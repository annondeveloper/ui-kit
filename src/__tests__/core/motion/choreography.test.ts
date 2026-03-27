import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Choreography, choreography } from '../../../core/motion/choreography'
import { getChoreographyPreset } from '../../../core/motion/choreography-presets'
import type { ChoreographyConfig } from '../../../core/motion/choreography'

// Mock animate to track calls and resolve with controllable timing
vi.mock('../../../core/motion/animate', () => ({
  animate: vi.fn((_el: Element, _kf: Keyframe[], opts?: { delay?: number }) => {
    const delay = opts?.delay ?? 0
    const animation = {
      pause: vi.fn(),
      play: vi.fn(),
      cancel: vi.fn(),
      playbackRate: 1,
    }
    return {
      animation,
      // Resolve after delay so stagger timing is testable
      finished: delay > 0
        ? new Promise<void>((resolve) => setTimeout(resolve, delay))
        : Promise.resolve(),
      cancel: vi.fn(() => animation.cancel()),
    }
  }),
}))

function makeElement(tag = 'div'): Element {
  const el = document.createElement(tag)
  ;(el as unknown as Record<string, unknown>).animate = vi.fn(() => ({
    onfinish: null,
    oncancel: null,
    cancel: vi.fn(),
    pause: vi.fn(),
    play: vi.fn(),
    playbackRate: 1,
    finished: Promise.resolve(),
  }))
  document.body.appendChild(el)
  return el
}

async function flushPromisesAndTimers(rounds = 10): Promise<void> {
  for (let i = 0; i < rounds; i++) {
    await vi.advanceTimersByTimeAsync(100)
  }
}

describe('Choreography', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({ matches: false }),
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    document.body.textContent = ''
  })

  it('plays all steps in sequence', async () => {
    const el1 = makeElement()
    const el2 = makeElement()

    const config: ChoreographyConfig = {
      sequence: [
        { target: [el1], animation: 'fadeIn', duration: 100 },
        { target: [el2], animation: 'slideUp', duration: 100 },
      ],
    }

    const ch = choreography(config)
    const playPromise = ch.play()
    await flushPromisesAndTimers()
    await playPromise

    expect(ch.progress).toBe(1)
  })

  it('applies stagger delays to elements', async () => {
    const { animate: mockAnimate } = await import('../../../core/motion/animate')
    ;(mockAnimate as ReturnType<typeof vi.fn>).mockClear()

    const elements = [makeElement(), makeElement(), makeElement()]

    const config: ChoreographyConfig = {
      sequence: [
        {
          target: elements,
          animation: 'fadeIn',
          duration: 200,
          stagger: { each: 50, from: 'start' },
        },
      ],
    }

    const ch = choreography(config)
    const p = ch.play()
    await flushPromisesAndTimers()
    await p

    // animate should have been called once per element
    expect(mockAnimate).toHaveBeenCalledTimes(3)

    // Check that stagger delays were applied (0, 50, 100)
    const calls = (mockAnimate as ReturnType<typeof vi.fn>).mock.calls
    expect(calls[0][2].delay).toBe(0)
    expect(calls[1][2].delay).toBe(50)
    expect(calls[2][2].delay).toBe(100)
  })

  it('cancel() stops animations', async () => {
    const el = makeElement()

    const config: ChoreographyConfig = {
      sequence: [
        { target: [el], animation: 'fadeIn', duration: 1000 },
      ],
    }

    const ch = choreography(config)
    const p = ch.play()

    ch.cancel()
    await flushPromisesAndTimers()
    await p

    expect(ch.progress).toBeLessThanOrEqual(1)
  })

  it('respectMotion=true with reduced motion skips animations', async () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({ matches: true }),
    })

    const el = makeElement()
    const config: ChoreographyConfig = {
      sequence: [{ target: [el], animation: 'fadeIn', duration: 200 }],
      respectMotion: true,
    }

    const ch = choreography(config)
    await ch.play()

    expect(ch.progress).toBe(1)
  })

  it('respectMotion=false ignores reduced motion preference', async () => {
    const { animate: mockAnimate } = await import('../../../core/motion/animate')
    ;(mockAnimate as ReturnType<typeof vi.fn>).mockClear()

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({ matches: true }),
    })

    const el = makeElement()
    const config: ChoreographyConfig = {
      sequence: [{ target: [el], animation: 'fadeIn', duration: 200 }],
      respectMotion: false,
    }

    const ch = choreography(config)
    const p = ch.play()
    await flushPromisesAndTimers()
    await p

    expect(mockAnimate).toHaveBeenCalled()
    expect(ch.progress).toBe(1)
  })

  it('progress getter returns values between 0 and 1', async () => {
    const el = makeElement()

    const config: ChoreographyConfig = {
      sequence: [
        { target: [el], animation: 'fadeIn', duration: 100 },
        { target: [el], animation: 'slideUp', duration: 100 },
      ],
    }

    const ch = new Choreography(config)
    expect(ch.progress).toBe(0)

    const p = ch.play()
    await flushPromisesAndTimers()
    await p

    expect(ch.progress).toBe(1)
  })

  it('applies defaults to all steps', async () => {
    const { animate: mockAnimate } = await import('../../../core/motion/animate')
    ;(mockAnimate as ReturnType<typeof vi.fn>).mockClear()

    const el = makeElement()

    const config: ChoreographyConfig = {
      sequence: [
        { target: [el], animation: 'fadeIn' },
      ],
      defaults: { duration: 800 },
    }

    const ch = choreography(config)
    const p = ch.play()
    await flushPromisesAndTimers()
    await p

    const calls = (mockAnimate as ReturnType<typeof vi.fn>).mock.calls
    expect(calls[0][2].duration).toBe(800)
  })

  it('handles custom animation with keyframes', async () => {
    const { animate: mockAnimate } = await import('../../../core/motion/animate')
    ;(mockAnimate as ReturnType<typeof vi.fn>).mockClear()

    const el = makeElement()
    const customKeyframes = [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(360deg)' },
    ]

    const config: ChoreographyConfig = {
      sequence: [
        {
          target: [el],
          animation: 'custom',
          keyframes: customKeyframes,
          duration: 300,
        },
      ],
    }

    const ch = choreography(config)
    const p = ch.play()
    await flushPromisesAndTimers()
    await p

    const calls = (mockAnimate as ReturnType<typeof vi.fn>).mock.calls
    expect(calls[0][1]).toEqual(customKeyframes)
  })

  it('choreography() factory returns Choreography instance', () => {
    const ch = choreography({ sequence: [] })
    expect(ch).toBeInstanceOf(Choreography)
  })
})

describe('ChoreographyPresets', () => {
  it('cascade returns valid config with slideUp', () => {
    const config = getChoreographyPreset('cascade', '.items')
    expect(config.sequence).toHaveLength(1)
    expect(config.sequence[0].animation).toBe('slideUp')
    expect(config.sequence[0].stagger).toBeDefined()
    expect(config.sequence[0].stagger?.from).toBe('start')
  })

  it('stagger-grid returns scaleIn with center stagger', () => {
    const config = getChoreographyPreset('stagger-grid', '.grid-items')
    expect(config.sequence).toHaveLength(1)
    expect(config.sequence[0].animation).toBe('scaleIn')
    expect(config.sequence[0].stagger?.from).toBe('center')
  })

  it('wave returns slideUp with center stagger', () => {
    const config = getChoreographyPreset('wave', '.items')
    expect(config.sequence).toHaveLength(1)
    expect(config.sequence[0].animation).toBe('slideUp')
    expect(config.sequence[0].stagger?.from).toBe('center')
  })

  it('spiral returns scaleIn with center stagger', () => {
    const config = getChoreographyPreset('spiral', '.items')
    expect(config.sequence).toHaveLength(1)
    expect(config.sequence[0].animation).toBe('scaleIn')
  })

  it('focus-in returns two-step sequence', () => {
    const config = getChoreographyPreset('focus-in', '.items')
    expect(config.sequence).toHaveLength(2)
    expect(config.sequence[0].animation).toBe('scaleIn')
    expect(config.sequence[1].animation).toBe('fadeIn')
  })

  it('accepts custom duration and staggerEach options', () => {
    const config = getChoreographyPreset('cascade', '.items', {
      duration: 600,
      staggerEach: 100,
    })
    expect(config.sequence[0].duration).toBe(600)
    expect(config.sequence[0].stagger?.each).toBe(100)
  })

  it('all presets return valid ChoreographyConfig', () => {
    const presets = ['cascade', 'stagger-grid', 'wave', 'spiral', 'focus-in'] as const
    for (const preset of presets) {
      const config = getChoreographyPreset(preset, '.test')
      expect(config).toHaveProperty('sequence')
      expect(Array.isArray(config.sequence)).toBe(true)
      for (const step of config.sequence) {
        expect(step).toHaveProperty('target')
        expect(step).toHaveProperty('animation')
      }
    }
  })
})
