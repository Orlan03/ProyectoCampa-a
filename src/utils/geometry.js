import { BoxGeometry, ConeGeometry } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export function box(w, h, d, [x, y, z]) {
  return new BoxGeometry(w, h, d).translate(x, y, z)
}

/** Techo a cuatro aguas (pirámide rectangular) con base de `w` x `d`. */
export function hipRoof(w, h, d, [x, y, z]) {
  return new ConeGeometry(1, 1, 4, 1)
    .rotateY(Math.PI / 4)
    .scale(w / Math.SQRT2, h, d / Math.SQRT2)
    .translate(x, y + h / 2, z)
}

export function merge(parts) {
  const merged = mergeGeometries(parts, false)
  parts.forEach((p) => p.dispose())
  return merged
}
