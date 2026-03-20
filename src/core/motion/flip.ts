interface FlipState {
  rects: Map<Element, DOMRect>
}

export const flip = {
  capture(selector: string | Element[]): FlipState {
    const elements =
      typeof selector === 'string' ? Array.from(document.querySelectorAll(selector)) : selector
    const rects = new Map<Element, DOMRect>()
    for (const el of elements) {
      rects.set(el, el.getBoundingClientRect())
    }
    return { rects }
  },

  play(state: FlipState, options: { duration?: number; easing?: string } = {}): Promise<void> {
    const { duration = 300, easing = 'ease-out' } = options
    const promises: Promise<void>[] = []

    for (const [el, oldRect] of state.rects) {
      const newRect = el.getBoundingClientRect()
      const dx = oldRect.left - newRect.left
      const dy = oldRect.top - newRect.top
      const sw = oldRect.width / newRect.width
      const sh = oldRect.height / newRect.height

      if (
        Math.abs(dx) < 0.5 &&
        Math.abs(dy) < 0.5 &&
        Math.abs(sw - 1) < 0.01 &&
        Math.abs(sh - 1) < 0.01
      )
        continue

      const anim = el.animate(
        [
          { transform: `translate(${dx}px, ${dy}px) scale(${sw}, ${sh})` },
          { transform: 'none' },
        ],
        { duration, easing, fill: 'none' as FillMode },
      )

      promises.push(
        new Promise((r) => {
          anim.onfinish = () => r(undefined)
        }),
      )
    }

    return Promise.all(promises).then(() => {})
  },
}
