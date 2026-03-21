import { useRef, useEffect, useState, type RefObject } from 'react'
import { useMotionLevel } from './use-motion-level'

export type EntranceAnimation = 'fade' | 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'none'

export function useEntrance(
  ref: RefObject<HTMLElement | null>,
  animation: EntranceAnimation = 'fade-up',
  options: { delay?: number; duration?: number; once?: boolean } = {}
): boolean {
  const { delay = 0, duration = 300, once = true } = options
  const motionLevel = useMotionLevel()
  const [entered, setEntered] = useState(false)
  const hasEntered = useRef(false)

  useEffect(() => {
    if (motionLevel === 0 || animation === 'none') {
      setEntered(true)
      return
    }
    if (once && hasEntered.current) return

    const el = ref.current
    if (!el) return

    // Set initial state
    el.style.opacity = '0'
    if (animation.includes('up')) el.style.transform = 'translateY(12px)'
    else if (animation.includes('down')) el.style.transform = 'translateY(-12px)'
    else if (animation.includes('left')) el.style.transform = 'translateX(12px)'
    else if (animation.includes('right')) el.style.transform = 'translateX(-12px)'
    else if (animation === 'scale') el.style.transform = 'scale(0.95)'

    const timer = setTimeout(() => {
      el.style.transition = `opacity ${duration}ms var(--ease-out, ease-out), transform ${duration}ms var(--ease-out, ease-out)`
      el.style.opacity = '1'
      el.style.transform = 'none'

      const cleanup = setTimeout(() => {
        el.style.transition = ''
        el.style.transform = ''
        el.style.opacity = ''
        setEntered(true)
        hasEntered.current = true
      }, duration)

      return () => clearTimeout(cleanup)
    }, delay)

    return () => clearTimeout(timer)
  }, [ref, animation, delay, duration, motionLevel, once])

  return entered
}
