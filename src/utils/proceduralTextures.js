import { CanvasTexture, NoColorSpace, RepeatWrapping, SRGBColorSpace } from 'three'
import { LANE_WIDTH } from '../config/gameConfig'
import { mulberry32 } from './random'

function makeCanvas(width, height = width) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return [canvas, canvas.getContext('2d')]
}

function toTexture(canvas, { srgb = true, repeat = [1, 1] } = {}) {
  const texture = new CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = RepeatWrapping
  texture.repeat.set(...repeat)
  texture.anisotropy = 8
  texture.colorSpace = srgb ? SRGBColorSpace : NoColorSpace
  return texture
}

function speckle(ctx, rctx, size, count, [cMin, cMax], [rMin, rMax]) {
  for (let i = 0; i < count; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const s = Math.random() * 2 + 0.5
    const v = (cMin + Math.random() * (cMax - cMin)) | 0
    ctx.fillStyle = `rgb(${v},${v},${v + 2})`
    ctx.fillRect(x, y, s, s)
    const r = (rMin + Math.random() * (rMax - rMin)) | 0
    rctx.fillStyle = `rgb(${r},${r},${r})`
    rctx.fillRect(x, y, s, s)
  }
}

function stains(ctx, size, count, color) {
  for (let i = 0; i < count; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const r = 20 + Math.random() * 70
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, color)
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(x - r, y - r, r * 2, r * 2)
  }
}

/** Asfalto con líneas de borde y carriles. Un tile = `tileLength` unidades de largo. */
export function createAsphaltTextures({ width, tileLength, repeatY }) {
  const S = 512
  const [c, ctx] = makeCanvas(S)
  const [r, rctx] = makeCanvas(S)

  ctx.fillStyle = '#3d3f42'
  ctx.fillRect(0, 0, S, S)
  rctx.fillStyle = '#d6d6d6'
  rctx.fillRect(0, 0, S, S)
  stains(ctx, S, 16, 'rgba(20,20,22,0.18)')
  speckle(ctx, rctx, S, 22000, [38, 95], [170, 255])

  const toPx = (x) => ((x + width / 2) / width) * S
  const lineW = (0.13 / width) * S
  const paint = (x, y, w, h) => {
    ctx.fillStyle = 'rgba(236,234,224,0.9)'
    ctx.fillRect(x, y, w, h)
    rctx.fillStyle = '#7a7a7a'
    rctx.fillRect(x, y, w, h)
  }

  for (const x of [-width / 2 + 0.3, width / 2 - 0.3]) paint(toPx(x) - lineW / 2, 0, lineW, S)

  const dash = (3 / tileLength) * S
  for (const x of [-LANE_WIDTH / 2, LANE_WIDTH / 2]) paint(toPx(x) - lineW / 2, S * 0.1, lineW, dash)

  const repeat = [1, repeatY]
  return { map: toTexture(c, { repeat }), roughnessMap: toTexture(r, { srgb: false, repeat }) }
}

/** Baldosas de vereda de 1.2 m (el canvas representa 2x2 baldosas). */
export function createSidewalkTextures(repeat) {
  const S = 256
  const [c, ctx] = makeCanvas(S)
  const [r, rctx] = makeCanvas(S)

  ctx.fillStyle = '#a7a39a'
  ctx.fillRect(0, 0, S, S)
  rctx.fillStyle = '#c8c8c8'
  rctx.fillRect(0, 0, S, S)
  stains(ctx, S, 8, 'rgba(90,85,75,0.15)')
  speckle(ctx, rctx, S, 5000, [140, 185], [150, 240])

  ctx.fillStyle = '#6f6b63'
  rctx.fillStyle = '#ffffff'
  for (const p of [0, S / 2]) {
    ctx.fillRect(p, 0, 3, S)
    ctx.fillRect(0, p, S, 3)
    rctx.fillRect(p, 0, 3, S)
    rctx.fillRect(0, p, S, 3)
  }

  return { map: toTexture(c, { repeat }), roughnessMap: toTexture(r, { srgb: false, repeat }) }
}

let stripeTexture

/** Franjas diagonales naranja/blanco de las vallas de construcción. */
export function getStripeTexture() {
  if (stripeTexture) return stripeTexture
  const [c, ctx] = makeCanvas(256, 64)
  ctx.fillStyle = '#fbf7ee'
  ctx.fillRect(0, 0, 256, 64)
  ctx.fillStyle = '#ff5a0a'
  for (let x = -64; x < 256 + 64; x += 64) {
    ctx.beginPath()
    ctx.moveTo(x, 64)
    ctx.lineTo(x + 32, 64)
    ctx.lineTo(x + 64, 0)
    ctx.lineTo(x + 32, 0)
    ctx.fill()
  }
  stripeTexture = toTexture(c)
  return stripeTexture
}

const TAU = Math.PI * 2
const mid = ([ax, ay], [bx, by]) => [(ax + bx) / 2, (ay + by) / 2]

function blobRadii(rand, points, jitter) {
  return Array.from({ length: points }, () => 1 - jitter + rand() * jitter * 2)
}

/** Contorno orgánico suavizado (curvas por los puntos medios). */
function blobPath(ctx, cx, cy, radius, radii) {
  const n = radii.length
  const pt = (i) => {
    const a = (i / n) * TAU
    const r = radius * radii[i % n]
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]
  }
  ctx.beginPath()
  ctx.moveTo(...mid(pt(0), pt(1)))
  for (let i = 1; i <= n; i++) ctx.quadraticCurveTo(...pt(i), ...mid(pt(i), pt(i + 1)))
  ctx.closePath()
}

function crackPoints(rand, cx, cy, angle, r0, r1) {
  const pts = []
  let a = angle
  for (let r = r0; r < r1; r += 6 + rand() * 10) {
    a += (rand() - 0.5) * 0.3
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r])
  }
  return pts
}

function strokePath(ctx, pts, width) {
  if (pts.length < 2) return
  ctx.lineWidth = width
  ctx.beginPath()
  ctx.moveTo(...pts[0])
  pts.slice(1).forEach((p) => ctx.lineTo(...p))
  ctx.stroke()
}

const potholeCache = new Map()

/**
 * Bache: borde de asfalto desgranado, hueco oscuro con grava, grietas radiales y
 * un charco al fondo. Devuelve color (con alfa), relieve y rugosidad.
 */
export function getPotholeTextures(seed) {
  if (potholeCache.has(seed)) return potholeCache.get(seed)

  const S = 512
  const C = S / 2
  const R = S * 0.31
  const rand = mulberry32(seed)
  const shape = blobRadii(rand, 18, 0.22)
  const puddleShape = blobRadii(rand, 12, 0.25)
  const [c, ctx] = makeCanvas(S)
  const [h, hctx] = makeCanvas(S)
  const [r, rctx] = makeCanvas(S)

  hctx.fillStyle = '#ffffff'
  hctx.fillRect(0, 0, S, S)
  rctx.fillStyle = '#dcdcdc'
  rctx.fillRect(0, 0, S, S)

  ctx.strokeStyle = 'rgba(14,14,15,0.85)'
  hctx.strokeStyle = '#6a6a6a'
  ctx.lineCap = hctx.lineCap = 'round'
  for (let i = 0; i < 12; i++) {
    const a = rand() * TAU
    const main = crackPoints(rand, C, C, a, R * 0.9, R * (1.25 + rand() * 0.35))
    const width = 1.5 + rand() * 2.5
    strokePath(ctx, main, width)
    strokePath(hctx, main, width + 1)
    if (main.length > 4 && rand() < 0.6) {
      const [bx, by] = main[Math.floor(main.length / 2)]
      const branch = crackPoints(rand, bx, by, a + (rand() < 0.5 ? 0.9 : -0.9), 0, R * 0.25)
      strokePath(ctx, branch, width * 0.6)
      strokePath(hctx, branch, width * 0.6 + 1)
    }
  }

  blobPath(ctx, C, C, R * 1.17, shape)
  ctx.fillStyle = 'rgba(50,51,54,0.97)'
  ctx.fill()
  ctx.save()
  ctx.clip()
  for (let i = 0; i < 2600; i++) {
    const v = (30 + rand() * 75) | 0
    ctx.fillStyle = `rgb(${v},${v},${v + 2})`
    ctx.fillRect(rand() * S, rand() * S, 1 + rand() * 3, 1 + rand() * 3)
  }
  ctx.restore()
  blobPath(hctx, C, C, R * 1.17, shape)
  hctx.fillStyle = '#d2d2d2'
  hctx.fill()

  blobPath(ctx, C, C, R, shape)
  const hole = ctx.createRadialGradient(C, C, 0, C, C, R)
  hole.addColorStop(0, '#09090a')
  hole.addColorStop(0.7, '#141415')
  hole.addColorStop(1, '#2c2c2e')
  ctx.fillStyle = hole
  ctx.fill()
  blobPath(hctx, C, C, R, shape)
  const depth = hctx.createRadialGradient(C, C, 0, C, C, R)
  depth.addColorStop(0, '#080808')
  depth.addColorStop(1, '#5a5a5a')
  hctx.fillStyle = depth
  hctx.fill()

  ctx.save()
  blobPath(ctx, C, C, R, shape)
  ctx.clip()
  for (let i = 0; i < 320; i++) {
    const v = (55 + rand() * 60) | 0
    ctx.fillStyle = `rgba(${v},${v},${v},0.75)`
    ctx.fillRect(rand() * S, rand() * S, 1 + rand() * 3, 1 + rand() * 3)
  }
  // Sombra de la pared interior: el hueco se lee como profundidad, no como mancha.
  const wall = ctx.createLinearGradient(C - R, C - R, C + R, C + R)
  wall.addColorStop(0, 'rgba(0,0,0,0.75)')
  wall.addColorStop(0.45, 'rgba(0,0,0,0)')
  wall.addColorStop(1, 'rgba(150,140,130,0.18)')
  ctx.fillStyle = wall
  ctx.fillRect(0, 0, S, S)
  ctx.restore()

  // Arista del corte del asfalto, más clara que el hueco y el pavimento.
  blobPath(ctx, C, C, R, shape)
  ctx.strokeStyle = 'rgba(128,126,122,0.9)'
  ctx.lineWidth = 4
  ctx.stroke()

  const px = C + (rand() - 0.5) * R * 0.3
  const py = C + (rand() - 0.5) * R * 0.3
  for (const [g, fill] of [
    [ctx, 'rgba(20,26,31,0.96)'],
    [hctx, '#0a0a0a'],
    [rctx, '#121212'],
  ]) {
    blobPath(g, px, py, R * 0.5, puddleShape)
    g.fillStyle = fill
    g.fill()
  }

  // Círculo de pintura de señalización (reflectiva): se duplica en un mapa emisivo
  // para que el bache se distinga a distancia incluso al anochecer.
  const [e, ectx] = makeCanvas(S)
  ectx.fillStyle = '#000000'
  ectx.fillRect(0, 0, S, S)
  const paintR = S * 0.41
  const paintRotation = rand() * TAU
  for (const [g, color] of [
    [ctx, '#ffc21a'],
    [rctx, '#5a5a5a'],
    [ectx, '#ffffff'],
  ]) {
    g.save()
    g.setLineDash([30, 16])
    g.lineCap = 'round'
    g.strokeStyle = color
    g.lineWidth = 11
    g.beginPath()
    g.ellipse(C, C, paintR, paintR * 0.96, paintRotation, 0, TAU)
    g.stroke()
    g.restore()
  }

  const textures = {
    map: toTexture(c),
    bumpMap: toTexture(h, { srgb: false }),
    roughnessMap: toTexture(r, { srgb: false }),
    emissiveMap: toTexture(e),
  }
  potholeCache.set(seed, textures)
  return textures
}
