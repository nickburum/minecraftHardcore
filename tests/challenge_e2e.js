// End-to-end test for the "my health is my inventory" challenge: one bot player on a real server.
const mineflayer = require('mineflayer')
const { execFileSync } = require('child_process')
const PORT = +process.env.PORT || 25574, RCON = process.env.RCON || '25584', VER = process.env.VER || '1.21.11'
const rcon = (...c) => execFileSync('python3', [require('path').join(__dirname, 'rcon.py'), RCON, ...c]).toString()
const sleep = ms => new Promise(r => setTimeout(r, ms))
const log = (...a) => console.log('[test]', ...a)
let fails = 0
const check = (cond, msg) => { console.log(cond ? '  PASS' : '  FAIL', msg); if (!cond) fails++ }
const LOCK = 'hpinv_lock'

// RCON truncates long replies, so count locks with a zero-count /clear instead of reading Inventory.
const lockedCount = () => { const m = rcon(`clear Runner *[minecraft:custom_data~{${LOCK}:true}] 0`).match(/Found (\d+)/); return m ? +m[1] : 0 }
const items = () => rcon('execute as @e[type=item] run data get entity @s Item.id')

;(async () => {
  rcon('kill @e[type=item]', 'function hpinv:stop', 'difficulty peaceful', 'time set day')
  // No natural regen, so health only changes when the test changes it. (Rule name differs by version.)
  for (const r of ['naturalRegeneration', 'natural_health_regeneration']) { try { rcon(`gamerule ${r} false`) } catch (e) {} }
  const B = mineflayer.createBot({ host: '127.0.0.1', port: PORT, username: 'Runner', version: VER })
  B.msgs = []; B.titles = []
  B.on('messagestr', m => B.msgs.push(m))
  B.on('title', (t, type) => B.titles.push(type + ':' + JSON.stringify(t)))
  B._client.on('packet', (d, meta) => { if (meta.name === 'action_bar') B.titles.push('actionbar:' + JSON.stringify(d)) })
  await new Promise(r => B.once('spawn', r)); await sleep(1500)
  rcon('tp Runner 0 -60 0', 'kill @e[type=!player]')
  const system = () => B.msgs.filter(m => m.startsWith('[SYSTEM]'))

  log('start: intro, countdown, GO')
  rcon('function hpinv:start')
  await sleep(1000)
  check(B.titles.some(t => /Minecraft, but/.test(t)), 'intro title')
  check(/Normal/.test(B.msgs.join('|')), 'peaceful difficulty was switched to normal')
  await sleep(6000)
  check(B.titles.some(t => /GO!/.test(t)), 'countdown reached GO')
  check(system().some(m => /New rule just dropped/.test(m)), 'announcer start line in chat')
  check(lockedCount() === 27, 'all 27 backpack slots locked at full health: ' + lockedCount())
  check(B.titles.some(t => /actionbar.*hearts = /.test(t)), 'HUD shows hearts = slots')

  await sleep(5200) // the start line sets the 5 second cooldown
  log('fill the hotbar and offhand, then lose 2 hearts')
  for (let n = 0; n < 9; n++) rcon(`item replace entity Runner hotbar.${n} with minecraft:${['stone_sword', 'bread', 'torch', 'dirt', 'cobblestone', 'oak_log', 'iron_pickaxe', 'water_bucket', 'diamond'][n]} ${[1, 5, 16, 32, 64, 8, 1, 1, 3][n]}`)
  rcon('item replace entity Runner weapon.offhand with minecraft:shield')
  await sleep(500)
  B.msgs = []
  rcon('damage Runner 4 minecraft:generic')
  await sleep(400)
  check(lockedCount() === 29, 'two more slots locked (hotbar.8 + offhand): ' + lockedCount())
  const dropped = items()
  check(/diamond/.test(dropped) && /shield/.test(dropped), 'the diamond (hotbar.8) and shield (offhand) fell on the ground: ' + dropped.replace(/\s+/g, ' ').slice(0, 200))
  check(!/paper/.test(dropped), 'no lock items on the ground')
  rcon('kill @e[type=item]')
  check(system().some(m => /floor|Butterfingers|donation/.test(m)), 'item-dropped line: ' + system().join(' | '))

  log('heal: slots come back')
  await sleep(5200) // minor-line cooldown
  B.msgs = []
  rcon('effect give Runner minecraft:instant_health 1 3 true')
  await sleep(400)
  check(lockedCount() === 27, 'slots unlocked after healing: ' + lockedCount())
  check(system().some(m => /slot|healing|returned/i.test(m)), 'slot-regained line: ' + system().join(' | '))

  log('fall damage line')
  await sleep(5200)
  B.msgs = []
  rcon('tp Runner 0 -40 0'); await sleep(2500)
  check(system().some(m => /Gravity|ground does not move|long way down/.test(m)), 'fall line: ' + system().join(' | '))

  log('down to one heart')
  rcon('effect give Runner minecraft:instant_health 1 5 true'); await sleep(500)
  B.msgs = []
  rcon('damage Runner 18 minecraft:generic'); await sleep(800)
  check(lockedCount() === 36, 'only hotbar.0 open at one heart (8 hotbar + offhand + 27 locked): ' + lockedCount())
  check(system().some(m => /One heart|single slot/.test(m)), 'one-heart line plays even during cooldown: ' + system().join(' | '))

  log('diamond pickup and the Nether')
  rcon('effect give Runner minecraft:instant_health 1 5 true', 'kill @e[type=item]'); await sleep(500)
  B.msgs = []
  rcon('item replace entity Runner hotbar.0 with air', 'execute at Runner run summon item ~ ~ ~ {Item:{id:"minecraft:diamond",count:1}}'); await sleep(1500)
  check(system().some(m => /Diamonds! Shiny/.test(m)), 'diamond line')
  B.msgs = []
  rcon('execute in minecraft:the_nether run tp Runner 0 120 0'); await sleep(2500)
  check(system().some(m => /Welcome to the Nether/.test(m)), 'nether line')
  rcon('execute in minecraft:overworld run tp Runner 0 -60 0'); await sleep(2000)

  log('death')
  B.msgs = []
  rcon('kill Runner'); await sleep(800)
  check(system().some(m => /fallen|Oh no|you have died/.test(m)), 'death line: ' + system().join(' | '))
  check(!/paper/.test(items()), 'lock items dropped on death are removed')
  B._client.write('client_command', { actionId: 0 }); await sleep(1500)
  check(lockedCount() === 27, 'after respawn, full hearts and full hotbar: ' + lockedCount())

  log('kill the dragon: challenge complete')
  B.msgs = []; B.titles = []
  rcon('execute at Runner run summon minecraft:ender_dragon ~ ~10 ~ {NoAI:1b}'); await sleep(500)
  rcon('damage @e[type=minecraft:ender_dragon,limit=1] 1000 minecraft:player_attack by Runner'); await sleep(1500)
  check(B.titles.some(t => /CHALLENGE COMPLETE/.test(t)), 'win title')
  check(system().some(m => /dragon is down/.test(m)), 'dragon line')
  check(B.msgs.some(m => /Deaths: 1/.test(m)) && B.msgs.some(m => /lost \d+ hearts, dropped \d+ items/.test(m)), 'stats shown: ' + B.msgs.filter(m => /Time|Deaths|lost/.test(m)).join(' | '))
  check(lockedCount() === 0, 'all slots unlocked after the win')
  check(/has 0 /.test(rcon('scoreboard players get #active hpinv.var')), 'challenge stopped')

  console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED')
  process.exit(fails ? 1 : 0)
})().catch(e => { console.error(e); process.exit(2) })
