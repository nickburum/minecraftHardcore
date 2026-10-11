// RivalBot: a free, scripted Minecraft player that races you to the End.
//   node index.js                 uses config.json (copy config.example.json)
const fs = require('fs')
const path = require('path')
const { pathfinder, Movements } = require('mineflayer-pathfinder')
const { plugin: pvp } = require('mineflayer-pvp')
const collectBlock = require('mineflayer-collectblock').plugin
const toolPlugin = require('mineflayer-tool').plugin
const armorManager = require('mineflayer-armor-manager')
const { connect } = require('./lib/connection')
const { Memory } = require('./lib/memory')
const { Brain } = require('./lib/brain')
const { log } = require('./lib/log')

const configFile = process.argv[2] || path.join(__dirname, 'config.json')
const config = JSON.parse(fs.readFileSync(fs.existsSync(configFile) ? configFile : path.join(__dirname, 'config.example.json'), 'utf8'))
const memory = new Memory(path.resolve(__dirname, config.memoryFile || 'memory.json'))
memory.data.runs++
memory.save()

let reconnectDelay = 5000

function start () {
  const bot = connect(config)
  bot.loadPlugin(pathfinder)
  bot.loadPlugin(pvp)
  bot.loadPlugin(collectBlock)
  bot.loadPlugin(toolPlugin)
  bot.loadPlugin(armorManager)

  let brain = null
  bot.once('spawn', async () => {
    log('spawned as', bot.username, 'at', bot.entity.position.floored().toString())
    reconnectDelay = 5000
    const { loader: autoEat } = await import('mineflayer-auto-eat')
    bot.loadPlugin(autoEat)
    bot.autoEat.setOpts({ minHunger: 14, bannedFood: ['rotten_flesh', 'spider_eye', 'poisonous_potato', 'pufferfish', 'chorus_fruit'] })
    bot.autoEat.enableAuto()

    const moves = new Movements(bot)
    moves.allowSprinting = true
    moves.canDig = true
    moves.allow1by1towers = true
    moves.allowParkour = true
    moves.scafoldingBlocks = ['dirt', 'cobblestone', 'cobbled_deepslate', 'netherrack'].map(n => bot.registry.itemsByName[n]?.id).filter(Boolean)
    if (memory.style.avoidLava) moves.liquidCost = 100
    bot.pathfinder.setMovements(moves)
    bot.pvp.movements = moves
    if (bot.collectBlock.movements !== undefined) bot.collectBlock.movements = moves

    brain = new Brain(bot, memory, config)
    brain.startReflexes()
    brain.run().catch(e => log('brain crashed:', e.stack))
  })

  bot.on('messagestr', (text, position) => {
    if (position === 'game_info') return
    if (brain && text.startsWith(bot.username + ' ') && /died|slain|blown|fell|lava|drown|burn|shot|starv|killed|hit the ground|poke|stung|fire/.test(text)) brain.onDeathMessage(text)
    else if (!text.startsWith('<' + bot.username + '>')) log('chat:', text)
  })
  bot.on('respawn', () => brain && brain.onRespawn())
  bot.on('kicked', reason => log('kicked:', JSON.stringify(reason).slice(0, 200)))
  bot.on('error', err => log('error:', err.message))
  bot.on('end', reason => {
    log('disconnected:', reason, '- reconnecting in', reconnectDelay / 1000, 's')
    setTimeout(start, reconnectDelay)
    reconnectDelay = Math.min(reconnectDelay * 2, 5 * 60 * 1000)
  })
}

start()
