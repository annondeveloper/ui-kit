import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useEntrance, type EntranceAnimation } from '../../../core/motion/use-entrance'
import { MotionProvider } from '../../../core/motion/motion-context'
import { createRef, type ReactNode } from 'react'

describe('useEntrance', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  function createMockRef() {
    const el = document.createElement('div')
    const ref = createRef<HTMLElement>() as { current: HTMLElement | null }
    ref.current = el
    return { ref, el }
  }

  it('returns false initially then true after animation completes', () => {
    const { ref } = createMockRef()
    const { result } = renderHook(() => useEntrance(ref, 'fade-up', { duration: 300 }))

    expect(result.current).toBe(false)

    // Advance past delay (0) + duration (300)
    act(() => {
      vi.advanceTimersByTime(0) // delay timer
    })
    act(() => {
      vi.advanceTimersByTime(300) // duration cleanup timer
    })

    expect(result.current).toBe(true)
  })

  it('returns true immediately when motion level is 0', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))

    const { ref } = createMockRef()
    const { result } = renderHook(() => useEntrance(ref, 'fade-up'))

    expect(result.current).toBe(true)

    vi.unstubAllGlobals()
  })

  it('returns true immediately when animation is none', () => {
    const { ref } = createMockRef()
    const { result } = renderHook(() => useEntrance(ref, 'none'))

    expect(result.current).toBe(true)
  })

  it('sets opacity to 0 initially for fade animation', () => {
    const { ref, el } = createMockRef()
    renderHook(() => useEntrance(ref, 'fade'))

    expect(el.style.opacity).toBe('0')
  })

  it('sets translateY(12px) for fade-up animation', () => {
    const { ref, el } = createMockRef()
    renderHook(() => useEntrance(ref, 'fade-up'))

    expect(el.style.opacity).toBe('0')
    expect(el.style.transform).toBe('translateY(12px)')
  })

  it('sets translateY(-12px) for fade-down animation', () => {
    const { ref, el } = createMockRef()
    renderHook(() => useEntrance(ref, 'fade-down'))

    expect(el.style.transform).toBe('translateY(-12px)')
  })

  it('sets translateX(12px) for fade-left animation', () => {
    const { ref, el } = createMockRef()
    renderHook(() => useEntrance(ref, 'fade-left'))

    expect(el.style.transform).toBe('translateX(12px)')
  })

  it('sets translateX(-12px) for fade-right animation', () => {
    const { ref, el } = createMockRef()
    renderHook(() => useEntrance(ref, 'fade-right'))

    expect(el.style.transform).toBe('translateX(-12px)')
  })

  it('sets scale(0.95) for scale animation', () => {
    const { ref, el } = createMockRef()
    renderHook(() => useEntrance(ref, 'scale'))

    expect(el.style.transform).toBe('scale(0.95)')
  })

  it('respects custom delay', () => {
    const { ref, el } = createMockRef()
    renderHook(() => useEntrance(ref, 'fade', { delay: 100, duration: 200 }))

    // Before delay, opacity should still be 0
    expect(el.style.opacity).toBe('0')

    act(() => {
      vi.advanceTimersByTime(50) // Not yet past delay
    })
    expect(el.style.opacity).toBe('0')

    act(() => {
      vi.advanceTimersByTime(50) // Now past delay (100ms total)
    })
    // After delay, transition starts — opacity set to 1
    expect(el.style.opacity).toBe('1')
  })

  it('cleans up styles after animation completes', () => {
    const { ref, el } = createMockRef()
    renderHook(() => useEntrance(ref, 'fade-up', { duration: 200 }))

    act(() => {
      vi.advanceTimersByTime(0) // delay
    })
    act(() => {
      vi.advanceTimersByTime(200) // duration
    })

    // After cleanup, inline styles should be cleared
    expect(el.style.transition).toBe('')
    expect(el.style.transform).toBe('')
    expect(el.style.opacity).toBe('')
  })

  it('does not re-animate when once is true and already entered', () => {
    const { ref, el } = createMockRef()
    const { result, rerender } = renderHook(() =>
      useEntrance(ref, 'fade-up', { duration: 100, once: true })
    )

    // Complete the first animation
    act(() => {
      vi.advanceTimersByTime(0)
    })
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current).toBe(true)

    // Rerender should not reset
    rerender()
    expect(result.current).toBe(true)
    expect(el.style.opacity).toBe('')
  })

  it('does not animate when ref is null', () => {
    const ref = createRef<HTMLElement>()
    const { result } = renderHook(() => useEntrance(ref, 'fade-up'))

    // Should stay false because no element to animate
    expect(result.current).toBe(false)
  })

  it('returns true immediately when MotionProvider level is 0', () => {
    const { ref } = createMockRef()
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MotionProvider level={0}>{children}</MotionProvider>
    )
    const { result } = renderHook(() => useEntrance(ref, 'fade-up'), { wrapper })

    expect(result.current).toBe(true)
  })

  it('applies transition with correct duration', () => {
    const { ref, el } = createMockRef()
    renderHook(() => useEntrance(ref, 'fade', { duration: 500 }))

    act(() => {
      vi.advanceTimersByTime(0) // delay
    })

    expect(el.style.transition).toContain('500ms')
  })
})
