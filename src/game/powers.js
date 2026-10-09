import { barriers, potholes } from './runtime'

/** Apaga el bache o la valla que está más cerca, delante del jugador. */
export function clearAhead() {
  let best = null
  for (const pool of [potholes, barriers]) {
    for (const obstacle of pool) {
      if (!obstacle.active || obstacle.z > -0.4) continue
      if (!best || obstacle.z > best.z) best = obstacle
    }
  }
  if (!best) return false
  best.active = false
  return true
}
