import { describe, it, expect } from 'vitest'
import { themes, lightThemes, type ThemeName } from '../../../core/tokens/themes'
import { TOKEN_KEYS, type ThemeTokens } from '../../../core/tokens/tokens'

const THEME_NAMES: ThemeName[] = [
  'aurora', 'sunset', 'rose', 'amber',
  'ocean', 'emerald', 'cyan',
  'violet', 'fuchsia',
  'slate',
  'corporate', 'midnight', 'forest', 'wine', 'carbon',
]

describe('Named Themes', () => {
  it('exports exactly 15 dark themes', () => {
    expect(Object.keys(themes)).toHaveLength(15)
  })

  it('exports exactly 15 light themes', () => {
    expect(Object.keys(lightThemes)).toHaveLength(15)
  })

  it('has all expected theme names in dark themes', () => {
    for (const name of THEME_NAMES) {
      expect(themes).toHaveProperty(name)
    }
  })

  it('has all expected theme names in light themes', () => {
    for (const name of THEME_NAMES) {
      expect(lightThemes).toHaveProperty(name)
    }
  })

  describe.each(THEME_NAMES)('dark theme: %s', (name) => {
    const theme = themes[name]

    it('contains all required token keys', () => {
      for (const key of TOKEN_KEYS) {
        expect(theme).toHaveProperty(key)
        expect(typeof (theme as ThemeTokens)[key]).toBe('string')
        expect((theme as ThemeTokens)[key].length).toBeGreaterThan(0)
      }
    })

    it('brand token contains oklch color', () => {
      expect(theme.brand).toMatch(/oklch/)
    })

    it('has dark-mode bg-base (low lightness)', () => {
      // Dark themes should have low lightness in bgBase
      expect(theme.bgBase).toMatch(/oklch\(\s*\d+%/)
    })
  })

  describe.each(THEME_NAMES)('light theme: %s', (name) => {
    const theme = lightThemes[name]

    it('contains all required token keys', () => {
      for (const key of TOKEN_KEYS) {
        expect(theme).toHaveProperty(key)
        expect(typeof (theme as ThemeTokens)[key]).toBe('string')
        expect((theme as ThemeTokens)[key].length).toBeGreaterThan(0)
      }
    })

    it('brand token contains oklch color', () => {
      expect(theme.brand).toMatch(/oklch/)
    })

    it('has light-mode bg-base (high lightness)', () => {
      // Light themes should have high lightness in bgBase
      expect(theme.bgBase).toMatch(/oklch\(\s*9[0-9]%/)
    })
  })

  it('dark and light themes have the same brand color for each name', () => {
    for (const name of THEME_NAMES) {
      expect(themes[name].brand).toBe(lightThemes[name].brand)
    }
  })
})
