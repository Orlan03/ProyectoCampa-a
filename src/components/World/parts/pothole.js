import { DodecahedronGeometry, PlaneGeometry } from 'three'
import { POTHOLE } from '../../../config/gameConfig'
import { merge } from '../../../utils/geometry'
import { standardMaterial } from '../../../utils/materials'
import { getPotholeTextures } from '../../../utils/proceduralTextures'
import { mulberry32 } from '../../../utils/random'

export const POTHOLE_VARIANTS = [11, 23, 37]

function potholeMaterial(seed) {
  const { map, bumpMap, roughnessMap, emissiveMap } = getPotholeTextures(seed)
  return standardMaterial(`pothole-${seed}`, {
    map,
    bumpMap,
    bumpScale: 4,
    roughnessMap,
    roughness: 1,
    emissiveMap,
    emissive: '#ffb000',
    emissiveIntensity: 0.55,
    metalness: 0,
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
  })
}

/** Trozos de asfalto suelto alrededor del borde, fusionados en una sola geometría. */
function createRubble(seed) {
  const rand = mulberry32(seed * 7)
  const rim = POTHOLE.visualSize * 0.34
  return merge(
    Array.from({ length: 7 }, () => {
      const a = rand() * Math.PI * 2
      const r = rim * (0.85 + rand() * 0.35)
      const s = 0.05 + rand() * 0.07
      return new DodecahedronGeometry(1, 0)
        .scale(s, s * 0.45, s * (0.8 + rand() * 0.5))
        .rotateY(rand() * Math.PI)
        .translate(Math.cos(a) * r, s * 0.2, Math.sin(a) * r)
    }),
  )
}

/** Bache: calcomanía sobre el asfalto (hueco, grietas, charco, pintura) + escombros. */
export function createPotholeParts(seed) {
  return [
    {
      name: 'decal',
      geometry: new PlaneGeometry(POTHOLE.visualSize, POTHOLE.visualSize).rotateX(-Math.PI / 2).translate(0, 0.012, 0),
      material: potholeMaterial(seed),
      renderOrder: 1,
    },
    {
      name: 'rubble',
      geometry: createRubble(seed),
      material: standardMaterial('rubble', { color: '#4b4c50', roughness: 0.95 }),
    },
  ]
}
