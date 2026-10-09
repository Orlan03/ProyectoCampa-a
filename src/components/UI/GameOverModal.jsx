import { LINKS } from '../../config/gameConfig'
import { useGameStore } from '../../store/useGameStore'
import { BoltIcon } from './BoltIcon'

export function GameOverModal() {
  const energy = useGameStore((s) => s.energy)
  const distance = useGameStore((s) => s.distance)
  const best = useGameStore((s) => s.best)
  const isNewRecord = useGameStore((s) => s.isNewRecord)
  const start = useGameStore((s) => s.start)

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/45 p-6 backdrop-blur-[2px]">
      <div className="pointer-events-auto w-full max-w-sm animate-[pop_0.35s_ease-out] rounded-3xl border border-white/30 bg-white/15 p-7 text-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
        <h2 className="text-2xl leading-tight font-black tracking-tight drop-shadow">
          ¡La ciudad está llena de baches! 🛑
        </h2>
        <p className="mt-2 text-base font-medium text-white/90">
          Pero Miguel Zhindón trae la energía para arreglar Biblián. ⚡
        </p>

        <div className="mt-5 rounded-2xl border border-yellow-300/30 bg-yellow-400/10 py-4 shadow-[inset_0_0_30px_rgba(234,179,8,0.15)]">
          <p className="text-sm font-semibold text-white/85">
            <BoltIcon className="mr-1 inline h-4 w-4 align-[-3px]" />
            Tu energía recolectada:{' '}
            <strong className="mt-1 block text-5xl font-black text-yellow-300 tabular-nums drop-shadow-[0_0_12px_rgba(234,179,8,0.6)]">
              {energy.toLocaleString('es-EC')} <span className="text-xl">kW</span>
            </strong>
          </p>
          <p className="mt-2 text-xs text-white/70">
            {distance.toLocaleString('es-EC')} m recorridos · Récord {best.toLocaleString('es-EC')} kW
          </p>
          {isNewRecord && (
            <p className="mx-auto mt-2 w-fit rounded-full bg-yellow-400 px-3 py-0.5 text-xs font-bold text-slate-900">
              ¡Nuevo récord!
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={start}
            className="rounded-2xl bg-yellow-400 py-3.5 text-lg font-extrabold text-slate-900 shadow-lg shadow-yellow-500/30 transition hover:bg-yellow-300 active:scale-[0.98]"
          >
            Reintentar
          </button>
          <a
            href={LINKS.propuestas}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border border-white/40 bg-white/10 py-3.5 font-bold transition hover:bg-white/20 active:scale-[0.98]"
          >
            Conoce sus propuestas
          </a>
        </div>
      </div>
    </div>
  )
}
