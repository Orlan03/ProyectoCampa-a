import { useGameStore } from '../../store/useGameStore'
import { BoltIcon } from './BoltIcon'

const glass = 'rounded-2xl border border-white/30 bg-slate-900/25 shadow-lg backdrop-blur-md'

export function HUD() {
  const energy = useGameStore((s) => s.energy)
  const distance = useGameStore((s) => s.distance)
  const best = useGameStore((s) => s.best)

  return (
    <div
      className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 sm:p-6"
      style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
    >
      <div className={`${glass} flex items-center gap-3 px-4 py-2`}>
        <BoltIcon className="h-8 w-8 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/75">Energía Recolectada:</p>
          {/* key reinicia la animación en cada recolección */}
          <p key={energy} className="animate-[pop_0.25s_ease-out] text-2xl font-black tabular-nums drop-shadow sm:text-3xl">
            {energy.toLocaleString('es-EC')} <span className="text-base font-bold text-yellow-300">kW</span>
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <p className={`${glass} px-3 py-1.5 text-sm font-bold tabular-nums`}>{distance.toLocaleString('es-EC')} m</p>
        <p className="rounded-full bg-slate-900/25 px-3 py-0.5 text-xs font-medium text-white/85 backdrop-blur-sm">
          Récord {best.toLocaleString('es-EC')} kW
        </p>
      </div>
    </div>
  )
}
