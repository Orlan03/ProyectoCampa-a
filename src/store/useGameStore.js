import { create } from 'zustand'
import { ENERGY, GAME, POWERS } from '../config/gameConfig'
import { clearAhead } from '../game/powers'
import { resetRuntime, runtime } from '../game/runtime'
import { isMobile } from '../utils/device'

let noticeTimer = 0

const BEST_KEY = 'biblian-runner-best-kw'
// Si el equipo no sostiene los FPS solo se baja de 'high' a 'medium' (sin AO ni MSAA):
// Bloom, luces y resolución se conservan.
const QUALITY_STEPS = ['high', 'medium']

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0
  } catch {
    return 0
  }
}

export const useGameStore = create((set, get) => {
  const flash = (notice) => {
    set({ notice })
    clearTimeout(noticeTimer)
    noticeTimer = setTimeout(() => {
      if (get().notice === notice) set({ notice: null })
    }, 1400)
  }

  return {
  status: 'menu', // 'menu' | 'playing' | 'blackout' | 'gameover'
  runId: 0,
  distance: 0,
  energy: 0, // Nivel de Energía en kW
  best: readBest(),
  isNewRecord: false,
  quality: isMobile ? 'medium' : 'high',
  powerIndex: 0,
  shield: false,
  notice: null,

  start() {
    resetRuntime()
    set((s) => ({
      status: 'playing',
      runId: s.runId + 1,
      distance: 0,
      energy: 0,
      isNewRecord: false,
      powerIndex: 0,
      shield: false,
      notice: null,
    }))
  },

  usePower() {
    const s = get()
    if (s.status !== 'playing') return false
    const power = POWERS[s.powerIndex % POWERS.length]
    if (s.energy < power.cost) return false

    if (power.id === 'shield') {
      if (runtime.shield) {
        flash('El escudo ya está activo')
        return false
      }
      runtime.shield = true
      set({ energy: s.energy - power.cost, shield: true, powerIndex: (s.powerIndex + 1) % POWERS.length })
      flash('Escudo activo')
      return true
    }

    if (power.id === 'magnet') {
      runtime.magnetUntil = performance.now() + power.duration * 1000
      set({ energy: s.energy - power.cost, powerIndex: (s.powerIndex + 1) % POWERS.length })
      flash('Imán activo')
      return true
    }

    if (!clearAhead()) {
      flash('No hay nada que arreglar enfrente')
      return false
    }
    set({ energy: s.energy - power.cost, powerIndex: (s.powerIndex + 1) % POWERS.length })
    flash('Obstáculo arreglado')
    return true
  },

  onShieldBroke() {
    set({ shield: false })
    flash('¡El escudo aguantó el golpe!')
  },

  // Choque con un bache: apagón de `blackoutMs` y luego la pantalla final.
  crash() {
    const s = get()
    if (s.status !== 'playing') return
    const isNewRecord = s.energy > s.best
    const best = Math.max(s.energy, s.best)
    try {
      localStorage.setItem(BEST_KEY, String(best))
    } catch {
      /* almacenamiento no disponible (modo privado) */
    }
    runtime.blackoutAt = performance.now()
    set({ status: 'blackout', distance: Math.floor(runtime.distance), best, isNewRecord })

    const { runId } = s
    setTimeout(() => {
      const current = get()
      if (current.status === 'blackout' && current.runId === runId) set({ status: 'gameover' })
    }, GAME.blackoutMs)
  },

  addEnergy() {
    set((s) => ({ energy: s.energy + ENERGY.kwPerOrb }))
  },

  setDistance(distance) {
    set({ distance })
  },

  degradeQuality() {
    const i = QUALITY_STEPS.indexOf(get().quality)
    if (i < QUALITY_STEPS.length - 1) set({ quality: QUALITY_STEPS[i + 1] })
  },
}
})
