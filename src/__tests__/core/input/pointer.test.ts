import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useRef } from 'react'
import { usePointer, type PointerHandlers } from '../../../core/input/pointer'

function createPointerEvent(type: string, opts: Partial<PointerEvent> = {}): PointerEvent {
  return new PointerEvent(type, {
    clientX: 0,
    clientY: 0,
    pointerId: 1,
    pointerType: 'mouse',
    isPrimary: true,
    bubbles: true,
    ...opts,
  })
}

describe('usePointer', () => {
  it('calls onPress on pointerdown', () => {
    const el = document.createElement('div')
    el.getBoundingClientRect = () => ({ left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100, x: 0, y: 0, toJSON: () => {} })
    const onPress = vi.fn()

    renderHook(() => {
      const ref = useRef<Element>(el)
      usePointer(ref, { onPress })
    })

    el.dispatchEvent(createPointerEvent('pointerdown', { clientX: 50, clientY: 50 }))
    expect(onPress).toHaveBeenCalledOnce()
    expect(onPress.mock.calls[0][0]).toMatchObject({ clientX: 50, clientY: 50, x: 50, y: 50 })
  })

  it('calls onRelease on pointerup when not dragging', () => {
    const el = document.createElement('div')
    el.getBoundingClientRect = () => ({ left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100, x: 0, y: 0, toJSON: () => {} })
    const onRelease = vi.fn()

    renderHook(() => {
      const ref = useRef<Element>(el)
      usePointer(ref, { onRelease })
    })

    el.dispatchEvent(createPointerEvent('pointerdown', { clientX: 10, clientY: 10 }))
    el.dispatchEvent(createPointerEvent('pointerup', { clientX: 10, clientY: 10 }))
    expect(onRelease).toHaveBeenCalledOnce()
  })

  it('calls onMove on pointermove', () => {
    const el = document.createElement('div')
    el.getBoundingClientRect = () => ({ left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100, x: 0, y: 0, toJSON: () => {} })
    const onMove = vi.fn()

    renderHook(() => {
      const ref = useRef<Element>(el)
      usePointer(ref, { onMove })
    })

    el.dispatchEvent(createPointerEvent('pointermove', { clientX: 25, clientY: 25 }))
    expect(onMove).toHaveBeenCalledOnce()
  })

  it('calls onHover on pointerenter', () => {
    const el = document.createElement('div')
    el.getBoundingClientRect = () => ({ left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100, x: 0, y: 0, toJSON: () => {} })
    const onHover = vi.fn()

    renderHook(() => {
      const ref = useRef<Element>(el)
      usePointer(ref, { onHover })
    })

    el.dispatchEvent(createPointerEvent('pointerenter', { clientX: 5, clientY: 5 }))
    expect(onHover).toHaveBeenCalledOnce()
  })

  it('calls onDrag and onDragEnd for drag interactions', () => {
    const el = document.createElement('div')
    el.getBoundingClientRect = () => ({ left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100, x: 0, y: 0, toJSON: () => {} })
    // setPointerCapture may not exist in jsdom
    el.setPointerCapture = vi.fn()
    const onDrag = vi.fn()
    const onDragEnd = vi.fn()

    renderHook(() => {
      const ref = useRef<Element>(el)
      usePointer(ref, { onDrag, onDragEnd })
    })

    el.dispatchEvent(createPointerEvent('pointerdown', { clientX: 10, clientY: 10, pointerId: 1 }))
    // Move beyond 3px threshold
    el.dispatchEvent(createPointerEvent('pointermove', { clientX: 20, clientY: 10, pointerId: 1 }))
    expect(onDrag).toHaveBeenCalledOnce()
    expect(onDrag.mock.calls[0][0]).toMatchObject({ deltaX: 10, deltaY: 0, startX: 10, startY: 10 })

    el.dispatchEvent(createPointerEvent('pointerup', { clientX: 30, clientY: 10, pointerId: 1 }))
    expect(onDragEnd).toHaveBeenCalledOnce()
    expect(onDragEnd.mock.calls[0][0]).toMatchObject({ deltaX: 20, deltaY: 0 })
  })

  it('does not call onDrag for small movements below threshold', () => {
    const el = document.createElement('div')
    el.getBoundingClientRect = () => ({ left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100, x: 0, y: 0, toJSON: () => {} })
    el.setPointerCapture = vi.fn()
    const onDrag = vi.fn()
    const onRelease = vi.fn()

    renderHook(() => {
      const ref = useRef<Element>(el)
      usePointer(ref, { onDrag, onRelease })
    })

    el.dispatchEvent(createPointerEvent('pointerdown', { clientX: 10, clientY: 10, pointerId: 1 }))
    el.dispatchEvent(createPointerEvent('pointermove', { clientX: 11, clientY: 11, pointerId: 1 }))
    expect(onDrag).not.toHaveBeenCalled()

    el.dispatchEvent(createPointerEvent('pointerup', { clientX: 11, clientY: 11, pointerId: 1 }))
    expect(onRelease).toHaveBeenCalledOnce()
  })

  it('removes event listeners on cleanup', () => {
    const el = document.createElement('div')
    el.getBoundingClientRect = () => ({ left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100, x: 0, y: 0, toJSON: () => {} })
    const onPress = vi.fn()

    const { unmount } = renderHook(() => {
      const ref = useRef<Element>(el)
      usePointer(ref, { onPress })
    })

    unmount()
    el.dispatchEvent(createPointerEvent('pointerdown', { clientX: 50, clientY: 50 }))
    expect(onPress).not.toHaveBeenCalled()
  })
})
