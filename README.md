# minecraftHardcore

Add-ons for the hardcore server, plus server-list branding for all three servers: hardcore, creative (test) and mod test.

## Server list icons and descriptions

| Server | Preview |
|---|---|
| Hardcore | ![Hardcore server in the server list](server/hardcore/preview.png) |
| Creative | ![Creative server in the server list](server/creative/preview.png) |
| Mod test | ![Mod test server in the server list](server/modtest/preview.png) |

Each folder under `server/` holds:
- `server-icon.png`: the 64×64 icon. Copy it into the server's main folder (next to `server.properties`) with exactly that name.
- `motd.properties`: the description line. Replace the `motd=` line in `server.properties` with it. Special characters are escaped so they display correctly.
- `motd.txt`: the same description in readable form, for editing.

Restart the server afterwards; both are only read at startup.

To change the text, edit `motd.txt` and run `python3 tools/make_server_icons.py <path to a Minecraft client .jar>`. That rebuilds the icons, previews and `motd.properties`, and warns if a line is too long to fit.

## Fabric, voice chat and the /info book

`prompts/fabric-migration.md` is a ready-to-paste prompt for Claude Code on the server. It moves the hardcore server to Fabric with a verified backup and a rollback, adds Simple Voice Chat, and installs the Server Info book.

- **Server Info book** (`datapack/server_info`): new players get it on their first join, and anyone can get a new copy with `/info` or `/trigger info`. It covers:
  - welcome text
  - a clickable link to download Simple Voice Chat, with one line of setup
  - the Elixir of Life recipe, where hovering shows the actual items
  - how reviving works
- **`/info` command** (`fabric-mods/info-command`): a tiny server-side Fabric mod, since a data pack can't add new commands.
- **Update checker** (`tools/check_fabric_updates.sh`): stages newer Fabric loader, Fabric API and Simple Voice Chat builds for the same Minecraft version, with hash checks.

Tested on a Fabric 26.3 server with Simple Voice Chat 2.6.24:
- A client without mods joins and isn't kicked.
- The book arrives on first join.
- `/info` and `/trigger info` both hand out the book, which has the voice chat link and the item tooltips.

## RivalBot and Race the Bot

A free bot (`rivalbot/`) that plays survival like a real player on the mod test server, learns from its deaths, and races you to the End. In the race data pack (`datapack/rival_race`), the System announcer roots for the bot and sabotages you. See [rivalbot/README.md](rivalbot/README.md) for what it can do so far and how to run it.

## Challenge: Minecraft, but my health is my inventory

A data pack for recording challenge videos, made for the mod test server.

- **The rule: 10 hearts = 10 slots.** Your hotbar (9 slots) plus your offhand are your whole inventory, and the 27 backpack slots are locked. Each heart you lose locks a slot, starting with the offhand and then from the right end of the hotbar. Whatever was in that slot falls on the ground. Heal and the slots unlock again. At one heart you only have your first hotbar slot.
- **Goal:** beat the game by killing the Ender Dragon. You get a win screen, fireworks and stats (time, deaths, hearts lost, items dropped).
- **The System:** a sarcastic, kid-friendly AI announcer, written in the spirit of Dungeon Crawler Carl. It comments when you start, lose a slot, drop items, heal, fall, burn, get blown up, find diamonds, enter the Nether and the End, die, and win. Every line also shows in chat as `[SYSTEM] …`. Small comments share a 5 second cooldown so it doesn't talk over itself; big moments always play.
- **On screen:** an intro ("Minecraft, but… My health is my inventory"), a 3-2-1 countdown, and a bar above the hotbar showing hearts = slots and a timer.

| Command | What it does |
|---|---|
| `/function hpinv:start` | Starts the challenge for everyone online. It clears inventories, heals everyone, switches them to Survival, and changes Peaceful to Normal |
| `/function hpinv:stop` | Ends it and unlocks every slot |
| `/function hpinv:admin/stats` | Shows time, deaths, hearts lost and items dropped |
| `/function hpinv:admin/hud_toggle` | Hides or shows the hearts and timer bar, for clean footage |

The announcer voice needs `resourcepack/health_inventory_voice` (build it with `python3 tools/make_announcer.py --build`). To change what the System says, edit `tools/health_inventory_lines.json` and run `python3 tools/make_announcer.py`. That regenerates the voice clips and the `voice/*.mcfunction` files together. Tested end to end with a bot player on 1.21.11 (25 checks, `tests/challenge_e2e.js`), and every command was checked on 26.3.

## Three Lives + Elixir of Life

The hardcore server's data pack (`datapack/elixir_of_life`). It's still a true hardcore world (hardcore hearts, locked to Hard), but everyone gets three lives, and friends can save each other.

- **Three lives.** Everyone starts with 3. Every death costs one, and your name color shows how many you have left:
  - **green:** 3 lives
  - **yellow:** 2 lives
  - **red:** last life
  - **gray:** out

  Lives are also shown in the tab list.
- **Dying with lives left.** Click **Spectate World** on the death screen and you're put straight back into Survival at your bed or spawn, with a few seconds of protection. Everyone sees "*Steve lost a life. 2 lives left.*"
- **Out.** Lose your last life and you're out: a spectator who can still watch, until someone saves you. Everyone hears a cannon shot and sees "*A champion has fallen*".
- **Elixir of Life.** Craft it from a Golden Apple and a Potion of Weakness. To save someone who's out:
  1. Right-click the elixir and pick their name.
  2. Confirm the popup: *"Give up a life? Your lives: 3 → 2"*.
  3. The elixir is used up, **you lose one of your lives**, and they come back in Survival **on their last life** (red), with 15 seconds of protection. Everyone hears a chime and sees who gave up a life for whom.
  - Players on their last life can't give it away.
  - Offline players come back the next time they join.
- **The switch to three lives.** The first time the pack loads, everyone is set to 3 lives, including anyone who was dead under the old rules. Offline players are reset when they next join.

No resource pack is needed: all sounds are vanilla.

### Supported versions

Java Edition **1.21.9 to 26.3**. Bedrock is not supported.

| Version | How it was tested |
|---|---|
| 1.21.11 | Full end-to-end test with two bot players (`tests/e2e.js`, 25 checks) |
| 26.3 | Pack loads without errors, and every command was checked by running it on the server |

26.3 changed several data formats. The `overlay_26_3` folder holds the 26.3 versions of those files, and the game picks the right ones automatically.

### Install

1. Copy `datapack/elixir_of_life` into `<world>/datapacks/` and run `/reload`.
2. Stand at the world spawn and run `/function elixir:admin/set_world_spawn`. Revived players whose bed is gone are sent here. If it isn't set, they appear next to the player who saved them.
3. If the server still has the old announcer resource pack, clear the `resource-pack=` and `resource-pack-sha1=` lines in `server.properties` and restart.

### Crafting details

- With any potion other than Weakness, the elixir "curdles": you get the golden apple back and lose the potion.
- Automatic crafters make an *unrefined* elixir that does nothing. It has to be crafted by hand.

### Admin commands

| Command | What it does |
|---|---|
| `/function elixir:admin/give` | Gives you an Elixir of Life |
| `/function elixir:admin/revive {name:"Steve"}` | Brings back a player who is out, without costing anyone a life |
| `/function elixir:admin/set_lives {name:"Steve",lives:3}` | Sets someone's lives (1 to 3) |
| `/function elixir:admin/list` | Shows who is out and who is waiting to come back |
| `/function elixir:admin/set_world_spawn` | Sets the fallback spawn to where you're standing |
| `/function elixir:admin/uninstall` | Removes the pack's scoreboards, teams and storage (then run `/datapack disable`) |

### Layout

```
datapack/elixir_of_life/       the data pack
  data/elixir/function/        lives, death, use, revive, craft, announce, admin logic
  overlay_26_3/                26.3 versions of the advancements, loot tables and item modifier
datapack/server_info/          the /info book (built by tools/make_info_book.py)
tools/make_server_icons.py     makes the server icons, MOTD lines and previews
server/hardcore, server/creative, server/modtest   server-list icon and description for each server
tests/                         end-to-end test with bot players
```

### Running the tests

You need Java 21 (1.21.x) or Java 25 (26.x), Node.js and Python 3.

```
cd tests && npm install
./setup_server.sh /tmp/mc 25576 25586        # hardcore test world; put a server.jar in /tmp/mc and start it
node e2e.js                                  # PORT, RCON and VER env vars select the server
python3 parse_check.py 25586 ../datapack/elixir_of_life   # runs every command through the server's parser
```
