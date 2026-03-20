import { useRef, useEffect, type RefObject } from 'react'

export interface PointerContext {
  x: number
  y: number
  clientX: number
  clientY: number
  pressure: number
  pointerType: string
  isPrimary: boolean
  pointerId: number
}

export interface DragContext extends PointerContext {
  deltaX: number
  deltaY: number
  startX: number
  startY: number
}

export interface PointerHandlers {
  onPress?: (ctx: PointerContext) => void
  onMove?: (ctx: PointerContext) => void
  onRelease?: (ctx: PointerContext) => void
  onDrag?: (ctx: DragContext) => void
  onDragEnd?: (ctx: DragContext) => void
  onHover?: (ctx: PointerContext) => void
}

export function usePointer(ref: RefObject<Element | null>, handlers: PointerHandlers): void {
  const state = useRef({ dragging: false, startX: 0, startY: 0, pointerId: -1 })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const toCtx = (e: PointerEvent): PointerContext => {
      const rect = el.getBoundingClientRect()
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        clientX: e.clientX,
        clientY: e.clientY,
        pressure: e.pressure,
        pointerType: e.pointerType,
        isPrimary: e.isPrimary,
        pointerId: e.pointerId,
      }
    }

    const onDown = (e: Event) => {
      const pe = e as PointerEvent
      const ctx = toCtx(pe)
      state.current = { dragging: false, startX: ctx.clientX, startY: ctx.clientY, pointerId: pe.pointerId }
      handlers.onPress?.(ctx)
      ;(el as HTMLElement).setPointerCapture?.(pe.pointerId)
    }

    const onMove = (e: Event) => {
      const pe = e as PointerEvent
      const ctx = toCtx(pe)

      if (state.current.pointerId === pe.pointerId && (handlers.onDrag || handlers.onDragEnd)) {
        const dx = ctx.clientX - state.current.startX
        const dy = ctx.clientY - state.current.startY
        if (!state.current.dragging && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
          state.current.dragging = true
        }
        if (state.current.dragging) {
          handlers.onDrag?.({ ...ctx, deltaX: dx, deltaY: dy, startX: state.current.startX, startY: state.current.startY })
        }
      }
      handlers.onMove?.(ctx)
    }

    const onUp = (e: Event) => {
      const pe = e as PointerEvent
      const ctx = toCtx(pe)

      if (state.current.dragging) {
        handlers.onDragEnd?.({
          ...ctx,
          deltaX: ctx.clientX - state.current.startX,
          deltaY: ctx.clientY - state.current.startY,
          startX: state.current.startX,
          startY: state.current.startY,
        })
      } else {
        handlers.onRelease?.(ctx)
      }
      state.current = { dragging: false, startX: 0, startY: 0, pointerId: -1 }
    }

    const onEnter = (e: Event) => {
      handlers.onHover?.(toCtx(e as PointerEvent))
    }

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointerenter', onEnter)

    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointerenter', onEnter)
    }
  }, [ref, handlers])
}
