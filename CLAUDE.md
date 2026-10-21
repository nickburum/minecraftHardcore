# Notes for Claude Code

This repo holds add-ons for a Minecraft **Java Edition** hardcore server. The main piece is the Three Lives + Elixir of Life data pack in `datapack/elixir_of_life` (see README.md for what it does). It also has the server-list icon and description for all three servers, in `server/`.

## The servers

All three run on the same machine as separate Java processes, each in its own `screen` session.

| Server | Folder on the host | Port | What it's for | Gets the data pack |
|---|---|---|---|---|
| Hardcore | `~/vanilla` (world `hardcore`); `~/hardcore-fabric` after the Fabric move | 25565 (voice chat: UDP 24454) | The real hardcore survival world | Yes, after it passes on creative, plus `server_info` |
| Creative | `~/vanilla-creative` (world `creative`) | 25566 | Test server: try data pack changes here first | Yes, first |
| Mod test | `~/modtest` (Fabric) | 25567 | Testing mods and data packs, recording videos | No. It gets the health inventory challenge, RivalBot and the bot race instead |

Test every data pack change on the creative server before putting it on hardcore. Hardcore deaths are permanent, so a broken pack there can cost players their run.

If you are running on the game server and were asked to install it, follow the steps below. Ask the owner before restarting the server or changing `server.properties`, because players may be online.

## Installing on the server

1. **Find the server.** Find the server directory (it holds `server.properties`) and the world folder (`level-name` in `server.properties`, `world` by default). Check the version in `logs/latest.log` ("Starting minecraft server version …") or from the jar name.
   - Supported: Java **1.21.9 to 26.3**.
   - Stop and tell the owner if the version is outside that range, or if the server is Bedrock or a modded loader that doesn't load vanilla data packs.
   - Paper, Spigot and Fabric load vanilla data packs normally.
2. **Check hardcore.** It should say `hardcore=true` in `server.properties`. The pack also works on non-hardcore worlds, but revives only matter in hardcore.
3. **Copy the data pack.** Copy the folder `datapack/elixir_of_life` to `<world>/datapacks/elixir_of_life`. Copy the folder itself, not a zip, so updates are easy to diff.
4. **Load it.** Run `/reload` from the console (or RCON or `screen`/`tmux`) or restart the server. Then confirm:
   - `/datapack list` shows `file/elixir_of_life`.
   - `logs/latest.log` has no `ERROR` lines that mention `elixir`.
5. **Set the fallback spawn.** Ask an operator in game to stand at world spawn and run `/function elixir:admin/set_world_spawn`.
   - From the console, use this instead, with the world spawn coordinates:
     `data modify storage elixir:data world_spawn set value {dimension:"minecraft:overworld",x:X,y:Y,z:Z}`
6. **No resource pack.** The old announcer voice pack is gone. If `server.properties` still has `resource-pack=` or `resource-pack-sha1=` set to it, clear both lines and restart (ask the owner first).
7. **Smoke test** (console or RCON):
   - `function elixir:admin/list` should print empty Fallen and Pending lists.
   - `scoreboard players list <op>` should show `elixir.lives` = 3, and the tab list should show everyone's lives with green names.
   - `give <op> minecraft:golden_apple` and `give <op> minecraft:potion[potion_contents={potion:"minecraft:weakness"}]`. Then have the operator craft the elixir and right-click it. It should say "No fallen champions await revival."

The pack is **Three Lives**: every death costs a life, players with lives left are put back into Survival automatically after they click "Spectate World", and a player who is out can be brought back by someone with 2+ lives giving one up through the Elixir of Life (with a confirm popup). The first load resets everyone, including the dead, to 3 lives (the "epoch" in `lives/new_epoch.mcfunction`). Don't bump the epoch again unless the owner asks for another reset.

## Moving the hardcore server to Fabric, voice chat and the /info book

The full, step-by-step task is in `prompts/fabric-migration.md`. Follow it when asked to do the move. Its key rules:
- Back up first and verify the backup.
- Keep `level-name=hardcore`; a wrong name generates a new world.
- Leave `~/vanilla` untouched as the rollback.
- Never schedule the update checker without the owner's approval.

Pieces from this repo:
- `datapack/server_info`: the Server Info book. It's given on first join and by `/trigger info`. Edit the text in `tools/info_book.json` and `tools/make_info_book.py`, then run `python3 tools/make_info_book.py`.
- `fabric-mods/info-command/info-command-1.0.0.jar`: adds `/info`, because a data pack can't add commands. Needs Fabric API. Rebuild with `fabric-mods/info-command/build.sh <fabric server dir>` (JDK 25).
- Simple Voice Chat comes from Modrinth. It's optional for players (`force_voice_chat=false`). Voice uses UDP 24454, so friends need a second playit tunnel (UDP, to `127.0.0.1:24454`) and `voice_host` set to that tunnel's address in `config/voicechat/voicechat-server.properties`.
- `tools/check_fabric_updates.sh`: downloads newer Fabric loader, Fabric API and Simple Voice Chat builds for the same Minecraft version into a staging folder, hash-checked. It never touches the running server.

## Installing the health inventory challenge (mod test server)

This goes on the mod test server only. It is a challenge for recording videos, not something for the hardcore or creative worlds.

1. Copy `datapack/health_inventory` to `~/modtest/<world>/datapacks/health_inventory` (the world folder is `level-name` in `~/modtest/server.properties`). Run `/reload`, then check that `/datapack list` shows `file/health_inventory` and the log has no `ERROR` lines mentioning `hpinv`.
2. Resource pack (the announcer voice):
   - Run `python3 tools/make_announcer.py --build`. It builds `dist/health_inventory_resourcepack.zip` and prints the SHA-1.
   - Publish the zip as a GitHub release on this repo, tagged `health-inventory-v1` (then `-v2`, … for later rebuilds), and check that the downloaded file's SHA-1 matches.
   - In `~/modtest/server.properties`, set `resource-pack=<release asset URL>`, `resource-pack-sha1=<sha1>` and `require-resource-pack=false`. This needs a restart.
3. Ask the owner before you change these, because the mod test server is currently set up for creative testing:
   - **Game mode.** `gamemode=creative` with `force-gamemode=true` puts players back in Creative every time they join. For a recording session, use `gamemode=survival` and `force-gamemode=false`.
   - **Difficulty.** `hpinv:start` switches Peaceful to Normal by itself, so this needs no change.
   - **World.** Beating the game needs normal terrain and a fresh world. Offer a new world (for example `level-name=challenge`) so the existing test world is kept.
4. To start a run, an operator runs `/function hpinv:start`. To end one early, run `/function hpinv:stop`.

## Installing RivalBot and the bot race (mod test server)

Read `rivalbot/README.md` first. Everything here is on the mod test server only.

1. Stop the mod test server (ask the owner first), add these mods to `~/modtest/mods`, and start it again. They let the bot (a 26.1 client) join the 26.3 server.
   - ViaFabric 0.4.22+186-26.x
   - ViaVersion 5.12.2
   - ViaBackwards 5.12.2
   Get them from Modrinth, check their hashes, and check the log for errors on startup.
2. Install Node.js 22+ if it's missing. Copy `rivalbot/` to `~/rivalbot`, run `npm install` there, and create `config.json` from `config.example.json` with `"port": 25567`.
3. The bot's account: the owner provides an alt Minecraft account. Set `"auth": "microsoft"` and `"username"` to the alt's email. On first start, the bot prints a Microsoft link and code; the owner signs in on their phone. Never ask for, store or pass the password.
4. Run the bot in its own `screen` session (for example `screen -dmS rivalbot node index.js`) so it keeps running and reconnects by itself.
5. Copy `datapack/rival_race` into the mod test world's `datapacks/` and `/reload`. Run `/function race:admin/setup {bot:"<bot's in-game name>"}`.
6. Resource pack: build `dist/modtest_resourcepack.zip` with `python3 tools/make_announcer.py --build` (it holds both the health inventory and race voices) and publish it as a GitHub release, as for the other packs. Use it for the mod test server's `resource-pack` instead of the health-inventory-only pack.
7. To race: everyone joins, then an operator runs `/function race:start`.

## Server icon and description

Do this for each server you are asked to set up: hardcore uses `server/hardcore/`, creative uses `server/creative/`, and mod test uses `server/modtest/`.

1. Copy `server/<name>/server-icon.png` into the server directory, next to `server.properties`, keeping that exact file name. Back up any existing `server-icon.png` first.
2. In `server.properties`, replace the `motd=` line with the `motd=` line from `server/<name>/motd.properties`. Copy it exactly, including the `\u00A7` escapes.
3. Both take effect on the next restart. Ask the owner before restarting.
4. Check it: the server should show the new icon and description in the multiplayer list.

## Updating

Replace `<world>/datapacks/elixir_of_life` with the new copy and run `/reload`. Fallen and pending players are kept in world storage (`elixir:data`), so updating doesn't lose them.

## Developing

- Functions live in `datapack/elixir_of_life/data/elixir/function/`.
  - `tick.mcfunction` is the entry point.
  - Player ids live in the `elixir.id` scoreboard.
  - The fallen list, the menu buttons and pending revives are kept in `storage elixir:data`.
- 26.3 changed some JSON formats (loot `functions`→`modifier`, `function`→`type`, recipe_crafted `recipe_id`→`recipes`, potion predicate). Any advancement, loot table or item modifier you change must also be changed in `overlay_26_3/`.
- Test with `tests/e2e.js` (two bot players on a real hardcore server) and `tests/parse_check.py` (every command through a live server's parser). Mineflayer supports up to 26.1, so 26.2 and 26.3 can only be load-tested.
