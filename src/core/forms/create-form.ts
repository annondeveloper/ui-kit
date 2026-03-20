/**
 * Form definition factory.
 *
 * `createForm()` produces a plain config object that can be called at module
 * scope (outside React). The returned `FormDefinition` is then consumed by
 * `useForm()` inside a component to create reactive state.
 */

import type { ValidatorFn, AsyncValidatorFn } from './validators'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface FieldConfig {
  initial: unknown
  validate?: ValidatorFn
  validateAsync?: AsyncValidatorFn
}

export interface FormConfig<T extends Record<string, FieldConfig>> {
  fields: T
  onSubmit: (values: { [K in keyof T]: T[K]['initial'] }) => void | Promise<void>
  onError?: (errors: Partial<Record<keyof T, string>>) => void
  validateOn?: 'blur' | 'change' | 'submit'   // default: 'blur'
  revalidateOn?: 'change' | 'blur' | 'submit'  // default: 'change'
}

export interface FormDefinition<T extends Record<string, FieldConfig>> {
  fields: T
  onSubmit: FormConfig<T>['onSubmit']
  onError?: FormConfig<T>['onError']
  validateOn: 'blur' | 'change' | 'submit'
  revalidateOn: 'change' | 'blur' | 'submit'
}

// ─── Factory ────────────────────────────────────────────────────────────────

export function createForm<T extends Record<string, FieldConfig>>(
  config: FormConfig<T>,
): FormDefinition<T> {
  return {
    fields: config.fields,
    onSubmit: config.onSubmit,
    onError: config.onError,
    validateOn: config.validateOn ?? 'blur',
    revalidateOn: config.revalidateOn ?? 'change',
  }
}
