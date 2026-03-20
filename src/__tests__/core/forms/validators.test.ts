import { describe, it, expect, vi } from 'vitest'
import { v } from '../../../core/forms/validators'
import type { ValidatorFn, AsyncValidatorFn } from '../../../core/forms/validators'

// ─── v.required ──────────────────────────────────────────────────────────────

describe('v.required', () => {
  const validate = v.required()

  it('fails for undefined', () => {
    expect(validate(undefined)).toBe('This field is required')
  })

  it('fails for null', () => {
    expect(validate(null)).toBe('This field is required')
  })

  it('fails for empty string', () => {
    expect(validate('')).toBe('This field is required')
  })

  it('fails for whitespace-only string', () => {
    expect(validate('   ')).toBe('This field is required')
    expect(validate('\t')).toBe('This field is required')
    expect(validate('\n')).toBe('This field is required')
    expect(validate(' \t\n ')).toBe('This field is required')
  })

  it('passes for non-empty string', () => {
    expect(validate('hello')).toBeUndefined()
    expect(validate('a')).toBeUndefined()
    expect(validate(' a ')).toBeUndefined()
  })

  it('passes for zero (number)', () => {
    expect(validate(0)).toBeUndefined()
  })

  it('passes for false (boolean — valid for checkboxes)', () => {
    expect(validate(false)).toBeUndefined()
  })

  it('passes for true (boolean)', () => {
    expect(validate(true)).toBeUndefined()
  })

  it('uses custom error message', () => {
    const custom = v.required('Name is required')
    expect(custom(undefined)).toBe('Name is required')
    expect(custom('')).toBe('Name is required')
  })

  it('passes for arrays (non-null values)', () => {
    expect(validate([])).toBeUndefined()
    expect(validate([1, 2])).toBeUndefined()
  })

  it('passes for objects', () => {
    expect(validate({})).toBeUndefined()
  })
})

// ─── v.email ─────────────────────────────────────────────────────────────────

describe('v.email', () => {
  const validate = v.email()

  it('passes for valid email: user@example.com', () => {
    expect(validate('user@example.com')).toBeUndefined()
  })

  it('passes for email with dots: first.last@example.com', () => {
    expect(validate('first.last@example.com')).toBeUndefined()
  })

  it('passes for email with plus: user+tag@example.com', () => {
    expect(validate('user+tag@example.com')).toBeUndefined()
  })

  it('passes for email with subdomain', () => {
    expect(validate('user@mail.example.com')).toBeUndefined()
  })

  it('fails for missing @', () => {
    expect(validate('userexample.com')).toBe('Invalid email address')
  })

  it('fails for missing domain', () => {
    expect(validate('user@')).toBe('Invalid email address')
  })

  it('fails for missing TLD', () => {
    expect(validate('user@example')).toBe('Invalid email address')
  })

  it('fails for spaces in email', () => {
    expect(validate('user @example.com')).toBe('Invalid email address')
    expect(validate('us er@example.com')).toBe('Invalid email address')
  })

  it('fails for double @', () => {
    expect(validate('user@@example.com')).toBe('Invalid email address')
  })

  it('skips validation for empty string (not required)', () => {
    expect(validate('')).toBeUndefined()
  })

  it('skips validation for undefined', () => {
    expect(validate(undefined)).toBeUndefined()
  })

  it('skips validation for null', () => {
    expect(validate(null)).toBeUndefined()
  })

  it('skips validation for non-string values', () => {
    expect(validate(123)).toBeUndefined()
    expect(validate(true)).toBeUndefined()
  })

  it('skips validation for whitespace-only string', () => {
    expect(validate('   ')).toBeUndefined()
  })

  it('uses custom error message', () => {
    const custom = v.email('Please enter a valid email')
    expect(custom('bad')).toBe('Please enter a valid email')
  })
})

// ─── v.url ───────────────────────────────────────────────────────────────────

describe('v.url', () => {
  const validate = v.url()

  it('passes for https://example.com', () => {
    expect(validate('https://example.com')).toBeUndefined()
  })

  it('passes for http://localhost:3000', () => {
    expect(validate('http://localhost:3000')).toBeUndefined()
  })

  it('passes for URL with path', () => {
    expect(validate('https://example.com/path/to/page')).toBeUndefined()
  })

  it('passes for URL with query string', () => {
    expect(validate('https://example.com?q=search&page=1')).toBeUndefined()
  })

  it('fails for plain text', () => {
    expect(validate('not a url')).toBe('Invalid URL')
  })

  it('fails for missing protocol', () => {
    expect(validate('example.com')).toBe('Invalid URL')
  })

  it('skips for empty string', () => {
    expect(validate('')).toBeUndefined()
  })

  it('skips for undefined', () => {
    expect(validate(undefined)).toBeUndefined()
  })

  it('skips for null', () => {
    expect(validate(null)).toBeUndefined()
  })

  it('uses custom error message', () => {
    const custom = v.url('Enter a valid URL')
    expect(custom('bad')).toBe('Enter a valid URL')
  })
})

// ─── v.minLength ─────────────────────────────────────────────────────────────

describe('v.minLength', () => {
  const validate = v.minLength(3)

  it('passes when string meets minimum', () => {
    expect(validate('abc')).toBeUndefined()
    expect(validate('abcde')).toBeUndefined()
  })

  it('fails when string is too short', () => {
    expect(validate('ab')).toBe('Must be at least 3 characters')
    expect(validate('a')).toBe('Must be at least 3 characters')
  })

  it('skips for empty string', () => {
    expect(validate('')).toBeUndefined()
  })

  it('skips for undefined', () => {
    expect(validate(undefined)).toBeUndefined()
  })

  it('skips for null', () => {
    expect(validate(null)).toBeUndefined()
  })

  it('skips for non-string values', () => {
    expect(validate(12)).toBeUndefined()
    expect(validate(true)).toBeUndefined()
  })

  it('skips validation for whitespace-only string', () => {
    expect(validate('   ')).toBeUndefined()
  })

  it('uses custom message', () => {
    const custom = v.minLength(5, 'Too short!')
    expect(custom('ab')).toBe('Too short!')
  })

  it('handles exact minimum length', () => {
    expect(validate('abc')).toBeUndefined()
  })
})

// ─── v.maxLength ─────────────────────────────────────────────────────────────

describe('v.maxLength', () => {
  const validate = v.maxLength(5)

  it('passes when string is within limit', () => {
    expect(validate('abc')).toBeUndefined()
    expect(validate('abcde')).toBeUndefined()
  })

  it('fails when string exceeds limit', () => {
    expect(validate('abcdef')).toBe('Must be at most 5 characters')
    expect(validate('abcdefghij')).toBe('Must be at most 5 characters')
  })

  it('skips for empty string', () => {
    expect(validate('')).toBeUndefined()
  })

  it('skips for undefined', () => {
    expect(validate(undefined)).toBeUndefined()
  })

  it('skips for null', () => {
    expect(validate(null)).toBeUndefined()
  })

  it('skips validation for whitespace-only string', () => {
    expect(validate('   ')).toBeUndefined()
  })

  it('uses custom message', () => {
    const custom = v.maxLength(3, 'Too long!')
    expect(custom('abcd')).toBe('Too long!')
  })

  it('handles exact maximum length', () => {
    expect(validate('abcde')).toBeUndefined()
  })
})

// ─── v.min ───────────────────────────────────────────────────────────────────

describe('v.min', () => {
  const validate = v.min(5)

  it('passes when number meets minimum', () => {
    expect(validate(5)).toBeUndefined()
    expect(validate(10)).toBeUndefined()
    expect(validate(100)).toBeUndefined()
  })

  it('fails when number is below minimum', () => {
    expect(validate(4)).toBe('Must be at least 5')
    expect(validate(0)).toBe('Must be at least 5')
    expect(validate(-1)).toBe('Must be at least 5')
  })

  it('works with string numbers ("5")', () => {
    expect(validate('5')).toBeUndefined()
    expect(validate('10')).toBeUndefined()
    expect(validate('3')).toBe('Must be at least 5')
  })

  it('skips for empty string', () => {
    expect(validate('')).toBeUndefined()
  })

  it('skips for null', () => {
    expect(validate(null)).toBeUndefined()
  })

  it('skips for undefined', () => {
    expect(validate(undefined)).toBeUndefined()
  })

  it('skips for NaN values', () => {
    expect(validate('not-a-number')).toBeUndefined()
  })

  it('uses custom message', () => {
    const custom = v.min(18, 'Must be at least 18 years old')
    expect(custom(16)).toBe('Must be at least 18 years old')
  })

  it('handles floating point', () => {
    expect(validate(4.9)).toBe('Must be at least 5')
    expect(validate(5.0)).toBeUndefined()
    expect(validate(5.1)).toBeUndefined()
  })

  it('handles negative minimums', () => {
    const negMin = v.min(-10)
    expect(negMin(-11)).toBe('Must be at least -10')
    expect(negMin(-10)).toBeUndefined()
    expect(negMin(0)).toBeUndefined()
  })
})

// ─── v.max ───────────────────────────────────────────────────────────────────

describe('v.max', () => {
  const validate = v.max(100)

  it('passes when number is within limit', () => {
    expect(validate(100)).toBeUndefined()
    expect(validate(50)).toBeUndefined()
    expect(validate(0)).toBeUndefined()
  })

  it('fails when number exceeds limit', () => {
    expect(validate(101)).toBe('Must be at most 100')
    expect(validate(200)).toBe('Must be at most 100')
  })

  it('works with string numbers', () => {
    expect(validate('50')).toBeUndefined()
    expect(validate('101')).toBe('Must be at most 100')
  })

  it('skips for empty string', () => {
    expect(validate('')).toBeUndefined()
  })

  it('skips for null', () => {
    expect(validate(null)).toBeUndefined()
  })

  it('skips for undefined', () => {
    expect(validate(undefined)).toBeUndefined()
  })

  it('skips for NaN values', () => {
    expect(validate('xyz')).toBeUndefined()
  })

  it('uses custom message', () => {
    const custom = v.max(10, 'Maximum 10 items')
    expect(custom(11)).toBe('Maximum 10 items')
  })

  it('handles floating point', () => {
    expect(validate(100.1)).toBe('Must be at most 100')
    expect(validate(99.9)).toBeUndefined()
  })
})

// ─── v.pattern ───────────────────────────────────────────────────────────────

describe('v.pattern', () => {
  const validate = v.pattern(/^[A-Z]{3}-\d{4}$/)

  it('passes when string matches regex', () => {
    expect(validate('ABC-1234')).toBeUndefined()
    expect(validate('XYZ-0000')).toBeUndefined()
  })

  it('fails when string does not match', () => {
    expect(validate('abc-1234')).toBe('Invalid format')
    expect(validate('AB-1234')).toBe('Invalid format')
    expect(validate('ABCD-1234')).toBe('Invalid format')
    expect(validate('ABC-123')).toBe('Invalid format')
  })

  it('skips for empty string', () => {
    expect(validate('')).toBeUndefined()
  })

  it('skips for undefined', () => {
    expect(validate(undefined)).toBeUndefined()
  })

  it('skips for null', () => {
    expect(validate(null)).toBeUndefined()
  })

  it('skips for non-string values', () => {
    expect(validate(123)).toBeUndefined()
  })

  it('skips validation for whitespace-only string', () => {
    expect(validate('   ')).toBeUndefined()
  })

  it('uses custom message', () => {
    const custom = v.pattern(/^\d{5}$/, 'Must be a 5-digit zip code')
    expect(custom('1234')).toBe('Must be a 5-digit zip code')
    expect(custom('12345')).toBeUndefined()
  })
})

// ─── v.match ─────────────────────────────────────────────────────────────────

describe('v.match', () => {
  const validate = v.match('password')

  it('passes when values match', () => {
    expect(validate('secret123', { password: 'secret123' })).toBeUndefined()
  })

  it('fails when values differ', () => {
    expect(validate('secret123', { password: 'different' })).toBe('Must match password')
  })

  it('fails when field does not exist in allValues', () => {
    expect(validate('secret123', { other: 'value' })).toBe('Must match password')
  })

  it('uses custom message', () => {
    const custom = v.match('password', 'Passwords do not match')
    expect(custom('abc', { password: 'xyz' })).toBe('Passwords do not match')
  })

  it('handles missing allValues gracefully', () => {
    expect(validate('secret123')).toBeUndefined()
    expect(validate('secret123', undefined)).toBeUndefined()
  })

  it('matches undefined values correctly', () => {
    expect(validate(undefined, { password: undefined })).toBeUndefined()
  })

  it('strict equality: does not coerce types', () => {
    expect(validate('1', { password: 1 as unknown })).toBe('Must match password')
  })
})

// ─── v.oneOf ─────────────────────────────────────────────────────────────────

describe('v.oneOf', () => {
  const validate = v.oneOf(['red', 'green', 'blue'])

  it('passes when value is in options', () => {
    expect(validate('red')).toBeUndefined()
    expect(validate('green')).toBeUndefined()
    expect(validate('blue')).toBeUndefined()
  })

  it('fails when value is not in options', () => {
    expect(validate('yellow')).toBe('Must be one of: red, green, blue')
  })

  it('skips for empty string', () => {
    expect(validate('')).toBeUndefined()
  })

  it('skips for null', () => {
    expect(validate(null)).toBeUndefined()
  })

  it('skips for undefined', () => {
    expect(validate(undefined)).toBeUndefined()
  })

  it('uses custom message', () => {
    const custom = v.oneOf([1, 2, 3], 'Pick a valid number')
    expect(custom(4)).toBe('Pick a valid number')
  })

  it('works with numeric options', () => {
    const numValidator = v.oneOf([1, 2, 3])
    expect(numValidator(1)).toBeUndefined()
    expect(numValidator(4)).toBe('Must be one of: 1, 2, 3')
  })
})

// ─── v.custom ────────────────────────────────────────────────────────────────

describe('v.custom', () => {
  it('returns undefined for valid (return true)', () => {
    const validate = v.custom(() => true)
    expect(validate('anything')).toBeUndefined()
  })

  it('returns undefined for valid (return undefined)', () => {
    const validate = v.custom(() => undefined)
    expect(validate('anything')).toBeUndefined()
  })

  it('returns error string for invalid', () => {
    const validate = v.custom((value) => {
      if (typeof value === 'string' && value.includes('bad')) return 'Contains bad word'
      return true
    })
    expect(validate('this is bad')).toBe('Contains bad word')
    expect(validate('this is good')).toBeUndefined()
  })

  it('receives allValues as second arg', () => {
    const validate = v.custom((value, allValues) => {
      if (allValues && (allValues as Record<string, unknown>).otherField === 'trigger') {
        return 'Triggered by other field'
      }
      return true
    })
    expect(validate('x', { otherField: 'trigger' })).toBe('Triggered by other field')
    expect(validate('x', { otherField: 'nope' })).toBeUndefined()
  })
})

// ─── v.pipe ──────────────────────────────────────────────────────────────────

describe('v.pipe', () => {
  it('returns undefined when all validators pass', () => {
    const validate = v.pipe(v.required(), v.minLength(3), v.maxLength(10))
    expect(validate('hello')).toBeUndefined()
  })

  it('returns first error when a validator fails', () => {
    const validate = v.pipe(v.required(), v.minLength(3))
    expect(validate('')).toBe('This field is required')
  })

  it('stops at first failure (short-circuit)', () => {
    const spy1 = vi.fn(() => 'Error 1')
    const spy2 = vi.fn(() => undefined)
    const validate = v.pipe(spy1, spy2)
    validate('test')
    expect(spy1).toHaveBeenCalledTimes(1)
    expect(spy2).not.toHaveBeenCalled()
  })

  it('passes value and allValues to each validator', () => {
    const spy = vi.fn(() => undefined)
    const allVals = { field1: 'a' }
    const validate = v.pipe(spy)
    validate('test', allVals)
    expect(spy).toHaveBeenCalledWith('test', allVals)
  })

  it('works with single validator', () => {
    const validate = v.pipe(v.required())
    expect(validate('hello')).toBeUndefined()
    expect(validate('')).toBe('This field is required')
  })

  it('works with empty validators array', () => {
    const validate = v.pipe()
    expect(validate('anything')).toBeUndefined()
    expect(validate(undefined)).toBeUndefined()
  })

  it('chains multiple validators and returns second error', () => {
    const validate = v.pipe(v.required(), v.email())
    expect(validate('not-an-email')).toBe('Invalid email address')
  })
})

// ─── v.async ─────────────────────────────────────────────────────────────────

describe('v.async', () => {
  it('resolves with undefined for valid', async () => {
    const validate = v.async(async () => undefined, { debounce: 0 })
    const result = await validate('anything')
    expect(result).toBeUndefined()
  })

  it('resolves with error string for invalid', async () => {
    const validate = v.async(async () => 'Username taken', { debounce: 0 })
    const result = await validate('taken-user')
    expect(result).toBe('Username taken')
  })

  it('debounces rapid calls', async () => {
    const fn = vi.fn(async (value: unknown) => {
      return value === 'taken' ? 'Username taken' : undefined
    })
    const validate = v.async(fn, { debounce: 50 })

    // Fire multiple rapid calls — only the last should execute
    const p1 = validate('a')
    const p2 = validate('ab')
    const p3 = validate('abc')

    // The earlier promises may never resolve because they are replaced by subsequent calls.
    // Wait for the last one to resolve.
    const result = await p3
    expect(result).toBeUndefined()

    // The function should have been called at most once (the final debounced call)
    // Wait a bit for any pending timers
    await new Promise((r) => setTimeout(r, 100))
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('abc')
  })

  it('settles earlier debounced promises (does not hang)', async () => {
    const validate = v.async(async (value) => {
      return value === 'taken' ? 'Already taken' : undefined
    }, { debounce: 50 })

    const p1 = validate('a')
    const p2 = validate('ab')
    const p3 = validate('abc')

    // All promises should settle — p1 and p2 resolve with undefined (cancelled)
    const results = await Promise.all([p1, p2, p3])
    expect(results[0]).toBeUndefined() // settled by cancellation
    expect(results[1]).toBeUndefined() // settled by cancellation
    expect(results[2]).toBeUndefined() // actual validation result
  })

  it('handles thrown errors gracefully', async () => {
    const validate = v.async(
      async () => {
        throw new Error('Network error')
      },
      { debounce: 0 }
    )
    const result = await validate('test')
    expect(result).toBe('Validation failed')
  })

  it('uses default debounce of 300ms', async () => {
    const fn = vi.fn(async () => undefined)
    const validate = v.async(fn)

    const promise = validate('test')

    // Before debounce fires, function should not have been called
    expect(fn).not.toHaveBeenCalled()

    // Fast-forward and wait
    await new Promise((r) => setTimeout(r, 350))
    const result = await promise
    expect(result).toBeUndefined()
    expect(fn).toHaveBeenCalledTimes(1)
  })
})

// ─── Type exports ────────────────────────────────────────────────────────────

describe('Type exports', () => {
  it('exports ValidatorFn type', () => {
    const fn: ValidatorFn = (value) => (value ? undefined : 'error')
    expect(fn('test')).toBeUndefined()
  })

  it('exports AsyncValidatorFn type', () => {
    const fn: AsyncValidatorFn = async (value) => (value ? undefined : 'error')
    expect(fn('test')).resolves.toBeUndefined()
  })
})
