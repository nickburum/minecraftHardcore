# Notes for Claude Code

This repo holds add-ons for a Minecraft **Java Edition** hardcore server. The main piece is the Elixir of Life data pack (see README.md for what it does). It also has the server-list icon and description for both the hardcore and the creative server, in `server/`.

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
6. **Resource pack (announcer voice).** This step is optional, and everything else works without it.
   - Run `python3 tools/make_voices.py --build` to build `dist/elixir_of_life_resourcepack.zip`. The command prints the SHA-1.
   - The zip needs a **public direct-download URL**. This GitHub repo is private, so raw links won't work. Ask the owner where to host it.
   - Then set these in `server.properties` and restart:
     - `resource-pack=<url>`
     - `resource-pack-sha1=<sha1>`
     - `require-resource-pack=false`
7. **Smoke test** (console or RCON):
   - `function elixir:admin/list` should print empty Fallen and Pending lists.
   - `give <op> minecraft:golden_apple` and `give <op> minecraft:potion[potion_contents={potion:"minecraft:weakness"}]`. Then have the operator craft the elixir and right-click it. It should say "No fallen champions await revival."

## Server icon and description

Do this for each server you are asked to set up: the hardcore server uses `server/hardcore/` and the creative server uses `server/creative/`. Only the hardcore server gets the data pack.

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
- After you change a voice line or `tools/players.txt`, run `python3 tools/make_voices.py`. It rewrites `announce/voice_map.mcfunction` and the resource pack sounds.
- Test with `tests/e2e.js`, which runs two bot players against a real server. Mineflayer supports up to 26.1, so 26.2 and 26.3 can only be load-tested.
