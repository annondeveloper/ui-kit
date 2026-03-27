import { describe, it, expect } from 'vitest'
import { themeToFigmaVariables } from '../../cli/utils/figma-tokens'
import { themeToStyleDictionary } from '../../cli/utils/style-dictionary'
import { generateTheme } from '../../core/tokens/generator'
import { TOKEN_KEYS } from '../../core/tokens/tokens'

describe('themeToFigmaVariables', () => {
  const tokens = generateTheme('#6366f1')

  it('returns correct top-level structure', () => {
    const result = themeToFigmaVariables(tokens, 'aurora') as any
    expect(result.version).toBe('1.0')
    expect(result.collections).toBeInstanceOf(Array)
    expect(result.collections).toHaveLength(1)
  })

  it('collection has name and mode', () => {
    const result = themeToFigmaVariables(tokens, 'aurora', 'dark') as any
    const collection = result.collections[0]
    expect(collection.name).toBe('aurora Theme')
    expect(collection.modes).toEqual([{ name: 'dark' }])
  })

  it('creates a variable for each token', () => {
    const result = themeToFigmaVariables(tokens, 'test') as any
    const variables = result.collections[0].variables
    expect(variables).toHaveLength(TOKEN_KEYS.length)
  })

  it('each variable has name, type COLOR, and hex value', () => {
    const result = themeToFigmaVariables(tokens, 'test') as any
    const variables = result.collections[0].variables
    for (const v of variables) {
      expect(v.name).toBeDefined()
      expect(v.type).toBe('COLOR')
      expect(typeof v.value).toBe('string')
    }
  })

  it('converts OKLCH brand to a hex string', () => {
    const result = themeToFigmaVariables(tokens, 'test') as any
    const brandVar = result.collections[0].variables.find((v: any) => v.name === 'brand')
    expect(brandVar).toBeDefined()
    expect(brandVar.value).toMatch(/^#[0-9a-f]{6}$/i)
  })

  it('supports light mode', () => {
    const result = themeToFigmaVariables(tokens, 'aurora', 'light') as any
    expect(result.collections[0].modes).toEqual([{ name: 'light' }])
  })
})

describe('themeToStyleDictionary', () => {
  const tokens = generateTheme('#6366f1')

  it('returns color object with all tokens', () => {
    const result = themeToStyleDictionary(tokens, 'aurora') as any
    expect(result.color).toBeDefined()
    expect(Object.keys(result.color)).toHaveLength(TOKEN_KEYS.length)
  })

  it('each entry has a value property', () => {
    const result = themeToStyleDictionary(tokens, 'aurora') as any
    for (const [, entry] of Object.entries(result.color) as [string, any][]) {
      expect(entry.value).toBeDefined()
      expect(typeof entry.value).toBe('string')
    }
  })

  it('uses dashed names for keys', () => {
    const result = themeToStyleDictionary(tokens, 'aurora') as any
    expect(result.color['brand']).toBeDefined()
    expect(result.color['brand-light']).toBeDefined()
    expect(result.color['bg-base']).toBeDefined()
    expect(result.color['text-primary']).toBeDefined()
  })
})
