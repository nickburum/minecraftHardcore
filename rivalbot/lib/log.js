const t0 = Date.now()
function log (...args) {
  const s = ((Date.now() - t0) / 1000).toFixed(1).padStart(7)
  console.log(`[${s}s]`, ...args)
}
module.exports = { log }
