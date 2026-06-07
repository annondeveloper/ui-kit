import { describe, it, expect } from 'vitest'
import { generateTheme, themeToCSS, themeToInlineStyle, validateContrast } from '../../../core/tokens/generator'
import { TOKEN_KEYS, TOKEN_TO_CSS } from '../../../core/tokens/tokens'

describe('generateTheme', () => {
  it('returns all TOKEN_KEYS for dark mode (default)', () => {
    const theme = generateTheme('#6366f1')
    for (const key of TOKEN_KEYS) {
      expect(theme[key]).toBeDefined()
      expect(typeof theme[key]).toBe('string')
    }
  })

  it('returns all TOKEN_KEYS for light mode', () => {
    const theme = generateTheme('#6366f1', 'light')
    for (const key of TOKEN_KEYS) {
      expect(theme[key]).toBeDefined()
      expect(typeof theme[key]).toBe('string')
    }
  })

  it('light mode bgBase has higher lightness than dark mode', () => {
    const dark = generateTheme('#6366f1', 'dark')
    const light = generateTheme('#6366f1', 'light')
    // Dark bgBase starts with oklch(8%...), light with oklch(98%...)
    const darkL = parseFloat(dark.bgBase.match(/oklch\((\d+(?:\.\d+)?)%/)![1])
    const lightL = parseFloat(light.bgBase.match(/oklch\((\d+(?:\.\d+)?)%/)![1])
    expect(lightL).toBeGreaterThan(darkL)
  })

  it('all token values are valid OKLCH strings', () => {
    const theme = generateTheme('#6366f1')
    const oklchPattern = /^oklch\(/
    for (const key of TOKEN_KEYS) {
      expect(theme[key]).toMatch(oklchPattern)
    }
  })

  it('generates different brand tokens for different hex inputs', () => {
    const theme1 = generateTheme('#6366f1')
    const theme2 = generateTheme('#ff0000')
    expect(theme1.brand).not.toBe(theme2.brand)
  })
})

describe('themeToCSS', () => {
  it('returns CSS string with :root selector by default', () => {
    const theme = generateTheme('#6366f1')
    const css = themeToCSS(theme)
    expect(css).toMatch(/^:root \{/)
    expect(css).toMatch(/\}$/)
  })

  it('includes all custom properties', () => {
    const theme = generateTheme('#6366f1')
    const css = themeToCSS(theme)
    expect(css).toContain('--brand:')
    expect(css).toContain('--bg-base:')
    expect(css).toContain('--text-primary:')
    expect(css).toContain('--status-ok:')
    expect(css).toContain('--aurora-1:')
  })

  it('uses custom selector when provided', () => {
    const theme = generateTheme('#6366f1')
    const css = themeToCSS(theme, '.custom')
    expect(css).toMatch(/^\.custom \{/)
  })
})

describe('validateContrast', () => {
  it('returns a contrast result with ratio/aa/aaa/pairs', () => {
    const theme = generateTheme('#6366f1')
    const result = validateContrast(theme)
    expect(typeof result.ratio).toBe('number')
    expect(typeof result.aa).toBe('boolean')
    expect(typeof result.aaa).toBe('boolean')
    expect(Array.isArray(result.pairs)).toBe(true)
    expect(result.pairs.length).toBeGreaterThan(0)
  })

  it('default dark theme has readable primary text (passes AA)', () => {
    const theme = generateTheme('#6366f1', 'dark')
    const result = validateContrast(theme)
    // textPrimary oklch(97%) on bgBase oklch(8%) is very high contrast
    expect(result.ratio).toBeGreaterThan(4.5)
    expect(result.aa).toBe(true)
  })

  it('pairs are sorted worst-contrast-first', () => {
    const result = validateContrast(generateTheme('#6366f1'))
    for (let i = 1; i < result.pairs.length; i++) {
      expect(result.pairs[i].ratio).toBeGreaterThanOrEqual(result.pairs[i - 1].ratio)
    }
  })
})

describe('themeToInlineStyle', () => {
  it('maps every token to its CSS custom property', () => {
    const theme = generateTheme('#6366f1')
    const style = themeToInlineStyle(theme)
    for (const key of TOKEN_KEYS) {
      const cssVar = TOKEN_TO_CSS[key]
      expect(style[cssVar]).toBe(theme[key])
    }
  })
})
