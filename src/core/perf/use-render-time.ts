import { useRef, useState, useEffect } from 'react'

export interface RenderTiming {
  componentName: string
  renderCount: number
  lastRenderMs: number
  averageRenderMs: number
  status: 'sampling' | 'complete'
}

const SAMPLE_COUNT = 10

/**
 * Measure a component's actual render-to-commit cost.
 *
 * Each render captures a start timestamp in the component body; a post-commit
 * effect measures the elapsed time (reconciliation + commit for this subtree)
 * and records a sample. Recording a sample triggers the next render, so the hook
 * self-drives until it has `SAMPLE_COUNT` real measurements, then stops updating
 * (the `done` guard prevents an infinite render loop). The averaged result is a
 * representative per-render cost — not a synthetic interval and not a no-op.
 */
export function useRenderTime(componentName: string): RenderTiming {
  const renderStart = performance.now()
  const samplesRef = useRef<number[]>([])
  const doneRef = useRef(false)
  const [timing, setTiming] = useState<RenderTiming>({
    componentName,
    renderCount: 0,
    lastRenderMs: 0,
    averageRenderMs: 0,
    status: 'sampling',
  })

  // Intentionally runs after every commit (no dependency array): each run records
  // one real sample and schedules the next render until SAMPLE_COUNT is reached.
  useEffect(() => {
    if (doneRef.current) return

    const elapsed = performance.now() - renderStart
    const samples = samplesRef.current
    samples.push(elapsed)

    const avg = samples.reduce((sum, v) => sum + v, 0) / samples.length
    const complete = samples.length >= SAMPLE_COUNT
    if (complete) doneRef.current = true

    setTiming({
      componentName,
      renderCount: samples.length,
      lastRenderMs: Math.round(elapsed * 100) / 100,
      averageRenderMs: Math.round(avg * 100) / 100,
      status: complete ? 'complete' : 'sampling',
    })
  })

  return timing
}
