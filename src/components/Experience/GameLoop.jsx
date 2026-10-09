import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { GAME } from '../../config/gameConfig'
import { fallsInPothole, hitsBarrier, touchesOrb } from '../../game/collisions'
import { barriers, energyOrbs, potholes, runtime, speedProgress } from '../../game/runtime'
import { nextGap, spawnRow } from '../../game/spawner'
import { useGameStore } from '../../store/useGameStore'

// Avanza un pool de obstáculos; devuelve true si el jugador chocó.
function advanceObstacles(pool, dz, hits) {
  for (const o of pool) {
    if (!o.active) continue
    const prevZ = o.z
    o.z += dz
    if (hits(runtime.player, o, prevZ)) return true
    // Pasó detrás de la cámara: queda libre para que el spawner lo recicle delante.
    if (o.z > GAME.despawnZ) o.active = false
  }
  return false
}

// Debe montarse antes que el resto de la escena para que sus useFrame corran primero.
export function GameLoop() {
  const uiTimer = useRef(0)

  useFrame((_, dt) => {
    const store = useGameStore.getState()
    if (store.status !== 'playing') return
    const d = Math.min(dt, 0.05)

    runtime.elapsed += d
    runtime.speed = Math.min(GAME.maxSpeed, GAME.startSpeed + GAME.acceleration * runtime.elapsed)
    runtime.timeScale = 1 + speedProgress() * 0.45
    const dz = runtime.speed * d
    runtime.distance += dz

    if (advanceObstacles(potholes, dz, fallsInPothole) || advanceObstacles(barriers, dz, hitsBarrier)) {
      runtime.shake = 0.6
      store.crash()
      return
    }

    for (const orb of energyOrbs) {
      if (!orb.active) continue
      const prevZ = orb.z
      orb.z += dz
      if (orb.collected) {
        orb.collectT += d
        if (orb.collectT > 0.3) orb.active = false
      } else if (touchesOrb(runtime.player, orb, prevZ)) {
        orb.collected = true
        store.addEnergy()
      } else if (orb.z > GAME.despawnZ) {
        orb.active = false
      }
    }

    runtime.lastRowZ += dz
    while (runtime.lastRowZ - runtime.nextGap >= GAME.spawnZ) {
      runtime.lastRowZ -= runtime.nextGap
      spawnRow(runtime.lastRowZ)
      runtime.nextGap = nextGap(runtime.speed)
    }

    uiTimer.current += d
    if (uiTimer.current > 0.1) {
      uiTimer.current = 0
      store.setDistance(Math.floor(runtime.distance))
    }
  })

  return null
}
