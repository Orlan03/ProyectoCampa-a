import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { ROAD, SIDEWALK } from '../../config/gameConfig'
import { runtime } from '../../game/runtime'
import { createAsphaltTextures, createSidewalkTextures } from '../../utils/proceduralTextures'

const ROAD_CENTER_Z = ROAD.startZ - ROAD.length / 2
const SIDEWALK_CENTER_X = ROAD.width / 2 + SIDEWALK.width / 2

export function Road() {
  const asphalt = useMemo(
    () =>
      createAsphaltTextures({
        width: ROAD.width,
        tileLength: ROAD.tileLength,
        repeatY: ROAD.length / ROAD.tileLength,
      }),
    [],
  )
  const sidewalk = useMemo(
    () => createSidewalkTextures([SIDEWALK.width / SIDEWALK.tile, ROAD.length / SIDEWALK.tile]),
    [],
  )

  // El suelo no se mueve: se desplaza el offset de las texturas según la distancia recorrida.
  useFrame(() => {
    const roadOffset = (runtime.distance / ROAD.tileLength) % 1
    asphalt.map.offset.y = roadOffset
    asphalt.roughnessMap.offset.y = roadOffset
    const walkOffset = (runtime.distance / SIDEWALK.tile) % 1
    sidewalk.map.offset.y = walkOffset
    sidewalk.roughnessMap.offset.y = walkOffset
  })

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, ROAD_CENTER_Z]}>
        <planeGeometry args={[ROAD.width, ROAD.length]} />
        <meshStandardMaterial
          map={asphalt.map}
          roughnessMap={asphalt.roughnessMap}
          bumpMap={asphalt.roughnessMap}
          bumpScale={0.6}
          roughness={1}
          metalness={0}
          envMapIntensity={0.6}
        />
      </mesh>

      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh
            rotation-x={-Math.PI / 2}
            position={[side * SIDEWALK_CENTER_X, SIDEWALK.height, ROAD_CENTER_Z]}
          >
            <planeGeometry args={[SIDEWALK.width, ROAD.length]} />
            <meshStandardMaterial
              map={sidewalk.map}
              roughnessMap={sidewalk.roughnessMap}
              bumpMap={sidewalk.roughnessMap}
              bumpScale={0.4}
              roughness={1}
            />
          </mesh>
          <mesh position={[side * (ROAD.width / 2 + 0.08), SIDEWALK.height / 2, ROAD_CENTER_Z]}>
            <boxGeometry args={[0.16, SIDEWALK.height, ROAD.length]} />
            <meshStandardMaterial color="#b9b5ab" roughness={0.85} />
          </mesh>
        </group>
      ))}

      <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, -60]}>
        <planeGeometry args={[320, 320]} />
        <meshStandardMaterial color="#557a2f" roughness={1} />
      </mesh>
    </group>
  )
}
