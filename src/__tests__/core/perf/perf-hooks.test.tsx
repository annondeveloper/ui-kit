import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useRenderTime } from '../../../core/perf/use-render-time'
import { useWebVitals } from '../../../core/perf/use-web-vitals'

describe('useRenderTime', () => {
  it('self-samples real render timings and completes after 10 samples', async () => {
    const { result } = renderHook(() => useRenderTime('Test'))
    expect(result.current.componentName).toBe('Test')

    // The hook self-drives re-renders until it has SAMPLE_COUNT measurements.
    await waitFor(() => expect(result.current.status).toBe('complete'))

    expect(result.current.renderCount).toBe(10)
    expect(typeof result.current.averageRenderMs).toBe('number')
    expect(result.current.averageRenderMs).toBeGreaterThanOrEqual(0)
  })

  it('stops re-rendering once complete (no infinite loop)', async () => {
    const { result, rerender } = renderHook(() => useRenderTime('Stable'))
    await waitFor(() => expect(result.current.status).toBe('complete'))
    const settled = result.current
    rerender()
    // A manual rerender after completion must not restart sampling.
    expect(result.current.status).toBe('complete')
    expect(result.current.renderCount).toBe(settled.renderCount)
  })
})

describe('useWebVitals', () => {
  it('returns null vitals when PerformanceObserver is unavailable', () => {
    const original = globalThis.PerformanceObserver
    // @ts-expect-error - simulate unsupported environment
    delete globalThis.PerformanceObserver
    try {
      const { result } = renderHook(() => useWebVitals())
      expect(result.current).toEqual({ lcp: null, cls: null, inp: null })
    } finally {
      globalThis.PerformanceObserver = original
    }
  })
})
