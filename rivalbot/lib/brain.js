// Decides what to do next. The plan is a speedrun route; reflexes interrupt it when
// something attacks, a creeper gets close, health drops or night falls.
const { Skills, Interrupted, LOGS, RAW_TO_COOKED, sleep } = require('./skills')
const { Personality } = require('./personality')
const { log } = require('./log')

const HOSTILE = new Set(['zombie', 'husk', 'drowned', 'skeleton', 'stray', 'bogged', 'spider', 'cave_spider', 'creeper', 'witch', 'slime', 'enderman', 'silverfish', 'zombie_villager', 'pillager', 'vindicator', 'phantom', 'blaze', 'magma_cube', 'piglin_brute', 'hoglin', 'wither_skeleton', 'breeze', 'creaking'])
const FOODS = ['cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'cooked_chicken', 'cooked_rabbit', 'bread', 'apple', 'baked_potato', 'carrot', 'beef', 'porkchop', 'mutton', 'chicken', 'rabbit']

class Brain {
  constructor (bot, memory, config) {
    this.bot = bot
    this.memory = memory
    this.config = config
    this.skills = new Skills(bot, memory, config)
    this.say = new Personality(bot, config)
    this.reflexBusy = false
    this.lastDeath = null
    this.plan = this.makePlan()
  }

  makePlan () {
    const s = this.skills
    const ironSkill = () => (this.memory.data.skills['iron (look around)'] || { ok: 0, fail: 0 })
    return [
      { name: 'wood', done: () => s.has('wooden_pickaxe') || s.has('stone_pickaxe') || s.logCount() + s.plankCount() / 4 >= 5, run: () => s.collect(LOGS, 6, { label: 'logs' }), milestone: 'wood' },
      { name: 'wooden pickaxe', done: () => s.has('wooden_pickaxe') || s.has('stone_pickaxe') || s.has('iron_pickaxe'), run: () => s.craftTool('wooden_pickaxe') },
      { name: 'stone', done: () => s.has('stone_pickaxe') || s.count('cobblestone') >= 16, run: () => s.collect(['stone', 'cobblestone'], 16, { exposedOnly: true, label: 'stone' }) },
      { name: 'stone tools', done: () => (s.has('stone_pickaxe') || s.has('iron_pickaxe')) && (s.has('stone_sword') || s.has('iron_sword')) && s.has('stone_axe'), run: async () => { await s.craftTool('stone_pickaxe'); await s.craftTool('stone_sword'); await s.craftTool('stone_axe') }, milestone: 'stone' },
      { name: 'food', done: () => s.count(FOODS) >= 6, run: () => s.hunt() },
      { name: 'furnace', done: () => s.has('furnace') || s.findBlocks(['furnace'], 24, 1).length > 0, run: async () => { if (s.count('cobblestone') < 8) await s.collect(['stone', 'cobblestone'], 8, { exposedOnly: true, label: 'stone' }); await s.craft('furnace', 1) } },
      { name: 'cook food', done: () => !Object.keys(RAW_TO_COOKED).some(r => s.has(r)), run: async () => { await s.nearbyOrPlaced('furnace', 'furnace'); await s.cookFood() } },
      {
        name: 'iron',
        done: () => s.count(['raw_iron', 'iron_ingot']) >= 16 || s.has('iron_chestplate'),
        run: async () => {
          // Learned behavior: if looking around for visible iron keeps failing, go straight to strip mining.
          const look = ironSkill()
          if (look.fail <= look.ok + 1) {
            const t = Date.now()
            try { await s.collect(['iron_ore', 'deepslate_iron_ore'], 16, { maxDistance: 32, exposedOnly: true, label: 'iron', explore: false }); this.memory.skill('iron (look around)', true, (Date.now() - t) / 1000); return } catch (e) { if (e instanceof Interrupted) throw e; this.memory.skill('iron (look around)', false) }
          }
          await s.stripMine(['iron_ore', 'deepslate_iron_ore'], 16, 16)
        },
        milestone: 'iron'
      },
      { name: 'smelt iron', done: () => s.count('raw_iron') === 0 || s.count('iron_ingot') >= 16, run: () => s.smelt('raw_iron', 'iron_ingot', 16) },
      { name: 'iron gear', done: () => s.has('iron_pickaxe') && s.has('iron_sword') && s.has('bucket') && s.has('iron_chestplate'), run: async () => { for (const t of ['iron_pickaxe', 'iron_sword']) await s.craftTool(t); if (!s.has('bucket')) await s.craft('bucket'); if (!s.has('iron_chestplate')) await s.craft('iron_chestplate') }, milestone: 'iron gear' },
      { name: 'more iron', done: () => ['iron_helmet', 'iron_leggings', 'iron_boots'].every(a => s.has(a) || this.wearing(a)) || s.count(['raw_iron', 'iron_ingot']) >= 16, run: () => s.stripMine(['iron_ore', 'deepslate_iron_ore'], 16, 16) },
      { name: 'smelt more iron', done: () => s.count('raw_iron') === 0, run: () => s.smelt('raw_iron', 'iron_ingot', 32) },
      { name: 'iron armor', done: () => ['iron_helmet', 'iron_leggings', 'iron_boots'].every(a => s.has(a) || this.wearing(a)), run: async () => { for (const a of ['iron_helmet', 'iron_leggings', 'iron_boots']) if (!s.has(a) && !this.wearing(a)) await s.craft(a) }, milestone: 'armor' },
      { name: 'diamonds', done: () => s.count('diamond') >= 3 || s.has('diamond_pickaxe'), run: () => s.stripMine(['diamond_ore', 'deepslate_diamond_ore'], 3, -54, 32), milestone: 'diamonds' },
      { name: 'diamond pickaxe', done: () => s.has('diamond_pickaxe'), run: () => s.craftTool('diamond_pickaxe') },
      // The Nether and the End are the next stages to build. Until then it keeps getting stronger.
      { name: 'stockpile', done: () => false, run: async () => { await s.hunt(); await s.stripMine(['iron_ore', 'deepslate_iron_ore', 'diamond_ore', 'deepslate_diamond_ore'], s.count(['raw_iron', 'diamond']) + 8, -20) } }
    ]
  }

  wearing (name) { return Object.values(this.bot.entity.equipment || {}).some(i => i && i.name === name) || this.bot.inventory.slots.slice(5, 9).some(i => i && i.name === name) }

  isNight () { const t = this.bot.time.timeOfDay; return t > 13000 && t < 23000 }

  // ---------------------------------------------------------------- main loop

  async run () {
    log('brain started')
    this.say.event('hello')
    while (true) {
      if (!this.bot.entity || this.bot.health <= 0 || this.reflexBusy) { await sleep(500); continue }
      if (this.pendingRecovery) { const r = this.pendingRecovery; this.pendingRecovery = null; await this.recoverItems(r).catch(e => log('recover:', e.message)); continue }
      const step = this.plan.find(g => !g.done())
      this.current = step.name
      const t = Date.now()
      try {
        await step.run()
        if (step.done()) {
          this.memory.skill(step.name, true, (Date.now() - t) / 1000)
          log('done:', step.name)
          if (step.milestone) this.say.event(step.milestone)
        }
      } catch (e) {
        if (e instanceof Interrupted || this.skills.interrupted) { while (this.reflexBusy) await sleep(300); continue }
        this.memory.skill(step.name, false)
        log(`failed: ${step.name}:`, e.message)
        await sleep(1000)
        try { await this.skills.explore(32) } catch (e2) {}
      }
    }
  }

  // ---------------------------------------------------------------- reflexes

  startReflexes () {
    setInterval(() => this.reflex().catch(e => log('reflex:', e.message)), 400)
  }

  interrupt () {
    this.skills.interrupted = true
    try { this.bot.pathfinder.setGoal(null) } catch (e) {}
    try { this.bot.collectBlock.cancelTask() } catch (e) {}
  }

  async reflex () {
    if (this.reflexBusy || !this.bot.entity || this.bot.health <= 0) return
    const bot = this.bot
    const st = this.memory.style
    const me = bot.entity.position
    const threats = Object.values(bot.entities).filter(e => e.type === 'hostile' || HOSTILE.has(e.name)).filter(e => e.position.distanceTo(me) < 10)
    threats.sort((a, b) => a.position.distanceTo(me) - b.position.distanceTo(me))
    const creeper = threats.find(e => e.name === 'creeper' && e.position.distanceTo(me) < st.keepAwayFromCreepers)
    const close = threats.find(e => e.position.distanceTo(me) < 5 && e.name !== 'enderman')
    const surfaceNight = st.shelterAtNight && this.isNight() && me.y > 55 && !this.sheltered

    let action = null
    if (bot.oxygenLevel !== undefined && bot.oxygenLevel < 10 && bot.entity.isInWater) action = async () => { log('out of air, swimming up'); await this.skills.swimUp() }
    else if (creeper) action = async () => { log('creeper! backing off'); this.say.event('creeper'); await this.skills.backOff(creeper.position, 8) }
    else if (close && bot.health < st.retreatHealth) action = async () => { log('low health, retreating'); this.say.event('retreat'); await this.skills.backOff(close.position, 12); await this.eatIfPossible() }
    else if (close && st.fightBack) action = async () => { log('fighting', close.name); await this.skills.fight(close, 15000) }
    else if (surfaceNight) action = async () => { log('night: digging in'); this.say.event('night'); await this.skills.digIn(); this.sheltered = true; while (this.isNight()) await sleep(2000); this.sheltered = false; this.say.event('morning') }
    if (!action) return

    this.reflexBusy = true
    this.interrupt()
    try { await action() } finally { this.skills.interrupted = false; this.reflexBusy = false }
  }

  async eatIfPossible () {
    const food = this.skills.item(FOODS)
    if (!food || this.bot.food >= 20) return
    await this.bot.equip(food, 'hand')
    try { await this.bot.consume() } catch (e) {}
  }

  // ---------------------------------------------------------------- death and learning

  onDeathMessage (text) {
    const lower = text.toLowerCase()
    let cause = 'other'
    if (/lava/.test(lower)) cause = 'lava'
    else if (/blown up|explod/.test(lower)) cause = 'creeper'
    else if (/fell|hit the ground|fall/.test(lower)) cause = 'fall'
    else if (/drown/.test(lower)) cause = 'drowning'
    else if (/slain|shot|killed|stung|poke/.test(lower)) cause = 'mob'
    else if (/burn|fire|flames/.test(lower)) cause = 'fire'
    else if (/starv/.test(lower)) cause = 'starving'
    const pos = this.bot.entity ? this.bot.entity.position.clone() : null
    const lesson = this.memory.learnFromDeath(cause, { message: text, night: this.isNight(), doing: this.current, pos: pos && pos.floored().toArray() })
    log('died:', cause, '-', text)
    this.lastDeath = { pos, at: Date.now(), dimension: this.bot.game.dimension }
    this.interrupt()
    this.say.event('death')
    if (lesson) setTimeout(() => this.say.line(lesson), 6000)
  }

  onRespawn () {
    this.skills.interrupted = false
    if (this.lastDeath && this.lastDeath.pos && Date.now() - this.lastDeath.at < 4 * 60 * 1000) this.pendingRecovery = this.lastDeath
  }

  // Run back for the items, like anyone would.
  async recoverItems (death) {
    if (this.bot.game.dimension !== death.dimension) return
    const d = this.bot.entity.position.distanceTo(death.pos)
    if (d > 400) return
    log('going back for my stuff,', Math.round(d), 'blocks')
    this.say.event('recover')
    await this.skills.gotoNear(death.pos, 2, 180000)
    for (let i = 0; i < 6; i++) {
      const drop = this.bot.nearestEntity(e => e.name === 'item' && e.position.distanceTo(this.bot.entity.position) < 10)
      if (!drop) break
      await this.skills.gotoNear(drop.position, 0, 8000).catch(() => {})
    }
  }
}

module.exports = { Brain }
