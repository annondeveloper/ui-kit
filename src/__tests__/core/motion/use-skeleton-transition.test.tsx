import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSkeletonTransition } from '../../../core/motion/use-skeleton-transition'
import { MotionProvider } from '../../../core/motion/motion-context'
import type { ReactNode } from 'react'

describe('useSkeletonTransition', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('shows skeleton when loading is true', () => {
    const { result } = renderHook(() => useSkeletonTransition(true))
    expect(result.current.showSkeleton).toBe(true)
  })

  it('hides skeleton when loading is false from start', () => {
    const { result } = renderHook(() => useSkeletonTransition(false))
    expect(result.current.showSkeleton).toBe(false)
  })

  it('returns content opacity 1 when not loading', () => {
    const { result } = renderHook(() => useSkeletonTransition(false))
    expect(result.current.contentStyle.opacity).toBe(1)
  })

  it('returns content opacity 0 when loading', () => {
    const { result } = renderHook(() => useSkeletonTransition(true))
    expect(result.current.contentStyle.opacity).toBe(0)
  })

  it('transitions from skeleton to content with minimum display time', () => {
    const { result, rerender } = renderHook(
      ({ loading }) => useSkeletonTransition(loading, { minDisplayTime: 50 }),
      { initialProps: { loading: true } }
    )

    expect(result.current.showSkeleton).toBe(true)

    // Transition loading from true to false
    rerender({ loading: false })

    // Should still show skeleton during min display time
    act(() => {
      vi.advanceTimersByTime(30)
    })
    // May still show skeleton within min display time
    expect(result.current.showSkeleton).toBe(true)

    // After min display time
    act(() => {
      vi.advanceTimersByTime(30)
    })
    expect(result.current.showSkeleton).toBe(false)
  })

  it('provides transition style on content', () => {
    const { result } = renderHook(() =>
      useSkeletonTransition(false, { fadeDuration: 300 })
    )
    expect(result.current.contentStyle.transition).toContain('300ms')
  })

  it('skips animation when motion level is 0', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))

    const { result, rerender } = renderHook(
      ({ loading }) => useSkeletonTransition(loading),
      { initialProps: { loading: true } }
    )

    rerender({ loading: false })

    // Should immediately hide skeleton and show content
    expect(result.current.showSkeleton).toBe(false)
    expect(result.current.contentStyle).toEqual({})

    vi.unstubAllGlobals()
  })

  it('returns empty contentStyle when motion level is 0', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))

    const { result } = renderHook(() => useSkeletonTransition(false))
    expect(result.current.contentStyle).toEqual({})

    vi.unstubAllGlobals()
  })
})
