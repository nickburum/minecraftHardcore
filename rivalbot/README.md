# RivalBot

A free Minecraft bot that plays survival like a real player and races you to the End. No AI service and no API costs: it's a hand-built "brain" on top of [Mineflayer](https://github.com/PrismarineJS/mineflayer), the open-source bot library.

It pairs with the **Race the Bot** data pack (`datapack/rival_race`), where the System announcer roots for the bot and sabotages you.

## What it does today

- **Moves like a player:** walks, sprints, hops while running, looks around when idle, swims up for air, and goes back for its items after dying.
- **Plays fair:** with `realism.xray` off (the default) it only goes after ore it could actually see. Otherwise it strip-mines for it like a person would.
- **Follows a speedrun route:**
  - wood, crafting table and wooden pickaxe
  - stone, then stone pickaxe, sword and axe
  - food (hunts and cooks), then a furnace
  - iron, smelted into an iron pickaxe, sword, bucket and chestplate
  - the rest of the iron armor
  - diamonds, then a diamond pickaxe
- **Reflexes:** fights back, backs away from creepers, retreats and eats when low on health, and digs in for the night once it has learned that nights are dangerous.
- **Learns from deaths:** each death is saved in `memory.json` with what killed it. The bot changes how it plays (flees sooner, avoids lava, keeps its distance from creepers, shelters at night) and announces the lesson in chat. It also keeps success and failure counts per task and changes tactics when one keeps failing (for example, it goes straight to strip mining when looking around for iron doesn't work).
- **Talks:** kid-friendly trash talk in chat at each milestone.

**Not built yet:** the Nether (portal, fortress, blaze rods), ender pearls and eyes of ender, finding the stronghold, and the dragon fight. Until those exist, the bot keeps getting stronger in the Overworld. Each one is a big skill and will be added in stages.

## Running it on the mod test server (26.3)

The bot library speaks Minecraft 26.1, so the server needs three free Fabric mods that translate between versions. They go in `~/modtest/mods` (tested with these versions):

- [ViaFabric](https://modrinth.com/mod/viafabric) 0.4.22+186-26.x
- [ViaVersion](https://modrinth.com/plugin/viaversion) 5.12.2
- [ViaBackwards](https://modrinth.com/plugin/viabackwards) 5.12.2

26.3 also expects a "tick end" packet after every movement packet, which the bot library doesn't send. `lib/connection.js` adds it; without it the server kicks the bot for "invalid movement".

You also need Node.js 22 or newer.

```
cd rivalbot
npm install
cp config.example.json config.json   # set host, port and username
node index.js
```

### The bot's account

The mod test server checks real accounts (`online-mode=true`), so the bot needs its own Minecraft account (an alt). In `config.json` set `"username"` to the alt's email and `"auth": "microsoft"`. On the first start the bot prints a link and a short code: open the link on your phone, sign in to the alt, and enter the code. The login is saved in `.auth-cache/`, so this only happens once. **Never put the password in a file or give it to anyone, including Claude.**

### Learning

`memory.json` holds everything the bot has learned. Delete it to start the bot over from scratch.

## Race the Bot (data pack)

Install `datapack/rival_race` on the same server.

| Command | What it does |
|---|---|
| `/function race:admin/setup {bot:"RivalBot"}` | Tells the pack which player is the bot (use the bot's in-game name) |
| `/function race:start` | Fresh race for everyone online: resets advancements, shows the race scoreboard, counts down |
| `/function race:stop` | Ends the race |
| `/function race:admin/sabotage_now` | Sabotages a random human right now |
| `/function race:admin/sabotage_toggle` | Turns the System's sabotage off or on |

- **Milestones:** these use the game's own advancements, so you and the bot are judged the same way: stone tools, iron, armor, diamonds, the Nether, a blaze rod, an eye of ender, the End. The first to kill the Ender Dragon wins.
- **Sabotage:** every 3 to 5 minutes, and whenever a human takes the lead, the System hits a random human with one of these:
  - a creeper behind you
  - knocking the item out of your hand
  - mining fatigue
  - a launch into the air (only when you can survive the fall)
  - blindness
  - hunger
  - a silverfish swarm
- **Announcer:** voice lines are in `tools/rival_race_lines.json`. Rebuild with `python3 tools/make_announcer.py race`. `dist/modtest_resourcepack.zip` holds the voices for both mod test challenges in one pack, because a server can only send one.
