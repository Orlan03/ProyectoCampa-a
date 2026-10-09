import { Suspense, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Box, Cone, Cylinder, Sphere, Text } from '@react-three/drei'
import { MeshStandardMaterial } from 'three'
import { MODELS } from '../../config/models'
import { runtime } from '../../game/runtime'
import { box, merge } from '../../utils/geometry'
import { ModelSlot } from '../Models/ModelSlot'

// Terrazas escalonadas (de abajo hacia arriba), empotradas en la colina como el santuario real.
const TERRACES = [
  { size: [46, 4, 16], y: 2, z: 7 },
  { size: [36, 4, 13], y: 6, z: 4.5 },
  { size: [26, 4, 10], y: 10, z: 2.5 },
]

// Intensidades base; se multiplican por runtime.power para que el apagón también lo afecte.
const GLOW = { base: 0.5, arches: 2, dome: 2, sign: 2.5, hill: 0.6 }
const GLOW_KEYS = Object.keys(GLOW)

// Arcos iluminados en el frente de cada terraza, fusionados en una sola malla.
function createArches() {
  const parts = []
  for (const { size, y, z } of TERRACES) {
    const [w, h, d] = size
    const count = Math.floor((w - 4) / 4)
    for (let i = 0; i < count; i++) {
      const x = (i - (count - 1) / 2) * 4
      parts.push(box(1.4, h * 0.55, 0.3, [x, y - h * 0.1, z + d / 2 + 0.1]))
    }
  }
  return merge(parts)
}

/**
 * Santuario de la Virgen del Rocío (Biblián) con su iluminación nocturna: terrazas
 * cálidas, cúpula azul y el letrero "BIBLIAN" sobre la colina.
 *
 * Está a ~168 m, dentro del plano lejano de la cámara (230 m). A esa distancia la
 * niebla lo ocultaría, así que sus materiales usan fog: false para brillar en el horizonte.
 */
export function SantuarioBackground({ position = [0, -1, -168], scale = 0.65 }) {
  const arches = useMemo(createArches, [])

  const materials = useMemo(
    () => ({
      base: new MeshStandardMaterial({
        color: '#f5ecd7',
        emissive: '#fbbf24',
        emissiveIntensity: GLOW.base,
        roughness: 0.85,
        fog: false,
      }),
      arches: new MeshStandardMaterial({
        color: '#fff3d6',
        emissive: '#ffb547',
        emissiveIntensity: GLOW.arches,
        toneMapped: false,
        fog: false,
      }),
      dome: new MeshStandardMaterial({
        color: '#1e3a8a',
        emissive: '#3b82f6',
        emissiveIntensity: GLOW.dome,
        roughness: 0.35,
        metalness: 0.3,
        toneMapped: false,
        fog: false,
      }),
      // Leve emisivo: a contraluz del atardecer la colina se vería negra.
      hill: new MeshStandardMaterial({
        color: '#2c5a30',
        emissive: '#163d1c',
        emissiveIntensity: 0.6,
        roughness: 1,
        flatShading: true,
        fog: false,
      }),
      sign: new MeshStandardMaterial({
        color: '#ffffff',
        emissive: '#ffffff',
        emissiveIntensity: GLOW.sign,
        toneMapped: false,
        fog: false,
      }),
    }),
    [],
  )

  useFrame(() => {
    for (const key of GLOW_KEYS) {
      materials[key].emissiveIntensity = GLOW[key] * runtime.power
    }
  })

  return (
    <group position={position} scale={scale}>
      {/* Colina arbolada detrás de la iglesia (su frente queda detrás de la nave y la cúpula) */}
      <Sphere args={[1, 40, 20]} position={[0, -4, -42]} scale={[75, 56, 28]} material={materials.hill} />

      {/* Letrero en la cima de la colina */}
      <Suspense fallback={null}>
        <Text
          position={[0, 50.5, -36]}
          fontSize={8.5}
          letterSpacing={0.2}
          outlineWidth={0.25}
          outlineColor="#ffffff"
          anchorX="center"
          anchorY="bottom"
          material={materials.sign}
        >
          BIBLIAN
        </Text>
      </Suspense>

      <ModelSlot model={MODELS.santuario}>
        {/* Base y terrazas con luz arquitectónica cálida */}
        {TERRACES.map(({ size, y, z }) => (
          <Box key={y} args={size} position={[0, y, z]} material={materials.base} />
        ))}
        <mesh geometry={arches} material={materials.arches} />

        {/* Nave y torres laterales */}
        <Box args={[16, 7, 10]} position={[0, 15.5, 2]} material={materials.base} />
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 9.5, 0, 2]}>
            <Box args={[3, 10, 3]} position-y={17} material={materials.base} />
            <Cone args={[2.2, 6, 4]} position-y={25} rotation-y={Math.PI / 4} material={materials.dome} />
          </group>
        ))}

        {/* Cúpula central: tambor corto + aguja alta azul */}
        <Cylinder args={[4.2, 4.6, 5, 24]} position={[0, 21.5, 1]} material={materials.base} />
        <Cone args={[4.6, 18, 24]} position={[0, 33, 1]} material={materials.dome} />
        <Box args={[0.5, 3.2, 0.5]} position={[0, 43.6, 1]} material={materials.sign} />
        <Box args={[1.8, 0.5, 0.5]} position={[0, 44.2, 1]} material={materials.sign} />
      </ModelSlot>
    </group>
  )
}
