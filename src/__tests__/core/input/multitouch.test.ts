import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useRef } from 'react'
import { useMultiTouch } from '../../../core/input/multitouch'

describe('useMultiTouch', () => {
  it('calls onTouch for pointerdown events', () => {
    const el = document.createElement('div')
    const onTouch = vi.fn()

    renderHook(() => {
      const ref = useRef<Element>(el)
      useMultiTouch(ref, { onTouch })
    })

    el.dispatchEvent(new PointerEvent('pointerdown', { clientX: 10, clientY: 20, pointerId: 1, bubbles: true }))
    expect(onTouch).toHaveBeenCalledWith(1, 10, 20)
  })

  it('tracks multiple pointers', () => {
    const el = document.createElement('div')
    const onTouch = vi.fn()

    renderHook(() => {
      const ref = useRef<Element>(el)
      useMultiTouch(ref, { onTouch })
    })

    el.dispatchEvent(new PointerEvent('pointerdown', { clientX: 10, clientY: 20, pointerId: 1, bubbles: true }))
    el.dispatchEvent(new PointerEvent('pointerdown', { clientX: 30, clientY: 40, pointerId: 2, bubbles: true }))

    expect(onTouch).toHaveBeenCalledTimes(2)
  })

  it('respects maxPointers limit', () => {
    const el = document.createElement('div')
    const onTouch = vi.fn()

    renderHook(() => {
      const ref = useRef<Element>(el)
      useMultiTouch(ref, { onTouch, maxPointers: 2 })
    })

    el.dispatchEvent(new PointerEvent('pointerdown', { clientX: 10, clientY: 20, pointerId: 1, bubbles: true }))
    el.dispatchEvent(new PointerEvent('pointerdown', { clientX: 30, clientY: 40, pointerId: 2, bubbles: true }))
    el.dispatchEvent(new PointerEvent('pointerdown', { clientX: 50, clientY: 60, pointerId: 3, bubbles: true }))

    expect(onTouch).toHaveBeenCalledTimes(2)
  })

  it('removes pointer on pointerup', () => {
    const el = document.createElement('div')
    const onTouch = vi.fn()

    renderHook(() => {
      const ref = useRef<Element>(el)
      useMultiTouch(ref, { onTouch, maxPointers: 1 })
    })

    el.dispatchEvent(new PointerEvent('pointerdown', { clientX: 10, clientY: 20, pointerId: 1, bubbles: true }))
    el.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, bubbles: true }))
    // After releasing, should be able to add another
    el.dispatchEvent(new PointerEvent('pointerdown', { clientX: 30, clientY: 40, pointerId: 2, bubbles: true }))

    expect(onTouch).toHaveBeenCalledTimes(2)
  })

  it('cleans up listeners on unmount', () => {
    const el = document.createElement('div')
    const onTouch = vi.fn()

    const { unmount } = renderHook(() => {
      const ref = useRef<Element>(el)
      useMultiTouch(ref, { onTouch })
    })

    unmount()
    el.dispatchEvent(new PointerEvent('pointerdown', { clientX: 10, clientY: 20, pointerId: 1, bubbles: true }))
    expect(onTouch).not.toHaveBeenCalled()
  })
})
