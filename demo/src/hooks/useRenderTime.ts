import { useRef, useState, useEffect } from 'react'

export interface RenderTiming {
  componentName: string
  renderCount: number
  lastRenderMs: number
  averageRenderMs: number
  status: 'sampling' | 'complete'
}

const SAMPLE_DURATION_MS = 3000 // Sample renders for 3 seconds
const SAMPLE_INTERVAL_MS = 200  // Re-render every 200ms during sampling

/**
 * Measures component render time over a 3-second sampling window.
 * Forces periodic re-renders during sampling to collect multiple data points,
 * then stops and reports the average.
 */
export function useRenderTime(componentName: string): RenderTiming {
  const renderStart = useRef(performance.now())
  const samples = useRef<number[]>([])
  const [timing, setTiming] = useState<RenderTiming>({
    componentName,
    renderCount: 0,
    lastRenderMs: 0,
    averageRenderMs: 0,
    status: 'sampling',
  })

  // Capture render start time
  renderStart.current = performance.now()

  useEffect(() => {
    // Record this render's elapsed time
    const elapsed = performance.now() - renderStart.current
    samples.current.push(elapsed)

    const count = samples.current.length
    const avg = samples.current.reduce((s, v) => s + v, 0) / count

    // During sampling period, force periodic re-renders
    if (count * SAMPLE_INTERVAL_MS < SAMPLE_DURATION_MS) {
      const timer = setTimeout(() => {
        setTiming({
          componentName,
          renderCount: count,
          lastRenderMs: Math.round(elapsed * 100) / 100,
          averageRenderMs: Math.round(avg * 100) / 100,
          status: 'sampling',
        })
      }, SAMPLE_INTERVAL_MS)
      return () => clearTimeout(timer)
    }

    // Sampling complete — set final result, no more re-renders
    setTiming({
      componentName,
      renderCount: count,
      lastRenderMs: Math.round(elapsed * 100) / 100,
      averageRenderMs: Math.round(avg * 100) / 100,
      status: 'complete',
    })
  }) // Intentionally no deps — runs after each render during sampling

  return timing
}
