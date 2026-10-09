import { Suspense, useEffect, useRef } from 'react'
import { useAnimations } from '@react-three/drei'
import { BRAND } from '../../config/gameConfig'
import { MODELS } from '../../config/models'
import { ModelErrorBoundary, useClonedGLTF } from '../Models/ModelSlot'

const SKIN = '#b9825a'

function Limb({ radius, length, color, y }) {
  return (
    <mesh position-y={y}>
      <capsuleGeometry args={[radius, length, 4, 10]} />
      <meshStandardMaterial color={color} roughness={0.72} metalness={0.08} />
    </mesh>
  )
}

/** Avatar procedural (mira hacia -z). `limbs` recibe las articulaciones para animarlas. */
function Humanoid({ limbs }) {
  const bind = (name) => (el) => {
    limbs.current[name] = el
  }

  return (
    <group>
      {[-1, 1].map((side) => (
        <group key={`leg${side}`} ref={bind(side < 0 ? 'legL' : 'legR')} position={[side * 0.13, 0.92, 0]}>
          <Limb radius={0.085} length={0.62} color="#24324d" y={-0.42} />
          <mesh position={[0, -0.86, -0.05]}>
            <boxGeometry args={[0.16, 0.1, 0.3]} />
            <meshStandardMaterial color="#f2f2f2" roughness={0.45} metalness={0.12} />
          </mesh>
        </group>
      ))}

      <mesh position-y={1.24}>
        <capsuleGeometry args={[0.2, 0.36, 6, 14]} />
        <meshStandardMaterial color={BRAND.primary} roughness={0.55} metalness={0.12} envMapIntensity={0.8} />
      </mesh>

      <mesh position={[0, 1.27, 0.21]}>
        <boxGeometry args={[0.32, 0.38, 0.16]} />
        <meshStandardMaterial color={BRAND.accent} roughness={0.4} metalness={0.15} envMapIntensity={0.9} />
      </mesh>

      {[-1, 1].map((side) => (
        <group key={`arm${side}`} ref={bind(side < 0 ? 'armL' : 'armR')} position={[side * 0.28, 1.46, 0]}>
          <Limb radius={0.06} length={0.46} color={BRAND.primary} y={-0.28} />
          <mesh position-y={-0.56}>
            <sphereGeometry args={[0.065, 10, 10]} />
            <meshStandardMaterial color={SKIN} roughness={0.48} />
          </mesh>
        </group>
      ))}

      <group position-y={1.66}>
        <mesh>
          <sphereGeometry args={[0.14, 20, 20]} />
          <meshStandardMaterial color={SKIN} roughness={0.45} />
        </mesh>
        <mesh position={[0, 0.04, 0.015]} scale={[1.05, 0.85, 1.05]}>
          <sphereGeometry args={[0.145, 20, 20, 0, Math.PI * 2, 0, Math.PI / 1.9]} />
          <meshStandardMaterial color="#1b1410" roughness={0.9} />
        </mesh>
      </group>
    </group>
  )
}

function PlayerGLB({ config }) {
  const group = useRef()
  const { scene, animations } = useClonedGLTF(config.url)
  const { actions, names } = useAnimations(animations, group)

  useEffect(() => {
    const action = actions[config.runClip] ?? actions[names[0]]
    action?.reset().fadeIn(0.2).play()
    return () => action?.fadeOut(0.2)
  }, [actions, names, config.runClip])

  return (
    <group ref={group} scale={config.scale} rotation-y={config.rotationY}>
      <primitive object={scene} />
    </group>
  )
}

export function PlayerModel({ limbs }) {
  const config = MODELS.player
  const fallback = <Humanoid limbs={limbs} />
  if (!config.url) return fallback

  return (
    <ModelErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <PlayerGLB config={config} />
      </Suspense>
    </ModelErrorBoundary>
  )
}
