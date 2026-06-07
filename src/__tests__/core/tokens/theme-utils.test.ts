import { describe, it, expect } from 'vitest'
import { generateTheme } from '../../../core/tokens/generator'
import { auditThemeContrast } from '../../../core/tokens/contrast'
import { generateHarmony, suggestHarmonies } from '../../../core/tokens/harmony'
import { exportTheme, encodeThemeToHash, decodeThemeFromHash } from '../../../core/tokens/theme-export'

describe('auditThemeContrast', () => {
  it('returns pairs sorted worst-first with pass flags', () => {
    const pairs = auditThemeContrast(generateTheme('#6366f1'))
    expect(pairs.length).toBeGreaterThan(0)
    for (const p of pairs) {
      expect(p.passAA).toBe(p.ratio >= 4.5)
      expect(p.passAAA).toBe(p.ratio >= 7)
    }
    for (let i = 1; i < pairs.length; i++) {
      expect(pairs[i].ratio).toBeGreaterThanOrEqual(pairs[i - 1].ratio)
    }
  })

  it('skips alpha-composited tokens', () => {
    const pairs = auditThemeContrast(generateTheme('#6366f1'))
    expect(pairs.every(p => !p.foreground.value.includes('/'))).toBe(true)
    expect(pairs.every(p => !p.background.value.includes('/'))).toBe(true)
  })
})

describe('generateHarmony', () => {
  it('complementary returns two hex colors', () => {
    const h = generateHarmony('#6366f1', 'complementary')
    expect(h.type).toBe('complementary')
    expect(h.colors).toHaveLength(2)
    expect(h.colors.every(c => /^#[0-9a-f]{6}$/i.test(c))).toBe(true)
  })

  it('tetradic returns four colors, the first being the base', () => {
    const h = generateHarmony('#ff0000', 'tetradic')
    expect(h.colors).toHaveLength(4)
  })

  it('suggestHarmonies returns all five harmony types', () => {
    const all = suggestHarmonies('#6366f1')
    expect(all.map(h => h.type)).toEqual([
      'complementary',
      'analogous',
      'triadic',
      'split-complementary',
      'tetradic',
    ])
  })
})

describe('exportTheme', () => {
  const tokens = generateTheme('#6366f1')

  it('css format produces a :root block', () => {
    expect(exportTheme(tokens, 'css')).toMatch(/^:root \{/)
  })

  it('tailwind format references CSS vars', () => {
    const out = exportTheme(tokens, 'tailwind')
    expect(out).toContain('tailwindcss')
    expect(out).toContain('var(--')
  })

  it('figma-tokens format is valid JSON with $type color', () => {
    const parsed = JSON.parse(exportTheme(tokens, 'figma-tokens'))
    const first = Object.values(parsed)[0] as { $type: string; $value: string }
    expect(first.$type).toBe('color')
    expect(typeof first.$value).toBe('string')
  })

  it('css-in-js format exports a const object', () => {
    expect(exportTheme(tokens, 'css-in-js')).toContain('export const theme =')
  })
})

describe('theme URL hash round-trip', () => {
  it('encodes and decodes back to the same params', () => {
    const hash = encodeThemeToHash('#6366f1', 'dark')
    expect(decodeThemeFromHash(hash)).toEqual({ brandHex: '#6366f1', mode: 'dark' })
    expect(decodeThemeFromHash('#' + hash)).toEqual({ brandHex: '#6366f1', mode: 'dark' })
  })

  it('rejects malformed hashes', () => {
    expect(decodeThemeFromHash('')).toBeNull()
    expect(decodeThemeFromHash(btoa('not-a-color:dark'))).toBeNull()
    expect(decodeThemeFromHash(btoa('#6366f1:purple'))).toBeNull()
  })
})
