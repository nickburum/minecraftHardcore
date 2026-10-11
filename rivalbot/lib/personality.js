// How the bot talks and carries itself: kid-friendly trash talk in chat, plus small human habits
// (looking around, hopping while sprinting, pausing) so it doesn't move like a robot.
const { log } = require('./log')

const LINES = {
  hello: ['Hey! Ready to lose? Just kidding. Mostly.', 'Bot online. The race is on!', 'Hello! I have been practicing. A lot.'],
  wood: ['Got wood. Tree punching: complete.', 'Logs collected. Speedrun mode activated.'],
  stone: ['Stone tools! I am basically a caveman now.', 'Stone pickaxe ready. How is your progress going?'],
  iron: ['Found iron! The System says I am doing great.', 'Iron acquired. Things are getting serious.'],
  'iron gear': ['Iron pickaxe and sword. Try and catch me now!', 'Shiny new iron gear. You should get some too. If you can.'],
  armor: ['Full iron armor! I am a tin can of doom.', 'Armor on. Zombies, please form an orderly line.'],
  diamonds: ['DIAMONDS! Okay, I am excited.', 'Diamonds found. This is going very well for me.'],
  creeper: ['Nope. Not today, creeper.', 'Creeper! Walking away. Calmly. Very calmly.'],
  retreat: ['Tactical retreat!', 'Running away is a strategy. A good one.'],
  night: ['Getting dark. Digging in until morning.', 'Night time. I learned my lesson. Hiding in a hole.'],
  morning: ['Good morning! Back to winning.', 'Sun is up. Let us go.'],
  death: ['Ouch. That was embarrassing.', 'I will be back. Probably.', 'Okay, that did not go to plan.'],
  recover: ['Going back for my stuff.', 'Nobody touch my items! I am coming.']
}

class Personality {
  constructor (bot, config) {
    this.bot = bot
    this.chatty = !config.realism || config.realism.chatty !== false
    this.lastChat = 0
    this.idle()
  }

  line (text) {
    if (!this.chatty || !text) return
    const now = Date.now()
    if (now - this.lastChat < 4000) return
    this.lastChat = now
    try { this.bot.chat(text) } catch (e) {}
  }

  event (name) {
    const options = LINES[name]
    if (options) this.line(options[Math.floor(Math.random() * options.length)])
  }

  // Small human habits.
  idle () {
    setInterval(() => {
      const bot = this.bot
      if (!bot.entity || bot.health <= 0) return
      const moving = bot.getControlState('forward') || bot.pathfinder?.isMoving()
      // Hop now and then while sprinting on open ground, like players do.
      if (moving && bot.getControlState('sprint') && bot.entity.onGround && Math.random() < 0.15) {
        bot.setControlState('jump', true)
        setTimeout(() => bot.setControlState('jump', false), 250)
      }
      // Glance around when standing still.
      if (!moving && !bot.pvp?.target && Math.random() < 0.35) {
        const yaw = bot.entity.yaw + (Math.random() - 0.5) * 1.6
        const pitch = (Math.random() - 0.5) * 0.6
        bot.look(yaw, pitch, false).catch(() => {})
      }
    }, 1500)
  }
}

module.exports = { Personality, LINES }
