import { useEffect } from 'react'
import { useGameStore } from '../../store/useGameStore'
import { GameOverModal } from './GameOverModal'
import { HUD } from './HUD'
import { StartScreen } from './StartScreen'

function ShortCircuitFlash() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="absolute inset-0 animate-[spark_0.45s_steps(1)_forwards] bg-white" />
      <p className="animate-[flicker_0.9s_linear_forwards] text-3xl font-black tracking-widest text-yellow-300 drop-shadow-[0_0_16px_rgba(234,179,8,0.9)]">
        ¡APAGÓN!
      </p>
    </div>
  )
}

export function UIOverlay() {
  const status = useGameStore((s) => s.status)
  const start = useGameStore((s) => s.start)

  useEffect(() => {
    if (status !== 'menu' && status !== 'gameover') return
    const onKey = (e) => e.key === 'Enter' && start()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [status, start])

  return (
    <div className="pointer-events-none absolute inset-0 text-white">
      {status === 'playing' && <HUD />}
      {status === 'blackout' && <ShortCircuitFlash />}
      {status === 'menu' && <StartScreen />}
      {status === 'gameover' && <GameOverModal />}
    </div>
  )
}
