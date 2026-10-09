import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils, Object3D } from 'three'
import { ROAD, STREETLIGHT, WORLD } from '../../config/gameConfig'
import { MODELS } from '../../config/models'
import { runtime } from '../../game/runtime'
import { isMobile } from '../../utils/device'
import { createGlowAttribute, NO_SHADOW_LAYER } from '../../utils/instancing'
import { InstancedParts, ModelParts } from '../Models/InstancedParts'
import { createLampParts, createPoleParts } from './parts/streetlight'

const { perSide, spacing, height: H, armLength: ARM } = STREETLIGHT
const COUNT = perSide * 2
const TOTAL = perSide * spacing
const Z_MAX = 14
const Z_MIN = Z_MAX - TOTAL
const POLE_X = ROAD.width / 2 + 0.55
const LAMP_X = POLE_X - ARM
const LENS_INTENSITY = 5
const CONE_OPACITY = 0.14
// Número fijo de PointLights: cambiarlo en caliente obligaría a recompilar todos los shaders.
const LIGHT_POOL = isMobile ? 4 : 6
// Arranque tipo lámpara de descarga: parpadea antes de quedar encendida (pasos de 60 ms).
const STARTUP_FLICKER = [1, 0.1, 0.85, 0, 0.6, 1, 0.3, 1]
const FLICKER_STEP = 0.06

const mod = (a, n) => ((a % n) + n) % n
const byDistanceToView = (a, b) => Math.abs(a.z + 8) - Math.abs(b.z + 8)

/** 14 postes en 3 draw calls; se encienden al acercarse el jugador. */
export function Streetlights() {
  const dummy = useMemo(() => new Object3D(), [])
  const poleParts = useMemo(createPoleParts, [])
  const lampParts = useMemo(createLampParts, [])
  const glow = useMemo(() => createGlowAttribute(COUNT), [])
  const poleApi = useRef(null)
  const lampApi = useRef(null)
  const lights = useRef([])
  const lit = useMemo(() => [], [])

  const poles = useMemo(() => {
    const list = []
    for (const side of [-1, 1]) {
      for (let i = 0; i < perSide; i++) {
        list.push({
          side,
          index: list.length,
          baseZ: Z_MAX - i * spacing - (side > 0 ? spacing / 2 : 0),
          z: 0,
          on: false,
          onAt: 0,
          glow: 0,
        })
      }
    }
    return list
  }, [])

  useFrame((state, dt) => {
    const now = state.clock.elapsedTime
    const d = Math.min(dt, 0.05)
    const [lens, cone] = lampParts
    lens.material.emissiveIntensity = LENS_INTENSITY * runtime.power
    cone.material.opacity = CONE_OPACITY * runtime.power
    lit.length = 0

    for (const p of poles) {
      const z = Z_MIN + mod(p.baseZ + runtime.distance - Z_MIN, TOTAL)
      if (z < p.z - 1) {
        p.on = false
        p.glow = 0
      }
      p.z = z

      // Se enciende al entrar en el radio de luz que trae el jugador.
      if (!p.on && z > WORLD.lightFrontZ) {
        p.on = true
        p.onAt = now
      }
      const step = Math.floor((now - p.onAt) / FLICKER_STEP)
      if (p.on && step < STARTUP_FLICKER.length) p.glow = STARTUP_FLICKER[step]
      else p.glow = MathUtils.damp(p.glow, p.on ? 1 : 0, 6, d)
      glow.setX(p.index, p.glow)
      if (p.glow > 0.02) lit.push(p)

      // Lado derecho girado 180°: el brazo apunta hacia la calzada sin escala negativa.
      dummy.position.set(p.side * POLE_X, 0, z)
      dummy.rotation.set(0, p.side > 0 ? Math.PI : 0, 0)
      dummy.updateMatrix()
      poleApi.current?.setMatrixAt(p.index, dummy.matrix)
      lampApi.current?.setMatrixAt(p.index, dummy.matrix)
    }
    poleApi.current?.commit()
    lampApi.current?.commit()

    // Las luces reales se asignan a los postes encendidos más cercanos al tramo visible.
    lit.sort(byDistanceToView)
    lights.current.forEach((light, k) => {
      const p = lit[k]
      if (!light) return
      if (!p) {
        light.intensity = 0
        return
      }
      light.position.set(p.side * LAMP_X, H - 0.4, p.z)
      light.intensity = STREETLIGHT.lightIntensity * p.glow * runtime.power
    })
  })

  return (
    <group>
      {/* Un .glb propio reemplaza solo el poste; la lente y el cono de luz se mantienen. */}
      <ModelParts model={MODELS.streetlight} fallback={poleParts}>
        {(parts) => <InstancedParts parts={parts} count={COUNT} apiRef={poleApi} layer={NO_SHADOW_LAYER} />}
      </ModelParts>
      <InstancedParts parts={lampParts} count={COUNT} glow={glow} apiRef={lampApi} layer={NO_SHADOW_LAYER} />

      {Array.from({ length: LIGHT_POOL }, (_, k) => (
        <pointLight
          key={k}
          ref={(el) => (lights.current[k] = el)}
          color="#ffc46b"
          intensity={0}
          distance={STREETLIGHT.lightDistance}
          decay={2}
        />
      ))}
    </group>
  )
}
