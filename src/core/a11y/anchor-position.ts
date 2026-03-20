import { useEffect, useState, type RefObject } from 'react'

export interface AnchorPositionResult {
  x: number
  y: number
  placement: 'top' | 'bottom' | 'left' | 'right'
}

export function useAnchorPosition(
  triggerRef: RefObject<Element | null>,
  floatingRef: RefObject<Element | null>,
  config: {
    placement?: 'top' | 'bottom' | 'left' | 'right'
    offset?: number
    enabled?: boolean
  } = {}
): AnchorPositionResult {
  const { placement = 'bottom', offset = 8, enabled = true } = config
  const [position, setPosition] = useState<AnchorPositionResult>({ x: 0, y: 0, placement })

  useEffect(() => {
    if (!enabled) return
    // Check if CSS anchor positioning is supported
    if (typeof CSS !== 'undefined' && CSS.supports?.('anchor-name', '--a')) return // CSS handles it

    const trigger = triggerRef.current
    const floating = floatingRef.current
    if (!trigger || !floating) return

    const update = () => {
      const triggerRect = trigger.getBoundingClientRect()
      const floatingRect = floating.getBoundingClientRect()

      let x = 0, y = 0, finalPlacement = placement

      switch (placement) {
        case 'bottom':
          x = triggerRect.left + (triggerRect.width - floatingRect.width) / 2
          y = triggerRect.bottom + offset
          // Flip if off screen
          if (y + floatingRect.height > window.innerHeight) {
            y = triggerRect.top - floatingRect.height - offset
            finalPlacement = 'top'
          }
          break
        case 'top':
          x = triggerRect.left + (triggerRect.width - floatingRect.width) / 2
          y = triggerRect.top - floatingRect.height - offset
          if (y < 0) {
            y = triggerRect.bottom + offset
            finalPlacement = 'bottom'
          }
          break
        case 'right':
          x = triggerRect.right + offset
          y = triggerRect.top + (triggerRect.height - floatingRect.height) / 2
          break
        case 'left':
          x = triggerRect.left - floatingRect.width - offset
          y = triggerRect.top + (triggerRect.height - floatingRect.height) / 2
          break
      }

      // Clamp to viewport
      x = Math.max(8, Math.min(x, window.innerWidth - floatingRect.width - 8))

      setPosition({ x, y, placement: finalPlacement })
    }

    update()

    const resizeObserver = new ResizeObserver(update)
    resizeObserver.observe(trigger)
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [triggerRef, floatingRef, placement, offset, enabled])

  return position
}

export function supportsAnchorPositioning(): boolean {
  return typeof CSS !== 'undefined' && CSS.supports?.('anchor-name', '--a') === true
}
