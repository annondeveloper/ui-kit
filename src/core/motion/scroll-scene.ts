import { type RefObject, useEffect, useRef, useCallback } from 'react'

export interface ScrollSceneConfig {
  /** Element that triggers the scene */
  trigger: RefObject<HTMLElement | null>
  /** When the scene starts, e.g. 'top bottom' (trigger top meets viewport bottom). Default: 'top bottom' */
  start?: string
  /** When the scene ends, e.g. 'bottom top' (trigger bottom meets viewport top). Default: 'bottom top' */
  end?: string
  /** Tie animation progress to scroll position */
  scrub?: boolean
  /** Pin an element in place during the scroll range */
  pin?: RefObject<HTMLElement | null>
  /** Snap to specific progress points */
  snap?: {
    snapTo: number[]
    duration?: number
    ease?: string
  }
  /** Called when trigger enters the viewport */
  onEnter?: () => void
  /** Called when trigger leaves the viewport */
  onLeave?: () => void
  /** Called with 0-1 progress value during scrub */
  onProgress?: (progress: number) => void
}

/**
 * Parse a position string like 'top bottom' into trigger and viewport edges.
 * First word = trigger element edge, second word = viewport edge.
 */
function parsePosition(position: string): { triggerEdge: string; viewportEdge: string } {
  const parts = position.trim().split(/\s+/)
  return {
    triggerEdge: parts[0] || 'top',
    viewportEdge: parts[1] || 'bottom',
  }
}

/**
 * Get the pixel position of an edge of an element relative to the document.
 */
function getEdgePosition(rect: DOMRect, edge: string, scrollY: number): number {
  switch (edge) {
    case 'top':
      return rect.top + scrollY
    case 'bottom':
      return rect.bottom + scrollY
    case 'center':
      return rect.top + scrollY + rect.height / 2
    default:
      return rect.top + scrollY
  }
}

/**
 * Get the viewport position for an edge name.
 */
function getViewportEdge(edge: string, viewportHeight: number): number {
  switch (edge) {
    case 'top':
      return 0
    case 'bottom':
      return viewportHeight
    case 'center':
      return viewportHeight / 2
    default:
      return viewportHeight
  }
}

/**
 * Scroll scene hook — creates scroll-linked animations with progress tracking,
 * pinning, and snapping. Uses IntersectionObserver for enter/leave detection
 * and scroll listener for fine-grained progress.
 */
export function useScrollScene(config: ScrollSceneConfig): void {
  const {
    trigger,
    start = 'top bottom',
    end = 'bottom top',
    scrub = false,
    pin,
    snap,
    onEnter,
    onLeave,
    onProgress,
  } = config

  const isActive = useRef(false)
  const isPinned = useRef(false)
  const snapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const originalPinStyles = useRef<{ position: string; top: string; left: string; width: string } | null>(null)

  const handleScroll = useCallback(() => {
    const el = trigger.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    const scrollY = window.scrollY
    const viewportHeight = window.innerHeight

    const startParsed = parsePosition(start)
    const endParsed = parsePosition(end)

    // Calculate the scroll positions where the scene starts and ends
    const triggerStartPos = getEdgePosition(rect, startParsed.triggerEdge, scrollY)
    const viewportStartOffset = getViewportEdge(startParsed.viewportEdge, viewportHeight)
    const sceneStart = triggerStartPos - viewportStartOffset

    const triggerEndPos = getEdgePosition(rect, endParsed.triggerEdge, scrollY)
    const viewportEndOffset = getViewportEdge(endParsed.viewportEdge, viewportHeight)
    const sceneEnd = triggerEndPos - viewportEndOffset

    const range = sceneEnd - sceneStart
    if (range === 0) return

    const progress = Math.min(1, Math.max(0, (scrollY - sceneStart) / range))

    // Enter/leave detection
    const wasActive = isActive.current
    const nowActive = progress > 0 && progress < 1

    if (nowActive && !wasActive) {
      isActive.current = true
      onEnter?.()
    } else if (!nowActive && wasActive) {
      isActive.current = false
      onLeave?.()
    }

    // Progress callback for scrub mode
    if (scrub) {
      onProgress?.(progress)
    }

    // Pinning
    if (pin?.current) {
      const pinEl = pin.current
      if (nowActive && !isPinned.current) {
        // Save original styles
        originalPinStyles.current = {
          position: pinEl.style.position,
          top: pinEl.style.top,
          left: pinEl.style.left,
          width: pinEl.style.width,
        }
        const pinRect = pinEl.getBoundingClientRect()
        pinEl.style.position = 'fixed'
        pinEl.style.top = `${pinRect.top}px`
        pinEl.style.left = `${pinRect.left}px`
        pinEl.style.width = `${pinRect.width}px`
        isPinned.current = true
      } else if (!nowActive && isPinned.current) {
        // Restore original styles
        if (originalPinStyles.current) {
          pinEl.style.position = originalPinStyles.current.position
          pinEl.style.top = originalPinStyles.current.top
          pinEl.style.left = originalPinStyles.current.left
          pinEl.style.width = originalPinStyles.current.width
        }
        isPinned.current = false
      }
    }
  }, [trigger, start, end, scrub, pin, onEnter, onLeave, onProgress])

  // Handle snapping on scroll end
  const handleScrollEnd = useCallback(() => {
    if (!snap || !scrub) return

    const el = trigger.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    const scrollY = window.scrollY
    const viewportHeight = window.innerHeight

    const startParsed = parsePosition(start)
    const endParsed = parsePosition(end)

    const triggerStartPos = getEdgePosition(rect, startParsed.triggerEdge, scrollY)
    const viewportStartOffset = getViewportEdge(startParsed.viewportEdge, viewportHeight)
    const sceneStart = triggerStartPos - viewportStartOffset

    const triggerEndPos = getEdgePosition(rect, endParsed.triggerEdge, scrollY)
    const viewportEndOffset = getViewportEdge(endParsed.viewportEdge, viewportHeight)
    const sceneEnd = triggerEndPos - viewportEndOffset

    const range = sceneEnd - sceneStart
    if (range === 0) return

    const progress = Math.min(1, Math.max(0, (scrollY - sceneStart) / range))

    // Find nearest snap point
    let nearest = snap.snapTo[0]
    let nearestDist = Math.abs(progress - nearest)
    for (const point of snap.snapTo) {
      const dist = Math.abs(progress - point)
      if (dist < nearestDist) {
        nearest = point
        nearestDist = dist
      }
    }

    // Scroll to snap point
    const targetScroll = sceneStart + nearest * range
    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth',
    })
  }, [trigger, start, end, snap, scrub])

  useEffect(() => {
    const el = trigger.current
    if (!el) return

    // Use IntersectionObserver for initial enter/leave detection
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onEnter?.()
          isActive.current = true
        } else if (isActive.current) {
          onLeave?.()
          isActive.current = false
        }
      },
      { threshold: [0, 0.01, 0.99, 1] },
    )

    observer.observe(el)

    // Add scroll listener for scrub/pin/snap
    if (scrub || pin || snap) {
      window.addEventListener('scroll', handleScroll, { passive: true })

      // Scroll end detection for snapping
      if (snap) {
        const onScroll = () => {
          if (snapTimeoutRef.current) {
            clearTimeout(snapTimeoutRef.current)
          }
          snapTimeoutRef.current = setTimeout(handleScrollEnd, 150)
        }
        window.addEventListener('scroll', onScroll, { passive: true })

        return () => {
          observer.disconnect()
          window.removeEventListener('scroll', handleScroll)
          window.removeEventListener('scroll', onScroll)
          if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current)
        }
      }

      return () => {
        observer.disconnect()
        window.removeEventListener('scroll', handleScroll)
      }
    }

    return () => {
      observer.disconnect()
    }
  }, [trigger, scrub, pin, snap, handleScroll, handleScrollEnd, onEnter, onLeave])
}
