// Coloca tus .glb en /public/models y cambia `url` (ej. '/models/santuario.glb').
// Con `url: null` se usan las primitivas procedurales.
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
