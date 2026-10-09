import { GAME, PLAYER, POOLS } from '../config/gameConfig'

// Estado mutable de alta frecuencia: se lee/escribe dentro de useFrame sin
// pasar por React. Zustand solo guarda lo que necesita la UI.
export const runtime = {
  speed: GAME.startSpeed,
  distance: 0,
  elapsed: 0,
  timeScale: 1,
  lastRowZ: 0,
  nextGap: GAME.firstGap,
  shake: 0,
  power: 1, // 0 = apagón total, 1 = luces normales
  blackoutAt: 0,
  player: { x: 0, y: 0, height: PLAYER.height },
}

// Object pools: se crean una sola vez. Un elemento "libre" (active = false) que pasó detrás
// de la cámara se reubica delante del jugador en el siguiente spawn; nunca se crea ni destruye.
export const potholes = Array.from({ length: POOLS.potholes }, (_, id) => ({
  id,
  active: false,
  lane: 1,
  z: 0,
  rotation: 0,
  scale: 1,
}))

export const barriers = Array.from({ length: POOLS.barriers }, (_, id) => ({
  id,
  active: false,
  lane: 1,
  z: 0,
}))

export const energyOrbs = Array.from({ length: POOLS.energyOrbs }, (_, id) => ({
  id,
  active: false,
  collected: false,
  collectT: 0,
  lane: 1,
  z: 0,
  y: 1,
}))

export const speedProgress = () =>
  (runtime.speed - GAME.startSpeed) / (GAME.maxSpeed - GAME.startSpeed)

export function resetRuntime() {
  runtime.speed = GAME.startSpeed
  runtime.distance = 0
  runtime.elapsed = 0
  runtime.timeScale = 1
  runtime.lastRowZ = 0
  runtime.nextGap = GAME.firstGap
  runtime.shake = 0
  runtime.power = 1
  runtime.player.x = 0
  runtime.player.y = 0
  runtime.player.height = PLAYER.height
  for (const pool of [potholes, barriers, energyOrbs]) for (const item of pool) item.active = false
}
