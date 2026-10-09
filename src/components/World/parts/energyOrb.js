import { AdditiveBlending, Color, IcosahedronGeometry, SphereGeometry, TorusGeometry } from 'three'
import { merge } from '../../../utils/geometry'
import { NO_SHADOW_LAYER } from '../../../utils/instancing'
import { standardMaterial } from '../../../utils/materials'

const ELECTRIC_YELLOW = new Color('#eab308')

/** Núcleo emisivo + halo aditivo. toneMapped=false + emissive > 1 hace que el Bloom los realce. */
export function createOrbBodyParts() {
  return [
    {
      name: 'core',
      geometry: new IcosahedronGeometry(0.2, 3),
      material: standardMaterial('energy-core', {
        color: '#fde68a',
        emissive: ELECTRIC_YELLOW,
        emissiveIntensity: 2,
        roughness: 0.2,
        toneMapped: false,
      }),
    },
    {
      name: 'halo',
      geometry: new SphereGeometry(0.34, 20, 14),
      material: standardMaterial('energy-halo', {
        color: '#000000',
        emissive: ELECTRIC_YELLOW,
        emissiveIntensity: 0.9,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
        blending: AdditiveBlending,
        toneMapped: false,
      }),
      layer: NO_SHADOW_LAYER,
    },
  ]
}

/** Dos anillos orbitales inclinados, en una sola geometría (giran con su propia matriz). */
export function createOrbRingParts() {
  return [
    {
      name: 'rings',
      geometry: merge([
        new TorusGeometry(0.42, 0.016, 6, 40).rotateX(Math.PI / 3),
        new TorusGeometry(0.42, 0.016, 6, 40).rotateX(-Math.PI / 3),
      ]),
      material: standardMaterial('energy-ring', {
        color: '#fff7d6',
        emissive: new Color('#fde047'),
        emissiveIntensity: 3,
        toneMapped: false,
      }),
    },
  ]
}
