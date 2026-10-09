import { useCallback, useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils } from 'three'
import { Candidato } from '../../../Candidato'
import { GAME, LANES, PLAYER } from '../../config/gameConfig'
import { runtime } from '../../game/runtime'
import { useGameControls } from '../../hooks/useGameControls'
import { useGameStore } from '../../store/useGameStore'

const { damp } = MathUtils
const CENTER_LANE = 1

const createState = () => ({
  lane: CENTER_LANE,
  y: 0,
  vy: 0,
  grounded: true,
  slideTime: 0,
})

export function Player() {
  const root = useRef()
  const body = useRef()
  const shadow = useRef()
  const poseRef = useRef('run')
  const state = useRef(createState())
  const status = useGameStore((s) => s.status)
  const shieldOn = useGameStore((s) => s.shield)
  const runId = useGameStore((s) => s.runId)

  useEffect(() => {
    state.current = createState()
    poseRef.current = 'run'
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
      case 'power':
        useGameStore.getState().usePower()
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
    const currentStatus = useGameStore.getState().status

    if (currentStatus === 'blackout' || currentStatus === 'gameover') {
      poseRef.current = 'idle'
      r.position.y = damp(r.position.y, -0.3, 10, d)
      b.rotation.x = damp(b.rotation.x, -0.35, 8, d)
      return
    }

    if (currentStatus === 'menu') {
      poseRef.current = 'run'
      return
    }

    const targetX = LANES[s.lane]
    r.position.x = damp(r.position.x, targetX, GAME.laneDamping, d)

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
    b.rotation.z = damp(b.rotation.z, -lateral * 0.08, 10, d)
    b.rotation.x = damp(b.rotation.x, sliding ? 0.7 : 0, 16, d)

    poseRef.current = s.grounded ? 'run' : 'jump'

    runtime.player.x = r.position.x
    runtime.player.y = s.y
    runtime.player.height = sliding ? PLAYER.slideHeight : PLAYER.height

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
        <circleGeometry args={[0.55, 24]} />
        <meshBasicMaterial color="#1a0c10" transparent opacity={0.32} depthWrite={false} fog={false} />
      </mesh>
      <mesh visible={shieldOn} position={[0, 1.05, 0]}>
        <sphereGeometry args={[1.2, 20, 16]} />
        <meshBasicMaterial color="#fde047" transparent opacity={0.35} depthWrite={false} fog={false} />
      </mesh>
      <group ref={body}>
        {/*
          El .glb de Mixamo está en centímetros (~177 u de alto).
          0.01 lo deja a ~1.77 m. Sube el número si lo quieres más grande.
          rotation Y = PI lo pone mirando hacia la calle; quítalo si sale de frente.
        */}
        <Candidato poseRef={poseRef} scale={0.01} rotation={[0, Math.PI, 0]} />
      </group>
    </group>
  )
}
