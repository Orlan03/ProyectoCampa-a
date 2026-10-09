import { MeshStandardMaterial } from 'three'
import { box, hipRoof, merge } from '../../../utils/geometry'
import { withInstanceGlow } from '../../../utils/instancing'
import { standardMaterial } from '../../../utils/materials'

const FLOOR_HEIGHT = 3.05

// Paredes en blanco: el color de cada casa va en instanceColor.
const materials = {
  walls: () =>
    standardMaterial('house-wall-v2', {
      color: '#ffffff',
      roughness: 0.94,
      metalness: 0,
      envMapIntensity: 0.22,
    }),
  door: () =>
    standardMaterial('house-door-v2', {
      color: '#3d2918',
      roughness: 0.9,
      metalness: 0,
      envMapIntensity: 0.15,
    }),
  roof: () =>
    standardMaterial('house-roof-v2', {
      color: '#7a3422',
      roughness: 0.96,
      metalness: 0,
      envMapIntensity: 0.35,
    }),
}

// Vidrio cálido. emissiveIntensity lo baja el apagón; instanceGlow enciende cada casa aparte.
export const windowMaterial = withInstanceGlow(
  new MeshStandardMaterial({
    color: '#fef08a',
    emissive: '#fef08a',
    emissiveIntensity: 1.5,
    roughness: 0.42,
    metalness: 0,
  }),
)

/**
 * Casa de pueblo andino. La fachada queda en x = 0, mirando hacia +x (la calle).
 * Una pieza por material: todas las casas de una variante salen en un draw call por pieza.
 * El techo es un cono de 4 lados rotado 45° (pirámide de teja) estirado al largo de la casa.
 */
export function createHouseParts({ floors = 1, width, depth, windows = 2 }) {
  const H = floors * FLOOR_HEIGHT
  const roofH = 2.35 + width * 0.04
  const glass = []
  const doorZ = windows === 1 ? -width * 0.22 : 0

  const addWindow = (y, z, w = 1.35, h = 1.5) => {
    glass.push(box(0.1, h, w, [0.07, y, z]))
  }

  if (windows === 1) {
    addWindow(1.72, width * 0.2, 1.2, 1.35)
  } else {
    addWindow(1.65, -width * 0.3)
    addWindow(1.65, width * 0.3)
  }

  if (floors > 1) {
    const y = FLOOR_HEIGHT + 1.5
    addWindow(y, -width * 0.28, 1.0, 1.15)
    addWindow(y, width * 0.28, 1.0, 1.15)
  }

  return [
    {
      name: 'walls',
      geometry: box(depth, H, width, [-depth / 2, H / 2, 0]),
      material: materials.walls(),
    },
    {
      name: 'door',
      geometry: box(0.16, 2.25, 1.35, [0.06, 1.12, doorZ]),
      material: materials.door(),
    },
    { name: 'glass', geometry: merge(glass), material: windowMaterial, glow: true },
    {
      name: 'roof',
      geometry: hipRoof(depth + 1.6, roofH, width + 1.2, [-depth / 2, H - 0.04, 0]),
      material: materials.roof(),
    },
  ]
}
