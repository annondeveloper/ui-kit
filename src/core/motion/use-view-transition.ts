'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useMotionLevel } from './use-motion-level'
import { getTransitionCSS, type TransitionPreset } from './view-transition-presets'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ViewTransitionOptions {
  /** Preset animation style */
  preset?: TransitionPreset
  /** Duration in ms (default 300) */
  duration?: number
  /** Called when the transition starts */
  onStart?: () => void
  /** Called when the transition finishes */
  onFinish?: () => void
}

export interface ViewTransitionResult {
  /** Wraps a DOM-mutating callback in a view transition */
  startTransition: (callback: () => void | Promise<void>) => Promise<void>
  /** True while a view transition is in progress */
  isTransitioning: boolean
  /** Sets view-transition-name on an element; cleans up on unmount */
  assignTransitionName: (element: HTMLElement | null, name: string) => void
}

// ─── Feature detection ──────────────────────────────────────────────────────

function supportsViewTransitions(): boolean {
  return (
    typeof document !== 'undefined' &&
    typeof document.startViewTransition === 'function'
  )
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useViewTransition(options: ViewTransitionOptions = {}): ViewTransitionResult {
  const { preset, duration = 300, onStart, onFinish } = options
  const [isTransitioning, setIsTransitioning] = useState(false)
  const motionLevel = useMotionLevel()
  const namesRef = useRef<Map<HTMLElement, string>>(new Map())

  // Clean up transition names on unmount
  useEffect(() => {
    return () => {
      for (const el of namesRef.current.keys()) {
        el.style.viewTransitionName = ''
      }
      namesRef.current.clear()
    }
  }, [])

  const startTransition = useCallback(
    async (callback: () => void | Promise<void>): Promise<void> => {
      // Motion level 0 or reduced motion — skip transition entirely
      if (motionLevel === 0) {
        await callback()
        return
      }

      // No API support — fall back to direct callback
      if (!supportsViewTransitions()) {
        await callback()
        return
      }

      // Inject preset CSS if specified
      let styleEl: HTMLStyleElement | undefined
      if (preset) {
        styleEl = document.createElement('style')
        styleEl.textContent = getTransitionCSS(preset, duration)
        document.head.appendChild(styleEl)
      }

      setIsTransitioning(true)
      onStart?.()

      try {
        const transition = document.startViewTransition!(async () => {
          await callback()
        })

        await transition.finished
      } finally {
        setIsTransitioning(false)
        onFinish?.()
        if (styleEl) {
          styleEl.remove()
        }
      }
    },
    [motionLevel, preset, duration, onStart, onFinish],
  )

  const assignTransitionName = useCallback(
    (element: HTMLElement | null, name: string): void => {
      if (!element) return
      element.style.viewTransitionName = name
      namesRef.current.set(element, name)
    },
    [],
  )

  return { startTransition, isTransitioning, assignTransitionName }
}
