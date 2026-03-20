/**
 * Form context — lets child components auto-wire to the nearest form.
 *
 * Usage:
 *   <FormContextProvider form={form}>
 *     <MyField />   // can use useFormContext() to get form state
 *   </FormContextProvider>
 */

import { createContext, useContext, type ReactNode } from 'react'
import type { FormState } from './use-form'
import type { FieldConfig } from './create-form'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FormContext = createContext<FormState<any> | null>(null)

export interface FormContextProviderProps {
  form: FormState<Record<string, FieldConfig>>
  children: ReactNode
}

export function FormContextProvider({ form, children }: FormContextProviderProps) {
  return <FormContext.Provider value={form}>{children}</FormContext.Provider>
}

/**
 * Retrieve the form state from the nearest `<FormContextProvider>`.
 * Throws if used outside a provider.
 */
export function useFormContext<
  T extends Record<string, FieldConfig> = Record<string, FieldConfig>,
>(): FormState<T> {
  const ctx = useContext(FormContext)
  if (!ctx) {
    throw new Error('useFormContext must be used within a <Form> component')
  }
  return ctx as FormState<T>
}

/**
 * Like `useFormContext`, but returns `null` instead of throwing when
 * used outside a provider. Useful for standalone components that can
 * optionally bind to a form.
 */
export function useFormContextOptional<
  T extends Record<string, FieldConfig> = Record<string, FieldConfig>,
>(): FormState<T> | null {
  return useContext(FormContext) as FormState<T> | null
}
