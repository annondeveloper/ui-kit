import { animate, type AnimationResult } from './animate'
import { computeStaggerDelays, type StaggerFrom } from './stagger'

export interface ChoreographyStep {
  target: string | Element | Element[]
  animation:
    | 'fadeIn'
    | 'slideUp'
    | 'slideDown'
    | 'slideLeft'
    | 'slideRight'
    | 'scaleIn'
    | 'custom'
  keyframes?: Keyframe[]
  duration?: number
  spring?: { stiffness?: number; damping?: number; mass?: number }
  stagger?: { each?: number; from?: StaggerFrom }
  delay?: number
}

export interface ChoreographyConfig {
  sequence: ChoreographyStep[]
  defaults?: Partial<ChoreographyStep>
  respectMotion?: boolean
}

const PRESETS: Record<string, Keyframe[]> = {
  fadeIn: [{ opacity: 0 }, { opacity: 1 }],
  slideUp: [
    { opacity: 0, transform: 'translateY(20px)' },
    { opacity: 1, transform: 'translateY(0)' },
  ],
  slideDown: [
    { opacity: 0, transform: 'translateY(-20px)' },
    { opacity: 1, transform: 'translateY(0)' },
  ],
  slideLeft: [
    { opacity: 0, transform: 'translateX(20px)' },
    { opacity: 1, transform: 'translateX(0)' },
  ],
  slideRight: [
    { opacity: 0, transform: 'translateX(-20px)' },
    { opacity: 1, transform: 'translateX(0)' },
  ],
  scaleIn: [
    { opacity: 0, transform: 'scale(0.9)' },
    { opacity: 1, transform: 'scale(1)' },
  ],
}

function resolveTargets(target: string | Element | Element[]): Element[] {
  if (typeof target === 'string') {
    return Array.from(document.querySelectorAll(target))
  }
  if (Array.isArray(target)) return target
  return [target]
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  )
}

export class Choreography {
  private config: ChoreographyConfig
  private activeResults: AnimationResult[] = []
  private _progress = 0
  private _paused = false
  private _cancelled = false
  private totalSteps: number
  private completedSteps = 0

  constructor(config: ChoreographyConfig) {
    this.config = config
    this.totalSteps = config.sequence.length
  }

  async play(): Promise<void> {
    const { sequence, defaults = {}, respectMotion = true } = this.config

    if (respectMotion && prefersReducedMotion()) {
      this._progress = 1
      return
    }

    this._cancelled = false
    this._paused = false
    this.completedSteps = 0
    this._progress = 0

    for (let i = 0; i < sequence.length; i++) {
      if (this._cancelled) return

      const step = { ...defaults, ...sequence[i] }
      const elements = resolveTargets(step.target)
      if (elements.length === 0) {
        this.completedSteps++
        this._progress = this.completedSteps / this.totalSteps
        continue
      }

      const keyframes =
        step.animation === 'custom'
          ? step.keyframes ?? []
          : PRESETS[step.animation] ?? PRESETS.fadeIn

      const duration = step.duration ?? 400
      const stepDelay = step.delay ?? 0

      // Compute per-element delays via stagger
      let elementDelays: number[]
      if (step.stagger) {
        elementDelays = computeStaggerDelays(elements.length, {
          each: step.stagger.each ?? 50,
          from: step.stagger.from ?? 'start',
        })
      } else {
        elementDelays = elements.map(() => 0)
      }

      // Wait for step-level delay
      if (stepDelay > 0) {
        await this.wait(stepDelay)
        if (this._cancelled) return
      }

      // Animate all elements in this step concurrently
      const results = elements.map((el, idx) => {
        const result = animate(el, keyframes, {
          duration,
          delay: elementDelays[idx],
          fill: 'forwards',
          easing: 'ease-out',
        })
        this.activeResults.push(result)
        return result
      })

      // Wait for all element animations in this step to finish
      await Promise.all(results.map((r) => r.finished))

      this.completedSteps++
      this._progress = this.completedSteps / this.totalSteps
    }

    this._progress = 1
  }

  pause(): void {
    this._paused = true
    for (const result of this.activeResults) {
      result.animation?.pause()
    }
  }

  resume(): void {
    this._paused = false
    for (const result of this.activeResults) {
      result.animation?.play()
    }
  }

  cancel(): void {
    this._cancelled = true
    for (const result of this.activeResults) {
      result.cancel()
    }
    this.activeResults = []
  }

  get progress(): number {
    return this._progress
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
      const check = () => {
        if (this._cancelled) {
          resolve()
          return
        }
        if (this._paused) {
          setTimeout(check, 16)
          return
        }
        resolve()
      }
      setTimeout(check, ms)
    })
  }
}

export function choreography(config: ChoreographyConfig): Choreography {
  return new Choreography(config)
}
