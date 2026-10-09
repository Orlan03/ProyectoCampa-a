import { ENERGY, GAME, LANES, OBSTACLE_WEIGHTS } from '../config/gameConfig'
import { pick, randRange, shuffle } from '../utils/random'
import { barriers, energyOrbs, potholes } from './runtime'

const LANE_IDS = [0, 1, 2]
const POOL_BY_TYPE = { pothole: potholes, barrier: barriers }

const acquire = (pool) => pool.find((item) => !item.active)
const freeCount = (pool) => pool.reduce((n, item) => n + (item.active ? 0 : 1), 0)

function pickType() {
  let r = Math.random()
  for (const [type, weight] of Object.entries(OBSTACLE_WEIGHTS)) {
    if ((r -= weight) <= 0) return type
  }
  return 'pothole'
}

export function nextGap(speed) {
  const [min, max] = GAME.gapTime
  return Math.max(GAME.minGap, speed * randRange(min, max))
}

function placeOrb(lane, z, y) {
  const orb = acquire(energyOrbs)
  Object.assign(orb, { active: true, collected: false, collectT: 0, lane, x: LANES[lane], z, y })
}

function orbLine(lane, rowZ) {
  for (let i = 0; i < ENERGY.perLine; i++) placeOrb(lane, rowZ + 3 + i * ENERGY.spacing, 1)
}

// Arco de energía sobre un obstáculo: premia el salto y enseña el momento justo.
function orbArc(lane, centerZ) {
  const half = (ENERGY.perLine - 1) / 2
  for (let i = 0; i < ENERGY.perLine; i++) {
    const k = (i - half) / (half + 0.6)
    placeOrb(lane, centerZ + (i - half) * 1.8, 1 + 1.6 * (1 - k * k))
  }
}

/** Reubica elementos libres del pool delante del jugador formando una fila. */
export function spawnRow(z) {
  const roll = Math.random()
  const count = roll < 0.45 ? 1 : roll < 0.85 ? 2 : 3
  const lanes = shuffle(LANE_IDS).slice(0, count)
  const obstacleZ = [null, null, null]

  // Baches y vallas se pueden saltar, así que incluso una fila de 3 es superable.
  for (const lane of lanes) {
    let type = pickType()
    let item = acquire(POOL_BY_TYPE[type])
    if (!item) {
      type = type === 'pothole' ? 'barrier' : 'pothole'
      item = acquire(POOL_BY_TYPE[type])
    }
    if (!item) break

    const oz = z + (type === 'pothole' ? randRange(-1.2, 1.2) : 0)
    item.active = true
    item.lane = lane
    item.z = oz
    if (type === 'pothole') {
      item.rotation = Math.random() * Math.PI * 2
      item.scale = randRange(0.9, 1.15)
    }
    obstacleZ[lane] = oz
  }

  // Solo se colocan grupos completos de energía para no dejar líneas cortadas.
  if (Math.random() > 0.75 || freeCount(energyOrbs) < ENERGY.perLine) return
  const free = LANE_IDS.filter((l) => obstacleZ[l] === null)
  const blocked = LANE_IDS.filter((l) => obstacleZ[l] !== null)
  if (!blocked.length || (free.length && Math.random() < 0.7)) {
    orbLine(pick(free), z)
  } else {
    const lane = pick(blocked)
    orbArc(lane, obstacleZ[lane])
  }
}
