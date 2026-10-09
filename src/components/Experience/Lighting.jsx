import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { Color, MathUtils, Object3D } from 'three'
import { WORLD } from '../../config/gameConfig'
import { runtime } from '../../game/runtime'
import { useGameStore } from '../../store/useGameStore'

// Atardecer: sol bajo y cálido con poca intensidad para que destaque la luz eléctrica.
const SUN_INTENSITY = 1.85
const HEMI_INTENSITY = 0.62
const ENV_INTENSITY = 0.55
const FILL_INTENSITY = 0.35

// Parpadeo de cortocircuito (un paso cada 50 ms) antes del apagón total.
const FLICKER = [1, 0.05, 0.9, 0, 0.7, 0, 0, 0.35, 0]
const FLICKER_STEP = 0.05

function gridPower(status, current, d) {
  if (status === 'blackout') {
    const step = Math.floor((performance.now() - runtime.blackoutAt) / 1000 / FLICKER_STEP)
    return FLICKER[step] ?? 0
  }
  return MathUtils.damp(current, 1, status === 'gameover' ? 2.5 : 8, d)
}

export function Lighting() {
  const [target] = useState(() => new Object3D())
  const sun = useRef()
  const hemi = useRef()
  const fill = useRef()
  const fogColor = useMemo(() => new Color(WORLD.fogColor), [])

  useFrame((state, dt) => {
    const status = useGameStore.getState().status
    const p = (runtime.power = gridPower(status, runtime.power, Math.min(dt, 0.05)))

    sun.current.intensity = SUN_INTENSITY * p
    hemi.current.intensity = HEMI_INTENSITY * (0.2 + 0.8 * p)
    if (fill.current) fill.current.intensity = FILL_INTENSITY * p
    state.scene.environmentIntensity = ENV_INTENSITY * (0.12 + 0.88 * p)
    state.scene.fog?.color.copy(fogColor).multiplyScalar(0.15 + 0.85 * p)
  })

  return (
    <>
      <Environment preset="sunset" environmentIntensity={ENV_INTENSITY} />
      <hemisphereLight ref={hemi} args={['#c4b4e8', '#5a3a28', HEMI_INTENSITY]} />
      {/* Relleno cálido desde el horizonte para que fachadas y asfalto no queden planos. */}
      <directionalLight ref={fill} position={[8, 6, 10]} intensity={FILL_INTENSITY} color="#ffb07a" />

      <primitive object={target} position={[0, 0, -12]} />
      <directionalLight
        ref={sun}
        target={target}
        position={[-13, 10, -34]}
        intensity={SUN_INTENSITY}
        color="#ff9b5c"
      />
    </>
  )
}
