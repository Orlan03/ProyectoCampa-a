import { Component, Suspense, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js'

export class ModelErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    console.warn('[ModelSlot] No se pudo cargar el modelo, usando primitiva:', error?.message)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

export function useClonedGLTF(url, { castShadow = true, receiveShadow = true } = {}) {
  const gltf = useGLTF(url)
  const scene = useMemo(() => {
    const copy = cloneSkinned(gltf.scene)
    copy.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = castShadow
        o.receiveShadow = receiveShadow
      }
    })
    return copy
  }, [gltf.scene, castShadow, receiveShadow])
  return { ...gltf, scene }
}

function GLBModel({ model, castShadow, receiveShadow }) {
  const { scene } = useClonedGLTF(model.url, { castShadow, receiveShadow })
  return (
    <primitive
      object={scene}
      scale={model.scale ?? 1}
      rotation-y={model.rotationY ?? 0}
      position={model.offset ?? [0, 0, 0]}
    />
  )
}

/**
 * Renderiza el .glb de `model.url` si existe; si no (o si falla la carga),
 * renderiza los `children` como primitiva de respaldo.
 */
export function ModelSlot({ model, children, castShadow = true, receiveShadow = true, ...groupProps }) {
  if (!model?.url) return <group {...groupProps}>{children}</group>

  const fallback = <>{children}</>
  return (
    <group {...groupProps}>
      <ModelErrorBoundary fallback={fallback}>
        <Suspense fallback={fallback}>
          <GLBModel model={model} castShadow={castShadow} receiveShadow={receiveShadow} />
        </Suspense>
      </ModelErrorBoundary>
    </group>
  )
}
