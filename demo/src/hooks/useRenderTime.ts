import { useRef, useEffect, useState } from 'react'

export interface RenderTiming {
  componentName: string
  renderCount: number
  lastRenderMs: number
  averageRenderMs: number
}

export function useRenderTime(componentName: string): RenderTiming {
  const renderStart = useRef(performance.now())
  const renderCount = useRef(0)
  const totalMs = useRef(0)
  const [timing, setTiming] = useState<RenderTiming>({
    componentName,
    renderCount: 0,
    lastRenderMs: 0,
    averageRenderMs: 0,
  })

  // Capture render start time on every render
  renderStart.current = performance.now()

  useEffect(() => {
    const elapsed = performance.now() - renderStart.current
    renderCount.current += 1
    totalMs.current += elapsed

    setTiming({
      componentName,
      renderCount: renderCount.current,
      lastRenderMs: Math.round(elapsed * 100) / 100,
      averageRenderMs: Math.round((totalMs.current / renderCount.current) * 100) / 100,
    })
  })

  return timing
}
