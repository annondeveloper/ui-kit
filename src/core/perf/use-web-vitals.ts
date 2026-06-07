import { useState, useEffect } from 'react'

export interface WebVitals {
  /** Largest Contentful Paint, in ms (null until observed). */
  lcp: number | null
  /** Cumulative Layout Shift score (null until observed). */
  cls: number | null
  /** Interaction to Next Paint, in ms (null until observed). */
  inp: number | null
}

/**
 * Observe Core Web Vitals (LCP, CLS, INP) via PerformanceObserver. Degrades to
 * `null` values where the browser doesn't support a given entry type.
 */
export function useWebVitals(): WebVitals {
  const [vitals, setVitals] = useState<WebVitals>({ lcp: null, cls: null, inp: null })

  useEffect(() => {
    if (typeof PerformanceObserver === 'undefined') return

    const observers: PerformanceObserver[] = []

    try {
      const lcpObserver = new PerformanceObserver(list => {
        const entries = list.getEntries()
        const last = entries[entries.length - 1]
        if (last) setVitals(prev => ({ ...prev, lcp: Math.round(last.startTime) }))
      })
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
      observers.push(lcpObserver)
    } catch {
      /* not supported */
    }

    try {
      let clsTotal = 0
      const clsObserver = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number }
          if (!shift.hadRecentInput) clsTotal += shift.value ?? 0
        }
        setVitals(prev => ({ ...prev, cls: Math.round(clsTotal * 1000) / 1000 }))
      })
      clsObserver.observe({ type: 'layout-shift', buffered: true })
      observers.push(clsObserver)
    } catch {
      /* not supported */
    }

    try {
      const inpObserver = new PerformanceObserver(list => {
        let maxDuration = 0
        for (const entry of list.getEntries()) {
          if (entry.duration > maxDuration) maxDuration = entry.duration
        }
        if (maxDuration > 0) {
          setVitals(prev => ({
            ...prev,
            inp: prev.inp !== null ? Math.max(prev.inp, maxDuration) : maxDuration,
          }))
        }
      })
      inpObserver.observe({ type: 'event', buffered: true })
      observers.push(inpObserver)
    } catch {
      /* not supported */
    }

    return () => {
      for (const obs of observers) obs.disconnect()
    }
  }, [])

  return vitals
}
