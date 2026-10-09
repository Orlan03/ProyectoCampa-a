import { CylinderGeometry } from 'three'
import { BARRIER } from '../../../config/gameConfig'
import { box, merge } from '../../../utils/geometry'
import { standardMaterial } from '../../../utils/materials'
import { getStripeTexture } from '../../../utils/proceduralTextures'

// Compartido por todas las vallas: Obstacles anima su intensidad para que parpadeen a la vez.
export const beaconMaterial = standardMaterial('barrier-beacon', {
  color: '#ffd28a',
  emissive: '#ff9d00',
  emissiveIntensity: 3,
  toneMapped: false,
})

/** Valla de construcción a franjas con baliza ámbar. */
export function createBarrierParts() {
  const { w, h } = BARRIER
  const legX = w / 2 - 0.08
  return [
    {
      name: 'boards',
      geometry: merge([box(w, 0.24, 0.05, [0, 0.82, 0]), box(w, 0.24, 0.05, [0, 0.42, 0])]),
      material: standardMaterial('barrier-board', { map: getStripeTexture(), roughness: 0.35, metalness: 0.05 }),
    },
    {
      name: 'frame',
      geometry: merge(
        [-1, 1].flatMap((side) => [
          box(0.07, h, 0.07, [side * legX, h / 2, 0]),
          box(0.07, 0.07, 0.6, [side * legX, 0.05, 0]),
        ]),
      ),
      material: standardMaterial('barrier-frame', { color: '#e9e6df', roughness: 0.45, metalness: 0.6 }),
    },
    {
      name: 'feet',
      geometry: merge([-1, 1].map((side) => box(0.3, 0.1, 0.62, [side * legX, 0.05, 0]))),
      material: standardMaterial('barrier-foot', { color: '#1f1f22', roughness: 0.9 }),
    },
    {
      name: 'beacon',
      geometry: new CylinderGeometry(0.08, 0.09, 0.14, 12).translate(legX, h + 0.09, 0),
      material: beaconMaterial,
    },
  ]
}
