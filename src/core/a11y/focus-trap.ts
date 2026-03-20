import { useEffect, type RefObject } from 'react'

export interface FocusTrapConfig {
  active: boolean
  returnFocus?: boolean
  initialFocus?: 'first' | RefObject<HTMLElement | null>
}

export function useFocusTrap(containerRef: RefObject<HTMLElement | null>, config: FocusTrapConfig): void {
  useEffect(() => {
    if (!config.active) return
    const container = containerRef.current
    if (!container) return

    const previousFocus = document.activeElement as HTMLElement | null

    // Get all focusable elements
    const getFocusable = () => {
      return Array.from(container.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ))
    }

    // Set initial focus
    const focusable = getFocusable()
    if (config.initialFocus === 'first' && focusable[0]) {
      focusable[0].focus()
    } else if (config.initialFocus && typeof config.initialFocus === 'object' && config.initialFocus.current) {
      config.initialFocus.current.focus()
    } else if (focusable[0]) {
      focusable[0].focus()
    }

    // Trap focus on Tab
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const elements = getFocusable()
      if (elements.length === 0) return

      const first = elements[0]
      const last = elements[elements.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    container.addEventListener('keydown', onKeyDown)

    return () => {
      container.removeEventListener('keydown', onKeyDown)
      if (config.returnFocus !== false && previousFocus) {
        previousFocus.focus()
      }
    }
  }, [containerRef, config.active, config.returnFocus, config.initialFocus])
}
