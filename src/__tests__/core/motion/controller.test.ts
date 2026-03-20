import { describe, it, expect, vi, beforeEach } from 'vitest'
import { motion } from '../../../core/motion/controller'

function createMockAnimation(): Animation {
  return {
    onfinish: null,
    oncancel: null,
    pause: vi.fn(),
    play: vi.fn(),
    cancel: vi.fn(),
    playbackRate: 1,
  } as unknown as Animation
}

describe('MotionController', () => {
  beforeEach(() => {
    motion.clear()
  })

  it('register adds animation', () => {
    const anim = createMockAnimation()
    motion.register(anim)
    expect(motion.count).toBe(1)
  })

  it('pause pauses all animations', () => {
    const anim = createMockAnimation()
    motion.register(anim)
    motion.pause()
    expect(anim.pause).toHaveBeenCalled()
  })

  it('resume plays all animations', () => {
    const anim = createMockAnimation()
    motion.register(anim)
    motion.pause()
    motion.resume()
    expect(anim.play).toHaveBeenCalled()
  })

  it('clear cancels and removes all', () => {
    const anim = createMockAnimation()
    motion.register(anim)
    motion.clear()
    expect(anim.cancel).toHaveBeenCalled()
    expect(motion.count).toBe(0)
  })

  it('playbackRate setter updates all animations', () => {
    const anim = createMockAnimation()
    motion.register(anim)
    motion.playbackRate = 2
    expect(anim.playbackRate).toBe(2)
    // Reset
    motion.playbackRate = 1
  })

  it('removes animation on finish', () => {
    const anim = createMockAnimation()
    motion.register(anim)
    expect(motion.count).toBe(1)

    // Simulate finish
    ;(anim.onfinish as Function)()
    expect(motion.count).toBe(0)
  })
})
