import { describe, it, expect } from 'vitest'
import { cn } from '../../../core/utils/cn'

describe('cn', () => {
  it('joins string arguments', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('filters falsy values from conditionals', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c')
  })

  it('handles object notation with boolean values', () => {
    expect(cn('a', { b: true, c: false })).toBe('a b')
  })

  it('flattens nested arrays', () => {
    expect(cn('a', ['b', 'c'])).toBe('a b c')
  })

  it('filters null, undefined, empty string, and zero', () => {
    expect(cn('a', null, undefined, '', 0, 'b')).toBe('a b')
  })

  it('returns empty string with no arguments', () => {
    expect(cn()).toBe('')
  })

  it('handles deeply nested arrays', () => {
    expect(cn('a', [['b', ['c']]])).toBe('a b c')
  })

  it('handles numbers as class names', () => {
    expect(cn(1, 2)).toBe('1 2')
  })
})
