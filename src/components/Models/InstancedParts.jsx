import { Suspense, useLayoutEffect, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { extractParts, HIDDEN_MATRIX } from '../../utils/instancing'
import { ModelErrorBoundary } from './ModelSlot'

/**
 * Dibuja un objeto compuesto (lista de piezas geometría+material) como un InstancedMesh por
 * pieza: N copias del objeto = un draw call por pieza. Expone en `apiRef` una API para
 * escribir la misma matriz en todas las piezas.
 *
 * Pieza: { name, geometry, material, glow?, layer?, renderOrder? }
 * `layer` (prop) fuerza la capa de todas las piezas.
 */
export function InstancedParts({ parts, count, glow, apiRef, layer }) {
  const meshes = useRef([])

  useLayoutEffect(() => {
    parts.forEach((p, k) => {
      if (glow && p.glow) p.geometry.setAttribute('instanceGlow', glow)
      const mesh = meshes.current[k]
      if (!mesh) return
      if (layer ?? p.layer) mesh.layers.set(layer ?? p.layer)
      // Todas ocultas hasta que el dueño del pool las posicione.
      for (let i = 0; i < count; i++) mesh.setMatrixAt(i, HIDDEN_MATRIX)
      mesh.instanceMatrix.needsUpdate = true
    })
    apiRef.current = {
      setMatrixAt(i, matrix) {
        for (const mesh of meshes.current) mesh?.setMatrixAt(i, matrix)
      },
      setColorAt(i, color, partName) {
        meshes.current.forEach((mesh, k) => {
          if (mesh && parts[k].name === partName) mesh.setColorAt(i, color)
        })
      },
      commit() {
        for (const mesh of meshes.current) {
          if (!mesh) continue
          mesh.instanceMatrix.needsUpdate = true
          if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
        }
        if (glow) glow.needsUpdate = true
      },
    }
  }, [parts, glow, apiRef, count, layer])

  return parts.map((p, k) => (
    <instancedMesh
      key={`${p.name}-${k}`}
      ref={(el) => (meshes.current[k] = el)}
      args={[p.geometry, p.material, count]}
      renderOrder={p.renderOrder ?? 0}
      // Las instancias se reparten por todo el escenario: el bounding sphere de la geometría no sirve.
      frustumCulled={false}
    />
  ))
}

function GLBParts({ model, children }) {
  const { scene } = useGLTF(model.url)
  const parts = useMemo(() => extractParts(scene, model), [scene, model])
  return children(parts)
}

/**
 * Entrega a `children` las piezas del .glb de `model.url` o, si no hay modelo (o falla),
 * las piezas procedurales de `fallback`.
 */
export function ModelParts({ model, fallback, children }) {
  if (!model?.url) return children(fallback)
  const procedural = children(fallback)
  return (
    <ModelErrorBoundary fallback={procedural}>
      <Suspense fallback={procedural}>
        <GLBParts model={model}>{children}</GLBParts>
      </Suspense>
    </ModelErrorBoundary>
  )
}
