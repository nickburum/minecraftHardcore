// Things the bot knows how to do. Each skill is an async function that either finishes its
// job or throws, so the brain can try something else.
const { Vec3 } = require('vec3')
const { goals } = require('mineflayer-pathfinder')
const { log } = require('./log')

// No birch: 26.3 added poplar wood, and the version bridge shows poplar to this (26.1) client as
// birch. Crafting with it then goes out of sync with the server, so the bot leaves birch alone.
const LOGS = ['oak_log', 'spruce_log', 'jungle_log', 'acacia_log', 'dark_oak_log', 'mangrove_log', 'cherry_log', 'pale_oak_log']
const PLANKS = LOGS.map(l => l.replace('_log', '_planks'))
const FOOD_ANIMALS = ['cow', 'pig', 'sheep', 'chicken', 'rabbit']
const RAW_TO_COOKED = { beef: 'cooked_beef', porkchop: 'cooked_porkchop', mutton: 'cooked_mutton', chicken: 'cooked_chicken', rabbit: 'cooked_rabbit' }
const FUEL = ['coal', 'charcoal', ...PLANKS, ...LOGS]

const sleep = ms => new Promise(r => setTimeout(r, ms))

class Interrupted extends Error {}

function withTimeout (promise, ms, what) {
  let timer
  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    new Promise((resolve, reject) => { timer = setTimeout(() => reject(new Error(`${what} timed out`)), ms) })
  ])
}

class Skills {
  constructor (bot, memory, config) {
    this.bot = bot
    this.memory = memory
    this.config = config
    this.mcData = require('minecraft-data')(bot.version)
    this.interrupted = false
  }

  // ---------------------------------------------------------------- inventory

  count (name) {
    const names = Array.isArray(name) ? name : [name]
    return this.bot.inventory.items().filter(i => names.includes(i.name)).reduce((n, i) => n + i.count, 0)
  }

  has (name, n = 1) { return this.count(name) >= n }

  item (name) {
    const names = Array.isArray(name) ? name : [name]
    return this.bot.inventory.items().find(i => names.includes(i.name))
  }

  bestOf (names) { for (const n of names) if (this.has(n)) return n; return null }

  plankCount () { return this.count(PLANKS) }
  logCount () { return this.count(LOGS) }

  check () { if (this.interrupted) throw new Interrupted('interrupted') }

  // The inventory updates a moment after crafting or picking up; wait for it instead of guessing.
  async waitFor (cond, ms = 2000) {
    const until = Date.now() + ms
    while (!cond() && Date.now() < until) await sleep(50)
    return cond()
  }

  // ---------------------------------------------------------------- movement

  async goto (goal, timeoutMs = 60000) {
    this.check()
    try {
      await withTimeout(this.bot.pathfinder.goto(goal), timeoutMs, 'walking')
    } finally {
      this.bot.pathfinder.setGoal(null)
    }
    this.check()
  }

  async gotoNear (pos, range = 2, timeoutMs) { return this.goto(new goals.GoalNear(pos.x, pos.y, pos.z, range), timeoutMs) }

  // Underground means no sky light at head height.
  underground () {
    const head = this.bot.blockAt(this.bot.entity.position.offset(0, 1.6, 0))
    return head ? (head.skyLight || 0) === 0 : false
  }

  // Dig a staircase up until there's sky, like a player climbing out of a mine.
  async surface () {
    for (let i = 0; i < 12 && this.underground(); i++) {
      this.check()
      const p = this.bot.entity.position.floored()
      const dir = [[1, 0], [-1, 0], [0, 1], [0, -1]][i % 4]
      log('heading up to the surface from y', p.y)
      await this.goto(new goals.GoalBlock(p.x + dir[0] * 6, p.y + 6, p.z + dir[1] * 6), 60000).catch(e => { if (e instanceof Interrupted) throw e; log('climb:', e.message) })
    }
  }

  // Walk somewhere new to load fresh chunks, like a player looking around.
  async explore (distance = 48) {
    if (this.underground()) await this.surface()
    const angle = Math.random() * Math.PI * 2
    const p = this.bot.entity.position
    const x = Math.round(p.x + Math.cos(angle) * distance)
    const z = Math.round(p.z + Math.sin(angle) * distance)
    log('exploring toward', x, z)
    this.bot.setControlState('sprint', true)
    try { await this.goto(new goals.GoalXZ(x, z), 45000) } catch (e) { if (e instanceof Interrupted) throw e } finally { this.bot.setControlState('sprint', false) }
  }

  // ---------------------------------------------------------------- blocks

  // Blocks the bot could plausibly see: next to air or another see-through block.
  // With realism.xray off it won't beeline for ore buried in solid stone.
  exposed (pos) {
    if (this.config.realism && this.config.realism.xray) return true
    for (const d of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]) {
      const b = this.bot.blockAt(pos.offset(...d))
      if (b && (b.boundingBox === 'empty' || b.name.includes('leaves') || b.name.includes('glass'))) return true
    }
    return false
  }

  nearLiquid (pos) {
    for (const d of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, 0, 1], [0, 0, -1], [0, 2, 0]]) {
      const b = this.bot.blockAt(pos.offset(...d))
      if (b && (b.name === 'water' || b.name === 'lava' || b.name === 'bubble_column')) return true
    }
    return false
  }

  findBlocks (names, maxDistance = 48, count = 16, requireExposed = false) {
    const ids = names.map(n => this.mcData.blocksByName[n]?.id).filter(id => id !== undefined)
    const found = this.bot.findBlocks({ matching: ids, maxDistance, count: count * 4 })
    return found.filter(p => (!requireExposed || this.exposed(p)) && !this.nearLiquid(p)).slice(0, count)
  }

  async collect (names, wanted, { maxDistance = 48, exposedOnly = false, explore = true, label } = {}) {
    const what = label || names[0]
    let misses = 0
    const surfaceThing = names.some(n => n.endsWith('_log'))
    if (surfaceThing && this.underground() && !this.findBlocks(names, 16, 1).length) await this.surface()
    while (this.count(this.dropsFor(names)) < wanted) {
      this.check()
      const targets = this.findBlocks(names, maxDistance, 6, exposedOnly)
      if (!targets.length) {
        if (!explore || ++misses > 4) throw new Error(`no ${what} nearby`)
        await this.explore()
        continue
      }
      const blocks = targets.map(p => this.bot.blockAt(p)).filter(Boolean)
      try {
        await withTimeout(this.bot.collectBlock.collect(blocks.slice(0, 1), { ignoreNoPath: true }), 45000, `collecting ${what}`)
      } catch (e) {
        if (e instanceof Interrupted) throw e
        log(`collect ${what}:`, e.message)
        if (++misses > 6) throw e
      }
    }
  }

  dropsFor (names) {
    const map = { stone: 'cobblestone', cobblestone: 'cobblestone', deepslate: 'cobbled_deepslate', iron_ore: 'raw_iron', deepslate_iron_ore: 'raw_iron', coal_ore: 'coal', deepslate_coal_ore: 'coal', diamond_ore: 'diamond', deepslate_diamond_ore: 'diamond' }
    return [...new Set(names.map(n => map[n] || n))]
  }

  // A spot on the ground near the bot where a block can go.
  findPlaceSpot () {
    const base = this.bot.entity.position.floored()
    for (let r = 1; r <= 3; r++) {
      for (let dx = -r; dx <= r; dx++) {
        for (let dz = -r; dz <= r; dz++) {
          if (Math.abs(dx) !== r && Math.abs(dz) !== r) continue
          for (const dy of [0, 1, -1]) {
            const at = base.offset(dx, dy, dz)
            const below = this.bot.blockAt(at.offset(0, -1, 0))
            const here = this.bot.blockAt(at)
            const above = this.bot.blockAt(at.offset(0, 1, 0))
            if (below && below.boundingBox === 'block' && here && here.name === 'air' && above && above.name === 'air') return below
          }
        }
      }
    }
    return null
  }

  async place (itemName) {
    const ref = this.findPlaceSpot()
    if (!ref) throw new Error(`no room to place ${itemName}`)
    if (!await this.waitFor(() => this.item(itemName))) throw new Error(`no ${itemName} to place`)
    await this.bot.equip(this.item(itemName), 'hand')
    await this.bot.lookAt(ref.position.offset(0.5, 1, 0.5), false)
    await this.bot.placeBlock(ref, new Vec3(0, 1, 0))
    await sleep(250)
    const placedAt = ref.position.offset(0, 1, 0)
    this.placed = [...(this.placed || []), placedAt]
    return this.bot.blockAt(placedAt)
  }

  async nearbyOrPlaced (blockName, itemName, maxDistance = 6) {
    const found = this.findBlocks([blockName], maxDistance, 1)[0]
    if (found) return this.bot.blockAt(found)
    if (!this.has(itemName)) return null
    return this.place(itemName)
  }

  // ---------------------------------------------------------------- crafting

  async craft (name, times = 1) {
    this.check()
    const item = this.mcData.itemsByName[name]
    if (!item) throw new Error(`unknown item ${name}`)
    let table = null
    let recipes = this.bot.recipesFor(item.id, null, 1, null)
    if (!recipes.length) {
      table = await this.ensureTable()
      recipes = this.bot.recipesFor(item.id, null, 1, table)
    }
    if (!recipes.length) throw new Error(`can't craft ${name} yet`)
    if (table) await this.gotoNear(table.position, 3)
    const before = this.count(name)
    await this.bot.craft(recipes[0], times, table)
    if (!await this.waitFor(() => this.count(name) > before)) throw new Error(`crafting ${name} didn't produce anything`)
    log('crafted', name, 'x', times)
    if (table && this.placedByMe(table)) await this.pickUp(table, 'crafting_table')
  }

  async ensurePlanks (n) {
    while (this.plankCount() < n) {
      if (!this.logCount()) await this.collect(LOGS, 1, { label: 'logs' })
      const log = this.item(LOGS)
      await this.craft(log.name.replace('_log', '_planks'), 1)
    }
  }

  async ensureSticks (n) {
    while (this.count('stick') < n) { await this.ensurePlanks(2); await this.craft('stick', 1) }
  }

  // Players carry their crafting table and furnace, so after using one it placed, the bot
  // breaks it and takes it along. Otherwise it gets stranded underground without one.
  placedByMe (block) { return this.placed && this.placed.some(p => p.equals(block.position)) }

  async pickUp (block, itemName) {
    try {
      const b = this.bot.blockAt(block.position)
      if (!b || b.name !== itemName) return
      await this.bot.tool.equipForBlock(b, {}).catch(() => {})
      await this.bot.dig(b, true)
      this.placed = this.placed.filter(p => !p.equals(block.position))
      const drop = await this.waitFor(() => this.bot.nearestEntity(e => e.name === 'item' && e.position.distanceTo(block.position) < 3), 1500)
      if (drop) await this.gotoNear(this.bot.nearestEntity(e => e.name === 'item' && e.position.distanceTo(block.position) < 3).position, 0, 6000).catch(() => {})
      await this.waitFor(() => this.has(itemName), 1500)
    } catch (e) { if (e instanceof Interrupted) throw e; log('pick up', itemName + ':', e.message) }
  }

  async ensureTable () {
    const near = this.findBlocks(['crafting_table'], 24, 1)[0]
    if (near) return this.bot.blockAt(near)
    if (!this.has('crafting_table')) { await this.ensurePlanks(4); await this.craft('crafting_table', 1) }
    return this.place('crafting_table')
  }

  async craftTool (name) {
    if (this.has(name)) return
    const material = name.split('_')[0]
    const sticks = name.endsWith('_sword') || name.endsWith('_shovel') ? 1 : 2
    await this.ensureTable() // first, so building the table doesn't eat the planks meant for the tool
    await this.ensureSticks(sticks)
    if (material === 'wooden') await this.ensurePlanks(3)
    await this.craft(name, 1)
  }

  // ---------------------------------------------------------------- smelting

  async smelt (input, output, wanted) {
    if (this.count(output) >= wanted || !this.has(input)) return
    if (!this.findBlocks(['furnace'], 6, 1).length && !this.has('furnace')) {
      if (this.count('cobblestone') < 8) await this.getStone(8)
      await this.craft('furnace', 1)
    }
    const furnaceBlock = await this.nearbyOrPlaced('furnace', 'furnace')
    await this.gotoNear(furnaceBlock.position, 3)
    const furnace = await this.bot.openFurnace(furnaceBlock)
    try {
      const n = Math.min(this.count(input), wanted - this.count(output))
      const fuel = this.bestOf(FUEL)
      if (!fuel) throw new Error('no fuel')
      const perFuel = fuel === 'coal' || fuel === 'charcoal' ? 8 : (fuel.endsWith('_log') ? 1.5 : 1.5)
      if (!furnace.fuelItem()) await furnace.putFuel(this.mcData.itemsByName[fuel].id, null, Math.min(this.count(fuel), Math.ceil(n / perFuel)))
      await furnace.putInput(this.mcData.itemsByName[input].id, null, n)
      log('smelting', n, input)
      const deadline = Date.now() + n * 10500 + 5000
      while (Date.now() < deadline) {
        this.check()
        await sleep(2000)
        if (furnace.outputItem()) await furnace.takeOutput()
        if (!furnace.inputItem() && !furnace.outputItem()) break
      }
      if (furnace.outputItem()) await furnace.takeOutput()
    } finally {
      furnace.close()
    }
    if (this.placedByMe(furnaceBlock)) await this.pickUp(furnaceBlock, 'furnace')
  }

  // ---------------------------------------------------------------- food and fighting

  async hunt () {
    if (this.underground()) await this.surface()
    const target = this.bot.nearestEntity(e => FOOD_ANIMALS.includes(e.name) && e.position.distanceTo(this.bot.entity.position) < 48)
    if (!target) { await this.explore(); return }
    log('hunting', target.name)
    await this.equipWeapon()
    await this.fight(target, 30000)
    await sleep(600)
    // Pick up the drops.
    const drop = this.bot.nearestEntity(e => e.name === 'item' && e.position.distanceTo(this.bot.entity.position) < 8)
    if (drop) { try { await this.gotoNear(drop.position, 0, 8000) } catch (e) { if (e instanceof Interrupted) throw e } }
  }

  async cookFood () {
    for (const [raw, cooked] of Object.entries(RAW_TO_COOKED)) {
      if (this.has(raw) && this.findBlocks(['furnace'], 24, 1).length) await this.smelt(raw, cooked, this.count(cooked) + this.count(raw))
    }
  }

  async equipWeapon () {
    const weapon = this.bestOf(['diamond_sword', 'iron_sword', 'stone_sword', 'wooden_sword', 'diamond_axe', 'iron_axe', 'stone_axe', 'wooden_axe'])
    if (weapon) await this.bot.equip(this.item(weapon), 'hand')
  }

  async fight (entity, timeoutMs = 20000) {
    await this.equipWeapon()
    this.bot.pvp.attack(entity)
    const until = Date.now() + timeoutMs
    while (entity.isValid && Date.now() < until && this.bot.health > 0) await sleep(250)
    this.bot.pvp.stop()
  }

  // Back off from something (creepers) in a straight line.
  async backOff (from, distance = 6) {
    const p = this.bot.entity.position
    const away = p.minus(from).normalize().scaled(distance).plus(p)
    this.bot.setControlState('sprint', true)
    try { await this.goto(new goals.GoalXZ(Math.round(away.x), Math.round(away.z)), 5000) } catch (e) {} finally { this.bot.setControlState('sprint', false) }
  }

  // ---------------------------------------------------------------- mining

  // Stone you can see, or else dig down through the dirt until you hit some, like a player would.
  async getStone (wanted) {
    const names = ['stone', 'cobblestone', 'deepslate', 'andesite', 'diorite', 'granite']
    for (let attempt = 0; attempt < 6 && this.count(['cobblestone', 'cobbled_deepslate']) < wanted; attempt++) {
      this.check()
      if (this.findBlocks(names, 24, 1, true).length) {
        await this.collect(['stone', 'cobblestone', 'deepslate'], wanted, { maxDistance: 24, exposedOnly: true, explore: false, label: 'stone' }).catch(e => { if (e instanceof Interrupted) throw e; log('stone:', e.message) })
        continue
      }
      // Staircase down a few blocks; stone gets uncovered on the way.
      const p = this.bot.entity.position.floored()
      const dir = [[1, 0], [-1, 0], [0, 1], [0, -1]][Math.floor(Math.random() * 4)]
      log('digging down for stone')
      await this.goto(new goals.GoalBlock(p.x + dir[0] * 6, p.y - 6, p.z + dir[1] * 6), 60000).catch(e => { if (e instanceof Interrupted) throw e; log('dig down:', e.message) })
    }
    if (this.count(['cobblestone', 'cobbled_deepslate']) < wanted) throw new Error('could not find enough stone')
  }

  // Dig a staircase down to a height, then a straight tunnel, watching for ore that the
  // digging uncovers, the way a player strip mines.
  async stripMine (oreNames, wanted, targetY = 16, tunnelLength = 12) {
    const bot = this.bot
    if (bot.entity.position.y > targetY + 2) {
      log('digging down to y', targetY)
      const p = bot.entity.position.floored()
      const dir = [[1, 0], [-1, 0], [0, 1], [0, -1]][Math.floor(Math.random() * 4)]
      const drop = p.y - targetY
      await this.goto(new goals.GoalBlock(p.x + dir[0] * drop, targetY, p.z + dir[1] * drop), 180000)
    }
    for (let leg = 0; leg < 8 && this.count(this.dropsFor(oreNames)) < wanted; leg++) {
      const seen = this.findBlocks(oreNames, 12, 4, true)
      if (seen.length) { await this.collect(oreNames, wanted, { maxDistance: 12, exposedOnly: true, explore: false, label: oreNames[0] }).catch(e => { if (e instanceof Interrupted) throw e }); continue }
      const p = bot.entity.position.floored()
      const dir = [[1, 0], [-1, 0], [0, 1], [0, -1]][Math.floor(Math.random() * 4)]
      log('tunnelling', dir)
      await this.goto(new goals.GoalBlock(p.x + dir[0] * tunnelLength, p.y, p.z + dir[1] * tunnelLength), 90000).catch(e => { if (e instanceof Interrupted) throw e; log('tunnel:', e.message) })
    }
  }

  // Out of air. Like a player: head for the nearest air you can reach (often sideways, out of an
  // underwater cave), and only dig straight up as a last resort, since digging underwater is slow.
  async swimUp () {
    const bot = this.bot
    const airId = this.mcData.blocksByName.air.id
    const air = bot.findBlocks({ matching: airId, maxDistance: 12, count: 40 })
      .filter(p => { const below = bot.blockAt(p.offset(0, -1, 0)); return below && (below.name === 'water' || below.boundingBox === 'block') })
    if (air.length) {
      const target = air[0]
      log('out of air: swimming to air at', target.toString())
      try { await withTimeout(bot.pathfinder.goto(new goals.GoalNear(target.x, target.y, target.z, 1)), 9000, 'swimming to air') } catch (e) { log('swim:', e.message) } finally { bot.pathfinder.setGoal(null) }
      if (!bot.entity.isInWater || bot.oxygenLevel >= 18) return
    }
    await bot.look(bot.entity.yaw, Math.PI / 2, true).catch(() => {})
    bot.setControlState('jump', true)
    const until = Date.now() + 8000
    while (Date.now() < until && bot.health > 0 && bot.entity.isInWater) {
      const above = bot.blockAt(bot.entity.position.offset(0, 2, 0))
      if (above && above.boundingBox === 'block' && above.diggable) { await bot.tool.equipForBlock(above, {}).catch(() => {}); await bot.dig(above, true).catch(() => {}) }
      await sleep(150)
    }
    bot.clearControlStates()
  }

  // ---------------------------------------------------------------- shelter

  // Dig two blocks down and close the hole above: a quick, safe place to wait out the night.
  async digIn () {
    const bot = this.bot
    const p = bot.entity.position.floored()
    for (const dy of [-1, -2]) {
      const b = bot.blockAt(p.offset(0, dy, 0))
      if (b && b.diggable && b.name !== 'air') { await bot.dig(b, true) }
    }
    await sleep(800)
    const roofItem = this.bestOf(['dirt', 'cobblestone', 'cobbled_deepslate', ...PLANKS])
    if (roofItem) {
      const head = bot.entity.position.floored().offset(0, 2, 0)
      const ref = bot.blockAt(head.offset(1, 0, 0)) || bot.blockAt(head.offset(-1, 0, 0))
      if (ref && ref.boundingBox === 'block') {
        try { await bot.equip(this.item(roofItem), 'hand'); await bot.placeBlock(ref, new Vec3(-1, 0, 0)) } catch (e) { log('roof:', e.message) }
      }
    }
  }
}

module.exports = { Skills, Interrupted, LOGS, PLANKS, FOOD_ANIMALS, RAW_TO_COOKED, sleep }
