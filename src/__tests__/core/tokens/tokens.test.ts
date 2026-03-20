import { describe, it, expect } from 'vitest'
import { TOKEN_KEYS, TOKEN_TO_CSS, type ThemeTokens } from '../../../core/tokens/tokens'

describe('TOKEN_KEYS', () => {
  const requiredKeys: (keyof ThemeTokens)[] = [
    'brand', 'brandLight', 'brandDark', 'brandSubtle', 'brandGlow',
    'bgBase', 'bgSurface', 'bgElevated', 'bgOverlay',
    'borderSubtle', 'borderDefault', 'borderStrong', 'borderGlow',
    'textPrimary', 'textSecondary', 'textTertiary', 'textDisabled',
    'statusOk', 'statusWarning', 'statusCritical', 'statusInfo',
    'aurora1', 'aurora2',
  ]

  it('has all required keys', () => {
    for (const key of requiredKeys) {
      expect(TOKEN_KEYS).toContain(key)
    }
  })

  it('has no extra keys beyond required', () => {
    expect(TOKEN_KEYS).toHaveLength(requiredKeys.length)
  })
})

describe('TOKEN_TO_CSS', () => {
  it('maps every TOKEN_KEY to a CSS custom property starting with --', () => {
    for (const key of TOKEN_KEYS) {
      const cssVar = TOKEN_TO_CSS[key]
      expect(cssVar).toBeDefined()
      expect(cssVar.startsWith('--')).toBe(true)
    }
  })

  it('has an entry for every key in ThemeTokens', () => {
    const cssKeys = Object.keys(TOKEN_TO_CSS)
    expect(cssKeys).toHaveLength(TOKEN_KEYS.length)
    for (const key of TOKEN_KEYS) {
      expect(cssKeys).toContain(key)
    }
  })
})
