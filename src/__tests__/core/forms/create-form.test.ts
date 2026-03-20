import { describe, it, expect, vi } from 'vitest'
import { createForm } from '../../../core/forms/create-form'
import type { FormDefinition, FieldConfig } from '../../../core/forms/create-form'
import { v } from '../../../core/forms/validators'

// ─── createForm ─────────────────────────────────────────────────────────────

describe('createForm', () => {
  it('returns a FormDefinition with all field configs preserved', () => {
    const emailValidator = v.pipe(v.required(), v.email())
    const def = createForm({
      fields: {
        email: { initial: '', validate: emailValidator },
        name: { initial: 'John' },
        age: { initial: 25 },
      },
      onSubmit: vi.fn(),
    })

    expect(def.fields.email.initial).toBe('')
    expect(def.fields.email.validate).toBe(emailValidator)
    expect(def.fields.name.initial).toBe('John')
    expect(def.fields.age.initial).toBe(25)
  })

  it('defaults validateOn to "blur"', () => {
    const def = createForm({
      fields: { name: { initial: '' } },
      onSubmit: vi.fn(),
    })
    expect(def.validateOn).toBe('blur')
  })

  it('defaults revalidateOn to "change"', () => {
    const def = createForm({
      fields: { name: { initial: '' } },
      onSubmit: vi.fn(),
    })
    expect(def.revalidateOn).toBe('change')
  })

  it('preserves custom validateOn', () => {
    const def = createForm({
      fields: { name: { initial: '' } },
      onSubmit: vi.fn(),
      validateOn: 'change',
    })
    expect(def.validateOn).toBe('change')
  })

  it('preserves custom revalidateOn', () => {
    const def = createForm({
      fields: { name: { initial: '' } },
      onSubmit: vi.fn(),
      revalidateOn: 'submit',
    })
    expect(def.revalidateOn).toBe('submit')
  })

  it('preserves validateOn="submit"', () => {
    const def = createForm({
      fields: { name: { initial: '' } },
      onSubmit: vi.fn(),
      validateOn: 'submit',
    })
    expect(def.validateOn).toBe('submit')
  })

  it('preserves onSubmit callback', () => {
    const onSubmit = vi.fn()
    const def = createForm({
      fields: { name: { initial: '' } },
      onSubmit,
    })
    expect(def.onSubmit).toBe(onSubmit)
  })

  it('preserves onError callback', () => {
    const onError = vi.fn()
    const def = createForm({
      fields: { name: { initial: '' } },
      onSubmit: vi.fn(),
      onError,
    })
    expect(def.onError).toBe(onError)
  })

  it('onError is undefined when not provided', () => {
    const def = createForm({
      fields: { name: { initial: '' } },
      onSubmit: vi.fn(),
    })
    expect(def.onError).toBeUndefined()
  })

  it('preserves field async validators', () => {
    const asyncValidator = v.async(async () => undefined, { debounce: 0 })
    const def = createForm({
      fields: {
        username: { initial: '', validateAsync: asyncValidator },
      },
      onSubmit: vi.fn(),
    })
    expect(def.fields.username.validateAsync).toBe(asyncValidator)
  })

  it('returns a plain object (not a class instance)', () => {
    const def = createForm({
      fields: { name: { initial: '' } },
      onSubmit: vi.fn(),
    })
    expect(def.constructor).toBe(Object)
  })

  it('supports boolean initial values', () => {
    const def = createForm({
      fields: { agree: { initial: false } },
      onSubmit: vi.fn(),
    })
    expect(def.fields.agree.initial).toBe(false)
  })

  it('supports complex initial values', () => {
    const def = createForm({
      fields: {
        tags: { initial: ['react', 'vue'] },
        meta: { initial: { key: 'value' } },
      },
      onSubmit: vi.fn(),
    })
    expect(def.fields.tags.initial).toEqual(['react', 'vue'])
    expect(def.fields.meta.initial).toEqual({ key: 'value' })
  })
})
