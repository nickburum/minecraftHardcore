const mineflayer = require('mineflayer')
const { execFileSync } = require('child_process')
const PORT = +process.env.PORT || 25571, RCON = process.env.RCON || '25581', VER = process.env.VER || '1.21.11'
const rcon = (...c) => execFileSync('python3', [require('path').join(__dirname, 'rcon.py'), RCON, ...c]).toString()
const sleep = ms => new Promise(r => setTimeout(r, ms))
const log = (...a) => console.log('[test]', ...a)
let fails = 0
const check = (cond, msg) => { console.log(cond ? '  PASS' : '  FAIL', msg); if (!cond) fails++ }

function mk (name) {
  const b = mineflayer.createBot({ host: '127.0.0.1', port: PORT, username: name, version: VER })
  b.msgs = []; b.titles = []
  b.on('messagestr', m => b.msgs.push(m)); b.on('actionBar', m => b.titles.push('actionbar:' + m.toString()))
  b.on('title', (t, type) => b.titles.push(type + ':' + (typeof t === 'string' ? t : JSON.stringify(t))))
  b._client.on('packet', (d, meta) => { if (meta.name === 'action_bar') b.titles.push('actionbar:' + JSON.stringify(d)); if (/dialog/.test(meta.name)) { b.dialog = d; b.dialogName = meta.name } })
  b.on('error', e => log(name, 'error', e.message))
  b.on('kicked', r => log(name, 'kicked', r))
  return new Promise(r => b.once('spawn', () => r(b)))
}
const inv = n => rcon(`data get entity ${n} Inventory`)

;(async () => {
  rcon('setworldspawn 0 -60 0', 'kill @e[type=item]')
  const A = await mk('Reviver'); const B = await mk('Victim')
  await sleep(1500)
  rcon('gamemode survival Reviver', 'gamemode survival Victim', 'clear Reviver', 'clear Victim', 'tp Reviver 5 -60 5', 'tp Victim 0 -60 0', 'effect clear Victim')
  await sleep(500)

  log('craft with wrong potion (healing)')
  rcon('item replace entity Reviver hotbar.0 with minecraft:golden_apple', 'item replace entity Reviver hotbar.1 with minecraft:potion[potion_contents={potion:"minecraft:healing"}]')
  await sleep(500)
  const craft = async () => {
    await A.clickWindow(36, 0, 0); await A.clickWindow(1, 0, 0)
    await A.clickWindow(37, 0, 0); await A.clickWindow(2, 0, 0)
    await sleep(300); await A.clickWindow(0, 0, 0); await sleep(400); await A.clickWindow(20, 0, 0); await sleep(400)
  }
  await craft()
  let i = inv('Reviver')
  check(/golden_apple/.test(i) && !/elixir_raw|elixir_of_life/.test(i), 'wrong potion gives the golden apple back: ' + i.slice(0, 200))
  check(A.msgs.some(m => /curdles/.test(m)), 'wrong-potion message shown')

  log('craft with weakness potion')
  rcon('clear Reviver', 'item replace entity Reviver hotbar.0 with minecraft:golden_apple', 'item replace entity Reviver hotbar.1 with minecraft:potion[potion_contents={potion:"minecraft:weakness"}]')
  await sleep(500)
  await craft()
  i = inv('Reviver')
  check(/elixir_of_life/.test(i) && !/elixir_raw/.test(i), 'weakness potion makes a refined elixir: ' + i.slice(0, 300))

  log('shift-click craft with long weakness')
  rcon('item replace entity Reviver hotbar.0 with minecraft:golden_apple', 'item replace entity Reviver hotbar.1 with minecraft:potion[potion_contents={potion:"minecraft:long_weakness"}]')
  await sleep(500)
  await A.clickWindow(36, 0, 0); await A.clickWindow(1, 0, 0); await A.clickWindow(37, 0, 0); await A.clickWindow(2, 0, 0)
  await sleep(300); await A.clickWindow(0, 0, 1); await sleep(600)
  i = inv('Reviver')
  check((i.match(/elixir_of_life/g) || []).length === 2 && !/elixir_raw/.test(i), 'shift-click craft gives a second refined elixir')

  log('use elixir with nobody dead')
  rcon('clear Reviver minecraft:carrot_on_a_stick 1')
  A.titles = []
  await A.setQuickBarSlot(0); rcon('item replace entity Reviver hotbar.0 from entity Reviver container.20'); await sleep(300)
  rcon('loot replace entity Reviver hotbar.0 loot elixir:elixir_of_life'); await sleep(300)
  A.activateItem(); await sleep(400); A.deactivateItem()
  check(A.titles.some(t => /No fallen/.test(t)), 'no-fallen actionbar shown: ' + A.titles.join(' | '))

  log('victim with a /spawnpoint dies')
  rcon('setblock 20 -60 20 minecraft:red_bed[facing=north,part=foot]', 'setblock 20 -60 19 minecraft:red_bed[facing=north,part=head]')
  rcon('spawnpoint Victim 20 -60 20')
  console.log(rcon('data get entity Victim respawn'))
  A.msgs = []; A.titles = []
  rcon('kill Victim')
  await sleep(1500)
  console.log(rcon('data get storage elixir:data', 'scoreboard players get Victim elixir.id', 'data get entity Victim playerGameType'))
  check(A.titles.some(t => /Champion Has Fallen/.test(t)), 'fallen notice shown')
  check(A.msgs.some(m => /SYSTEM MESSAGE.*champion has fallen.*Victim/i.test(m)), 'fallen chat message shown')
  check(/name: "Victim"/.test(rcon('data get storage elixir:data fallen')), 'victim name captured in fallen list')
  B.respawn && B._client.write('client_command', { actionId: 0 })
  await sleep(1500)
  const gm = rcon('data get entity Victim playerGameType')
  log('victim gamemode after respawn', gm)
  check(/: 3/.test(gm), 'victim is spectator after hardcore death')
  rcon('tp Victim 100 -50 100')

  log('reviver opens the menu')
  A.dialog = null
  A.activateItem(); await sleep(500); A.deactivateItem()
  check(!!A.dialog, 'dialog sent to client (' + A.dialogName + '): ' + JSON.stringify(A.dialog).slice(0, 400))
  const id = rcon('scoreboard players get Victim elixir.id').match(/has (\d+)/)[1]
  B.msgs = []; B.titles = []; A.msgs = []; A.titles = []
  A.chat('/trigger elixir.revive set ' + id)
  await sleep(1500)
  const gm2 = rcon('data get entity Victim playerGameType'); const pos = rcon('data get entity Victim Pos')
  check(/: 0/.test(gm2), 'victim back in survival')
  check(/20\.5d, -60\.0d, 20\.5d/.test(pos), 'victim at their /spawnpoint (forced): ' + pos)
  const eff = rcon('data get entity Victim active_effects')
  check(/resistance/.test(eff) && /slow_falling/.test(eff) && /fire_resistance/.test(eff), 'protection effects applied')
  check(B.titles.some(t => /You Have Been Revived/.test(t)), 'revived player gets an on-screen notice')
  check(/You Have Been Revived/.test(B.titles.filter(t => /subtitle/.test(t)).slice(-1)[0] || ''), 'revived player sees their own notice last: ' + B.titles.filter(t => /subtitle/.test(t)).join(' | '))
  check(B.titles.some(t => /actionbar.*Reviver/.test(t)), 'revived player sees who revived them in the action bar')
  check(B.msgs.some(m => /You have been revived.*Reviver/s.test(m)), 'revived player told who revived them: ' + B.msgs.join(' | '))
  check(A.titles.some(t => /Resurrection Has Occurred/.test(t)), 'resurrection notice for everyone')
  check(A.msgs.some(m => /resurrection has occurred.*Victim.*returned to the realm/i.test(m)), 'resurrection chat message')
  check((inv('Reviver').match(/elixir_of_life/g) || []).length === 1, 'one elixir consumed')
  check(/fallen: \[\]/.test(rcon('data get storage elixir:data')), 'fallen list empty')

  log('trigger again with no elixir target -> refused, nothing consumed')
  A.msgs = []
  A.chat('/trigger elixir.revive set ' + id); await sleep(800)
  check((inv('Reviver').match(/elixir_of_life/g) || []).length === 1, 'nothing consumed for a stale request')

  const giveAndOpen = async () => {
    rcon('loot replace entity Reviver hotbar.0 loot elixir:elixir_of_life'); await sleep(300)
    await A.setQuickBarSlot(1); await sleep(100); await A.setQuickBarSlot(0); await sleep(200)
    A.activateItem(); await sleep(400); A.deactivateItem(); await sleep(200)
  }
  let V = B
  const die = async () => { rcon('kill Victim'); await sleep(800); V._client.write('client_command', { actionId: 0 }); await sleep(800) }
  const sleepInBed = async (x, z) => {
    rcon('difficulty peaceful', 'kill @e[type=!player]', 'time set 18000', `setblock ${x} -60 ${z} minecraft:red_bed[facing=north,part=foot]`, `setblock ${x} -60 ${z - 1} minecraft:red_bed[facing=north,part=head]`, `tp Victim ${x + 1} -60 ${z}`)
    await sleep(3000)
    try { await V.activateBlock(V.blockAt(new (require('vec3'))(x, -60, z))) } catch (e) { log('sleep error', e.message) }
    await sleep(500); try { await V.wake() } catch (e) {}
    rcon('time set day', 'difficulty hard'); await sleep(500)
    return rcon(`data get entity Victim respawn`)
  }

  log('real bed spawn: victim sleeps in a bed, dies, is revived onto the bed')
  rcon('gamemode survival Victim'); await sleep(300)
  const r1 = await sleepInBed(30, 30)
  check(/forced: 0b/.test(r1) || !/forced/.test(r1), 'bed spawn is not forced: ' + r1.trim())
  await die()
  await giveAndOpen()
  A.chat('/trigger elixir.revive set ' + id); await sleep(1200)
  let p = rcon('data get entity Victim Pos')
  check(/30\.5d, -59\.4\d*d, 29\.5d/.test(p), 'revived onto their bed: ' + p.trim())

  log('offline revive with bed broken: falls back to admin world spawn')
  await die()
  rcon('setblock 30 -60 30 air', 'setblock 30 -60 29 air')
  V.quit(); await sleep(1000)
  rcon('data modify storage elixir:data world_spawn set value {dimension:"minecraft:overworld",x:-7,y:-60,z:-7}')
  A.msgs = []
  await giveAndOpen()
  A.chat('/trigger elixir.revive set ' + id); await sleep(800)
  check(A.msgs.some(m => /offline/.test(m)), 'reviver told victim is offline')
  V = await mk('Victim'); await sleep(1500)
  check(/: 0/.test(rcon('data get entity Victim playerGameType')), 'offline victim revived on join')
  p = rcon('data get entity Victim Pos')
  check(/-6\.5d, -60\.0d, -6\.5d/.test(p), 'bed gone -> world spawn: ' + p.trim())
  check(V.msgs.some(m => /You have been revived.*Reviver/s.test(m)), 'offline victim told who revived them on join')

  log('no spawn point and no world spawn: arrives where the elixir was used')
  rcon('data remove storage elixir:data world_spawn', 'tp Reviver 12 -60 -3')
  await die()
  await giveAndOpen()
  A.chat('/trigger elixir.revive set ' + id); await sleep(1200)
  p = rcon('data get entity Victim Pos')
  check(/12\.5d, -60\.0d, -2\.5d/.test(p), 'sent to reviver position: ' + p.trim())
  log('non-elixir carrot on a stick does nothing; trigger without elixir refused')
  rcon('kill Victim'); await sleep(800); V._client.write('client_command', { actionId: 0 }); await sleep(800)
  rcon('clear Reviver')
  A.msgs = []
  A.chat('/trigger elixir.revive set ' + id); await sleep(800)
  check(A.msgs.some(m => /need an Elixir|cannot trigger/.test(m)), 'refused without elixir: ' + A.msgs.join('|'))
  check(/: 3/.test(rcon('data get entity Victim playerGameType')), 'victim still spectator')

  console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED')
  process.exit(fails ? 1 : 0)
})().catch(e => { console.error(e); process.exit(2) })
