// Coloca tus .glb en /public/models y cambia `url` (ej. '/models/santuario.glb').
// Con `url: null` se usan las primitivas procedurales.
// Casas CC0 de Quaternius (poly.pizza): dominio público, no piden crédito.
// El offset deja la fachada en x = 0 y el cuerpo hacia la acera.
export const HOUSES = [
  { url: '/models/houses/timber.glb', scale: 6.5, rotationY: 0, offset: [-2.86, 0, 0] },
  { url: '/models/houses/tile.glb', scale: 6, rotationY: 0, offset: [-3.84, 0, 0] },
  { url: '/models/houses/pair.glb', scale: 4.2, rotationY: 0, offset: [-4.12, 0.05, 0] },
  { url: '/models/houses/tile.glb', scale: 6.8, rotationY: 0, offset: [-4.35, 0, 0] },
]

export const MODELS = {
  player: { url: null, scale: 1, rotationY: Math.PI, runClip: 'Run' },
  house: { url: null, scale: 1, rotationY: 0 },
  santuario: { url: null, scale: 1, rotationY: 0 },
  pothole: { url: null, scale: 1, rotationY: 0 },
  barrier: { url: null, scale: 1, rotationY: 0 },
  // Solo reemplaza el poste; la lente emisiva y el cono de luz se mantienen.
  streetlight: { url: null, scale: 1, rotationY: 0 },
  energyOrb: { url: null, scale: 1, rotationY: 0 },
}
