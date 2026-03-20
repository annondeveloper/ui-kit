import { describe, it, expect, vi } from 'vitest'
import { animate, spring } from '../../../core/motion/animate'

function createMockElement() {
  const mockAnimation = {
    onfinish: null as ((ev: AnimationPlaybackEvent) => void) | null,
    oncancel: null as ((ev: AnimationPlaybackEvent) => void) | null,
    cancel: vi.fn(),
    pause: vi.fn(),
    play: vi.fn(),
    playbackRate: 1,
  }

  const el = {
    animate: vi.fn().mockReturnValue(mockAnimation),
  } as unknown as Element

  return { el, mockAnimation }
}

describe('animate', () => {
  it('calls element.animate with correct args', () => {
    const { el } = createMockElement()
    const keyframes = [{ opacity: 0 }, { opacity: 1 }]
    animate(el, keyframes, { duration: 500, easing: 'ease-in' })

    expect(el.animate).toHaveBeenCalledWith(keyframes, {
      duration: 500,
      easing: 'ease-in',
      delay: 0,
      fill: 'forwards',
      iterations: 1,
      direction: 'normal',
    })
  })

  it('returns object with animation, finished promise, cancel function', () => {
    const { el } = createMockElement()
    const result = animate(el, [{ opacity: 0 }, { opacity: 1 }])

    expect(result.animation).toBeTruthy()
    expect(result.finished).toBeInstanceOf(Promise)
    expect(typeof result.cancel).toBe('function')
  })

  it('handles null element gracefully', () => {
    const result = animate(null, [{ opacity: 0 }])
    expect(result.animation).toBeNull()
    expect(result.cancel).not.toThrow()
  })

  it('finished promise resolves on animation finish', async () => {
    const { el, mockAnimation } = createMockElement()
    const result = animate(el, [{ opacity: 0 }, { opacity: 1 }])

    // Trigger onfinish
    mockAnimation.onfinish?.(null as unknown as AnimationPlaybackEvent)
    await expect(result.finished).resolves.toBeUndefined()
  })

  it('cancel calls animation.cancel', () => {
    const { el, mockAnimation } = createMockElement()
    const result = animate(el, [{ opacity: 0 }, { opacity: 1 }])
    result.cancel()
    expect(mockAnimation.cancel).toHaveBeenCalled()
  })
})

describe('spring', () => {
  it('calls animate with spring keyframes', () => {
    const { el } = createMockElement()
    const result = spring(el, { opacity: 1 })

    expect(el.animate).toHaveBeenCalled()
    expect(result.animation).toBeTruthy()

    const call = (el.animate as ReturnType<typeof vi.fn>).mock.calls[0]
    const keyframes = call[0] as Keyframe[]
    expect(keyframes.length).toBeGreaterThan(10)
    expect(keyframes[keyframes.length - 1].opacity).toBeCloseTo(1, 1)
  })

  it('handles null element gracefully', () => {
    const result = spring(null, { opacity: 1 })
    expect(result.animation).toBeNull()
  })
})
