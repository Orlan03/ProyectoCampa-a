import { InstancedBufferAttribute, Matrix4 } from 'three'

/**
 * Capa visible para la cámara principal pero ignorada por ContactShadows: halos y conos de
 * luz (no deben proyectar sombra) y objetos fuera de su zona (para no redibujarlos en su pase).
 */
export const NO_SHADOW_LAYER = 1

/** Matriz de escala 0: oculta una instancia sin cambiar el `count` del InstancedMesh. */
export const HIDDEN_MATRIX = new Matrix4().makeScale(0, 0, 0)

export function createGlowAttribute(count) {
  return new InstancedBufferAttribute(new Float32Array(count), 1)
}

/**
 * Añade un brillo por instancia (atributo `instanceGlow`, 0..1) a un material, para que
 * cada ventana o lámpara se encienda por separado dentro del mismo draw call.
 * - 'emissive': multiplica la emisión (MeshStandard/MeshPhysical).
 * - 'color': multiplica el color difuso (MeshBasic aditivo, p. ej. conos de luz).
 */
export function withInstanceGlow(material, target = 'emissive') {
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float instanceGlow;\nvarying float vInstanceGlow;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvInstanceGlow = instanceGlow;')
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      '#include <common>\nvarying float vInstanceGlow;',
    )
    shader.fragmentShader =
      target === 'emissive'
        ? shader.fragmentShader.replace(
            '#include <emissivemap_fragment>',
            '#include <emissivemap_fragment>\ntotalEmissiveRadiance *= vInstanceGlow;',
          )
        : shader.fragmentShader.replace(
            '#include <color_fragment>',
            '#include <color_fragment>\ndiffuseColor.rgb *= vInstanceGlow;',
          )
  }
  material.customProgramCacheKey = () => `instance-glow-${target}`
  return material
}

/**
 * Convierte la escena de un .glb en piezas instanciables (geometría con la transformación
 * horneada + material). Así un modelo propio se dibuja también con un draw call por material.
 */
export function extractParts(scene, { scale = 1, rotationY = 0, offset = [0, 0, 0] } = {}) {
  const root = new Matrix4()
    .makeTranslation(...offset)
    .multiply(new Matrix4().makeRotationY(rotationY))
    .multiply(new Matrix4().makeScale(scale, scale, scale))
  scene.updateMatrixWorld(true)
  const parts = []
  scene.traverse((o) => {
    if (!o.isMesh) return
    const geometry = o.geometry.clone().applyMatrix4(new Matrix4().multiplyMatrices(root, o.matrixWorld))
    parts.push({ name: o.name, geometry, material: o.material })
  })
  return parts
}
