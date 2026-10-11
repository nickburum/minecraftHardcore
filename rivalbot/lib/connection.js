// Connects to the server and patches what the 26.3 server expects from a client.
const mineflayer = require('mineflayer')

const MOVE_PACKETS = new Set(['position', 'position_look', 'look', 'flying'])

function connect (config) {
  const bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: config.username,
    auth: config.auth || 'offline', // 'microsoft' for a real (alt) account: sign in once with the device code it prints
    version: config.version || '26.1',
    profilesFolder: config.profilesFolder || './.auth-cache',
    checkTimeoutInterval: 60 * 1000
  })

  // 26.3 allows one position packet per client tick and only resets that when the client sends
  // tick_end, which the real client does every tick and mineflayer doesn't. Without this the
  // server kicks the bot with "Invalid move player packet received".
  const write = bot._client.write.bind(bot._client)
  bot._client.write = (name, params) => {
    const result = write(name, params)
    if (MOVE_PACKETS.has(name)) write('tick_end', {})
    return result
  }
  return bot
}

module.exports = { connect }
