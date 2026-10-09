import { useLayoutEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, MathUtils, Object3D } from 'three'
import { ROAD, SIDEWALK, WORLD } from '../../config/gameConfig'
import { MODELS } from '../../config/models'
import { runtime } from '../../game/runtime'
import { isMobile } from '../../utils/device'
import { createGlowAttribute, NO_SHADOW_LAYER } from '../../utils/instancing'
import { mulberry32, pick } from '../../utils/random'
import { InstancedParts, ModelParts } from '../Models/InstancedParts'
import { createHouseParts, windowMaterial } from './parts/colonialHouse'
const HOUSES_PER_SIDE = isMobile ? 10 : 12
const SPACING = 9.6
const TOTAL = HOUSES_PER_SIDE * SPACING
const Z_MAX = 16
const Z_MIN = Z_MAX - TOTAL
const FRONT_X = ROAD.width / 2 + SIDEWALK.width
const WINDOW_GLOW = 1.2

// Paleta colonial andina: fachadas encaladas y pintadas en tonos vivos.
const WALL_COLORS = ['#fbf3e4', '#f6c945', '#f28c4b', '#5aa9d6', '#ef7d7d', '#8cc49a', '#f3dcb2', '#c7a6e0']
const ACCENT_COLORS = ['#1d4e89', '#1f8a70', '#9b2226', '#5b3a8e', '#0f5e66']
const VARIANTS = [
  { floors: 1, width: 8.4, depth: 6 },
  { floors: 2, width: 8.8, depth: 7 },
  { floors: 2, width: 8.2, depth: 6.5 },
  { floors: 1, width: 8.9, depth: 7 },
]

const mod = (a, n) => ((a % n) + n) % n

/** Casas recicladas a ambos lados: 4 variantes × 6 piezas = 24 draw calls para todas. */
export function Buildings() {
  const dummy = useMemo(() => new Object3D(), [])
  const variantParts = useMemo(() => VARIANTS.map(createHouseParts), [])

  const { houses, perVariant } = useMemo(() => {
    const rand = mulberry32(2026)
    const perVariant = VARIANTS.map(() => 0)
    const houses = []
    for (const side of [-1, 1]) {
      for (let i = 0; i < HOUSES_PER_SIDE; i++) {
        const variant = Math.floor(rand() * VARIANTS.length)
        houses.push({
          side,
          variant,
          index: perVariant[variant]++,
          baseZ: Z_MAX - i * SPACING - (side > 0 ? SPACING / 2 : 0),
          wall: new Color(pick(WALL_COLORS, rand)),
          accent: new Color(pick(ACCENT_COLORS, rand)),
          // Algunas casas tienen luz interior que se enciende al llegar el jugador.
          hasLights: rand() < 0.7,
          lightOffset: rand() * 10,
          setback: rand() * 0.35,
          state: { z: 0, on: false, glow: 0 },
        })
      }
    }
    return { houses, perVariant }
  }, [])

  const apis = useMemo(() => VARIANTS.map(() => ({ current: null })), [])
  const glows = useMemo(() => perVariant.map(createGlowAttribute), [perVariant])

  useLayoutEffect(() => {
    for (const h of houses) {
      apis[h.variant].current?.setColorAt(h.index, h.wall, 'walls')
      apis[h.variant].current?.setColorAt(h.index, h.accent, 'accent')
    }
  }, [houses, apis])

  // Las casas se reciclan: al pasar la cámara reaparecen al fondo (oculto por la niebla).
  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05)
    windowMaterial.emissiveIntensity = WINDOW_GLOW * runtime.power

    for (const h of houses) {
      const s = h.state
      const z = Z_MIN + mod(h.baseZ + runtime.distance - Z_MIN, TOTAL)
      if (z < s.z - 1) {
        s.on = false
        s.glow = 0
      }
      s.z = z
      if (h.hasLights && z > WORLD.lightFrontZ + h.lightOffset) s.on = true
      s.glow = MathUtils.damp(s.glow, s.on ? 1 : 0, 3, d)
      glows[h.variant].setX(h.index, s.glow)

      // Lado derecho girado 180° (no espejado): las instancias con escala negativa se verían del revés.
      dummy.position.set(h.side * (FRONT_X + h.setback), 0, z)
      dummy.rotation.set(0, h.side > 0 ? Math.PI : 0, 0)
      dummy.updateMatrix()
      apis[h.variant].current?.setMatrixAt(h.index, dummy.matrix)
    }
    for (const api of apis) api.current?.commit()
  })

  return VARIANTS.map((_, v) => (
    <ModelParts key={v} model={MODELS.house} fallback={variantParts[v]}>
      {(parts) => (
        // Fuera de la zona de ContactShadows: en NO_SHADOW_LAYER no se dibujan en su pase.
        <InstancedParts parts={parts} count={perVariant[v]} glow={glows[v]} apiRef={apis[v]} layer={NO_SHADOW_LAYER} />
      )}
    </ModelParts>
  ))
}
