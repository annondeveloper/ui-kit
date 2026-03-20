import { solveSpring, springDuration, type SpringConfig } from './spring'

export interface AnimateOptions {
  duration?: number
  easing?: string
  delay?: number
  fill?: FillMode
  iterations?: number
  direction?: PlaybackDirection
}

export interface AnimationResult {
  animation: Animation | null
  finished: Promise<void>
  cancel: () => void
}

export function animate(
  element: Element | null,
  keyframes: Keyframe[] | PropertyIndexedKeyframes,
  options: AnimateOptions = {},
): AnimationResult {
  if (!element || typeof element.animate !== 'function') {
    return { animation: null, finished: Promise.resolve(), cancel: () => {} }
  }

  const {
    duration = 300,
    easing = 'ease-out',
    delay = 0,
    fill = 'forwards',
    iterations = 1,
    direction = 'normal',
  } = options

  const animation = element.animate(keyframes, {
    duration,
    easing,
    delay,
    fill,
    iterations,
    direction,
  })

  const finished = new Promise<void>((resolve) => {
    animation.onfinish = () => resolve()
    animation.oncancel = () => resolve()
  })

  return {
    animation,
    finished,
    cancel: () => animation.cancel(),
  }
}

/** Animate with spring physics. */
export function spring(
  element: Element | null,
  to: Record<string, string | number>,
  config?: SpringConfig,
): AnimationResult {
  if (!element) {
    return { animation: null, finished: Promise.resolve(), cancel: () => {} }
  }

  const values = solveSpring(config)
  const duration = springDuration(config)

  const keyframes: Keyframe[] = values.map((progress) => {
    const frame: Keyframe = {}
    for (const [prop, target] of Object.entries(to)) {
      if (typeof target === 'number') {
        frame[prop] = progress * target
      } else {
        frame[prop] = target
      }
    }
    return frame
  })

  return animate(element, keyframes, { duration, easing: 'linear', fill: 'forwards' })
}
