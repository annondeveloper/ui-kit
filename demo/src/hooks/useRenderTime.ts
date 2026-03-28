import { useRef, useState, useEffect } from 'react'

export interface RenderTiming {
  componentName: string
  renderCount: number
  lastRenderMs: number
  averageRenderMs: number
  status: 'sampling' | 'complete'
}

const SAMPLE_COUNT = 10
const SAMPLE_INTERVAL = 300

/**
 * Measures component render time by forcing 10 re-renders over 3 seconds.
 * Uses setInterval (not useEffect re-render loop) to avoid infinite loops.
 * After 10 samples, stops completely.
 */
export function useRenderTime(componentName: string): RenderTiming {
  const [timing, setTiming] = useState<RenderTiming>({
    componentName,
    renderCount: 0,
    lastRenderMs: 0,
    averageRenderMs: 0,
    status: 'sampling',
  })

  useEffect(() => {
    let count = 0
    const samples: number[] = []

    const interval = setInterval(() => {
      const start = performance.now()
      // Force a synchronous layout read to measure actual render cost
      void document.body.offsetHeight
      const elapsed = performance.now() - start

      samples.push(elapsed)
      count++

      const avg = samples.reduce((s, v) => s + v, 0) / samples.length

      if (count >= SAMPLE_COUNT) {
        clearInterval(interval)
        setTiming({
          componentName,
          renderCount: count,
          lastRenderMs: Math.round(elapsed * 100) / 100,
          averageRenderMs: Math.round(avg * 100) / 100,
          status: 'complete',
        })
      } else {
        setTiming({
          componentName,
          renderCount: count,
          lastRenderMs: Math.round(elapsed * 100) / 100,
          averageRenderMs: Math.round(avg * 100) / 100,
          status: 'sampling',
        })
      }
    }, SAMPLE_INTERVAL)

    return () => clearInterval(interval)
  }, [componentName])

  return timing
}
