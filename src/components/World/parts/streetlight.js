import {
  AdditiveBlending,
  CanvasTexture,
  ConeGeometry,
  CylinderGeometry,
  MeshBasicMaterial,
  MeshStandardMaterial,
} from 'three'
import { STREETLIGHT } from '../../../config/gameConfig'
import { box, merge } from '../../../utils/geometry'
import { NO_SHADOW_LAYER, withInstanceGlow } from '../../../utils/instancing'
import { standardMaterial } from '../../../utils/materials'

const { height: H, armLength: ARM } = STREETLIGHT

/** Poste con brazo hacia +x (hacia la calzada en el lado izquierdo). */
export function createPoleParts() {
  return [
    {
      name: 'pole',
      geometry: merge([
        new CylinderGeometry(0.16, 0.21, 0.6, 12).translate(0, 0.3, 0),
        new CylinderGeometry(0.055, 0.085, H, 12).translate(0, H / 2, 0),
        new CylinderGeometry(0.1, 0.1, 0.14, 12).translate(0, 2.6, 0),
        new CylinderGeometry(0.04, 0.045, ARM, 8).rotateZ(Math.PI / 2).translate(ARM / 2, H - 0.1, 0),
        new CylinderGeometry(0.025, 0.025, 1.1, 6).rotateZ(Math.PI / 2 - 0.75).translate(0.38, H - 0.45, 0),
        box(0.8, 0.16, 0.36, [ARM, H - 0.12, 0]),
      ]),
      material: standardMaterial('streetlight-pole', { color: '#22313a', roughness: 0.45, metalness: 0.7 }),
    },
  ]
}

function createConeAlpha() {
  const canvas = document.createElement('canvas')
  canvas.width = 4
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  const g = ctx.createLinearGradient(0, 0, 0, 64)
  g.addColorStop(0, '#ffffff')
  g.addColorStop(0.6, '#3a3a3a')
  g.addColorStop(1, '#000000')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 4, 64)
  return new CanvasTexture(canvas)
}

/**
 * Lente emisiva + cono de luz volumétrico falso. Ambos leen el brillo por instancia
 * (`instanceGlow`), así cada poste se enciende por separado en el mismo draw call.
 * Los materiales son globales: su intensidad base se usa para el apagón.
 */
export function createLampParts() {
  return [
    {
      name: 'lens',
      geometry: box(0.62, 0.05, 0.28, [ARM, H - 0.22, 0]),
      material: withInstanceGlow(
        new MeshStandardMaterial({ color: '#3b3a36', emissive: '#ffc46b', emissiveIntensity: 5, toneMapped: false }),
      ),
      glow: true,
    },
    {
      name: 'cone',
      geometry: new ConeGeometry(2.1, H - 0.3, 24, 1, true).translate(ARM, (H - 0.3) / 2, 0),
      material: withInstanceGlow(
        new MeshBasicMaterial({
          color: '#ffcf7a',
          alphaMap: createConeAlpha(),
          transparent: true,
          opacity: 0.14,
          depthWrite: false,
          blending: AdditiveBlending,
          fog: false,
        }),
        'color',
      ),
      glow: true,
      layer: NO_SHADOW_LAYER,
      renderOrder: 2,
    },
  ]
}
