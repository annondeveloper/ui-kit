import { useRef, useState, useEffect } from 'react'

export interface RenderTiming {
  componentName: string
  renderCount: number
  lastRenderMs: number
  averageRenderMs: number
}

/**
 * Measures component render time. Only updates state ONCE on mount
 * to avoid infinite re-render loops. Subsequent renders update refs only.
 */
export function useRenderTime(componentName: string): RenderTiming {
  const mountTime = useRef(performance.now())
  const [timing] = useState<RenderTiming>(() => ({
    componentName,
    renderCount: 1,
    lastRenderMs: 0,
    averageRenderMs: 0,
  }))

  // Measure mount time once — no state updates to avoid loops
  useEffect(() => {
    const elapsed = performance.now() - mountTime.current
    // Mutate the object directly to avoid re-renders
    timing.lastRenderMs = Math.round(elapsed * 100) / 100
    timing.averageRenderMs = timing.lastRenderMs
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return timing
}
