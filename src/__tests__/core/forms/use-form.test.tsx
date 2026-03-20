import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { render, screen } from '@testing-library/react'
import { createForm } from '../../../core/forms/create-form'
import { useForm } from '../../../core/forms/use-form'
import {
  FormContextProvider,
  useFormContext,
  useFormContextOptional,
} from '../../../core/forms/form-context'
import { v } from '../../../core/forms/validators'
import type { ReactNode } from 'react'

// ─── Helpers ────────────────────────────────────────────────────────────────

function createTestForm(overrides: Record<string, unknown> = {}) {
  return createForm({
    fields: {
      email: { initial: '', validate: v.pipe(v.required(), v.email()) },
      password: { initial: '', validate: v.pipe(v.required(), v.minLength(8)) },
      remember: { initial: false },
    },
    onSubmit: vi.fn(),
    ...overrides,
  })
}

// ─── useForm ────────────────────────────────────────────────────────────────

describe('useForm', () => {
  // ── Initial state ───────────────────────────────────────────────────────

  describe('initial state', () => {
    it('values reflect field initial values', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      expect(result.current.values).toEqual({
        email: '',
        password: '',
        remember: false,
      })
    })

    it('errors is empty initially', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      expect(result.current.errors).toEqual({})
    })

    it('touched is empty initially', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      expect(result.current.touched).toEqual({})
    })

    it('dirty is false initially', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      expect(result.current.dirty).toBe(false)
    })

    it('valid is true initially (not yet validated)', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      expect(result.current.valid).toBe(true)
    })

    it('submitting is false initially', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      expect(result.current.submitting).toBe(false)
    })

    it('submitCount is 0 initially', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      expect(result.current.submitCount).toBe(0)
    })
  })

  // ── setValue ─────────────────────────────────────────────────────────────

  describe('setValue', () => {
    it('updates the field value', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      act(() => {
        result.current.setValue('email', 'test@example.com')
      })

      expect(result.current.values.email).toBe('test@example.com')
    })

    it('marks form as dirty', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      expect(result.current.dirty).toBe(false)

      act(() => {
        result.current.setValue('email', 'a')
      })

      expect(result.current.dirty).toBe(true)
    })

    it('does not validate on change by default (validateOn=blur)', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      act(() => {
        result.current.setValue('email', 'invalid')
      })

      // No errors because default validateOn is 'blur', not 'change'
      expect(result.current.errors).toEqual({})
    })

    it('validates on change when validateOn=change', () => {
      const def = createTestForm({ validateOn: 'change' })
      const { result } = renderHook(() => useForm(def))

      act(() => {
        result.current.setValue('email', 'invalid')
      })

      expect(result.current.errors.email).toBe('Invalid email address')
    })

    it('revalidates on change if field was previously validated and had error', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      // First, validate field via blur to mark it as validated
      act(() => {
        result.current.setTouched('email', true)
      })

      // Should have error since email is empty and required
      expect(result.current.errors.email).toBe('This field is required')

      // Now set a valid value — should revalidate and clear the error
      act(() => {
        result.current.setValue('email', 'user@example.com')
      })

      expect(result.current.errors.email).toBeUndefined()
    })

    it('does not revalidate fields that have not been validated yet', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      // Set an invalid email without ever having triggered validation
      act(() => {
        result.current.setValue('email', 'bad')
      })

      // No error because the field was never validated
      expect(result.current.errors.email).toBeUndefined()
    })

    it('preserves other field values when setting one field', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      act(() => {
        result.current.setValue('email', 'test@example.com')
      })
      act(() => {
        result.current.setValue('password', 'secret123')
      })

      expect(result.current.values.email).toBe('test@example.com')
      expect(result.current.values.password).toBe('secret123')
      expect(result.current.values.remember).toBe(false)
    })

    it('accepts boolean values', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      act(() => {
        result.current.setValue('remember', true)
      })

      expect(result.current.values.remember).toBe(true)
    })
  })

  // ── setTouched / blur ───────────────────────────────────────────────────

  describe('setTouched / blur', () => {
    it('marks field as touched', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      act(() => {
        result.current.setTouched('email', true)
      })

      expect(result.current.touched.email).toBe(true)
    })

    it('validates field on blur (default validateOn=blur)', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      act(() => {
        result.current.setTouched('email', true)
      })

      // Email is empty and required, so should have error
      expect(result.current.errors.email).toBe('This field is required')
    })

    it('sets error if validation fails', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      act(() => {
        result.current.setValue('email', 'not-an-email')
      })
      act(() => {
        result.current.setTouched('email', true)
      })

      expect(result.current.errors.email).toBe('Invalid email address')
    })

    it('clears error if validation passes', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      // First, create an error
      act(() => {
        result.current.setTouched('email', true)
      })
      expect(result.current.errors.email).toBeDefined()

      // Set a valid value and re-touch
      act(() => {
        result.current.setValue('email', 'user@example.com')
      })
      act(() => {
        result.current.setTouched('email', true)
      })

      expect(result.current.errors.email).toBeUndefined()
    })

    it('does not validate when touched is set to false', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      act(() => {
        result.current.setTouched('email', false)
      })

      expect(result.current.touched.email).toBe(false)
      expect(result.current.errors.email).toBeUndefined()
    })

    it('does not validate on blur when validateOn=submit', () => {
      const def = createTestForm({ validateOn: 'submit' })
      const { result } = renderHook(() => useForm(def))

      act(() => {
        result.current.setTouched('email', true)
      })

      expect(result.current.errors.email).toBeUndefined()
    })

    it('does not validate fields without validators', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      act(() => {
        result.current.setTouched('remember', true)
      })

      expect(result.current.errors.remember).toBeUndefined()
      expect(result.current.touched.remember).toBe(true)
    })
  })

  // ── validateField ───────────────────────────────────────────────────────

  describe('validateField', () => {
    it('returns undefined for valid field', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      act(() => {
        result.current.setValue('email', 'user@example.com')
      })

      let error: string | undefined
      act(() => {
        error = result.current.validateField('email')
      })

      expect(error).toBeUndefined()
    })

    it('returns error message for invalid field', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      let error: string | undefined
      act(() => {
        error = result.current.validateField('email')
      })

      expect(error).toBe('This field is required')
    })

    it('updates errors state', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      act(() => {
        result.current.validateField('email')
      })

      expect(result.current.errors.email).toBe('This field is required')
    })

    it('clears error when field becomes valid', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      act(() => {
        result.current.validateField('email')
      })
      expect(result.current.errors.email).toBeDefined()

      act(() => {
        result.current.setValue('email', 'user@example.com')
      })
      act(() => {
        result.current.validateField('email')
      })

      expect(result.current.errors.email).toBeUndefined()
    })

    it('returns undefined for field with no validator', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      let error: string | undefined
      act(() => {
        error = result.current.validateField('remember')
      })

      expect(error).toBeUndefined()
    })
  })

  // ── validateAll ─────────────────────────────────────────────────────────

  describe('validateAll', () => {
    it('returns true when all fields are valid', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      act(() => {
        result.current.setValue('email', 'user@example.com')
        result.current.setValue('password', 'password123')
      })

      let valid: boolean = false
      act(() => {
        valid = result.current.validateAll()
      })

      expect(valid).toBe(true)
    })

    it('returns false when any field is invalid', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      let valid: boolean = true
      act(() => {
        valid = result.current.validateAll()
      })

      expect(valid).toBe(false)
    })

    it('populates errors for all invalid fields', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      act(() => {
        result.current.validateAll()
      })

      expect(result.current.errors.email).toBe('This field is required')
      expect(result.current.errors.password).toBe('This field is required')
    })

    it('marks all fields as touched', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      act(() => {
        result.current.validateAll()
      })

      expect(result.current.touched.email).toBe(true)
      expect(result.current.touched.password).toBe(true)
      expect(result.current.touched.remember).toBe(true)
    })

    it('clears errors for valid fields', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      // First, validate to set errors
      act(() => {
        result.current.validateAll()
      })
      expect(result.current.errors.email).toBeDefined()

      // Fix the values
      act(() => {
        result.current.setValue('email', 'user@example.com')
        result.current.setValue('password', 'password123')
      })

      act(() => {
        result.current.validateAll()
      })

      expect(result.current.errors.email).toBeUndefined()
      expect(result.current.errors.password).toBeUndefined()
    })
  })

  // ── setError ────────────────────────────────────────────────────────────

  describe('setError', () => {
    it('sets a manual error on a field', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      act(() => {
        result.current.setError('email', 'Server says: already taken')
      })

      expect(result.current.errors.email).toBe('Server says: already taken')
    })

    it('clears error when set to undefined', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      act(() => {
        result.current.setError('email', 'Some error')
      })
      expect(result.current.errors.email).toBe('Some error')

      act(() => {
        result.current.setError('email', undefined)
      })
      expect(result.current.errors.email).toBeUndefined()
    })
  })

  // ── handleSubmit ────────────────────────────────────────────────────────

  describe('handleSubmit', () => {
    it('validates all fields first', async () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      await act(async () => {
        await result.current.handleSubmit()
      })

      expect(result.current.errors.email).toBeDefined()
      expect(result.current.errors.password).toBeDefined()
    })

    it('calls onSubmit with values when valid', async () => {
      const onSubmit = vi.fn()
      const def = createTestForm({ onSubmit })
      const { result } = renderHook(() => useForm(def))

      act(() => {
        result.current.setValue('email', 'user@example.com')
        result.current.setValue('password', 'password123')
      })

      await act(async () => {
        await result.current.handleSubmit()
      })

      expect(onSubmit).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
        remember: false,
      })
    })

    it('does not call onSubmit when invalid', async () => {
      const onSubmit = vi.fn()
      const def = createTestForm({ onSubmit })
      const { result } = renderHook(() => useForm(def))

      await act(async () => {
        await result.current.handleSubmit()
      })

      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('calls onError with errors when invalid', async () => {
      const onError = vi.fn()
      const def = createTestForm({ onError })
      const { result } = renderHook(() => useForm(def))

      await act(async () => {
        await result.current.handleSubmit()
      })

      expect(onError).toHaveBeenCalledWith({
        email: 'This field is required',
        password: 'This field is required',
      })
    })

    it('sets submitting=true during async submit', async () => {
      let resolveSubmit!: () => void
      const onSubmit = vi.fn(
        () =>
          new Promise<void>((resolve) => {
            resolveSubmit = resolve
          }),
      )
      const def = createTestForm({ onSubmit })
      const { result } = renderHook(() => useForm(def))

      act(() => {
        result.current.setValue('email', 'user@example.com')
        result.current.setValue('password', 'password123')
      })

      let submitPromise!: Promise<void>
      act(() => {
        submitPromise = result.current.handleSubmit()
      })

      // During submission, submitting should be true
      expect(result.current.submitting).toBe(true)

      await act(async () => {
        resolveSubmit()
        await submitPromise
      })

      expect(result.current.submitting).toBe(false)
    })

    it('sets submitting=false after submit completes', async () => {
      const onSubmit = vi.fn(async () => {})
      const def = createTestForm({ onSubmit })
      const { result } = renderHook(() => useForm(def))

      act(() => {
        result.current.setValue('email', 'user@example.com')
        result.current.setValue('password', 'password123')
      })

      await act(async () => {
        await result.current.handleSubmit()
      })

      expect(result.current.submitting).toBe(false)
    })

    it('increments submitCount', async () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      expect(result.current.submitCount).toBe(0)

      await act(async () => {
        await result.current.handleSubmit()
      })

      expect(result.current.submitCount).toBe(1)

      await act(async () => {
        await result.current.handleSubmit()
      })

      expect(result.current.submitCount).toBe(2)
    })

    it('increments submitCount even when invalid', async () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      await act(async () => {
        await result.current.handleSubmit()
      })

      expect(result.current.submitCount).toBe(1)
    })

    it('handles submit errors gracefully', async () => {
      const onSubmit = vi.fn(async () => {
        throw new Error('Network error')
      })
      const def = createTestForm({ onSubmit })
      const { result } = renderHook(() => useForm(def))

      act(() => {
        result.current.setValue('email', 'user@example.com')
        result.current.setValue('password', 'password123')
      })

      // Should not throw
      await act(async () => {
        await result.current.handleSubmit()
      })

      expect(result.current.submitting).toBe(false)
    })

    it('marks all fields as touched on submit', async () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      await act(async () => {
        await result.current.handleSubmit()
      })

      expect(result.current.touched.email).toBe(true)
      expect(result.current.touched.password).toBe(true)
      expect(result.current.touched.remember).toBe(true)
    })
  })

  // ── reset ───────────────────────────────────────────────────────────────

  describe('reset', () => {
    it('resets all fields to initial values', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      act(() => {
        result.current.setValue('email', 'user@example.com')
        result.current.setValue('password', 'password123')
        result.current.setValue('remember', true)
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.values).toEqual({
        email: '',
        password: '',
        remember: false,
      })
    })

    it('clears all errors', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      act(() => {
        result.current.validateAll()
      })
      expect(Object.keys(result.current.errors).length).toBeGreaterThan(0)

      act(() => {
        result.current.reset()
      })

      expect(result.current.errors).toEqual({})
    })

    it('clears all touched', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      act(() => {
        result.current.setTouched('email', true)
        result.current.setTouched('password', true)
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.touched).toEqual({})
    })

    it('resets dirty to false', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      act(() => {
        result.current.setValue('email', 'test')
      })
      expect(result.current.dirty).toBe(true)

      act(() => {
        result.current.reset()
      })

      expect(result.current.dirty).toBe(false)
    })

    it('resets single field when name provided', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      act(() => {
        result.current.setValue('email', 'user@example.com')
        result.current.setValue('password', 'secret')
      })

      act(() => {
        result.current.reset('email')
      })

      expect(result.current.values.email).toBe('')
      expect(result.current.values.password).toBe('secret')
    })

    it('does not affect other fields when resetting single field', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      act(() => {
        result.current.setValue('email', 'user@example.com')
        result.current.setValue('password', 'password123')
        result.current.setTouched('email', true)
        result.current.setTouched('password', true)
      })

      act(() => {
        result.current.setError('email', 'Error 1')
        result.current.setError('password', 'Error 2')
      })

      act(() => {
        result.current.reset('email')
      })

      // Email should be reset
      expect(result.current.values.email).toBe('')
      expect(result.current.errors.email).toBeUndefined()
      expect(result.current.touched.email).toBe(false)

      // Password should not be affected
      expect(result.current.values.password).toBe('password123')
      expect(result.current.errors.password).toBe('Error 2')
      expect(result.current.touched.password).toBe(true)
    })

    it('preserves submitCount after reset', async () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      await act(async () => {
        await result.current.handleSubmit()
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.submitCount).toBe(1)
    })
  })

  // ── getFieldProps ───────────────────────────────────────────────────────

  describe('getFieldProps', () => {
    it('returns value, onChange, onBlur, error, touched', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      const props = result.current.getFieldProps('email')

      expect(props).toHaveProperty('value')
      expect(props).toHaveProperty('onChange')
      expect(props).toHaveProperty('onBlur')
      expect(props).toHaveProperty('error')
      expect(props).toHaveProperty('touched')
    })

    it('returns current field value', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      expect(result.current.getFieldProps('email').value).toBe('')

      act(() => {
        result.current.setValue('email', 'test@example.com')
      })

      expect(result.current.getFieldProps('email').value).toBe('test@example.com')
    })

    it('onChange updates the field value', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      act(() => {
        result.current.getFieldProps('email').onChange('test@example.com')
      })

      expect(result.current.values.email).toBe('test@example.com')
    })

    it('onBlur marks field as touched and validates', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      act(() => {
        result.current.getFieldProps('email').onBlur()
      })

      expect(result.current.touched.email).toBe(true)
      expect(result.current.errors.email).toBe('This field is required')
    })

    it('returns error when field has error', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      act(() => {
        result.current.setError('email', 'Custom error')
      })

      expect(result.current.getFieldProps('email').error).toBe('Custom error')
    })

    it('returns touched state', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      expect(result.current.getFieldProps('email').touched).toBe(false)

      act(() => {
        result.current.setTouched('email', true)
      })

      expect(result.current.getFieldProps('email').touched).toBe(true)
    })
  })

  // ── valid computed property ─────────────────────────────────────────────

  describe('valid computed property', () => {
    it('is true when errors is empty', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      expect(result.current.valid).toBe(true)
    })

    it('is false when any error exists', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      act(() => {
        result.current.setError('email', 'Error')
      })

      expect(result.current.valid).toBe(false)
    })

    it('updates reactively when errors change', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      expect(result.current.valid).toBe(true)

      act(() => {
        result.current.setError('email', 'Error')
      })
      expect(result.current.valid).toBe(false)

      act(() => {
        result.current.setError('email', undefined)
      })
      expect(result.current.valid).toBe(true)
    })

    it('is false when multiple errors exist', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      act(() => {
        result.current.setError('email', 'Error 1')
        result.current.setError('password', 'Error 2')
      })

      expect(result.current.valid).toBe(false)
    })

    it('remains false after clearing only one of multiple errors', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      act(() => {
        result.current.setError('email', 'Error 1')
        result.current.setError('password', 'Error 2')
      })

      act(() => {
        result.current.setError('email', undefined)
      })

      expect(result.current.valid).toBe(false)
    })
  })

  // ── Edge cases ──────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('works with a form that has no validators', () => {
      const def = createForm({
        fields: {
          name: { initial: '' },
          age: { initial: 0 },
        },
        onSubmit: vi.fn(),
      })
      const { result } = renderHook(() => useForm(def))

      let valid = false
      act(() => {
        valid = result.current.validateAll()
      })

      expect(valid).toBe(true)
      expect(result.current.errors).toEqual({})
    })

    it('works with a single field', () => {
      const def = createForm({
        fields: {
          name: { initial: '', validate: v.required() },
        },
        onSubmit: vi.fn(),
      })
      const { result } = renderHook(() => useForm(def))

      act(() => {
        result.current.validateAll()
      })

      expect(result.current.errors.name).toBe('This field is required')
    })

    it('cross-field validation works via allValues', () => {
      const def = createForm({
        fields: {
          password: { initial: '' },
          confirm: { initial: '', validate: v.match('password', 'Passwords must match') },
        },
        onSubmit: vi.fn(),
      })
      const { result } = renderHook(() => useForm(def))

      act(() => {
        result.current.setValue('password', 'secret123')
        result.current.setValue('confirm', 'different')
      })

      act(() => {
        result.current.validateAll()
      })

      expect(result.current.errors.confirm).toBe('Passwords must match')
    })

    it('cross-field validation passes when values match', () => {
      const def = createForm({
        fields: {
          password: { initial: '' },
          confirm: { initial: '', validate: v.match('password') },
        },
        onSubmit: vi.fn(),
      })
      const { result } = renderHook(() => useForm(def))

      act(() => {
        result.current.setValue('password', 'secret123')
        result.current.setValue('confirm', 'secret123')
      })

      let valid = false
      act(() => {
        valid = result.current.validateAll()
      })

      expect(valid).toBe(true)
    })

    it('multiple rapid setValue calls work correctly', () => {
      const def = createTestForm()
      const { result } = renderHook(() => useForm(def))

      act(() => {
        result.current.setValue('email', 'a')
        result.current.setValue('email', 'ab')
        result.current.setValue('email', 'abc@test.com')
      })

      expect(result.current.values.email).toBe('abc@test.com')
    })
  })
})

// ─── FormContext ─────────────────────────────────────────────────────────────

describe('FormContext', () => {
  function TestChild() {
    const form = useFormContext()
    return (
      <div>
        <span data-testid="email-value">{String(form.values.email)}</span>
        <button
          data-testid="set-email"
          onClick={() => form.setValue('email', 'context@example.com')}
        >
          Set
        </button>
      </div>
    )
  }

  function TestWrapper({ children }: { children: ReactNode }) {
    const def = createForm({
      fields: {
        email: { initial: 'initial@example.com' },
      },
      onSubmit: vi.fn(),
    })
    const form = useForm(def)
    return <FormContextProvider form={form}>{children}</FormContextProvider>
  }

  it('provides form state to child components', () => {
    render(
      <TestWrapper>
        <TestChild />
      </TestWrapper>,
    )

    expect(screen.getByTestId('email-value').textContent).toBe('initial@example.com')
  })

  it('allows child to update form state', () => {
    render(
      <TestWrapper>
        <TestChild />
      </TestWrapper>,
    )

    act(() => {
      screen.getByTestId('set-email').click()
    })

    expect(screen.getByTestId('email-value').textContent).toBe('context@example.com')
  })

  it('throws when useFormContext is used outside provider', () => {
    // Suppress console.error from React error boundary
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    function Bare() {
      useFormContext()
      return null
    }

    expect(() => render(<Bare />)).toThrow(
      'useFormContext must be used within a <Form> component',
    )

    spy.mockRestore()
  })

  it('useFormContextOptional returns null outside provider', () => {
    function OptionalChild() {
      const form = useFormContextOptional()
      return <span data-testid="has-form">{form ? 'yes' : 'no'}</span>
    }

    render(<OptionalChild />)
    expect(screen.getByTestId('has-form').textContent).toBe('no')
  })

  it('useFormContextOptional returns form inside provider', () => {
    function OptionalChild() {
      const form = useFormContextOptional()
      return <span data-testid="has-form">{form ? 'yes' : 'no'}</span>
    }

    render(
      <TestWrapper>
        <OptionalChild />
      </TestWrapper>,
    )
    expect(screen.getByTestId('has-form').textContent).toBe('yes')
  })
})
