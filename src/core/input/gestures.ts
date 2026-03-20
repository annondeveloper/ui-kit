import { useEffect, useRef, type RefObject } from 'react'

export interface GestureHandlers {
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down', velocity: number) => void
  onLongPress?: (x: number, y: number) => void
  onDoubleTap?: (x: number, y: number) => void
}

export function useGesture(ref: RefObject<Element | null>, handlers: GestureHandlers): void {
  const state = useRef({
    startX: 0, startY: 0, startTime: 0,
    lastTapTime: 0, lastTapX: 0, lastTapY: 0,
    longPressTimer: null as ReturnType<typeof setTimeout> | null,
  })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onDown = (e: Event) => {
      const pe = e as PointerEvent
      state.current.startX = pe.clientX
      state.current.startY = pe.clientY
      state.current.startTime = Date.now()

      // Long press detection (500ms)
      if (handlers.onLongPress) {
        state.current.longPressTimer = setTimeout(() => {
          handlers.onLongPress?.(pe.clientX, pe.clientY)
        }, 500)
      }
    }

    const onUp = (e: Event) => {
      const pe = e as PointerEvent
      if (state.current.longPressTimer) {
        clearTimeout(state.current.longPressTimer)
        state.current.longPressTimer = null
      }

      const dx = pe.clientX - state.current.startX
      const dy = pe.clientY - state.current.startY
      const dt = (Date.now() - state.current.startTime) / 1000
      const distance = Math.sqrt(dx * dx + dy * dy)

      // Swipe detection (> 30px, < 300ms)
      if (distance > 30 && dt < 0.3 && handlers.onSwipe) {
        const velocity = distance / dt
        if (Math.abs(dx) > Math.abs(dy)) {
          handlers.onSwipe(dx > 0 ? 'right' : 'left', velocity)
        } else {
          handlers.onSwipe(dy > 0 ? 'down' : 'up', velocity)
        }
      }

      // Double tap detection (< 300ms between taps, < 30px apart)
      if (handlers.onDoubleTap && dt < 0.3 && distance < 10) {
        const now = Date.now()
        if (now - state.current.lastTapTime < 300 &&
            Math.abs(pe.clientX - state.current.lastTapX) < 30 &&
            Math.abs(pe.clientY - state.current.lastTapY) < 30) {
          handlers.onDoubleTap(pe.clientX, pe.clientY)
          state.current.lastTapTime = 0
        } else {
          state.current.lastTapTime = now
          state.current.lastTapX = pe.clientX
          state.current.lastTapY = pe.clientY
        }
      }
    }

    const onMove = () => {
      // Cancel long press if moved
      if (state.current.longPressTimer) {
        clearTimeout(state.current.longPressTimer)
        state.current.longPressTimer = null
      }
    }

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointermove', onMove)

    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointermove', onMove)
      if (state.current.longPressTimer) clearTimeout(state.current.longPressTimer)
    }
  }, [ref, handlers])
}
