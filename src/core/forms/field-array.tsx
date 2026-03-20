/**
 * `<FieldArray>` — dynamic form fields (tags, line items, invoices).
 *
 * Uses a render prop pattern to expose array manipulation helpers:
 *
 *   <FieldArray name="items">
 *     {({ fields, append, remove, move, insert }) => (
 *       fields.map((field, index) => (
 *         <div key={field.key}>
 *           <input {...form.getFieldProps(`items.${index}.name`)} />
 *           <button onClick={() => remove(index)}>✕</button>
 *         </div>
 *       ))
 *     )}
 *   </FieldArray>
 */

import { useState, useCallback, type ReactNode } from 'react'
import { useFormContext } from './form-context'

export interface FieldArrayItem {
  /** Stable key for React rendering — persists across reorders and removals. */
  key: string
}

export interface FieldArrayRenderProps {
  /** Array of items with stable keys for React `key` prop. */
  fields: FieldArrayItem[]
  /** Add an item to the end of the array. */
  append: (defaultValues?: Record<string, unknown>) => void
  /** Remove the item at `index`. */
  remove: (index: number) => void
  /** Move item from one position to another. */
  move: (from: number, to: number) => void
  /** Insert an item at a specific position. */
  insert: (index: number, defaultValues?: Record<string, unknown>) => void
}

export interface FieldArrayProps {
  /** Name of the array field in the form values. */
  name: string
  /** Render prop receiving the field array helpers. */
  children: (props: FieldArrayRenderProps) => ReactNode
}

let fieldKeyCounter = 0

export function FieldArray({ name, children }: FieldArrayProps) {
  const form = useFormContext()

  const [keys, setKeys] = useState<string[]>(() => {
    const value = form.values[name]
    if (Array.isArray(value)) {
      return value.map(() => `fa-${fieldKeyCounter++}`)
    }
    return []
  })

  const append = useCallback(
    (defaultValues?: Record<string, unknown>) => {
      const currentArray = (form.values[name] as unknown[]) ?? []
      const newItem = defaultValues ?? {}
      form.setValue(name, [...currentArray, newItem])
      setKeys((prev) => [...prev, `fa-${fieldKeyCounter++}`])
    },
    [form, name],
  )

  const remove = useCallback(
    (index: number) => {
      const currentArray = (form.values[name] as unknown[]) ?? []
      form.setValue(
        name,
        currentArray.filter((_, i) => i !== index),
      )
      setKeys((prev) => prev.filter((_, i) => i !== index))
    },
    [form, name],
  )

  const move = useCallback(
    (from: number, to: number) => {
      const currentArray = [...((form.values[name] as unknown[]) ?? [])]
      const [item] = currentArray.splice(from, 1)
      currentArray.splice(to, 0, item)
      form.setValue(name, currentArray)

      setKeys((prev) => {
        const newKeys = [...prev]
        const [key] = newKeys.splice(from, 1)
        newKeys.splice(to, 0, key)
        return newKeys
      })
    },
    [form, name],
  )

  const insert = useCallback(
    (index: number, defaultValues?: Record<string, unknown>) => {
      const currentArray = [...((form.values[name] as unknown[]) ?? [])]
      currentArray.splice(index, 0, defaultValues ?? {})
      form.setValue(name, currentArray)

      setKeys((prev) => {
        const newKeys = [...prev]
        newKeys.splice(index, 0, `fa-${fieldKeyCounter++}`)
        return newKeys
      })
    },
    [form, name],
  )

  const fields: FieldArrayItem[] = keys.map((key) => ({ key }))

  return <>{children({ fields, append, remove, move, insert })}</>
}
