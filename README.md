# minecraftHardcore

Add-ons for the hardcore server.

## Elixir of Life

A data pack that lets players bring fallen champions back in a hardcore world, plus server-wide death and resurrection announcements.

- **Elixir of Life.** Craft it from a Golden Apple and a Potion of Weakness. Right-click it to open a menu of fallen players, then pick one to revive.
- **Revival.** The player comes out of spectator mode at their spawn point (bed, respawn anchor or `/spawnpoint`). They get 15 seconds of protection and a notice saying who revived them.
- **Death announcement.** Everyone hears a cannon shot, then the announcer says *"System message. A champion has fallen."* A message also appears in small text just below the crosshair, the player's name shows in the action bar, and chat names them too.
- **Resurrection announcement.** Everyone hears an angelic chime, then the announcer says *"System message. A resurrection has occurred…"* followed by *"…the champion has returned to the realm."* The on-screen text works the same way as for a death.

Announcements are heard by every player on the server at full volume. The voice lines are stereo, so they sound the same from every direction instead of coming from one spot.

### Supported versions

Java Edition **1.21.9 to 26.3**. Bedrock is not supported.

| Version | How it was tested |
|---|---|
| 1.21.11 | Full end-to-end test with two bot players (30 checks) |
| 26.1.2 | Full end-to-end test with two bot players (30 checks) |
| 26.2 | Pack loads without errors |
| 26.3 | Pack loads without errors, and every command was checked by running it on the server |

26.3 changed several data formats. The `overlay_26_3` folder holds the 26.3 versions of those files, and the game picks the right ones automatically.

### Install

1. **Data pack.** Copy `datapack/elixir_of_life` (or `dist/elixir_of_life_datapack.zip`) into `<world>/datapacks/`. Then run `/reload` or restart the server.
2. **Set the fallback spawn.** Stand at the world spawn and run:
   ```
   /function elixir:admin/set_world_spawn
   ```
   Revived players with no bed or respawn anchor are sent here. If this isn't set, they appear next to the player who used the elixir.
3. **Resource pack (announcer voice).** The voice lines only play for players who have the resource pack. Everything else works without it. Either:
   - **Server resource pack (recommended).** Upload `dist/elixir_of_life_resourcepack.zip` somewhere with a public direct-download link, then set this in `server.properties`:
     ```
     resource-pack=https://your-host/elixir_of_life_resourcepack.zip
     resource-pack-sha1=<sha1 printed by tools/make_voices.py>
     require-resource-pack=false
     ```
     This repo is private, so GitHub raw links won't work. Use a public file host or your server host's file hosting. Then restart the server.
   - **Manual.** Each player puts the zip in `.minecraft/resourcepacks/` and enables it.

Build the zips with `python3 tools/make_voices.py --build`. The command also prints the SHA-1.

### Playing

1. Put a **Golden Apple** and a **Potion of Weakness** (normal or extended) into any crafting grid.
   - With any other potion, the elixir "curdles": you get the golden apple back but lose the potion.
   - Automatic crafters make an *unrefined* elixir that does nothing. It has to be crafted by hand.
2. Hold the **Elixir of Life** and right-click. A menu lists every fallen champion.
3. Click a name. The elixir is used up, and that player:
   - goes back to Survival at their bed or respawn anchor. If those are gone, they go to the fallback spawn.
   - gets Resistance V, Slow Falling, Fire Resistance, Water Breathing and Regeneration, so the fall, lava or water where they land can't kill them right away.
   - sees "You Have Been Revived" below the crosshair, with the reviver's name in the action bar.
4. Offline players can be revived too. They return the next time they join.

A dead hardcore player has to click **Spectate World** on the death screen before they can be revived.

### Admin commands

| Command | What it does |
|---|---|
| `/function elixir:admin/give` | Gives you an Elixir of Life |
| `/function elixir:admin/revive {name:"Steve"}` | Revives a player without using an elixir |
| `/function elixir:admin/list` | Shows who is fallen and who is waiting to be revived |
| `/function elixir:admin/set_world_spawn` | Sets the fallback spawn to where you're standing |
| `/function elixir:admin/uninstall` | Removes the pack's scoreboards and storage (then run `/datapack disable`) |

### Saying each player's name in the announcement

By default the announcer says *"…a champion has returned to the realm"*, and the player's name is shown on screen. To have the voice say the name:

1. Add the names to `tools/players.txt`, one per line. Use `Name=how to say it` for names the voice mispronounces.
2. Run `pip install piper-tts` (also needs `ffmpeg`), then `python3 tools/make_voices.py`.
3. Reinstall the data pack and the resource pack. If you host the resource pack, update `resource-pack-sha1`.

Voices are made offline with [Piper](https://github.com/rhasspy/piper) (`en_US-ryan-high`), with a little echo added.

### Layout

```
datapack/elixir_of_life/       the data pack
  data/elixir/function/        death, use, revive, craft, announce, admin logic
  overlay_26_3/                26.3 versions of the advancements, loot tables and item modifier
resourcepack/elixir_of_life_sounds/   announcer voice lines
tools/make_voices.py           makes the voice lines and builds dist/*.zip
tests/                         end-to-end test with bot players
```

### Running the tests

You need Java 21 (1.21.x) or Java 25 (26.x), Node.js and Python 3.

```
cd tests && npm install
./setup_server.sh /tmp/mc 25571 25581        # then put a server.jar in /tmp/mc and start it
node e2e.js                                  # PORT, RCON and VER env vars select the server
```
