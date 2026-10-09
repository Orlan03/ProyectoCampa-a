import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BackSide, Color, Vector3 } from 'three'
import { WORLD } from '../../config/gameConfig'
import { runtime } from '../../game/runtime'
import { NO_SHADOW_LAYER } from '../../utils/instancing'

const vertexShader = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Degradado de atardecer en tres tonos + resplandor del sol. El horizonte usa el
// mismo color que la niebla para que los objetos lejanos se fundan con el cielo.
const fragmentShader = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uMid;
  uniform vec3 uHorizon;
  uniform vec3 uSunDir;
  uniform float uPower;
  varying vec3 vDir;
  void main() {
    vec3 dir = normalize(vDir);
    float h = clamp(dir.y, 0.0, 1.0);
    vec3 col = mix(uHorizon, uMid, smoothstep(0.0, 0.22, h));
    col = mix(col, uTop, smoothstep(0.18, 0.7, h));
    float s = max(dot(dir, uSunDir), 0.0);
    col += vec3(1.0, 0.55, 0.25) * (pow(s, 10.0) * 0.45 + pow(s, 600.0) * 4.0);
    gl_FragColor = vec4(col * uPower, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

export function SkyDome() {
  const material = useRef()
  const uniforms = useMemo(
    () => ({
      uTop: { value: new Color(WORLD.skyTop) },
      uMid: { value: new Color(WORLD.skyMid) },
      uHorizon: { value: new Color(WORLD.fogColor) },
      uSunDir: { value: new Vector3(...WORLD.sunDirection).normalize() },
      uPower: { value: 1 },
    }),
    [],
  )

  // Mismo factor que la niebla en Lighting para que el apagón sea uniforme.
  // Se escribe en material.uniforms porque R3F no conserva la referencia del objeto original.
  useFrame(() => {
    if (material.current) material.current.uniforms.uPower.value = 0.15 + 0.85 * runtime.power
  })

  return (
    <mesh renderOrder={-1} frustumCulled={false} layers={NO_SHADOW_LAYER}>
      <sphereGeometry args={[200, 32, 16]} />
      <shaderMaterial
        ref={material}
        side={BackSide}
        depthWrite={false}
        fog={false}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  )
}
