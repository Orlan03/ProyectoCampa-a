import { useGameStore } from '../../store/useGameStore'
import { isMobile } from '../../utils/device'
import { BoltIcon } from './BoltIcon'

export function StartScreen() {
  const start = useGameStore((s) => s.start)
  const best = useGameStore((s) => s.best)

  return (
    <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-slate-950/60 via-slate-900/10 to-transparent p-6 pb-[max(2rem,env(safe-area-inset-bottom))] sm:items-center">
      <div className="pointer-events-auto w-full max-w-sm rounded-3xl border border-white/25 bg-white/10 p-6 text-center shadow-2xl backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-300">Con la energía de Miguel Zhindón</p>
        <h1 className="mt-1 text-4xl font-black tracking-tight drop-shadow-lg">Biblián Runner</h1>
        <p className="mt-3 text-sm text-white/80">
          Recolecta energía eléctrica <BoltIcon className="inline h-4 w-4 align-[-3px]" /> y salta los baches de
          la ciudad.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-white/80">
          <span className="rounded-xl bg-white/10 px-2 py-1.5">{isMobile ? 'Desliza ← →' : 'Flechas ← →'} cambiar carril</span>
          <span className="rounded-xl bg-white/10 px-2 py-1.5">{isMobile ? 'Desliza ↑' : 'Flecha ↑'} saltar bache</span>
        </div>

        <button
          onClick={start}
          className="mt-5 w-full rounded-2xl bg-yellow-400 py-3.5 text-lg font-extrabold text-slate-900 shadow-lg shadow-yellow-500/30 transition hover:bg-yellow-300 active:scale-[0.98]"
        >
          ¡Empezar a correr!
        </button>
        {best > 0 && <p className="mt-3 text-xs text-white/70">Tu récord: {best.toLocaleString('es-EC')} kW</p>}
      </div>
    </div>
  )
}
