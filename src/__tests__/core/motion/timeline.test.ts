import { describe, it, expect, vi } from 'vitest'
import { timeline } from '../../../core/motion/timeline'
import type { AnimationResult } from '../../../core/motion/animate'

function mockFactory(): AnimationResult {
  return {
    animation: null,
    finished: Promise.resolve(),
    cancel: vi.fn(),
  }
}

describe('Timeline', () => {
  it('add() creates entries', () => {
    const tl = timeline()
    tl.add(mockFactory).add(mockFactory)
    expect(tl.size).toBe(2)
  })

  it('add with negative offset overlaps', () => {
    const tl = timeline()
    tl.add(mockFactory).add(mockFactory, '-100ms')
    expect(tl.size).toBe(2)
  })

  it('label and offset from label', () => {
    const tl = timeline()
    tl.label('x').add(mockFactory, 'x+=50ms')
    expect(tl.size).toBe(1)
  })

  it('play() returns a promise', async () => {
    vi.useFakeTimers()
    const tl = timeline()
    tl.add(mockFactory)
    const promise = tl.play()
    expect(promise).toBeInstanceOf(Promise)
    vi.runAllTimers()
    await promise
    vi.useRealTimers()
  })

  it('cancel() calls cancel on results', async () => {
    vi.useFakeTimers()
    const cancelFn = vi.fn()
    const factory = (): AnimationResult => ({
      animation: null,
      finished: Promise.resolve(),
      cancel: cancelFn,
    })
    const tl = timeline()
    tl.add(factory)
    const p = tl.play()
    vi.runAllTimers()
    await p
    tl.cancel()
    expect(cancelFn).toHaveBeenCalled()
    vi.useRealTimers()
  })
})
