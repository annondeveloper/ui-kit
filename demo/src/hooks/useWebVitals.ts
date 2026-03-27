import { useState, useEffect } from 'react'

export interface WebVitals {
  lcp: number | null
  cls: number | null
  inp: number | null
}

export function useWebVitals(): WebVitals {
  const [vitals, setVitals] = useState<WebVitals>({
    lcp: null,
    cls: null,
    inp: null,
  })

  useEffect(() => {
    if (typeof PerformanceObserver === 'undefined') return

    const observers: PerformanceObserver[] = []

    // Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const last = entries[entries.length - 1]
        if (last) {
          setVitals((prev) => ({ ...prev, lcp: Math.round(last.startTime) }))
        }
      })
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
      observers.push(lcpObserver)
    } catch {
      // Not supported
    }

    // Cumulative Layout Shift
    try {
      let clsTotal = 0
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsTotal += (entry as any).value ?? 0
          }
        }
        setVitals((prev) => ({ ...prev, cls: Math.round(clsTotal * 1000) / 1000 }))
      })
      clsObserver.observe({ type: 'layout-shift', buffered: true })
      observers.push(clsObserver)
    } catch {
      // Not supported
    }

    // Interaction to Next Paint
    try {
      const inpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        let maxDuration = 0
        for (const entry of entries) {
          if (entry.duration > maxDuration) {
            maxDuration = entry.duration
          }
        }
        if (maxDuration > 0) {
          setVitals((prev) => ({
            ...prev,
            inp: prev.inp !== null ? Math.max(prev.inp, maxDuration) : maxDuration,
          }))
        }
      })
      inpObserver.observe({ type: 'event', buffered: true })
      observers.push(inpObserver)
    } catch {
      // Not supported
    }

    return () => {
      for (const obs of observers) {
        obs.disconnect()
      }
    }
  }, [])

  return vitals
}
