import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useRef } from 'react'
import { useGesture, type GestureHandlers } from '../../../core/input/gestures'

function createPointerEvent(type: string, opts: Partial<PointerEvent> = {}): PointerEvent {
  return new PointerEvent(type, {
    clientX: 0,
    clientY: 0,
    pointerId: 1,
    pointerType: 'touch',
    bubbles: true,
    ...opts,
  })
}

describe('useGesture', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('detects rightward swipe', () => {
    const el = document.createElement('div')
    const onSwipe = vi.fn()

    renderHook(() => {
      const ref = useRef<Element>(el)
      useGesture(ref, { onSwipe })
    })

    el.dispatchEvent(createPointerEvent('pointerdown', { clientX: 10, clientY: 50 }))
    // Advance time less than 300ms
    vi.advanceTimersByTime(100)
    el.dispatchEvent(createPointerEvent('pointerup', { clientX: 100, clientY: 50 }))

    expect(onSwipe).toHaveBeenCalledWith('right', expect.any(Number))
  })

  it('detects leftward swipe', () => {
    const el = document.createElement('div')
    const onSwipe = vi.fn()

    renderHook(() => {
      const ref = useRef<Element>(el)
      useGesture(ref, { onSwipe })
    })

    el.dispatchEvent(createPointerEvent('pointerdown', { clientX: 100, clientY: 50 }))
    vi.advanceTimersByTime(100)
    el.dispatchEvent(createPointerEvent('pointerup', { clientX: 10, clientY: 50 }))

    expect(onSwipe).toHaveBeenCalledWith('left', expect.any(Number))
  })

  it('detects downward swipe', () => {
    const el = document.createElement('div')
    const onSwipe = vi.fn()

    renderHook(() => {
      const ref = useRef<Element>(el)
      useGesture(ref, { onSwipe })
    })

    el.dispatchEvent(createPointerEvent('pointerdown', { clientX: 50, clientY: 10 }))
    vi.advanceTimersByTime(100)
    el.dispatchEvent(createPointerEvent('pointerup', { clientX: 50, clientY: 100 }))

    expect(onSwipe).toHaveBeenCalledWith('down', expect.any(Number))
  })

  it('detects upward swipe', () => {
    const el = document.createElement('div')
    const onSwipe = vi.fn()

    renderHook(() => {
      const ref = useRef<Element>(el)
      useGesture(ref, { onSwipe })
    })

    el.dispatchEvent(createPointerEvent('pointerdown', { clientX: 50, clientY: 100 }))
    vi.advanceTimersByTime(100)
    el.dispatchEvent(createPointerEvent('pointerup', { clientX: 50, clientY: 10 }))

    expect(onSwipe).toHaveBeenCalledWith('up', expect.any(Number))
  })

  it('does not detect swipe if too slow', () => {
    const el = document.createElement('div')
    const onSwipe = vi.fn()

    renderHook(() => {
      const ref = useRef<Element>(el)
      useGesture(ref, { onSwipe })
    })

    el.dispatchEvent(createPointerEvent('pointerdown', { clientX: 10, clientY: 50 }))
    vi.advanceTimersByTime(500)
    el.dispatchEvent(createPointerEvent('pointerup', { clientX: 100, clientY: 50 }))

    expect(onSwipe).not.toHaveBeenCalled()
  })

  it('detects long press after 500ms', () => {
    const el = document.createElement('div')
    const onLongPress = vi.fn()

    renderHook(() => {
      const ref = useRef<Element>(el)
      useGesture(ref, { onLongPress })
    })

    el.dispatchEvent(createPointerEvent('pointerdown', { clientX: 50, clientY: 60 }))
    expect(onLongPress).not.toHaveBeenCalled()

    vi.advanceTimersByTime(500)
    expect(onLongPress).toHaveBeenCalledWith(50, 60)
  })

  it('cancels long press on move', () => {
    const el = document.createElement('div')
    const onLongPress = vi.fn()

    renderHook(() => {
      const ref = useRef<Element>(el)
      useGesture(ref, { onLongPress })
    })

    el.dispatchEvent(createPointerEvent('pointerdown', { clientX: 50, clientY: 60 }))
    el.dispatchEvent(createPointerEvent('pointermove', { clientX: 80, clientY: 60 }))

    vi.advanceTimersByTime(500)
    expect(onLongPress).not.toHaveBeenCalled()
  })

  it('detects double tap', () => {
    const el = document.createElement('div')
    const onDoubleTap = vi.fn()

    renderHook(() => {
      const ref = useRef<Element>(el)
      useGesture(ref, { onDoubleTap })
    })

    // First tap
    el.dispatchEvent(createPointerEvent('pointerdown', { clientX: 50, clientY: 50 }))
    vi.advanceTimersByTime(50)
    el.dispatchEvent(createPointerEvent('pointerup', { clientX: 50, clientY: 50 }))

    // Second tap within 300ms
    vi.advanceTimersByTime(100)
    el.dispatchEvent(createPointerEvent('pointerdown', { clientX: 52, clientY: 52 }))
    vi.advanceTimersByTime(50)
    el.dispatchEvent(createPointerEvent('pointerup', { clientX: 52, clientY: 52 }))

    expect(onDoubleTap).toHaveBeenCalledWith(52, 52)
  })

  it('does not detect double tap if taps are too far apart in time', () => {
    const el = document.createElement('div')
    const onDoubleTap = vi.fn()

    renderHook(() => {
      const ref = useRef<Element>(el)
      useGesture(ref, { onDoubleTap })
    })

    // First tap
    el.dispatchEvent(createPointerEvent('pointerdown', { clientX: 50, clientY: 50 }))
    vi.advanceTimersByTime(50)
    el.dispatchEvent(createPointerEvent('pointerup', { clientX: 50, clientY: 50 }))

    // Second tap after 400ms
    vi.advanceTimersByTime(400)
    el.dispatchEvent(createPointerEvent('pointerdown', { clientX: 52, clientY: 52 }))
    vi.advanceTimersByTime(50)
    el.dispatchEvent(createPointerEvent('pointerup', { clientX: 52, clientY: 52 }))

    expect(onDoubleTap).not.toHaveBeenCalled()
  })
})
