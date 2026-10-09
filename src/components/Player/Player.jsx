import { useCallback, useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils } from 'three'
import { GAME, LANES, PLAYER } from '../../config/gameConfig'
import { runtime } from '../../game/runtime'
import { useGameControls } from '../../hooks/useGameControls'
import { useGameStore } from '../../store/useGameStore'
import { PlayerModel } from './PlayerModel'

const { damp } = MathUtils
const CENTER_LANE = 1

const createState = () => ({
  lane: CENTER_LANE,
  y: 0,
  vy: 0,
  grounded: true,
  slideTime: 0,
  phase: 0,
})

function dampLimb(limb, value, lambda, d) {
  if (limb) limb.rotation.x = damp(limb.rotation.x, value, lambda, d)
}

// Argumentos sueltos (sin objetos) porque se llama cada frame.
function poseLimbs(limbs, legL, legR, armL, armR, lambda, d) {
  dampLimb(limbs.legL, legL, lambda, d)
  dampLimb(limbs.legR, legR, lambda, d)
  dampLimb(limbs.armL, armL, lambda, d)
  dampLimb(limbs.armR, armR, lambda, d)
}

export function Player() {
  const root = useRef()
  const body = useRef()
  const shadow = useRef()
  const limbs = useRef({})
  const state = useRef(createState())
  const status = useGameStore((s) => s.status)
  const runId = useGameStore((s) => s.runId)

  useEffect(() => {
    state.current = createState()
    root.current?.position.set(LANES[CENTER_LANE], 0, 0)
    body.current?.rotation.set(0, 0, 0)
  }, [runId])

  const onAction = useCallback((action) => {
    const s = state.current
    switch (action) {
      case 'left':
        s.lane = Math.max(0, s.lane - 1)
        break
      case 'right':
        s.lane = Math.min(LANES.length - 1, s.lane + 1)
        break
      case 'jump':
        if (s.grounded) {
          s.vy = GAME.jumpVelocity
          s.grounded = false
          s.slideTime = 0
        }
        break
      case 'slide':
        s.slideTime = GAME.slideDuration
        if (!s.grounded) s.vy = Math.min(s.vy, -GAME.jumpVelocity * 1.1)
        break
    }
  }, [])

  useGameControls(onAction, status === 'playing')

  useFrame((_, dt) => {
    const r = root.current
    const b = body.current
    if (!r || !b) return
    const d = Math.min(dt, 0.05)
    const s = state.current
    const L = limbs.current
    const currentStatus = useGameStore.getState().status

    if (currentStatus === 'blackout' || currentStatus === 'gameover') {
      r.position.y = damp(r.position.y, -0.3, 10, d)
      b.rotation.x = damp(b.rotation.x, -0.5, 8, d)
      poseLimbs(L, 0.6, -0.4, 1.4, 1.2, 10, d)
      return
    }

    if (currentStatus === 'menu') {
      s.phase += d * 2.2
      b.position.y = Math.sin(s.phase) * 0.015
      poseLimbs(L, 0, 0, 0.08, 0.08, 6, d)
      return
    }

    // Cambio de carril suave (damp = lerp independiente del framerate).
    const targetX = LANES[s.lane]
    r.position.x = damp(r.position.x, targetX, GAME.laneDamping, d)

    // Física vertical; timeScale acorta el salto cuando el juego acelera.
    const ts = runtime.timeScale
    if (!s.grounded) {
      s.vy -= GAME.gravity * d * ts
      s.y += s.vy * d * ts
      if (s.y <= 0) {
        s.y = 0
        s.vy = 0
        s.grounded = true
      }
    }
    r.position.y = s.y

    s.slideTime = Math.max(0, s.slideTime - d)
    const sliding = s.slideTime > 0

    const lateral = targetX - r.position.x
    b.rotation.z = damp(b.rotation.z, -lateral * 0.12, 10, d)
    b.rotation.y = damp(b.rotation.y, -lateral * 0.1, 10, d)
    b.rotation.x = damp(b.rotation.x, sliding ? 1.15 : 0, 16, d)

    s.phase += d * 11 * Math.sqrt(runtime.speed / GAME.startSpeed)
    const swing = Math.sin(s.phase)

    if (sliding) {
      b.position.y = damp(b.position.y, 0.12, 16, d)
      poseLimbs(L, 1.3, 1.1, -0.6, -0.6, 16, d)
    } else if (!s.grounded) {
      b.position.y = damp(b.position.y, 0, 16, d)
      poseLimbs(L, 1.0, -0.3, -1.2, 0.6, 14, d)
    } else {
      // Ciclo de carrera: dos rebotes por zancada.
      b.position.y = Math.abs(swing) * 0.09
      poseLimbs(L, swing * 0.9, -swing * 0.9, -swing * 0.8, swing * 0.8, 22, d)
    }

    runtime.player.x = r.position.x
    runtime.player.y = s.y
    runtime.player.height = sliding ? PLAYER.slideHeight : PLAYER.height

    // Sombra local pegada al asfalto (no usa ContactShadows: ese pase pintaba franjas al moverse).
    if (shadow.current) {
      const air = Math.min(1, s.y / 2.2)
      shadow.current.position.y = 0.03 - r.position.y
      const k = 1 + air * 0.9
      shadow.current.scale.set(k, 1.35 * k, 1)
      shadow.current.material.opacity = 0.32 * (1 - air * 0.75)
    }
  })

  return (
    <group ref={root} position={[LANES[CENTER_LANE], 0, 0]}>
      <mesh ref={shadow} rotation-x={-Math.PI / 2} position={[0, 0.03, 0.08]} renderOrder={2}>
        <circleGeometry args={[0.48, 24]} />
        <meshBasicMaterial color="#1a0c10" transparent opacity={0.32} depthWrite={false} fog={false} />
      </mesh>
      <group ref={body}>
        <PlayerModel limbs={limbs} />
      </group>
    </group>
  )
}
