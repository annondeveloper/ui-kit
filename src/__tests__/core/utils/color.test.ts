import { describe, it, expect } from 'vitest'
import { hexToOklch, oklchToHex, getContrastRatio, adjustLightness } from '../../../core/utils/color'

describe('hexToOklch', () => {
  it('converts black to approximately l=0, c=0', () => {
    const result = hexToOklch('#000000')
    expect(result.l).toBeCloseTo(0, 2)
    expect(result.c).toBeCloseTo(0, 2)
  })

  it('converts white to approximately l=1, c=0', () => {
    const result = hexToOklch('#ffffff')
    expect(result.l).toBeCloseTo(1, 2)
    expect(result.c).toBeCloseTo(0, 2)
  })

  it('converts a color with nonzero chroma and hue', () => {
    const result = hexToOklch('#6366f1')
    expect(result.l).toBeGreaterThan(0.3)
    expect(result.l).toBeLessThan(0.7)
    expect(result.c).toBeGreaterThan(0.1)
    expect(result.h).toBeGreaterThan(0)
    expect(result.h).toBeLessThan(360)
  })
})

describe('oklchToHex', () => {
  it('converts black OKLCH back to hex', () => {
    expect(oklchToHex({ l: 0, c: 0, h: 0 })).toBe('#000000')
  })

  it('converts white OKLCH back to hex', () => {
    expect(oklchToHex({ l: 1, c: 0, h: 0 })).toBe('#ffffff')
  })
})

describe('round-trip conversion', () => {
  it('round-trips #6366f1 within ±2 per channel', () => {
    const original = '#6366f1'
    const oklch = hexToOklch(original)
    const result = oklchToHex(oklch)

    const parseHex = (h: string) => [
      parseInt(h.slice(1, 3), 16),
      parseInt(h.slice(3, 5), 16),
      parseInt(h.slice(5, 7), 16),
    ]

    const [r1, g1, b1] = parseHex(original)
    const [r2, g2, b2] = parseHex(result)

    expect(Math.abs(r1 - r2)).toBeLessThanOrEqual(2)
    expect(Math.abs(g1 - g2)).toBeLessThanOrEqual(2)
    expect(Math.abs(b1 - b2)).toBeLessThanOrEqual(2)
  })

  it('round-trips pure red', () => {
    const original = '#ff0000'
    const oklch = hexToOklch(original)
    const result = oklchToHex(oklch)

    const parseHex = (h: string) => [
      parseInt(h.slice(1, 3), 16),
      parseInt(h.slice(3, 5), 16),
      parseInt(h.slice(5, 7), 16),
    ]

    const [r1, g1, b1] = parseHex(original)
    const [r2, g2, b2] = parseHex(result)

    expect(Math.abs(r1 - r2)).toBeLessThanOrEqual(2)
    expect(Math.abs(g1 - g2)).toBeLessThanOrEqual(2)
    expect(Math.abs(b1 - b2)).toBeLessThanOrEqual(2)
  })
})

describe('getContrastRatio', () => {
  it('returns ~21 for black vs white', () => {
    const black = hexToOklch('#000000')
    const white = hexToOklch('#ffffff')
    const ratio = getContrastRatio(black, white)
    expect(ratio).toBeCloseTo(21, 0)
  })

  it('returns 1 for same color', () => {
    const color = hexToOklch('#6366f1')
    const ratio = getContrastRatio(color, color)
    expect(ratio).toBeCloseTo(1, 1)
  })
})

describe('adjustLightness', () => {
  it('increases lightness by delta', () => {
    const result = adjustLightness({ l: 0.5, c: 0.2, h: 270 }, 0.1)
    expect(result.l).toBeCloseTo(0.6)
    expect(result.c).toBe(0.2)
    expect(result.h).toBe(270)
  })

  it('clamps lightness to 0', () => {
    const result = adjustLightness({ l: 0.1, c: 0.2, h: 270 }, -0.5)
    expect(result.l).toBe(0)
  })

  it('clamps lightness to 1', () => {
    const result = adjustLightness({ l: 0.9, c: 0.2, h: 270 }, 0.5)
    expect(result.l).toBe(1)
  })
})
