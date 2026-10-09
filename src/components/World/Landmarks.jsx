import { useMemo } from 'react'
import { IcosahedronGeometry } from 'three'
import { merge } from '../../utils/geometry'
import { standardMaterial } from '../../utils/materials'
import { mulberry32 } from '../../utils/random'
import { SantuarioBackground } from './SantuarioBackground'

const SHADES = ['#6a4f7a', '#7d5f86']

/** Cordillera de fondo fusionada por tono: 2 draw calls para 13 picos. */
function Mountains() {
  const ranges = useMemo(() => {
    const rand = mulberry32(7)
    const byShade = SHADES.map(() => [])
    for (let i = 0; i < 13; i++) {
      const x = -170 + i * 28 + (rand() - 0.5) * 14
      const z = -196 - rand() * 6
      const r = 45 + rand() * 25
      const h = 22 + rand() * 20
      const shade = rand() > 0.5 ? 0 : 1
      byShade[shade].push(new IcosahedronGeometry(1, 1).scale(r, h, r * 0.25).translate(x, -6, z))
    }
    return byShade.map(merge)
  }, [])

  // Sin niebla: silueta violeta contra el cielo del atardecer (perspectiva atmosférica).
  // Poco profundas en z para quedar detrás del Santuario (z ≈ -168) sin pasar el plano lejano (230).
  return ranges.map((geometry, i) => (
    <mesh
      key={i}
      geometry={geometry}
      material={standardMaterial(`mountain-${i}`, { color: SHADES[i], roughness: 1, fog: false, flatShading: true })}
    />
  ))
}

export function Landmarks() {
  return (
    <group>
      <SantuarioBackground />
      <Mountains />
    </group>
  )
}
