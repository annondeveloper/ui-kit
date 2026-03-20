import { describe, it, expect, vi } from 'vitest'
import { flip } from '../../../core/motion/flip'

describe('flip', () => {
  it('capture stores rects for elements', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    const state = flip.capture([el])
    expect(state.rects.size).toBe(1)
    expect(state.rects.get(el)).toBeDefined()

    document.body.removeChild(el)
  })

  it('play creates animations for moved elements', async () => {
    const mockAnim = {
      onfinish: null as (() => void) | null,
      oncancel: null as (() => void) | null,
    }

    const el = {
      getBoundingClientRect: vi.fn(),
      animate: vi.fn().mockReturnValue(mockAnim),
    } as unknown as Element

    // First call (capture) returns old rect
    ;(el.getBoundingClientRect as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
    })

    const state = flip.capture([el])

    // Second call (play) returns new rect
    ;(el.getBoundingClientRect as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      left: 50,
      top: 50,
      width: 100,
      height: 100,
    })

    const playPromise = flip.play(state)

    // Trigger finish
    mockAnim.onfinish?.()
    await playPromise

    expect(el.animate).toHaveBeenCalled()
  })

  it('play skips elements that did not move', async () => {
    const rect = { left: 10, top: 10, width: 100, height: 100 }
    const el = {
      getBoundingClientRect: vi.fn().mockReturnValue(rect),
      animate: vi.fn(),
    } as unknown as Element

    const state = flip.capture([el])
    await flip.play(state)

    expect(el.animate).not.toHaveBeenCalled()
  })
})
