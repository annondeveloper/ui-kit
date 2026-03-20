export interface SpringConfig {
  stiffness?: number
  damping?: number
  mass?: number
  velocity?: number
  precision?: number
}

function acceleration(x: number, v: number, k: number, c: number, m: number): number {
  return (-k * x - c * v) / m
}

/**
 * Solves mx'' + cx' + kx = 0 using RK4 integration at 60fps.
 * Returns array of values [0...~1] representing position over time.
 */
export function solveSpring(config: SpringConfig = {}): number[] {
  const {
    stiffness = 100,
    damping = 10,
    mass = 1,
    velocity = 0,
    precision = 0.01,
  } = config
  const dt = 1 / 60

  let x = -1 // start displaced by -1 (will animate from 0 to 1)
  let v = velocity
  const values: number[] = []
  const maxFrames = 600 // 10 seconds max

  for (let i = 0; i < maxFrames; i++) {
    values.push(1 + x) // normalize: 0 at start, ~1 at rest

    // RK4 integration
    const k1v = acceleration(x, v, stiffness, damping, mass)
    const k1x = v

    const k2v = acceleration(x + k1x * dt / 2, v + k1v * dt / 2, stiffness, damping, mass)
    const k2x = v + k1v * dt / 2

    const k3v = acceleration(x + k2x * dt / 2, v + k2v * dt / 2, stiffness, damping, mass)
    const k3x = v + k2v * dt / 2

    const k4v = acceleration(x + k3x * dt, v + k3v * dt, stiffness, damping, mass)
    const k4x = v + k3v * dt

    v += ((k1v + 2 * k2v + 2 * k3v + k4v) / 6) * dt
    x += ((k1x + 2 * k2x + 2 * k3x + k4x) / 6) * dt

    // Check if settled
    if (Math.abs(x) < precision && Math.abs(v) < precision) {
      values.push(1) // final resting position
      break
    }
  }

  return values
}

/**
 * Pre-compute spring curve to CSS linear() easing function.
 * Max 40 control points for reasonable CSS size.
 */
export function springToLinearEasing(config?: SpringConfig): string {
  const values = solveSpring(config)
  const step = Math.max(1, Math.floor(values.length / 40))
  const points = values.filter((_, i) => i % step === 0 || i === values.length - 1)
  return `linear(${points.map((v) => v.toFixed(3)).join(', ')})`
}

/** Get the duration (in ms) that the spring takes to settle. */
export function springDuration(config?: SpringConfig): number {
  const values = solveSpring(config)
  return Math.round(values.length * (1000 / 60))
}
