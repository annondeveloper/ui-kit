import { type RefObject, useEffect, useRef, useState } from 'react'

export interface ScrollRevealOptions {
  threshold?: number
  rootMargin?: string
  once?: boolean
}

export function useScrollReveal(
  ref: RefObject<Element | null>,
  options: ScrollRevealOptions = {},
): boolean {
  const { threshold = 0.1, rootMargin = '0px', once = true } = options
  const [isVisible, setIsVisible] = useState(false)
  const hasTriggered = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (once && hasTriggered.current) return

    // Check for CSS scroll-driven animations support
    const supportsScrollTimeline =
      typeof CSS !== 'undefined' && CSS?.supports?.('animation-timeline', 'view()')
    if (supportsScrollTimeline) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          hasTriggered.current = true
          if (once) observer.disconnect()
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, threshold, rootMargin, once])

  return isVisible
}

export function supportsScrollDrivenAnimations(): boolean {
  return typeof CSS !== 'undefined' && CSS.supports?.('animation-timeline', 'view()') === true
}
