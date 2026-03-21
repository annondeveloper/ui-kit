import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useScrollScene, type ScrollSceneConfig } from '../../../core/motion/scroll-scene'
import { createRef } from 'react'

describe('useScrollScene', () => {
  let mockObserverInstances: any[] = []
  let MockIntersectionObserver: any

  beforeEach(() => {
    mockObserverInstances = []

    MockIntersectionObserver = vi.fn(function (this: any, callback: any, options: any) {
      this.observe = vi.fn()
      this.disconnect = vi.fn()
      this.unobserve = vi.fn()
      this.callback = callback
      this.options = options
      mockObserverInstances.push(this)
    })

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)

    // Mock scrollY
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true, configurable: true })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  function createMockRef() {
    const el = document.createElement('div')
    const ref = createRef<HTMLElement>() as { current: HTMLElement | null }
    ref.current = el
    // Mock getBoundingClientRect
    el.getBoundingClientRect = vi.fn(() => ({
      top: 200,
      bottom: 400,
      left: 0,
      right: 100,
      width: 100,
      height: 200,
      x: 0,
      y: 200,
      toJSON: () => {},
    }))
    return { ref, el }
  }

  it('creates an IntersectionObserver for the trigger element', () => {
    const { ref } = createMockRef()

    renderHook(() =>
      useScrollScene({
        trigger: ref,
        onEnter: vi.fn(),
      })
    )

    expect(MockIntersectionObserver).toHaveBeenCalledTimes(1)
    expect(mockObserverInstances[0].observe).toHaveBeenCalledWith(ref.current)
  })

  it('calls onEnter when element enters viewport', () => {
    const { ref } = createMockRef()
    const onEnter = vi.fn()

    renderHook(() =>
      useScrollScene({
        trigger: ref,
        onEnter,
      })
    )

    // Simulate intersection
    const observer = mockObserverInstances[0]
    observer.callback([{ isIntersecting: true }])

    expect(onEnter).toHaveBeenCalledTimes(1)
  })

  it('calls onLeave when element leaves viewport', () => {
    const { ref } = createMockRef()
    const onLeave = vi.fn()

    renderHook(() =>
      useScrollScene({
        trigger: ref,
        onLeave,
      })
    )

    // Enter first
    const observer = mockObserverInstances[0]
    observer.callback([{ isIntersecting: true }])
    // Then leave
    observer.callback([{ isIntersecting: false }])

    expect(onLeave).toHaveBeenCalledTimes(1)
  })

  it('does not call onLeave if never entered', () => {
    const { ref } = createMockRef()
    const onLeave = vi.fn()

    renderHook(() =>
      useScrollScene({
        trigger: ref,
        onLeave,
      })
    )

    // Leave without entering
    const observer = mockObserverInstances[0]
    observer.callback([{ isIntersecting: false }])

    expect(onLeave).not.toHaveBeenCalled()
  })

  it('adds scroll listener when scrub is enabled', () => {
    const { ref } = createMockRef()
    const addSpy = vi.spyOn(window, 'addEventListener')

    renderHook(() =>
      useScrollScene({
        trigger: ref,
        scrub: true,
        onProgress: vi.fn(),
      })
    )

    expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true })
  })

  it('disconnects observer on unmount', () => {
    const { ref } = createMockRef()

    const { unmount } = renderHook(() =>
      useScrollScene({
        trigger: ref,
        onEnter: vi.fn(),
      })
    )

    unmount()

    expect(mockObserverInstances[0].disconnect).toHaveBeenCalled()
  })

  it('removes scroll listener on unmount when scrub is enabled', () => {
    const { ref } = createMockRef()
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() =>
      useScrollScene({
        trigger: ref,
        scrub: true,
        onProgress: vi.fn(),
      })
    )

    unmount()

    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
  })

  it('does nothing when trigger ref is null', () => {
    const ref = createRef<HTMLElement>()

    renderHook(() =>
      useScrollScene({
        trigger: ref,
        onEnter: vi.fn(),
      })
    )

    expect(MockIntersectionObserver).not.toHaveBeenCalled()
  })

  it('uses default start and end values', () => {
    const { ref } = createMockRef()

    // Should not throw
    renderHook(() =>
      useScrollScene({
        trigger: ref,
      })
    )

    expect(MockIntersectionObserver).toHaveBeenCalledTimes(1)
  })

  it('adds scroll listener when pin is provided', () => {
    const { ref: trigger } = createMockRef()
    const { ref: pin } = createMockRef()
    const addSpy = vi.spyOn(window, 'addEventListener')

    renderHook(() =>
      useScrollScene({
        trigger,
        pin,
        onProgress: vi.fn(),
      })
    )

    expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true })
  })

  it('uses threshold array for intersection observer', () => {
    const { ref } = createMockRef()

    renderHook(() =>
      useScrollScene({
        trigger: ref,
        onEnter: vi.fn(),
      })
    )

    const options = MockIntersectionObserver.mock.calls[0][1]
    expect(options.threshold).toEqual([0, 0.01, 0.99, 1])
  })
})
