import { describe, it, expect } from 'vitest'
import { interpolatePath } from '../../../core/motion/morph'

describe('interpolatePath', () => {
  const from = '0 0 100 0 100 100 0 100'
  const to = '50 50 150 50 150 150 50 150'

  it('at progress 0 returns from path values', () => {
    const result = interpolatePath(from, to, 0)
    // Should be "0 0 100 0 100 100 0 100"
    const nums = result.match(/-?\d+\.?\d*/g)!.map(Number)
    expect(nums).toEqual([0, 0, 100, 0, 100, 100, 0, 100])
  })

  it('at progress 1 returns to path values', () => {
    const result = interpolatePath(from, to, 1)
    const nums = result.match(/-?\d+\.?\d*/g)!.map(Number)
    expect(nums).toEqual([50, 50, 150, 50, 150, 150, 50, 150])
  })

  it('at progress 0.5 returns midpoint', () => {
    const result = interpolatePath(from, to, 0.5)
    const nums = result.match(/-?\d+\.?\d*/g)!.map(Number)
    expect(nums[0]).toBe(25) // midpoint of 0 and 50
    expect(nums[1]).toBe(25)
  })

  it('handles paths with different point counts', () => {
    const short = '0 0 100 100'
    const long = '0 0 50 50 100 100'
    const result = interpolatePath(short, long, 0.5)
    expect(result).toBeTruthy()
  })
})
