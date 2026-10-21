// End-to-end test for Three Lives + Elixir of Life: two bot players on a real hardcore server.
//   PORT=25576 RCON=25586 VER=1.21.11 node e2e.js
const mineflayer = require('mineflayer')
const { execFileSync } = require('child_process')
const PORT = +process.env.PORT || 25576, RCON = process.env.RCON || '25586', VER = process.env.VER || '1.21.11'
const rcon = (...c) => execFileSync('python3', [require('path').join(__dirname, 'rcon.py'), RCON, ...c]).toString()
const sleep = ms => new Promise(r => setTimeout(r, ms))
const log = (...a) => console.log('[test]', ...a)
let fails = 0
const check = (cond, msg) => { console.log(cond ? '  PASS' : '  FAIL', msg); if (!cond) fails++ }

function mk (name) {
  const b = mineflayer.createBot({ host: '127.0.0.1', port: PORT, username: name, version: VER })
  b.msgs = []; b.titles = []; b.dialogs = []
  b.on('messagestr', m => b.msgs.push(m))
  b.on('title', (t, type) => b.titles.push(type + ':' + JSON.stringify(t)))
  b._client.on('packet', (d, meta) => {
    if (meta.name === 'action_bar') b.titles.push('actionbar:' + JSON.stringify(d))
    if (/dialog/.test(meta.name)) b.dialogs.push(JSON.stringify(d))
  })
  b.on('error', e => log(name, 'error', e.message))
  return new Promise(r => b.once('spawn', () => r(b)))
}
const score = (who, obj) => { const m = rcon(`scoreboard players get ${who} ${obj}`).match(/has (-?\d+)/); return m ? +m[1] : null }
const gamemode = who => { const m = rcon(`data get entity ${who} playerGameType`).match(/data: (\d)/); return m ? +m[1] : null }
const team = who => { for (const t of ['l3', 'l2', 'l1', 'out']) if (/passed/.test(rcon(`execute if entity @a[name=${who},team=elixir.${t}]`))) return t; return 'none' }
const elixirs = who => { const m = rcon(`clear ${who} minecraft:carrot_on_a_stick[minecraft:custom_data~{elixir_of_life:true}] 0`).match(/Found (\d+)/); return m ? +m[1] : 0 }
const books = who => { const m = rcon(`clear ${who} minecraft:written_book 0`).match(/Found (\d+)/); return m ? +m[1] : 0 }

;(async () => {
  rcon('data modify storage elixir:data world_spawn set value {dimension:"minecraft:overworld",x:0,y:-60,z:0}', 'time set day', 'difficulty peaceful')
  const A = await mk('Reviver'); const B = await mk('Victim')
  await sleep(2000)
  rcon('tp Reviver 5 -60 5', 'tp Victim 0 -60 0')

  log('new players')
  check(score('Reviver', 'elixir.lives') === 3 && score('Victim', 'elixir.lives') === 3, 'everyone starts with 3 lives')
  check(team('Victim') === 'l3', 'green name at 3 lives: ' + team('Victim'))
  check(books('Victim') === 1, 'Server Info book given on first join')

  log('craft the elixir (golden apple + weakness potion)')
  rcon('clear Reviver', 'item replace entity Reviver hotbar.0 with minecraft:golden_apple', 'item replace entity Reviver hotbar.1 with minecraft:potion[potion_contents={potion:"minecraft:weakness"}]')
  await sleep(500)
  await A.clickWindow(36, 0, 0); await A.clickWindow(1, 0, 0); await A.clickWindow(37, 0, 0); await A.clickWindow(2, 0, 0)
  await sleep(300); await A.clickWindow(0, 0, 0); await sleep(400); await A.clickWindow(36, 0, 0); await sleep(600)
  check(elixirs('Reviver') === 1, 'crafted a real Elixir of Life')

  const die = async () => { rcon('kill Victim'); await sleep(800); B._client.write('client_command', { actionId: 0 }); await sleep(1500) }

  log('first death: lose a life, respawn')
  A.msgs = []
  await die()
  check(score('Victim', 'elixir.lives') === 2, 'lives 3 -> 2')
  check(gamemode('Victim') === 0, 'back in survival after respawning (not stuck as a hardcore spectator)')
  check(team('Victim') === 'l2', 'yellow name at 2 lives: ' + team('Victim'))
  check(A.msgs.some(m => /Victim lost a life\. 2 lives left/.test(m)), 'everyone told: ' + A.msgs.filter(m => /lost a life/.test(m)).join(' | '))

  log('second death')
  await die()
  check(score('Victim', 'elixir.lives') === 1 && team('Victim') === 'l1' && gamemode('Victim') === 0, 'lives 2 -> 1, red name, survival')

  log('third death: out')
  A.msgs = []
  await die()
  check(score('Victim', 'elixir.lives') === 0, 'lives 1 -> 0')
  check(gamemode('Victim') === 3, 'out players stay spectators')
  check(team('Victim') === 'out', 'gray name when out: ' + team('Victim'))
  check(A.msgs.some(m => /A CHAMPION HAS FALLEN.*Victim is out of lives/.test(m)), 'fallen announcement')
  const id = score('Victim', 'elixir.id')

  log('revive: menu, confirm popup, life charged')
  rcon('item replace entity Reviver hotbar.0 from entity Reviver hotbar.0'); await A.setQuickBarSlot(1); await sleep(100); await A.setQuickBarSlot(0); await sleep(300)
  A.dialogs = []
  A.activateItem(); await sleep(500); A.deactivateItem()
  check(A.dialogs.some(d => /Choose who to bring back/.test(d)), 'revive menu opens')
  A.chat('/trigger elixir.revive set ' + id); await sleep(800)
  check(A.dialogs.some(d => /Give up a life\?/.test(d) && /3 → 2/.test(d)), 'confirm popup shows "Your lives: 3 → 2"')
  check(score('Reviver', 'elixir.lives') === 3 && elixirs('Reviver') === 1, 'nothing is charged before confirming')
  A.msgs = []
  A.chat('/trigger elixir.confirm set ' + id); await sleep(1500)
  check(score('Reviver', 'elixir.lives') === 2 && team('Reviver') === 'l2', 'reviver pays a life (3 -> 2, yellow)')
  check(elixirs('Reviver') === 0, 'elixir used up')
  check(gamemode('Victim') === 0 && score('Victim', 'elixir.lives') === 1 && team('Victim') === 'l1', 'revived player is back in survival on 1 life, red name')
  check(A.msgs.some(m => /RESURRECTION HAS OCCURRED.*Reviver gave up a life to bring back Victim/.test(m)), 'resurrection announcement names the giver')
  check(B.msgs.some(m => /Reviver gave up one of their lives/.test(m)), 'revived player told who saved them')

  log('a player on their last life cannot give it away')
  await die() // Victim at 1 life -> out
  rcon('scoreboard players set Reviver elixir.lives 1', 'loot replace entity Reviver hotbar.0 loot elixir:elixir_of_life'); await sleep(400)
  A.titles = []
  A.activateItem(); await sleep(500); A.deactivateItem()
  check(A.titles.some(t => /last life/.test(t)), 'using the elixir on your last life is refused')
  rcon('scoreboard players enable Reviver elixir.revive'); A.msgs = []
  A.chat('/trigger elixir.revive set ' + id); await sleep(600)
  A.chat('/trigger elixir.confirm set ' + id); await sleep(800)
  check(score('Reviver', 'elixir.lives') === 1 && elixirs('Reviver') === 1 && gamemode('Victim') === 3, 'even forcing the triggers costs nothing and revives nobody')

  log('the switch to three lives resets everyone, including players who are out')
  rcon('scoreboard players set Victim elixir.epoch 1'); await sleep(1500)
  check(score('Victim', 'elixir.lives') === 3 && gamemode('Victim') === 0 && team('Victim') === 'l3', 'out player brought back with 3 lives')

  log('/trigger info')
  rcon('clear Victim minecraft:written_book')
  B.chat('/trigger info'); await sleep(800)
  check(books('Victim') === 1, '/trigger info gives the book')

  console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED')
  process.exit(fails ? 1 : 0)
})().catch(e => { console.error(e); process.exit(2) })
