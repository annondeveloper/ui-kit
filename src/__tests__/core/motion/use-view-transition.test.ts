import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useViewTransition } from '../../../core/motion/use-view-transition'
import { getTransitionCSS, type TransitionPreset } from '../../../core/motion/view-transition-presets'

// ─── Mock matchMedia (motion enabled by default) ────────────────────────────

beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  )
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

// ─── useViewTransition ──────────────────────────────────────────────────────

describe('useViewTransition', () => {
  it('returns stable function references across renders', () => {
    const { result, rerender } = renderHook(() => useViewTransition())
    const first = result.current

    rerender()

    expect(result.current.startTransition).toBe(first.startTransition)
    expect(result.current.assignTransitionName).toBe(first.assignTransitionName)
  })

  it('isTransitioning is false initially', () => {
    const { result } = renderHook(() => useViewTransition())
    expect(result.current.isTransitioning).toBe(false)
  })

  describe('when View Transition API is available', () => {
    let finishResolve: () => void

    beforeEach(() => {
      const finished = new Promise<void>((r) => { finishResolve = r })

      Object.defineProperty(document, 'startViewTransition', {
        value: vi.fn((cb: () => Promise<void>) => {
          cb()
          return {
            finished,
            ready: Promise.resolve(),
          }
        }),
        configurable: true,
        writable: true,
      })
    })

    afterEach(() => {
      Object.defineProperty(document, 'startViewTransition', {
        value: undefined,
        configurable: true,
        writable: true,
      })
    })

    it('calls document.startViewTransition with callback', async () => {
      const callback = vi.fn()
      const { result } = renderHook(() => useViewTransition())

      let transitionPromise: Promise<void>
      act(() => {
        transitionPromise = result.current.startTransition(callback)
      })

      // Resolve the finished promise
      await act(async () => {
        finishResolve()
        await transitionPromise!
      })

      expect(callback).toHaveBeenCalledOnce()
    })

    it('toggles isTransitioning during transition', async () => {
      const { result } = renderHook(() => useViewTransition())

      let transitionPromise: Promise<void>

      await act(async () => {
        transitionPromise = result.current.startTransition(() => {})
      })

      // While transition is pending, isTransitioning should be true
      // (startViewTransition was called synchronously)
      // After finished resolves, it becomes false
      await act(async () => {
        finishResolve()
        await transitionPromise!
      })

      expect(result.current.isTransitioning).toBe(false)
    })

    it('calls onStart and onFinish callbacks', async () => {
      const onStart = vi.fn()
      const onFinish = vi.fn()
      const { result } = renderHook(() =>
        useViewTransition({ onStart, onFinish }),
      )

      let transitionPromise: Promise<void>
      act(() => {
        transitionPromise = result.current.startTransition(() => {})
      })

      expect(onStart).toHaveBeenCalledOnce()

      await act(async () => {
        finishResolve()
        await transitionPromise!
      })

      expect(onFinish).toHaveBeenCalledOnce()
    })
  })

  describe('when View Transition API is unavailable', () => {
    beforeEach(() => {
      // Ensure startViewTransition is not available
      Object.defineProperty(document, 'startViewTransition', {
        value: undefined,
        configurable: true,
      })
    })

    afterEach(() => {
      // Clean up
      Object.defineProperty(document, 'startViewTransition', {
        value: undefined,
        configurable: true,
      })
    })

    it('falls back to calling callback directly', async () => {
      const callback = vi.fn()
      const { result } = renderHook(() => useViewTransition())

      await act(async () => {
        await result.current.startTransition(callback)
      })

      expect(callback).toHaveBeenCalledOnce()
      expect(result.current.isTransitioning).toBe(false)
    })
  })

  describe('respects prefers-reduced-motion', () => {
    it('skips transition entirely when motion level is 0', async () => {
      vi.stubGlobal(
        'matchMedia',
        vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
      )

      const callback = vi.fn()
      const mockStartVT = vi.fn()
      Object.defineProperty(document, 'startViewTransition', {
        value: mockStartVT,
        configurable: true,
      })

      const { result } = renderHook(() => useViewTransition({ preset: 'crossfade' }))

      await act(async () => {
        await result.current.startTransition(callback)
      })

      expect(callback).toHaveBeenCalledOnce()
      expect(mockStartVT).not.toHaveBeenCalled()
      expect(result.current.isTransitioning).toBe(false)
    })
  })

  describe('assignTransitionName', () => {
    it('sets view-transition-name CSS property on element', () => {
      const { result } = renderHook(() => useViewTransition())
      const el = document.createElement('div')

      act(() => {
        result.current.assignTransitionName(el, 'hero-image')
      })

      expect(el.style.viewTransitionName).toBe('hero-image')
    })

    it('handles null element gracefully', () => {
      const { result } = renderHook(() => useViewTransition())

      expect(() => {
        act(() => {
          result.current.assignTransitionName(null, 'test')
        })
      }).not.toThrow()
    })

    it('cleans up transition names on unmount', () => {
      const { result, unmount } = renderHook(() => useViewTransition())
      const el = document.createElement('div')

      act(() => {
        result.current.assignTransitionName(el, 'hero-image')
      })

      expect(el.style.viewTransitionName).toBe('hero-image')

      unmount()

      expect(el.style.viewTransitionName).toBe('')
    })
  })
})

// ─── getTransitionCSS (presets) ─────────────────────────────────────────────

describe('getTransitionCSS', () => {
  const presets: TransitionPreset[] = [
    'morph',
    'crossfade',
    'slide-left',
    'slide-right',
    'slide-up',
    'zoom',
  ]

  for (const preset of presets) {
    it(`generates valid CSS for "${preset}" preset`, () => {
      const css = getTransitionCSS(preset)

      expect(css).toContain('::view-transition-old(root)')
      expect(css).toContain('::view-transition-new(root)')
      expect(css).toContain('@keyframes')
      expect(css).toContain('300ms')
    })
  }

  it('uses custom duration', () => {
    const css = getTransitionCSS('crossfade', 500)
    expect(css).toContain('500ms')
    expect(css).not.toContain('300ms')
  })

  it('defaults to 300ms duration', () => {
    const css = getTransitionCSS('morph')
    expect(css).toContain('300ms')
  })

  it('morph preset includes scale transforms', () => {
    const css = getTransitionCSS('morph')
    expect(css).toContain('scale')
    expect(css).toContain('opacity')
  })

  it('crossfade preset uses only opacity', () => {
    const css = getTransitionCSS('crossfade')
    expect(css).toContain('opacity')
    expect(css).not.toContain('transform')
  })

  it('slide-left preset uses translateX', () => {
    const css = getTransitionCSS('slide-left')
    expect(css).toContain('translateX(-100%)')
    expect(css).toContain('translateX(100%)')
  })

  it('slide-right preset uses opposite translateX', () => {
    const css = getTransitionCSS('slide-right')
    expect(css).toContain('translateX(100%)')
    expect(css).toContain('translateX(-100%)')
  })

  it('slide-up preset uses translateY', () => {
    const css = getTransitionCSS('slide-up')
    expect(css).toContain('translateY(-100%)')
    expect(css).toContain('translateY(100%)')
  })

  it('zoom preset uses scale transforms', () => {
    const css = getTransitionCSS('zoom')
    expect(css).toContain('scale(1.1)')
    expect(css).toContain('scale(0.95)')
  })
})
