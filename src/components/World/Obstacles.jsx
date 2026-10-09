import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Object3D } from 'three'
import { LANES, POOLS } from '../../config/gameConfig'
import { MODELS } from '../../config/models'
import { barriers, potholes, runtime } from '../../game/runtime'
import { HIDDEN_MATRIX, NO_SHADOW_LAYER } from '../../utils/instancing'
import { InstancedParts, ModelParts } from '../Models/InstancedParts'
import { beaconMaterial, createBarrierParts } from './parts/barrier'
import { createPotholeParts, POTHOLE_VARIANTS } from './parts/pothole'

const VARIANTS = POTHOLE_VARIANTS.length
// El slot i del pool de baches usa la variante i % 3, instancia floor(i / 3).
const potholeCount = (v) => Math.ceil((POOLS.potholes - v) / VARIANTS)

/**
 * Baches y vallas dibujados desde sus pools fijos con InstancedMesh: 3 variantes de bache
 * × 2 piezas + 4 piezas de valla = 10 draw calls, haya los obstáculos que haya.
 */
export function Obstacles() {
  const dummy = useMemo(() => new Object3D(), [])
  const potholeParts = useMemo(() => POTHOLE_VARIANTS.map(createPotholeParts), [])
  const barrierParts = useMemo(createBarrierParts, [])
  const potholeApis = useMemo(() => POTHOLE_VARIANTS.map(() => ({ current: null })), [])
  const barrierApi = useRef(null)

  useFrame((state) => {
    const blink = Math.sin(state.clock.elapsedTime * 9) > 0 ? 3.5 : 0.25
    beaconMaterial.emissiveIntensity = blink * runtime.power

    potholes.forEach((p, i) => {
      const api = potholeApis[i % VARIANTS].current
      if (!api) return
      const k = Math.floor(i / VARIANTS)
      if (!p.active) return api.setMatrixAt(k, HIDDEN_MATRIX)
      dummy.position.set(LANES[p.lane], 0, p.z)
      dummy.rotation.set(0, p.rotation, 0)
      dummy.scale.setScalar(p.scale)
      dummy.updateMatrix()
      api.setMatrixAt(k, dummy.matrix)
    })
    for (const api of potholeApis) api.current?.commit()

    const bApi = barrierApi.current
    if (!bApi) return
    dummy.rotation.set(0, 0, 0)
    dummy.scale.setScalar(1)
    barriers.forEach((b, i) => {
      if (!b.active) return bApi.setMatrixAt(i, HIDDEN_MATRIX)
      dummy.position.set(LANES[b.lane], 0, b.z)
      dummy.updateMatrix()
      bApi.setMatrixAt(i, dummy.matrix)
    })
    bApi.commit()
  })

  return (
    <>
      {POTHOLE_VARIANTS.map((seed, v) => (
        <ModelParts key={seed} model={MODELS.pothole} fallback={potholeParts[v]}>
          {(parts) => (
            <InstancedParts parts={parts} count={potholeCount(v)} apiRef={potholeApis[v]} layer={NO_SHADOW_LAYER} />
          )}
        </ModelParts>
      ))}
      <ModelParts model={MODELS.barrier} fallback={barrierParts}>
        {(parts) => <InstancedParts parts={parts} count={POOLS.barriers} apiRef={barrierApi} />}
      </ModelParts>
    </>
  )
}
