import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils, Vector3 } from 'three'
import { runtime, speedProgress } from '../../game/runtime'

const { damp } = MathUtils

export function CameraRig() {
  const lookAt = useMemo(() => new Vector3(), [])

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05)
    const cam = state.camera
    const p = runtime.player

    cam.position.x = damp(cam.position.x, p.x * 0.55, 6, d)
    cam.position.y = damp(cam.position.y, 3.4 + p.y * 0.35, 5, d)
    cam.position.z = 6.5

    if (runtime.shake > 0) {
      runtime.shake = Math.max(0, runtime.shake - d * 1.8)
      const s = runtime.shake * 0.35
      cam.position.x += (Math.random() - 0.5) * s
      cam.position.y += (Math.random() - 0.5) * s
    }

    lookAt.set(p.x * 0.35, 1 + p.y * 0.2, -10)
    cam.lookAt(lookAt)

    // En pantallas verticales se abre el FOV para que los tres carriles sigan visibles.
    const baseFov = cam.aspect < 1 ? 58 + (1 - cam.aspect) * 32 : 58
    const fov = damp(cam.fov, baseFov + speedProgress() * 12, 2, d)
    if (Math.abs(fov - cam.fov) > 0.01) {
      cam.fov = fov
      cam.updateProjectionMatrix()
    }
  })

  return null
}
