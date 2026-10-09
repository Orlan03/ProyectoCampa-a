import { MeshPhysicalMaterial } from 'three'
import { box, hipRoof, merge } from '../../../utils/geometry'
import { withInstanceGlow } from '../../../utils/instancing'
import { standardMaterial } from '../../../utils/materials'

const FLOOR_HEIGHT = 3.2

// Paredes y zócalo en blanco: el color real de cada casa va en instanceColor.
const materials = {
  walls: () => standardMaterial('house-wall', { color: '#ffffff', roughness: 0.88 }),
  accent: () => standardMaterial('house-accent', { color: '#ffffff', roughness: 0.6 }),
  wood: () => standardMaterial('wood', { color: '#6b3f1f', roughness: 0.7 }),
  frame: () => standardMaterial('frame', { color: '#fbf6ec', roughness: 0.55 }),
  roof: () => standardMaterial('roof', { color: '#c2582a', roughness: 0.78 }),
}

// Vidrio reflectivo con luz interior por instancia; su emissiveIntensity global se usa para el apagón.
export const windowMaterial = withInstanceGlow(
  new MeshPhysicalMaterial({
    color: '#1b2730',
    roughness: 0.06,
    metalness: 0.1,
    envMapIntensity: 1.4,
    clearcoat: 1,
    emissive: '#ffb35c',
    emissiveIntensity: 1.2,
  }),
)

/**
 * Casa colonial con la fachada en x = 0 mirando a +x, separada en una pieza por material
 * para dibujar todas las casas de una variante con un draw call por pieza.
 */
export function createHouseParts({ floors, width, depth }) {
  const H = floors * FLOOR_HEIGHT + 0.4
  const roofH = 1.5 + width * 0.05
  const wood = [box(0.5, 0.16, width + 0.6, [0.1, H + 0.02, 0]), box(0.14, 2.4, 1.5, [0.04, 1.2, 0])]
  const frame = []
  const glass = []

  const addWindow = (y, z, w = 1.0, h = 1.35) => {
    frame.push(box(0.07, h + 0.22, w + 0.22, [0.035, y, z]))
    frame.push(box(0.22, 0.08, w + 0.4, [0.1, y - h / 2 - 0.12, z]))
    glass.push(box(0.04, h, w, [0.075, y, z]))
  }

  addWindow(1.55, -width * 0.3)
  addWindow(1.55, width * 0.3)

  for (let f = 1; f < floors; f++) {
    const y = f * FLOOR_HEIGHT + 1.55
    for (const z of [-width * 0.33, 0, width * 0.33]) addWindow(y, z, 0.95, 1.6)
    wood.push(box(0.95, 0.12, width * 0.82, [0.47, f * FLOOR_HEIGHT + 0.7, 0]))
    wood.push(box(0.06, 0.85, width * 0.82, [0.92, f * FLOOR_HEIGHT + 1.2, 0]))
    wood.push(box(0.9, 0.06, 0.06, [0.47, f * FLOOR_HEIGHT + 1.62, -width * 0.41]))
    wood.push(box(0.9, 0.06, 0.06, [0.47, f * FLOOR_HEIGHT + 1.62, width * 0.41]))
  }

  return [
    { name: 'walls', geometry: box(depth, H, width, [-depth / 2, H / 2, 0]), material: materials.walls() },
    { name: 'accent', geometry: box(0.08, 0.75, width, [0.04, 0.375, 0]), material: materials.accent() },
    { name: 'wood', geometry: merge(wood), material: materials.wood() },
    { name: 'frame', geometry: merge(frame), material: materials.frame() },
    { name: 'glass', geometry: merge(glass), material: windowMaterial, glow: true },
    {
      name: 'roof',
      geometry: hipRoof(depth + 1.4, roofH, width + 1.0, [-depth / 2, H + 0.1, 0]),
      material: materials.roof(),
    },
  ]
}
