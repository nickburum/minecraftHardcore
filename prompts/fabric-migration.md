# Prompt: move the hardcore server from vanilla to Fabric

Paste everything below the line into Claude Code on the Mac (THOTH Prime). Replace `<server>` with the SSH target of the game server (for example `thoth@<LAN IP>`).

---

Context: you run on THOTH Prime. The target host is the game server, reached with `ssh -o BatchMode=yes <server>`. Work in the foreground and synchronously; no background agents. Do not touch ~/thoth-agent or youtube_gate.py. Use `sudo -n` only; never use or pass a password. Stop and report on any error, and do not loop restarts. The repo is nickburum/minecraftHardcore, branch `claude/minecraft-hardcore-datapack-y6qbd1`. Read its CLAUDE.md first; it lists the three servers and the house rules.

Goal: move the **hardcore** server (`~/vanilla`, world `hardcore`, port 25565, Minecraft 26.3) from vanilla to Fabric, keeping the world and every player's progress intact. Add Simple Voice Chat and a `/info` book. Leave `~/vanilla` untouched as the rollback. The creative and mod test servers are out of scope.

1. **Preflight (read only).**
   - Confirm the server's Minecraft version from `~/vanilla/logs/latest.log` ("Starting minecraft server version …").
   - Read `level-name` from `~/vanilla/server.properties` (expect `hardcore`).
   - Check that `~/vanilla/hardcore/level.dat` exists and that `hardcore=true`.
   - In the `vanilla` screen session, run `list`. If anyone is online, stop and tell me.
   - Report `free -h`, `df -h ~`, and the Java versions installed (26.3 needs Java 25).

2. **Stop and back up.**
   - Send `save-all flush`, wait for "Saved the game", then `stop`, and wait for the screen session to end. Use systemd instead if the hardcore server runs under it.
   - Back up the whole folder: `tar -czf ~/backups/manual/vanilla-pre-fabric-$(date +%F-%H%M).tar.gz -C ~ vanilla`.
   - Verify the archive with `tar -tzf`, and report its size and that `hardcore/level.dat` is inside.
   - Do not continue without a verified backup.

3. **Fabric server files in a new folder, `~/hardcore-fabric`.** Get the server launcher for the **same** Minecraft version from https://meta.fabricmc.net/v2/versions/loader/26.3. Use the newest loader marked `stable` and the newest stable installer, downloaded from `https://meta.fabricmc.net/v2/versions/loader/26.3/<loader>/<installer>/server/jar`. Report the exact URL and the loader version. This launcher jar replaces running the installer: it downloads the vanilla server and libraries on first start.

4. **Copy from `~/vanilla` into `~/hardcore-fabric`:**
   - the world folder `hardcore/` (all of it, including `datapacks/`)
   - `server.properties`, `ops.json`, `whitelist.json`, `banned-players.json`, `banned-ips.json`, `usercache.json`, `server-icon.png`, `eula.txt`

   Compare file counts and total size of `hardcore/` before and after. **`level-name` must still say `hardcore`**: a wrong name makes Fabric generate a brand-new world.

5. **Mods into `~/hardcore-fabric/mods`.** Use Modrinth's API (`https://api.modrinth.com/v2/project/<id>/version?game_versions=["26.3"]&loaders=["fabric"]`), take the newest file, and check its sha512 against the API before keeping it. Report the version and hash for each.
   - `fabric-api`: required by the `/info` mod.
   - `simple-voice-chat`: for 26.3 only "beta" builds exist; that's expected.
   - `info-command-1.0.0.jar` from the repo's `fabric-mods/info-command/`. It's prebuilt; `build.sh` rebuilds it with JDK 25 if needed.

   Simple Voice Chat is optional on the client, and `force_voice_chat=false` (the default) means players without the mod can still join. Confirm that value in `config/voicechat/voicechat-server.properties` after the first start.

6. **The revive data pack.** `hardcore/datapacks/elixir_of_life` should already be there from the world copy. Replace it with the repo's `datapack/elixir_of_life` so it's the current version, and report any differences.

7. **The /info book.** Copy the repo's `datapack/server_info` into `hardcore/datapacks/`.
   - A data pack can't create a new slash command. That's why the `info-command` mod exists: it adds `/info` and runs the pack's `info:give` function.
   - Without the mod, `/trigger info` still works.
   - New players get the book automatically on their first join.
   - To change the book, edit `tools/info_book.json` or `tools/make_info_book.py` and rerun `python3 tools/make_info_book.py`.

8. **Voice chat through playit.** Voice chat uses UDP port 24454, which is separate from Minecraft's TCP 25565. Friends connect through playit, so the existing Minecraft tunnel won't carry voice.
   - Tell me to add a second playit tunnel: type **UDP**, same agent, local `127.0.0.1:24454`.
   - When I give you its public address, set `voice_host=<address:port>` in `config/voicechat/voicechat-server.properties` and restart.
   - Until then, voice works only on the home network.

9. **EULA and first launch.**
   - Check that `eula.txt` says `eula=true`. Copy it from `~/vanilla`; don't accept it on my behalf if it's missing.
   - Use the same heap as before (`-Xms4G -Xmx6G`).
   - Start in a screen session named `hardcore`, not `vanilla`, so the old unit's stop logic can't grab it: `screen -dmS hardcore /usr/lib/jvm/java-25-openjdk-amd64/bin/java -Xms4G -Xmx6G -jar <launcher>.jar nogui`.
   - Wait for "Done". Report every `WARN` and `ERROR` line from the first launch log, grouped and de-duplicated.

10. **Verify.**
    - **You check:**
      - The log says `Preparing level "hardcore"` and loads the existing world. No "creating new world" message, and the world folder size hasn't shrunk.
      - `datapack list` shows `file/elixir_of_life` and `file/server_info`.
      - The mod list includes `fabric-api`, `voicechat` and `info_command`.
      - `function elixir:admin/list` prints the fallen list.
      - Port 25565 (TCP) is listening, and 24454 (UDP) is too.
    - **I check (give me this list):**
      - A vanilla client joins through the playit address without being kicked.
      - `/info` gives the book. Page 1's link opens the Simple Voice Chat page, and hovering the items on page 2 shows the Elixir of Life.
      - A client with Simple Voice Chat installed shows the voice chat icon and can talk.
      - Hardcore is still on, and the elixir still crafts and revives.

11. **Run it under systemd.**
    - Write `~/hardcore-fabric.service.new` using the working pattern of the existing units: `Type=forking`, `GuessMainPID=yes`, `screen -dmS hardcore …`, an `ExecStop` that sends `stop` and waits for the session to end, and `TimeoutStopSec=180`.
    - Print the one install command for me. Disable the old `vanilla.service` in that same command so both can't run at once.
    - Don't install it yourself.

12. **Update checker; don't schedule it.** Copy the repo's `tools/check_fabric_updates.sh` to `~/bin/`. Show it to me, then run it once by hand against `~/hardcore-fabric`.
    - It only downloads newer builds of the Fabric loader, Fabric API and Simple Voice Chat for the same Minecraft version, hash-checked, into `~/fabric-updates`.
    - It never touches the running server or the Minecraft version.
    - Propose a cron line, for example weekly with output to a log file, and **wait for my approval** before adding it.

13. **Rollback (if anything above fails after step 2):**
    - Stop the Fabric server.
    - Restart the untouched `~/vanilla` with its old unit or screen command.
    - Report what failed. Don't delete `~/hardcore-fabric`.

Final output: a PASS/FAIL table per step, the backup path and size, the loader, mod and data pack versions with hashes, the first-launch WARN/ERROR summary, the playit UDP tunnel request, the systemd install command, the update script and proposed cron line, and my manual checklist. Then wait for me.
