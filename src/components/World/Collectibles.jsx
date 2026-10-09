import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Object3D } from 'three'
import { LANES, POOLS } from '../../config/gameConfig'
import { MODELS } from '../../config/models'
import { energyOrbs } from '../../game/runtime'
import { HIDDEN_MATRIX, NO_SHADOW_LAYER } from '../../utils/instancing'
import { InstancedParts, ModelParts } from '../Models/InstancedParts'
import { createOrbBodyParts, createOrbRingParts } from './parts/energyOrb'

/** Las 15 Esferas de Energía del pool en 3 draw calls (núcleo, halo y anillos). */
export function Collectibles() {
  const dummy = useMemo(() => new Object3D(), [])
  const bodyParts = useMemo(createOrbBodyParts, [])
  const ringParts = useMemo(createOrbRingParts, [])
  const bodyApi = useRef(null)
  const ringApi = useRef(null)

  useFrame((state) => {
    const body = bodyApi.current
    const rings = ringApi.current
    if (!body) return
    const t = state.clock.elapsedTime

    energyOrbs.forEach((orb, i) => {
      if (!orb.active) {
        body.setMatrixAt(i, HIDDEN_MATRIX)
        rings?.setMatrixAt(i, HIDDEN_MATRIX)
        return
      }
      const k = orb.collected ? orb.collectT / 0.3 : 0
      const spin = t * 2 + orb.id
      dummy.position.set(orb.x ?? LANES[orb.lane], orb.y + Math.sin(t * 3 + orb.id) * 0.08 + k * 1.5, orb.z)
      dummy.scale.setScalar(1 + k * 0.6 - k * k * 1.5)
      dummy.rotation.set(0, spin, 0)
      dummy.updateMatrix()
      body.setMatrixAt(i, dummy.matrix)
      if (!rings) return
      dummy.rotation.set(0, spin, t * 4 + orb.id)
      dummy.updateMatrix()
      rings.setMatrixAt(i, dummy.matrix)
    })
    body.commit()
    rings?.commit()
  })

  return (
    <ModelParts model={MODELS.energyOrb} fallback={bodyParts}>
      {(parts) => (
        <>
          <InstancedParts parts={parts} count={POOLS.energyOrbs} apiRef={bodyApi} layer={NO_SHADOW_LAYER} />
          {/* Con un .glb propio los anillos procedurales se omiten. */}
          {parts === bodyParts && (
            <InstancedParts parts={ringParts} count={POOLS.energyOrbs} apiRef={ringApi} layer={NO_SHADOW_LAYER} />
          )}
        </>
      )}
    </ModelParts>
  )
}
