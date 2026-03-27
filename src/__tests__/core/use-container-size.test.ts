import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useContainerSize } from '../../core/utils/use-container-size'
import { type RefObject } from 'react'

// ─── ResizeObserver mock ────────────────────────────────────────────────────

type ROCallback = (entries: ResizeObserverEntry[]) => void
let roCallback: ROCallback | null = null
let roDisconnected = false

class MockResizeObserver {
  constructor(cb: ROCallback) {
    roCallback = cb
    roDisconnected = false
  }
  observe() {}
  unobserve() {}
  disconnect() {
    roDisconnected = true
  }
}

beforeEach(() => {
  roCallback = null
  roDisconnected = false
  vi.stubGlobal('ResizeObserver', MockResizeObserver)
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    cb(0)
    return 1
  })
  vi.stubGlobal('cancelAnimationFrame', vi.fn())
})

afterEach(() => {
  vi.restoreAllMocks()
})

function makeRef(el: HTMLElement | null): RefObject<HTMLElement | null> {
  return { current: el }
}

function fireResize(width: number, height: number) {
  if (!roCallback) throw new Error('ResizeObserver not initialized')
  roCallback([
    {
      borderBoxSize: [{ inlineSize: width, blockSize: height }],
      contentBoxSize: [{ inlineSize: width, blockSize: height }],
      contentRect: { width, height, x: 0, y: 0, top: 0, left: 0, bottom: height, right: width, toJSON: () => {} },
      target: document.createElement('div'),
      devicePixelContentBoxSize: [],
    } as unknown as ResizeObserverEntry,
  ])
}

describe('useContainerSize', () => {
  it('returns default SSR-safe values when ref is null', () => {
    const ref = makeRef(null)
    const { result } = renderHook(() => useContainerSize(ref))
    expect(result.current).toEqual({ width: 0, height: 0, breakpoint: 'xs' })
  })

  it('returns default values when ResizeObserver is unavailable', () => {
    vi.stubGlobal('ResizeObserver', undefined)
    const ref = makeRef(document.createElement('div'))
    const { result } = renderHook(() => useContainerSize(ref))
    expect(result.current).toEqual({ width: 0, height: 0, breakpoint: 'xs' })
  })

  it('updates size on ResizeObserver callback', () => {
    const ref = makeRef(document.createElement('div'))
    const { result } = renderHook(() => useContainerSize(ref))

    act(() => fireResize(500, 300))
    expect(result.current).toEqual({ width: 500, height: 300, breakpoint: 'md' })
  })

  it('computes correct breakpoints', () => {
    const ref = makeRef(document.createElement('div'))
    const { result } = renderHook(() => useContainerSize(ref))

    act(() => fireResize(100, 50))
    expect(result.current.breakpoint).toBe('xs')

    act(() => fireResize(320, 200))
    expect(result.current.breakpoint).toBe('sm')

    act(() => fireResize(480, 300))
    expect(result.current.breakpoint).toBe('md')

    act(() => fireResize(640, 400))
    expect(result.current.breakpoint).toBe('lg')

    act(() => fireResize(960, 600))
    expect(result.current.breakpoint).toBe('xl')
  })

  it('does not update state when dimensions are unchanged', () => {
    const ref = makeRef(document.createElement('div'))
    const { result } = renderHook(() => useContainerSize(ref))

    act(() => fireResize(500, 300))
    const first = result.current

    act(() => fireResize(500, 300))
    // Same reference means no re-render
    expect(result.current).toBe(first)
  })

  it('disconnects observer on unmount', () => {
    const ref = makeRef(document.createElement('div'))
    const { unmount } = renderHook(() => useContainerSize(ref))
    expect(roDisconnected).toBe(false)
    unmount()
    expect(roDisconnected).toBe(true)
  })

  it('falls back to contentRect when borderBoxSize is absent', () => {
    const ref = makeRef(document.createElement('div'))
    const { result } = renderHook(() => useContainerSize(ref))

    act(() => {
      if (!roCallback) throw new Error('ResizeObserver not initialized')
      roCallback([
        {
          borderBoxSize: [],
          contentBoxSize: [],
          contentRect: { width: 400, height: 250, x: 0, y: 0, top: 0, left: 0, bottom: 250, right: 400, toJSON: () => {} },
          target: document.createElement('div'),
          devicePixelContentBoxSize: [],
        } as unknown as ResizeObserverEntry,
      ])
    })

    expect(result.current).toEqual({ width: 400, height: 250, breakpoint: 'sm' })
  })
})
