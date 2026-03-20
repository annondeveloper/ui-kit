import { describe, it, expect } from 'vitest'
import { computeStaggerDelays } from '../../../core/motion/stagger'

describe('computeStaggerDelays', () => {
  it('from start: delays increase linearly', () => {
    const delays = computeStaggerDelays(5, { each: 50, from: 'start' })
    expect(delays).toEqual([0, 50, 100, 150, 200])
  })

  it('from end: delays decrease linearly', () => {
    const delays = computeStaggerDelays(5, { each: 50, from: 'end' })
    expect(delays).toEqual([200, 150, 100, 50, 0])
  })

  it('from center: center item has delay 0', () => {
    const delays = computeStaggerDelays(5, { each: 50, from: 'center' })
    expect(delays[2]).toBe(0) // center index
    expect(delays[0]).toBe(delays[4]) // symmetric
  })

  it('from edges: edge items have delay 0', () => {
    const delays = computeStaggerDelays(5, { each: 50, from: 'edges' })
    expect(delays[0]).toBe(0)
    expect(delays[4]).toBe(0)
    expect(delays[2]).toBeGreaterThan(0) // center gets max delay
  })

  it('from numeric index', () => {
    const delays = computeStaggerDelays(5, { each: 50, from: 2 })
    expect(delays[2]).toBe(0)
    expect(delays[0]).toBe(100)
  })

  it('grid: 2x2 corner items get correct 2D distances', () => {
    const delays = computeStaggerDelays(4, { each: 50, grid: [2, 2] })
    expect(delays).toHaveLength(4)
    // All corners equidistant from center in a 2x2 grid
    expect(delays[0]).toBe(delays[1])
    expect(delays[0]).toBe(delays[2])
    expect(delays[0]).toBe(delays[3])
  })

  it('random: returns array of correct length', () => {
    const delays = computeStaggerDelays(5, { each: 50, from: 'random' })
    expect(delays).toHaveLength(5)
    delays.forEach((d) => {
      expect(d).toBeGreaterThanOrEqual(0)
    })
  })
})
