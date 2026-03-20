import { useEffect, type RefObject } from 'react'

export interface TouchZone {
  id: string
  rect: { x: number; y: number; width: number; height: number }
}

export function useMultiTouch(ref: RefObject<Element | null>, config: {
  maxPointers?: number
  onTouch?: (pointerId: number, x: number, y: number) => void
} = {}): void {
  const { maxPointers = 10, onTouch } = config

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const pointers = new Map<number, { x: number; y: number }>()

    const onDown = (e: Event) => {
      const pe = e as PointerEvent
      if (pointers.size >= maxPointers) return
      pointers.set(pe.pointerId, { x: pe.clientX, y: pe.clientY })
      onTouch?.(pe.pointerId, pe.clientX, pe.clientY)
    }

    const onUp = (e: Event) => {
      const pe = e as PointerEvent
      pointers.delete(pe.pointerId)
    }

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)

    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
    }
  }, [ref, maxPointers, onTouch])
}
