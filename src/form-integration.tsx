'use client'

import type React from 'react'
import { Controller, type Control, type FieldValues, type Path, type RegisterOptions } from 'react-hook-form'
import { FormInput, INPUT_CLS } from './components/form-input'
import { Select, type SelectOption } from './components/select'
import { Checkbox } from './components/checkbox'
import { ToggleSwitch } from './components/toggle-switch'
import { cn } from './utils'

// ── Shared error display ──────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="mt-1 text-xs text-[hsl(var(--status-critical))]">{message}</p>
  )
}

// ── RHFFormInput ──────────────────────────────────────────────────────────

export interface RHFFormInputProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  rules?: RegisterOptions<T, Path<T>>
  label: string
  type?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  hint?: string
  className?: string
  autoComplete?: string
}

/**
 * FormInput wrapper for react-hook-form.
 * Shows validation errors from fieldState.error automatically.
 */
export function RHFFormInput<T extends FieldValues>({
  control, name, rules, label, type = 'text',
  placeholder, required, disabled, hint, className, autoComplete,
}: RHFFormInputProps<T>): React.JSX.Element {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <div className={cn('space-y-1.5', className)}>
          <FormInput
            label={label}
            value={field.value ?? ''}
            onChange={field.onChange}
            type={type}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            hint={fieldState.error ? undefined : hint}
            autoComplete={autoComplete}
          />
          <FieldError message={fieldState.error?.message} />
        </div>
      )}
    />
  )
}

// ── RHFSelect ─────────────────────────────────────────────────────────────

export interface RHFSelectProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  rules?: RegisterOptions<T, Path<T>>
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
  label?: string
}

/**
 * Select wrapper for react-hook-form.
 * Shows validation errors from fieldState.error automatically.
 */
export function RHFSelect<T extends FieldValues>({
  control, name, rules, options, placeholder, disabled, className, label,
}: RHFSelectProps<T>): React.JSX.Element {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <div className={cn('space-y-1.5', className)}>
          {label && (
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[hsl(var(--text-secondary))]">
              {label}
            </label>
          )}
          <Select
            value={field.value ?? ''}
            onValueChange={field.onChange}
            options={options}
            placeholder={placeholder}
            disabled={disabled}
            className={fieldState.error ? 'border-[hsl(var(--status-critical))]' : undefined}
          />
          <FieldError message={fieldState.error?.message} />
        </div>
      )}
    />
  )
}

// ── RHFCheckbox ───────────────────────────────────────────────────────────

export interface RHFCheckboxProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  rules?: RegisterOptions<T, Path<T>>
  label?: string
  disabled?: boolean
  className?: string
}

/**
 * Checkbox wrapper for react-hook-form.
 * Shows validation errors from fieldState.error automatically.
 */
export function RHFCheckbox<T extends FieldValues>({
  control, name, rules, label, disabled, className,
}: RHFCheckboxProps<T>): React.JSX.Element {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <div className={cn('space-y-1', className)}>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={!!field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              disabled={disabled}
            />
            {label && (
              <span className="text-sm text-[hsl(var(--text-primary))]">{label}</span>
            )}
          </div>
          <FieldError message={fieldState.error?.message} />
        </div>
      )}
    />
  )
}

// ── RHFToggleSwitch ───────────────────────────────────────────────────────

export interface RHFToggleSwitchProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  rules?: RegisterOptions<T, Path<T>>
  label?: string
  disabled?: boolean
  className?: string
}

/**
 * ToggleSwitch wrapper for react-hook-form.
 * Shows validation errors from fieldState.error automatically.
 */
export function RHFToggleSwitch<T extends FieldValues>({
  control, name, rules, label, disabled, className,
}: RHFToggleSwitchProps<T>): React.JSX.Element {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <div className={cn('space-y-1', className)}>
          <div className="flex items-center gap-2">
            <ToggleSwitch
              enabled={!!field.value}
              onChange={field.onChange}
              disabled={disabled}
            />
            {label && (
              <span className="text-sm text-[hsl(var(--text-primary))]">{label}</span>
            )}
          </div>
          <FieldError message={fieldState.error?.message} />
        </div>
      )}
    />
  )
}
