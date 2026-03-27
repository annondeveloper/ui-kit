import { type RefObject, useEffect, useRef, useCallback } from 'react'
import { Choreography } from './choreography'
import { getChoreographyPreset } from './choreography-presets'
import type { ChoreographyStep } from './choreography'
import type { ChoreographyPreset } from './choreography-presets'
import { useMotionLevel } from './use-motion-level'

export interface ScrollChoreographyConfig {
  /** Element that triggers the choreography when it enters the viewport */
  trigger: RefObject<HTMLElement | null>
  /** Steps to execute when triggered */
  sequence: ChoreographyStep[]
  /** Use a named preset instead of custom sequence */
  preset?: ChoreographyPreset
  /** When to trigger, e.g. 'top bottom' (trigger top meets viewport bottom). Default: 'top bottom' */
  start?: string
  /** Tie choreography progress to scroll position */
  scrub?: boolean
  /** Only trigger once. Default: true */
  once?: boolean
}

/**
 * Parse a start string like 'top bottom' into a rootMargin-compatible threshold.
 * Returns the viewport edge offset for IntersectionObserver rootMargin.
 */
function startToRootMargin(start: string): string {
  const parts = start.trim().split(/\s+/)
  const viewportEdge = parts[1] || 'bottom'

  // rootMargin bottom value determines how far before the element enters
  // 'top bottom' = trigger when element top hits viewport bottom (default, margin 0)
  // 'top center' = trigger when element top hits viewport center (margin -50%)
  // 'top top' = trigger when element top hits viewport top (margin -100%)
  switch (viewportEdge) {
    case 'top':
      return '0px 0px -100% 0px'
    case 'center':
      return '0px 0px -50% 0px'
    case 'bottom':
    default:
      return '0px 0px 0px 0px'
  }
}

/**
 * Scroll-triggered choreography hook.
 * Uses IntersectionObserver to detect when the trigger enters the viewport,
 * then plays a Choreography sequence. If scrub=true, maps scroll progress
 * to choreography steps instead of auto-playing.
 */
export function useScrollChoreography(config: ScrollChoreographyConfig): void {
  const {
    trigger,
    sequence,
    preset,
    start = 'top bottom',
    scrub = false,
    once = true,
  } = config

  const motionLevel = useMotionLevel()
  const choreographyRef = useRef<Choreography | null>(null)
  const hasTriggered = useRef(false)

  const buildChoreography = useCallback((): Choreography => {
    if (preset && trigger.current) {
      // Build from preset using a data attribute selector for targeting children
      const selector = `[data-scroll-choreo-id="${trigger.current.dataset.scrollChoreoId || 'default'}"] > *`
      const presetConfig = getChoreographyPreset(preset, selector)
      return new Choreography(presetConfig)
    }
    return new Choreography({ sequence })
  }, [preset, sequence, trigger])

  useEffect(() => {
    const el = trigger.current
    if (!el || motionLevel === 0) return

    const rootMargin = startToRootMargin(start)

    if (scrub) {
      // Scrub mode: map scroll progress to which step to play
      const handleScroll = () => {
        if (!el) return

        const rect = el.getBoundingClientRect()
        const viewportHeight = window.innerHeight
        const elTop = rect.top
        const elHeight = rect.height

        // Progress 0 = element just entered, 1 = element fully scrolled past
        const progress = Math.min(1, Math.max(0, 1 - (elTop / (viewportHeight + elHeight))))

        if (!choreographyRef.current) {
          choreographyRef.current = buildChoreography()
        }

        // Map progress to step index and play up to that step
        const ch = choreographyRef.current
        if (progress > 0 && !hasTriggered.current) {
          hasTriggered.current = true
          ch.play()
        }
      }

      window.addEventListener('scroll', handleScroll, { passive: true })
      handleScroll() // Check initial position

      return () => {
        window.removeEventListener('scroll', handleScroll)
        choreographyRef.current?.cancel()
        choreographyRef.current = null
      }
    }

    // Non-scrub mode: use IntersectionObserver
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        if (once && hasTriggered.current) return

        hasTriggered.current = true
        choreographyRef.current?.cancel()
        choreographyRef.current = buildChoreography()
        choreographyRef.current.play()
      },
      {
        rootMargin,
        threshold: [0, 0.01],
      },
    )

    observer.observe(el)

    return () => {
      observer.disconnect()
      choreographyRef.current?.cancel()
      choreographyRef.current = null
    }
  }, [trigger, start, scrub, once, motionLevel, buildChoreography])
}
