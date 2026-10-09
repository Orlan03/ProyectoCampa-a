import { POWERS } from '../../config/gameConfig'
import { useGameStore } from '../../store/useGameStore'
import { isMobile } from '../../utils/device'
import { BoltIcon } from './BoltIcon'

const glass = 'rounded-2xl border border-white/30 bg-slate-900/25 shadow-lg backdrop-blur-md'

export function HUD() {
  const energy = useGameStore((s) => s.energy)
  const distance = useGameStore((s) => s.distance)
  const best = useGameStore((s) => s.best)
  const powerIndex = useGameStore((s) => s.powerIndex)
  const shield = useGameStore((s) => s.shield)
  const notice = useGameStore((s) => s.notice)
  const usePower = useGameStore((s) => s.usePower)
  const power = POWERS[powerIndex % POWERS.length]
  const alreadyOn = power.id === 'shield' && shield
  const ready = energy >= power.cost && !alreadyOn

  return (
    <div className="pointer-events-none absolute inset-0">
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

    {notice && (
      <p className="absolute inset-x-0 top-24 text-center text-lg font-black tracking-wide text-yellow-300 drop-shadow-[0_0_12px_rgba(234,179,8,0.85)]">
        {notice}
      </p>
    )}

    <div className="absolute inset-x-0 bottom-0 flex justify-center px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <button
        type="button"
        onClick={usePower}
        disabled={!ready}
        className={`pointer-events-auto flex min-w-44 items-center gap-3 rounded-2xl px-4 py-2.5 text-left shadow-lg transition active:scale-[0.98] ${
          ready ? 'bg-yellow-400 text-slate-900 shadow-yellow-500/30 hover:bg-yellow-300' : 'bg-slate-900/55 text-white/45'
        }`}
      >
        <BoltIcon className={`h-7 w-7 ${ready ? '' : 'opacity-40'}`} />
        <span>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] opacity-70">
            {isMobile ? 'Toca' : 'Tecla E'} · {power.cost} kW
          </span>
          <span className="block text-base font-black leading-tight">{power.label}</span>
          <span className="block text-[11px] font-medium opacity-80">
            {alreadyOn ? 'Ya está activo' : shield ? `Escudo listo · ${power.detail}` : power.detail}
          </span>
        </span>
      </button>
    </div>
    </div>
  )
}
