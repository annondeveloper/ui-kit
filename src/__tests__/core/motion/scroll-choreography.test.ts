import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useScrollChoreography } from '../../../core/motion/scroll-choreography'
import { createRef } from 'react'

// Mock motion level
vi.mock('../../../core/motion/use-motion-level', () => ({
  useMotionLevel: vi.fn(() => 3),
}))

// Mock Choreography class as a proper constructor
const mockPlay = vi.fn(() => Promise.resolve())
const mockCancel = vi.fn()

vi.mock('../../../core/motion/choreography', () => {
  const MockChoreography = vi.fn(function (this: any) {
    this.play = mockPlay
    this.cancel = mockCancel
    this.progress = 0
  })
  return { Choreography: MockChoreography }
})

vi.mock('../../../core/motion/choreography-presets', () => ({
  getChoreographyPreset: vi.fn(() => ({
    sequence: [{ target: '.items', animation: 'fadeIn', duration: 400 }],
  })),
}))

describe('useScrollChoreography', () => {
  let mockObserverInstances: any[] = []
  let MockIntersectionObserver: any

  beforeEach(() => {
    mockObserverInstances = []
    mockPlay.mockClear()
    mockCancel.mockClear()

    MockIntersectionObserver = vi.fn(function (this: any, callback: any, options: any) {
      this.observe = vi.fn()
      this.disconnect = vi.fn()
      this.unobserve = vi.fn()
      this.callback = callback
      this.options = options
      mockObserverInstances.push(this)
    })

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)

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
      useScrollChoreography({
        trigger: ref,
        sequence: [{ target: '.items', animation: 'fadeIn' }],
      }),
    )

    expect(MockIntersectionObserver).toHaveBeenCalledTimes(1)
    expect(mockObserverInstances[0].observe).toHaveBeenCalledWith(ref.current)
  })

  it('plays choreography when trigger enters viewport', () => {
    const { ref } = createMockRef()

    renderHook(() =>
      useScrollChoreography({
        trigger: ref,
        sequence: [{ target: '.items', animation: 'fadeIn' }],
      }),
    )

    const observer = mockObserverInstances[0]
    observer.callback([{ isIntersecting: true }])

    expect(mockPlay).toHaveBeenCalledTimes(1)
  })

  it('does not play when trigger does not intersect', () => {
    const { ref } = createMockRef()

    renderHook(() =>
      useScrollChoreography({
        trigger: ref,
        sequence: [{ target: '.items', animation: 'fadeIn' }],
      }),
    )

    const observer = mockObserverInstances[0]
    observer.callback([{ isIntersecting: false }])

    expect(mockPlay).not.toHaveBeenCalled()
  })

  it('respects once=true (default) and only triggers once', () => {
    const { ref } = createMockRef()

    renderHook(() =>
      useScrollChoreography({
        trigger: ref,
        sequence: [{ target: '.items', animation: 'fadeIn' }],
      }),
    )

    const observer = mockObserverInstances[0]
    observer.callback([{ isIntersecting: true }])
    observer.callback([{ isIntersecting: false }])
    observer.callback([{ isIntersecting: true }])

    expect(mockPlay).toHaveBeenCalledTimes(1)
  })

  it('replays when once=false', () => {
    const { ref } = createMockRef()

    renderHook(() =>
      useScrollChoreography({
        trigger: ref,
        sequence: [{ target: '.items', animation: 'fadeIn' }],
        once: false,
      }),
    )

    const observer = mockObserverInstances[0]
    observer.callback([{ isIntersecting: true }])
    observer.callback([{ isIntersecting: true }])

    expect(mockPlay).toHaveBeenCalledTimes(2)
  })

  it('disconnects observer on unmount', () => {
    const { ref } = createMockRef()

    const { unmount } = renderHook(() =>
      useScrollChoreography({
        trigger: ref,
        sequence: [{ target: '.items', animation: 'fadeIn' }],
      }),
    )

    unmount()

    expect(mockObserverInstances[0].disconnect).toHaveBeenCalled()
  })

  it('cancels active choreography on unmount', () => {
    const { ref } = createMockRef()

    const { unmount } = renderHook(() =>
      useScrollChoreography({
        trigger: ref,
        sequence: [{ target: '.items', animation: 'fadeIn' }],
      }),
    )

    const observer = mockObserverInstances[0]
    observer.callback([{ isIntersecting: true }])

    unmount()

    expect(mockCancel).toHaveBeenCalled()
  })

  it('does nothing when trigger ref is null', () => {
    const ref = createRef<HTMLElement>()

    renderHook(() =>
      useScrollChoreography({
        trigger: ref,
        sequence: [{ target: '.items', animation: 'fadeIn' }],
      }),
    )

    expect(MockIntersectionObserver).not.toHaveBeenCalled()
  })

  it('skips animation when motion level is 0', async () => {
    const { useMotionLevel } = await import('../../../core/motion/use-motion-level')
    ;(useMotionLevel as ReturnType<typeof vi.fn>).mockReturnValue(0)

    const { ref } = createMockRef()

    renderHook(() =>
      useScrollChoreography({
        trigger: ref,
        sequence: [{ target: '.items', animation: 'fadeIn' }],
      }),
    )

    expect(MockIntersectionObserver).not.toHaveBeenCalled()
    expect(mockPlay).not.toHaveBeenCalled()

    ;(useMotionLevel as ReturnType<typeof vi.fn>).mockReturnValue(3)
  })

  it('uses rootMargin based on start position', () => {
    const { ref } = createMockRef()

    renderHook(() =>
      useScrollChoreography({
        trigger: ref,
        sequence: [{ target: '.items', animation: 'fadeIn' }],
        start: 'top center',
      }),
    )

    const options = MockIntersectionObserver.mock.calls[0][1]
    expect(options.rootMargin).toBe('0px 0px -50% 0px')
  })

  it('uses default rootMargin for top bottom', () => {
    const { ref } = createMockRef()

    renderHook(() =>
      useScrollChoreography({
        trigger: ref,
        sequence: [{ target: '.items', animation: 'fadeIn' }],
        start: 'top bottom',
      }),
    )

    const options = MockIntersectionObserver.mock.calls[0][1]
    expect(options.rootMargin).toBe('0px 0px 0px 0px')
  })

  it('uses top top rootMargin for full-scroll trigger', () => {
    const { ref } = createMockRef()

    renderHook(() =>
      useScrollChoreography({
        trigger: ref,
        sequence: [{ target: '.items', animation: 'fadeIn' }],
        start: 'top top',
      }),
    )

    const options = MockIntersectionObserver.mock.calls[0][1]
    expect(options.rootMargin).toBe('0px 0px -100% 0px')
  })

  it('adds scroll listener when scrub=true', () => {
    const { ref } = createMockRef()
    const addSpy = vi.spyOn(window, 'addEventListener')

    renderHook(() =>
      useScrollChoreography({
        trigger: ref,
        sequence: [{ target: '.items', animation: 'fadeIn' }],
        scrub: true,
      }),
    )

    expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true })
  })

  it('removes scroll listener on unmount when scrub=true', () => {
    const { ref } = createMockRef()
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() =>
      useScrollChoreography({
        trigger: ref,
        sequence: [{ target: '.items', animation: 'fadeIn' }],
        scrub: true,
      }),
    )

    unmount()

    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
  })

  it('cancels previous choreography before replaying with once=false', () => {
    const { ref } = createMockRef()

    renderHook(() =>
      useScrollChoreography({
        trigger: ref,
        sequence: [{ target: '.items', animation: 'fadeIn' }],
        once: false,
      }),
    )

    const observer = mockObserverInstances[0]
    observer.callback([{ isIntersecting: true }])
    observer.callback([{ isIntersecting: true }])

    expect(mockCancel).toHaveBeenCalled()
  })
})
