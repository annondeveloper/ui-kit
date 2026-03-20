export interface DecayConfig {
  velocity: number
  deceleration?: number
  precision?: number
}

/** Simulates momentum/friction deceleration (like flick-to-scroll). */
export function solveDecay(config: DecayConfig): { values: number[]; distance: number } {
  const { velocity, deceleration = 0.998, precision = 0.5 } = config
  const values: number[] = [0]
  let v = velocity
  let position = 0
  const maxFrames = 600

  for (let i = 0; i < maxFrames; i++) {
    v *= deceleration
    position += v / 60
    values.push(position)
    if (Math.abs(v) < precision) break
  }

  return { values, distance: position }
}

/** Simulates gravity (parabolic arc). */
export function solveGravity(config: { velocity: number; gravity?: number }): number[] {
  const { velocity, gravity = 980 } = config
  const values: number[] = [0]
  let v = velocity
  let position = 0
  const maxFrames = 300

  for (let i = 0; i < maxFrames; i++) {
    v += gravity / 60
    position += v / 60
    values.push(position)
    if (position > 2000) break // off screen
  }

  return values
}
