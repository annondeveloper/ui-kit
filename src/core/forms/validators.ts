/**
 * Composable form validator system.
 *
 * Usage:
 *   const validate = v.pipe(v.required(), v.email())
 *   const error = validate(value) // string | undefined
 */

/** A sync validator returns an error message string, or undefined if valid. */
export type ValidatorFn = (value: unknown, allValues?: Record<string, unknown>) => string | undefined

/** An async validator returns a promise of the same shape. */
export type AsyncValidatorFn = (value: unknown, allValues?: Record<string, unknown>) => Promise<string | undefined>

/** A validator result that may contain both sync and async validators. */
export interface ValidatorResult {
  sync: ValidatorFn
  async?: AsyncValidatorFn
}

export const v = {
  /**
   * Compose multiple validators. Runs in order, returns first error (short-circuit).
   */
  pipe(...validators: ValidatorFn[]): ValidatorFn {
    return (value, allValues) => {
      for (const validator of validators) {
        const error = validator(value, allValues)
        if (error) return error
      }
      return undefined
    }
  },

  /**
   * Value is required — rejects null, undefined, empty string, and whitespace-only strings.
   * Booleans (including false) are always considered valid (for checkboxes).
   */
  required(message = 'This field is required'): ValidatorFn {
    return (value) => {
      if (value === null || value === undefined) return message
      if (typeof value === 'string' && value.trim() === '') return message
      if (typeof value === 'boolean') return undefined
      return undefined
    }
  },

  /**
   * Valid email format (simplified RFC 5322).
   * Skips validation for empty/missing values — compose with required() if needed.
   */
  email(message = 'Invalid email address'): ValidatorFn {
    return (value) => {
      if (!value || typeof value !== 'string') return undefined
      const emailRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/
      if (!emailRegex.test(value)) return message
      return undefined
    }
  },

  /**
   * Valid URL (uses the URL constructor).
   * Skips for empty/missing values.
   */
  url(message = 'Invalid URL'): ValidatorFn {
    return (value) => {
      if (!value || typeof value !== 'string') return undefined
      try {
        new URL(value)
        return undefined
      } catch {
        return message
      }
    }
  },

  /**
   * Minimum string length.
   * Skips for empty/missing/non-string values.
   */
  minLength(min: number, message?: string): ValidatorFn {
    return (value) => {
      if (!value || typeof value !== 'string') return undefined
      if (value.length < min) return message ?? `Must be at least ${min} characters`
      return undefined
    }
  },

  /**
   * Maximum string length.
   * Skips for empty/missing/non-string values.
   */
  maxLength(max: number, message?: string): ValidatorFn {
    return (value) => {
      if (!value || typeof value !== 'string') return undefined
      if (value.length > max) return message ?? `Must be at most ${max} characters`
      return undefined
    }
  },

  /**
   * Minimum numeric value. Accepts numbers or numeric strings.
   * Skips for empty/null/undefined/NaN.
   */
  min(minimum: number, message?: string): ValidatorFn {
    return (value) => {
      if (value === null || value === undefined || value === '') return undefined
      const num = typeof value === 'number' ? value : Number(value)
      if (isNaN(num)) return undefined
      if (num < minimum) return message ?? `Must be at least ${minimum}`
      return undefined
    }
  },

  /**
   * Maximum numeric value. Accepts numbers or numeric strings.
   * Skips for empty/null/undefined/NaN.
   */
  max(maximum: number, message?: string): ValidatorFn {
    return (value) => {
      if (value === null || value === undefined || value === '') return undefined
      const num = typeof value === 'number' ? value : Number(value)
      if (isNaN(num)) return undefined
      if (num > maximum) return message ?? `Must be at most ${maximum}`
      return undefined
    }
  },

  /**
   * Regex pattern match.
   * Skips for empty/missing/non-string values.
   */
  pattern(regex: RegExp, message = 'Invalid format'): ValidatorFn {
    return (value) => {
      if (!value || typeof value !== 'string') return undefined
      if (!regex.test(value)) return message
      return undefined
    }
  },

  /**
   * Value must match another field (e.g., confirm password).
   * Returns undefined if allValues is not provided.
   */
  match(fieldName: string, message?: string): ValidatorFn {
    return (value, allValues) => {
      if (!allValues) return undefined
      if (value !== allValues[fieldName]) {
        return message ?? `Must match ${fieldName}`
      }
      return undefined
    }
  },

  /**
   * Value must be one of the given options.
   * Skips for empty/null/undefined.
   */
  oneOf(options: unknown[], message?: string): ValidatorFn {
    return (value) => {
      if (value === null || value === undefined || value === '') return undefined
      if (!options.includes(value)) return message ?? `Must be one of: ${options.join(', ')}`
      return undefined
    }
  },

  /**
   * Custom sync validator. The function should return:
   * - `true` or `undefined` for valid
   * - An error message string for invalid
   */
  custom(fn: (value: unknown, allValues?: Record<string, unknown>) => string | true | undefined): ValidatorFn {
    return (value, allValues) => {
      const result = fn(value, allValues)
      if (result === true || result === undefined) return undefined
      return result
    }
  },

  /**
   * Async validator with built-in debounce.
   * Rapid calls within the debounce window cancel previous pending validations.
   */
  async(
    fn: (value: unknown) => Promise<string | undefined>,
    options: { debounce?: number } = {}
  ): AsyncValidatorFn {
    const { debounce: debounceMs = 300 } = options
    let timer: ReturnType<typeof setTimeout> | null = null

    return (value) => {
      return new Promise((resolve) => {
        if (timer) clearTimeout(timer)
        timer = setTimeout(async () => {
          try {
            const result = await fn(value)
            resolve(result)
          } catch {
            resolve('Validation failed')
          }
        }, debounceMs)
      })
    }
  },
}
