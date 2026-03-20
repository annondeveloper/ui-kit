/**
 * React hook that creates reactive form state from a `FormDefinition`.
 *
 * Uses `useReducer` for predictable state transitions and exposes a rich API
 * for field management, validation, and submission.
 */

import { useReducer, useCallback, useRef, useMemo } from 'react'
import type { FieldConfig, FormDefinition } from './create-form'

// ─── Public types ───────────────────────────────────────────────────────────

export interface FieldProps {
  value: unknown
  onChange: (value: unknown) => void
  onBlur: () => void
  error: string | undefined
  touched: boolean
}

export interface FormState<T extends Record<string, FieldConfig>> {
  values: { [K in keyof T]: T[K]['initial'] }
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  dirty: boolean
  valid: boolean
  submitting: boolean
  submitCount: number

  setValue: (name: keyof T, value: unknown) => void
  setError: (name: keyof T, message: string | undefined) => void
  setTouched: (name: keyof T, touched?: boolean) => void
  validateField: (name: keyof T) => string | undefined
  validateAll: () => boolean
  handleSubmit: () => Promise<void>
  reset: (name?: keyof T) => void
  getFieldProps: (name: keyof T) => FieldProps
}

// ─── Internal types ─────────────────────────────────────────────────────────

interface InternalState {
  values: Record<string, unknown>
  errors: Record<string, string | undefined>
  touched: Record<string, boolean>
  dirty: boolean
  submitting: boolean
  submitCount: number
  /** Tracks which fields have been validated at least once (for revalidation). */
  validated: Record<string, boolean>
}

type Action =
  | { type: 'SET_VALUE'; name: string; value: unknown }
  | { type: 'SET_ERROR'; name: string; message: string | undefined }
  | { type: 'SET_TOUCHED'; name: string; touched: boolean }
  | { type: 'SET_ERRORS'; errors: Record<string, string | undefined> }
  | { type: 'SET_ALL_TOUCHED'; names: string[] }
  | { type: 'SET_SUBMITTING'; submitting: boolean }
  | { type: 'INCREMENT_SUBMIT' }
  | { type: 'RESET_FIELD'; name: string; initial: unknown }
  | { type: 'RESET_ALL'; initials: Record<string, unknown> }
  | { type: 'MARK_VALIDATED'; name: string }
  | { type: 'MARK_ALL_VALIDATED'; names: string[] }

// ─── Reducer ────────────────────────────────────────────────────────────────

function reducer(state: InternalState, action: Action): InternalState {
  switch (action.type) {
    case 'SET_VALUE':
      return {
        ...state,
        values: { ...state.values, [action.name]: action.value },
        dirty: true,
      }

    case 'SET_ERROR': {
      const errors = { ...state.errors }
      if (action.message === undefined) {
        delete errors[action.name]
      } else {
        errors[action.name] = action.message
      }
      return { ...state, errors }
    }

    case 'SET_TOUCHED':
      return {
        ...state,
        touched: { ...state.touched, [action.name]: action.touched },
      }

    case 'SET_ERRORS':
      return { ...state, errors: { ...action.errors } }

    case 'SET_ALL_TOUCHED': {
      const touched = { ...state.touched }
      for (const name of action.names) {
        touched[name] = true
      }
      return { ...state, touched }
    }

    case 'SET_SUBMITTING':
      return { ...state, submitting: action.submitting }

    case 'INCREMENT_SUBMIT':
      return { ...state, submitCount: state.submitCount + 1 }

    case 'RESET_FIELD':
      return {
        ...state,
        values: { ...state.values, [action.name]: action.initial },
        errors: (() => {
          const e = { ...state.errors }
          delete e[action.name]
          return e
        })(),
        touched: { ...state.touched, [action.name]: false },
        validated: { ...state.validated, [action.name]: false },
        // Recompute dirty: if all values match initials after this reset, not dirty.
        // We cannot know all initials here, so we keep dirty as-is for single field reset.
        dirty: state.dirty,
      }

    case 'RESET_ALL':
      return {
        values: { ...action.initials },
        errors: {},
        touched: {},
        dirty: false,
        submitting: false,
        submitCount: state.submitCount, // submitCount persists across resets
        validated: {},
      }

    case 'MARK_VALIDATED':
      return {
        ...state,
        validated: { ...state.validated, [action.name]: true },
      }

    case 'MARK_ALL_VALIDATED': {
      const validated = { ...state.validated }
      for (const name of action.names) {
        validated[name] = true
      }
      return { ...state, validated }
    }

    default:
      return state
  }
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useForm<T extends Record<string, FieldConfig>>(
  definition: FormDefinition<T>,
): FormState<T> {
  const defRef = useRef(definition)
  defRef.current = definition

  const fieldNames = useMemo(
    () => Object.keys(definition.fields),
    // Fields shape is static per definition, so we only compute once
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const initials = useMemo(() => {
    const vals: Record<string, unknown> = {}
    for (const name of fieldNames) {
      vals[name] = definition.fields[name].initial
    }
    return vals
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [state, dispatch] = useReducer(reducer, {
    values: { ...initials },
    errors: {},
    touched: {},
    dirty: false,
    submitting: false,
    submitCount: 0,
    validated: {},
  })

  // ── validateField ───────────────────────────────────────────────────────

  const validateField = useCallback(
    (name: keyof T): string | undefined => {
      const fieldName = name as string
      const config = defRef.current.fields[fieldName]
      if (!config?.validate) {
        dispatch({ type: 'SET_ERROR', name: fieldName, message: undefined })
        dispatch({ type: 'MARK_VALIDATED', name: fieldName })
        return undefined
      }

      const error = config.validate(state.values[fieldName], state.values)
      dispatch({ type: 'SET_ERROR', name: fieldName, message: error })
      dispatch({ type: 'MARK_VALIDATED', name: fieldName })
      return error
    },
    [state.values],
  )

  // ── validateAll ─────────────────────────────────────────────────────────

  const validateAll = useCallback((): boolean => {
    const errors: Record<string, string | undefined> = {}
    let allValid = true

    for (const name of fieldNames) {
      const config = defRef.current.fields[name]
      if (config?.validate) {
        const error = config.validate(state.values[name], state.values)
        if (error) {
          errors[name] = error
          allValid = false
        }
      }
    }

    dispatch({ type: 'SET_ERRORS', errors })
    dispatch({ type: 'SET_ALL_TOUCHED', names: fieldNames })
    dispatch({ type: 'MARK_ALL_VALIDATED', names: fieldNames })
    return allValid
  }, [fieldNames, state.values])

  // ── setValue ─────────────────────────────────────────────────────────────

  const setValue = useCallback(
    (name: keyof T, value: unknown) => {
      const fieldName = name as string
      dispatch({ type: 'SET_VALUE', name: fieldName, value })

      const def = defRef.current

      // Validate on change if configured
      if (def.validateOn === 'change') {
        const config = def.fields[fieldName]
        if (config?.validate) {
          const error = config.validate(value, { ...state.values, [fieldName]: value })
          dispatch({ type: 'SET_ERROR', name: fieldName, message: error })
          dispatch({ type: 'MARK_VALIDATED', name: fieldName })
        }
      }
      // Revalidate on change if field was previously validated and has error
      else if (def.revalidateOn === 'change' && state.validated[fieldName]) {
        const config = def.fields[fieldName]
        if (config?.validate) {
          const error = config.validate(value, { ...state.values, [fieldName]: value })
          dispatch({ type: 'SET_ERROR', name: fieldName, message: error })
        }
      }
    },
    [state.values, state.validated],
  )

  // ── setError ────────────────────────────────────────────────────────────

  const setError = useCallback((name: keyof T, message: string | undefined) => {
    dispatch({ type: 'SET_ERROR', name: name as string, message })
  }, [])

  // ── setTouched ──────────────────────────────────────────────────────────

  const setTouched = useCallback(
    (name: keyof T, touched = true) => {
      const fieldName = name as string
      dispatch({ type: 'SET_TOUCHED', name: fieldName, touched })

      const def = defRef.current
      if (def.validateOn === 'blur' && touched) {
        const config = def.fields[fieldName]
        if (config?.validate) {
          const error = config.validate(state.values[fieldName], state.values)
          dispatch({ type: 'SET_ERROR', name: fieldName, message: error })
          dispatch({ type: 'MARK_VALIDATED', name: fieldName })
        }
      }
    },
    [state.values],
  )

  // ── handleSubmit ────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    dispatch({ type: 'INCREMENT_SUBMIT' })

    // Validate all fields
    const errors: Record<string, string | undefined> = {}
    let allValid = true

    for (const name of fieldNames) {
      const config = defRef.current.fields[name]
      if (config?.validate) {
        const error = config.validate(state.values[name], state.values)
        if (error) {
          errors[name] = error
          allValid = false
        }
      }
    }

    dispatch({ type: 'SET_ERRORS', errors })
    dispatch({ type: 'SET_ALL_TOUCHED', names: fieldNames })
    dispatch({ type: 'MARK_ALL_VALIDATED', names: fieldNames })

    if (!allValid) {
      // Filter out undefined entries for onError callback
      const definedErrors: Partial<Record<string, string>> = {}
      for (const [key, val] of Object.entries(errors)) {
        if (val !== undefined) definedErrors[key] = val
      }
      defRef.current.onError?.(definedErrors as Partial<Record<keyof T, string>>)
      return
    }

    dispatch({ type: 'SET_SUBMITTING', submitting: true })
    try {
      await defRef.current.onSubmit(state.values as { [K in keyof T]: T[K]['initial'] })
    } catch {
      // Submit errors are caught so they don't crash the app.
      // The consumer can handle errors inside onSubmit itself.
    } finally {
      dispatch({ type: 'SET_SUBMITTING', submitting: false })
    }
  }, [fieldNames, state.values])

  // ── reset ───────────────────────────────────────────────────────────────

  const reset = useCallback(
    (name?: keyof T) => {
      if (name !== undefined) {
        const fieldName = name as string
        dispatch({ type: 'RESET_FIELD', name: fieldName, initial: initials[fieldName] })
      } else {
        dispatch({ type: 'RESET_ALL', initials })
      }
    },
    [initials],
  )

  // ── getFieldProps ───────────────────────────────────────────────────────

  const getFieldProps = useCallback(
    (name: keyof T): FieldProps => {
      const fieldName = name as string
      return {
        value: state.values[fieldName],
        onChange: (value: unknown) => setValue(name, value),
        onBlur: () => setTouched(name, true),
        error: state.errors[fieldName],
        touched: state.touched[fieldName] ?? false,
      }
    },
    [state.values, state.errors, state.touched, setValue, setTouched],
  )

  // ── Computed ────────────────────────────────────────────────────────────

  const valid = useMemo(() => {
    return !Object.values(state.errors).some((e) => e !== undefined)
  }, [state.errors])

  // ── Return ──────────────────────────────────────────────────────────────

  return {
    values: state.values as { [K in keyof T]: T[K]['initial'] },
    errors: state.errors as Partial<Record<keyof T, string>>,
    touched: state.touched as Partial<Record<keyof T, boolean>>,
    dirty: state.dirty,
    valid,
    submitting: state.submitting,
    submitCount: state.submitCount,
    setValue,
    setError,
    setTouched,
    validateField,
    validateAll,
    handleSubmit,
    reset,
    getFieldProps,
  }
}
