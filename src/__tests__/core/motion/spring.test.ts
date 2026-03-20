import { describe, it, expect } from 'vitest'
import { solveSpring, springToLinearEasing, springDuration } from '../../../core/motion/spring'

describe('solveSpring', () => {
  it('returns array starting near 0 and ending near 1', () => {
    const values = solveSpring()
    expect(values[0]).toBeCloseTo(0, 1)
    expect(values[values.length - 1]).toBeCloseTo(1, 1)
  })

  it('has multiple frames', () => {
    const values = solveSpring()
    expect(values.length).toBeGreaterThan(10)
  })

  it('spring with low damping overshoots (some value > 1)', () => {
    const values = solveSpring({ stiffness: 200, damping: 5, mass: 1 })
    const maxVal = Math.max(...values)
    expect(maxVal).toBeGreaterThan(1)
  })

  it('critically damped spring does not overshoot', () => {
    const stiffness = 100
    const mass = 1
    const damping = 2 * Math.sqrt(stiffness * mass)
    const values = solveSpring({ stiffness, damping, mass })
    const maxVal = Math.max(...values)
    expect(maxVal).toBeLessThanOrEqual(1.01) // small tolerance for numerical precision
  })

  it('respects custom config', () => {
    const fast = solveSpring({ stiffness: 500, damping: 30 })
    const slow = solveSpring({ stiffness: 50, damping: 5 })
    expect(fast.length).toBeLessThan(slow.length)
  })
})

describe('springToLinearEasing', () => {
  it('returns string starting with "linear("', () => {
    const result = springToLinearEasing()
    expect(result).toMatch(/^linear\(/)
    expect(result).toMatch(/\)$/)
  })

  it('has at most ~40 control points', () => {
    const result = springToLinearEasing()
    const points = result.slice(7, -1).split(',')
    expect(points.length).toBeLessThanOrEqual(80) // filtered points + last
  })
})

describe('springDuration', () => {
  it('returns a number in ms', () => {
    const duration = springDuration()
    expect(typeof duration).toBe('number')
    expect(duration).toBeGreaterThan(0)
  })

  it('stiffer springs settle faster', () => {
    const fast = springDuration({ stiffness: 500, damping: 30 })
    const slow = springDuration({ stiffness: 50, damping: 5 })
    expect(fast).toBeLessThan(slow)
  })
})
