export const LANE_WIDTH = 2.4
export const LANES = [-LANE_WIDTH, 0, LANE_WIDTH]

export const ROAD = { width: 8.4, length: 170, tileLength: 10, startZ: 20 }
export const SIDEWALK = { width: 3.6, height: 0.15, tile: 2.4 }

export const GAME = {
  startSpeed: 14,
  maxSpeed: 38,
  acceleration: 0.32,
  gravity: 46,
  jumpVelocity: 14.5,
  slideDuration: 0.7,
  laneDamping: 13,
  spawnZ: -95,
  despawnZ: 10,
  firstGap: 38,
  minGap: 15,
  gapTime: [1.05, 1.6],
  blackoutMs: 1000,
}

export const PLAYER = { width: 0.6, depth: 0.5, height: 1.75, slideHeight: 0.75 }

// Solo se cae si el centro de los pies entra en el núcleo del hueco (radio `coreRadius`
// escalado por el tamaño del bache, el hueco visible mide ~0.95 m de radio): rozar el borde no mata.
export const POTHOLE = { coreRadius: 0.62, h: 0.25, visualSize: 3.1 }

// Valla de construcción: se salta (h < altura del salto) o se esquiva.
export const BARRIER = { w: 1.8, d: 0.45, h: 0.95 }

export const OBSTACLE_WEIGHTS = { pothole: 0.6, barrier: 0.4 }

// Tamaño fijo de los pools: se crean una vez al cargar y se reciclan para siempre.
export const POOLS = { potholes: 10, barriers: 8, energyOrbs: 15 }

export const ENERGY = { kwPerOrb: 10, spacing: 2.2, perLine: 5 }

// Ambiente de atardecer: el horizonte y la niebla comparten color para fundir la distancia.
export const WORLD = {
  fogColor: '#e59a72',
  skyMid: '#a35d8c',
  skyTop: '#1c2a63',
  sunDirection: [-0.5, 0.05, -1],
  fogDensity: 0.013,
  // Los postes y ventanas se encienden al cruzar esta distancia frente al jugador.
  lightFrontZ: -32,
}

export const STREETLIGHT = {
  perSide: 7,
  spacing: 16,
  height: 6.3,
  armLength: 1.7,
  lightIntensity: 160,
  lightDistance: 20,
}

export const BRAND = {
  primary: '#1f5fbf',
  accent: '#eab308',
}

export const LINKS = {
  propuestas: 'https://example.com/propuestas',
}
