/**
 * `<Form>` — wraps a native `<form>` element and provides form context to children.
 *
 * Usage:
 *   const form = useForm(definition)
 *   <Form form={form}>
 *     <input {...form.getFieldProps('email')} />
 *     <button type="submit">Submit</button>
 *   </Form>
 */

import { type FormEvent, type ReactNode, useCallback } from 'react'
import { FormContextProvider } from './form-context'
import type { FormState } from './use-form'

export interface FormProps {
  /** Form state object returned by `useForm()`. */
  form: FormState<any>
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  /** Disable native browser validation. Defaults to `true` since we handle validation ourselves. */
  noValidate?: boolean
  /** Additional callback invoked after successful form submission (after `onSubmit` in the definition). */
  onSubmit?: () => void
}

export function Form({
  form,
  children,
  className,
  style,
  noValidate = true,
  onSubmit,
}: FormProps) {
  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()

      // Pre-validate synchronously so we know whether to call onSubmit.
      // handleSubmit() also validates, but its promise resolves regardless of
      // validity — we can't distinguish success from validation failure after
      // the fact without modifying handleSubmit's return type.
      const isValid = form.validateAll()
      if (!isValid) {
        // Still call handleSubmit to trigger onError, touch all fields, etc.
        form.handleSubmit()
        return
      }

      form.handleSubmit().then(() => {
        onSubmit?.()
      })
    },
    [form, onSubmit],
  )

  return (
    <FormContextProvider form={form}>
      <form
        onSubmit={handleSubmit}
        noValidate={noValidate}
        className={className}
        style={style}
      >
        {children}
      </form>
    </FormContextProvider>
  )
}
