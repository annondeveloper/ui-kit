import { useEffect, useState, type RefObject } from 'react'

export interface AnchorPositionResult {
  x: number
  y: number
  width: number
  placement: 'top' | 'bottom' | 'left' | 'right'
}

export function useAnchorPosition(
  triggerRef: RefObject<Element | null>,
  floatingRef: RefObject<Element | null>,
  config: {
    placement?: 'top' | 'bottom' | 'left' | 'right'
    align?: 'center' | 'start' | 'end'
    offset?: number
    enabled?: boolean
  } = {}
): AnchorPositionResult {
  const { placement = 'bottom', align = 'center', offset = 8, enabled = true } = config
  const [position, setPosition] = useState<AnchorPositionResult>({ x: 0, y: 0, width: 0, placement })

  useEffect(() => {
    if (!enabled) return

    const trigger = triggerRef.current
    const floating = floatingRef.current
    if (!trigger || !floating) return

    const update = () => {
      const triggerRect = trigger.getBoundingClientRect()
      const floatingRect = floating.getBoundingClientRect()

      let x = 0, y = 0, finalPlacement = placement

      const alignX = () => {
        if (align === 'start') return triggerRect.left
        if (align === 'end') return triggerRect.right - floatingRect.width
        return triggerRect.left + (triggerRect.width - floatingRect.width) / 2
      }

      switch (placement) {
        case 'bottom':
          x = alignX()
          y = triggerRect.bottom + offset
          // Flip if off screen
          if (y + floatingRect.height > window.innerHeight) {
            y = triggerRect.top - floatingRect.height - offset
            finalPlacement = 'top'
          }
          break
        case 'top':
          x = alignX()
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

      setPosition({ x, y, width: triggerRect.width, placement: finalPlacement })
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
  }, [triggerRef, floatingRef, placement, align, offset, enabled])

  return position
}

export function supportsAnchorPositioning(): boolean {
  return typeof CSS !== 'undefined' && CSS.supports?.('anchor-name', '--a') === true
}
