import { BARRIER, LANES, PLAYER, POTHOLE } from '../config/gameConfig'

// El jugador está fijo en z = 0; el mundo avanza hacia +z.
// Se comprueba el tramo recorrido en el frame (prevZ -> z) para evitar "tunneling".
const sweptOverlap = (prevZ, z, halfObstacle, halfPlayer) =>
  !(prevZ - halfObstacle > halfPlayer || z + halfObstacle < -halfPlayer)

// Bache: cuenta el centro de los pies, no el ancho del cuerpo; rozar el borde es seguro.
export function fallsInPothole(player, p, prevZ) {
  if (player.y > POTHOLE.h) return false
  const r = POTHOLE.coreRadius * p.scale
  if (Math.abs(player.x - LANES[p.lane]) > r) return false
  return sweptOverlap(prevZ, p.z, r, 0)
}

export function hitsBarrier(player, b, prevZ) {
  if (player.y > BARRIER.h) return false
  if (Math.abs(player.x - LANES[b.lane]) > (PLAYER.width + BARRIER.w) / 2) return false
  return sweptOverlap(prevZ, b.z, BARRIER.d / 2, PLAYER.depth / 2)
}

export function touchesOrb(player, orb, prevZ) {
  if (Math.abs(player.x - LANES[orb.lane]) > 0.8) return false
  if (prevZ > 0.6 || orb.z < -0.6) return false
  return orb.y > player.y - 0.3 && orb.y < player.y + player.height + 0.3
}
