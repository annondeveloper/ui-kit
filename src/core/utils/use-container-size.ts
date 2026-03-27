'use client'

import { useState, useEffect, type RefObject } from 'react'
import { getBreakpoint, type ContainerBreakpoint } from './container-breakpoints'

export interface ContainerSize {
  width: number
  height: number
  breakpoint: ContainerBreakpoint
}

const DEFAULT_SIZE: ContainerSize = { width: 0, height: 0, breakpoint: 'xs' }

/**
 * Tracks the dimensions of a container element via ResizeObserver.
 * Returns { width, height, breakpoint } where breakpoint is derived from width.
 * SSR-safe: returns zeros when ResizeObserver is unavailable.
 * Debounced via requestAnimationFrame to avoid excessive re-renders.
 */
export function useContainerSize(ref: RefObject<HTMLElement | null>): ContainerSize {
  const [size, setSize] = useState<ContainerSize>(DEFAULT_SIZE)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return

    let rafId: number | null = null

    const observer = new ResizeObserver((entries) => {
      if (rafId !== null) cancelAnimationFrame(rafId)

      rafId = requestAnimationFrame(() => {
        rafId = null
        const entry = entries[0]
        if (!entry) return

        // Prefer borderBoxSize for accuracy, fall back to contentRect
        let w: number
        let h: number
        if (entry.borderBoxSize?.length) {
          const box = entry.borderBoxSize[0]
          w = box.inlineSize
          h = box.blockSize
        } else {
          w = entry.contentRect.width
          h = entry.contentRect.height
        }

        setSize((prev) => {
          if (prev.width === w && prev.height === h) return prev
          return { width: w, height: h, breakpoint: getBreakpoint(w) }
        })
      })
    })

    observer.observe(el)

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      observer.disconnect()
    }
  }, [ref])

  return size
}
