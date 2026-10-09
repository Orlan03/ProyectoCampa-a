import { MeshPhysicalMaterial, MeshStandardMaterial } from 'three'

const cache = new Map()

/** Materiales compartidos por clave: menos cambios de estado en GPU y menos memoria. */
export function standardMaterial(key, params) {
  if (!cache.has(key)) cache.set(key, new MeshStandardMaterial(params))
  return cache.get(key)
}

export function physicalMaterial(key, params) {
  if (!cache.has(key)) cache.set(key, new MeshPhysicalMaterial(params))
  return cache.get(key)
}
