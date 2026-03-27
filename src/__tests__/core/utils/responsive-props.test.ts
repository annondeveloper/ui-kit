import { describe, it, expect } from 'vitest'
import { resolveResponsive, type ResponsiveValue } from '../../../core/utils/responsive-props'

describe('resolveResponsive', () => {
  it('returns a primitive value directly', () => {
    expect(resolveResponsive('hello', 'md', 'fallback')).toBe('hello')
    expect(resolveResponsive(42, 'lg', 0)).toBe(42)
    expect(resolveResponsive(true, 'xs', false)).toBe(true)
  })

  it('returns defaultValue for null/undefined', () => {
    expect(resolveResponsive(null as unknown as ResponsiveValue<string>, 'md', 'default')).toBe('default')
    expect(resolveResponsive(undefined as unknown as ResponsiveValue<string>, 'md', 'default')).toBe('default')
  })

  it('returns an array value directly (not treated as breakpoint map)', () => {
    const arr = [1, 2, 3]
    expect(resolveResponsive(arr as unknown as ResponsiveValue<number[]>, 'md', [])).toBe(arr)
  })

  it('resolves exact breakpoint match', () => {
    const value: ResponsiveValue<string> = { xs: 'tiny', md: 'medium', xl: 'huge' }
    expect(resolveResponsive(value, 'md', 'default')).toBe('medium')
    expect(resolveResponsive(value, 'xl', 'default')).toBe('huge')
    expect(resolveResponsive(value, 'xs', 'default')).toBe('tiny')
  })

  it('cascades down to the nearest smaller breakpoint', () => {
    const value: ResponsiveValue<string> = { xs: 'small', lg: 'large' }
    // sm has no explicit value → falls to xs
    expect(resolveResponsive(value, 'sm', 'default')).toBe('small')
    // md has no explicit value → falls to xs
    expect(resolveResponsive(value, 'md', 'default')).toBe('small')
    // lg has explicit value
    expect(resolveResponsive(value, 'lg', 'default')).toBe('large')
    // xl → falls to lg
    expect(resolveResponsive(value, 'xl', 'default')).toBe('large')
  })

  it('returns defaultValue when no breakpoint matches at or below', () => {
    const value: ResponsiveValue<string> = { md: 'medium' }
    // xs is below md, no xs defined
    expect(resolveResponsive(value, 'xs', 'default')).toBe('default')
    expect(resolveResponsive(value, 'sm', 'default')).toBe('default')
    // md and above should work
    expect(resolveResponsive(value, 'md', 'default')).toBe('medium')
    expect(resolveResponsive(value, 'lg', 'default')).toBe('medium')
  })

  it('handles single-breakpoint maps', () => {
    const value: ResponsiveValue<number> = { xl: 100 }
    expect(resolveResponsive(value, 'xs', 0)).toBe(0)
    expect(resolveResponsive(value, 'xl', 0)).toBe(100)
  })

  it('handles empty breakpoint map', () => {
    const value: ResponsiveValue<string> = {}
    expect(resolveResponsive(value, 'md', 'fallback')).toBe('fallback')
  })
})
