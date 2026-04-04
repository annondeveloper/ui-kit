/**
 * @module @annondeveloper/ui-kit/form
 *
 * Built-in form engine with zero external dependencies. Create type-safe forms
 * with validation, field arrays, and auto-wiring to ui-kit form components.
 *
 * @example
 * ```tsx
 * import { createForm, useForm, v } from '@annondeveloper/ui-kit/form'
 *
 * const LoginForm = createForm({
 *   email: { validator: v.compose(v.required(), v.email()) },
 *   password: { validator: v.required() },
 * })
 * ```
 */
export { createForm, type FormConfig, type FormDefinition, type FieldConfig } from './core/forms/create-form'
export { useForm, type FormState } from './core/forms/use-form'
export { Form, type FormProps } from './core/forms/form-component'
export { FieldArray, type FieldArrayProps, type FieldArrayRenderProps } from './core/forms/field-array'
export { v, type ValidatorFn, type AsyncValidatorFn } from './core/forms/validators'
export { useFormContext, useFormContextOptional } from './core/forms/form-context'
