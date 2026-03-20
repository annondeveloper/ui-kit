import { describe, it, expect } from 'vitest'
import { solveDecay, solveGravity } from '../../../core/motion/physics'

describe('solveDecay', () => {
  it('returns values that increase then plateau for positive velocity', () => {
    const { values } = solveDecay({ velocity: 800 })
    expect(values[0]).toBe(0)
    expect(values.length).toBeGreaterThan(10)

    // Values should be increasing (positive velocity)
    for (let i = 1; i < Math.min(10, values.length); i++) {
      expect(values[i]).toBeGreaterThan(values[i - 1])
    }

    // Should plateau: last few values close together
    const last = values[values.length - 1]
    const nearLast = values[values.length - 3]
    expect(Math.abs(last - nearLast)).toBeLessThan(50)
  })

  it('final distance is positive for positive velocity', () => {
    const { distance } = solveDecay({ velocity: 800 })
    expect(distance).toBeGreaterThan(0)
  })

  it('final distance is negative for negative velocity', () => {
    const { distance } = solveDecay({ velocity: -800 })
    expect(distance).toBeLessThan(0)
  })
})

describe('solveGravity', () => {
  it('returns values that go up then come back down for negative velocity', () => {
    const values = solveGravity({ velocity: -500 })
    expect(values[0]).toBe(0)

    // Should go negative (up) first
    const minVal = Math.min(...values)
    expect(minVal).toBeLessThan(0)

    // Then come back and go positive (down past origin)
    const maxVal = Math.max(...values)
    expect(maxVal).toBeGreaterThan(0)
  })

  it('returns only increasing values for positive velocity (falling)', () => {
    const values = solveGravity({ velocity: 100 })
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThanOrEqual(values[i - 1])
    }
  })
})
