import { useEffect, useRef } from 'react'

const KEY_ACTIONS = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'jump',
  ArrowDown: 'slide',
  a: 'left',
  d: 'right',
  w: 'jump',
  s: 'slide',
  ' ': 'jump',
}

const SWIPE_THRESHOLD = 28

/**
 * Teclado (flechas / WASD) y gestos swipe. El gesto se dispara en cuanto se
 * supera el umbral durante el touchmove, sin esperar a levantar el dedo.
 */
export function useGameControls(onAction, enabled) {
  const handler = useRef(onAction)
  handler.current = onAction

  useEffect(() => {
    if (!enabled) return

    const onKeyDown = (e) => {
      const action = KEY_ACTIONS[e.key.length === 1 ? e.key.toLowerCase() : e.key]
      if (!action) return
      e.preventDefault()
      if (!e.repeat) handler.current(action)
    }

    let start = null
    const onTouchStart = (e) => {
      const t = e.changedTouches[0]
      start = { x: t.clientX, y: t.clientY }
    }
    const onTouchMove = (e) => {
      if (!start) return
      const t = e.changedTouches[0]
      const dx = t.clientX - start.x
      const dy = t.clientY - start.y
      if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_THRESHOLD) return
      start = null
      if (Math.abs(dx) > Math.abs(dy)) handler.current(dx > 0 ? 'right' : 'left')
      else handler.current(dy < 0 ? 'jump' : 'slide')
    }
    const onTouchEnd = () => (start = null)

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('touchcancel', onTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [enabled])
}
