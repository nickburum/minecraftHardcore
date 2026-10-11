// What the bot has learned, kept between runs in a JSON file.
// Each death is recorded with its likely cause, and a few play-style settings change
// in response, so the bot plays a little differently after it gets burned.
const fs = require('fs')

const DEFAULTS = {
  runs: 0,
  deaths: [],
  skills: {},
  style: {
    retreatHealth: 8, // flee and heal below this many health points
    shelterAtNight: false, // dig in at night instead of working on the surface
    avoidLava: false, // treat lava as very expensive when pathfinding
    keepAwayFromCreepers: 4, // back off from creepers inside this distance
    fightBack: true
  },
  lessons: []
}

class Memory {
  constructor (file) {
    this.file = file
    try {
      const saved = JSON.parse(fs.readFileSync(file, 'utf8'))
      this.data = { ...DEFAULTS, ...saved, style: { ...DEFAULTS.style, ...saved.style } }
    } catch (e) {
      this.data = JSON.parse(JSON.stringify(DEFAULTS))
    }
  }

  get style () { return this.data.style }

  save () { fs.writeFileSync(this.file, JSON.stringify(this.data, null, 2)) }

  skill (name, ok, seconds) {
    const s = this.data.skills[name] || (this.data.skills[name] = { ok: 0, fail: 0, seconds: 0 })
    if (ok) { s.ok++; s.seconds += seconds } else s.fail++
    this.save()
  }

  // Returns a short lesson to say in chat, or null if nothing new was learned.
  learnFromDeath (cause, details) {
    this.data.deaths.push({ cause, ...details, at: new Date().toISOString() })
    const st = this.data.style
    let lesson = null
    const times = this.data.deaths.filter(d => d.cause === cause).length
    if (cause === 'lava' && !st.avoidLava) { st.avoidLava = true; lesson = 'Lesson learned: lava is not a floor. Avoiding it from now on.' }
    else if (cause === 'creeper') { st.keepAwayFromCreepers = Math.min(10, st.keepAwayFromCreepers + 2); lesson = `Lesson learned: creepers explode. Keeping ${st.keepAwayFromCreepers} blocks away now.` }
    else if (cause === 'mob' && details.night && !st.shelterAtNight) { st.shelterAtNight = true; lesson = 'Lesson learned: nights are dangerous. I will dig in after dark.' }
    else if (cause === 'mob') { st.retreatHealth = Math.min(14, st.retreatHealth + 2); lesson = `Lesson learned: run away sooner. Retreating at ${st.retreatHealth / 2} hearts now.` }
    else if (cause === 'fall') { lesson = 'Lesson learned: look before you leap.' }
    else if (cause === 'drowning') { lesson = 'Lesson learned: I need air. Who knew.' }
    if (times >= 3 && !lesson) lesson = `That is ${times} deaths to ${cause}. I am starting to see a pattern.`
    if (lesson) this.data.lessons.push(lesson)
    this.save()
    return lesson
  }
}

module.exports = { Memory }
