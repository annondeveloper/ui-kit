import { describe, it, expect } from 'vitest'
import { clamp, stripCidr } from '../../../core/utils/clamp'

describe('clamp', () => {
  it('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
  })

  it('clamps to min when value is below', () => {
    expect(clamp(-1, 0, 10)).toBe(0)
  })

  it('clamps to max when value is above', () => {
    expect(clamp(15, 0, 10)).toBe(10)
  })

  it('returns min when value equals min', () => {
    expect(clamp(0, 0, 10)).toBe(0)
  })

  it('returns max when value equals max', () => {
    expect(clamp(10, 0, 10)).toBe(10)
  })
})

describe('stripCidr', () => {
  it('strips CIDR notation from IP', () => {
    expect(stripCidr('10.0.0.1/24')).toBe('10.0.0.1')
  })

  it('returns IP as-is when no CIDR', () => {
    expect(stripCidr('10.0.0.1')).toBe('10.0.0.1')
  })

  it('handles IPv6 with CIDR', () => {
    expect(stripCidr('::1/128')).toBe('::1')
  })
})
