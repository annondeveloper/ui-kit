'use client'

import { cn } from '../utils'

// ── Shared class constants ──────────────────────────────────────────────────
// Import these in any page that needs raw class strings (e.g. for <textarea>)

export const INPUT_CLS = cn(
  'w-full rounded-lg border border-[hsl(var(--border-default))]',
  'bg-[hsl(var(--bg-base))] px-3 py-2 text-sm',
  'text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))]',
  'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-primary))]',
  'disabled:opacity-50 disabled:cursor-not-allowed',
)

export const LABEL_CLS = cn(
  'mb-1.5 block text-xs font-medium uppercase tracking-wider',
  'text-[hsl(var(--text-secondary))]',
)

export const TEXTAREA_CLS = cn(
  INPUT_CLS,
  'resize-none font-mono text-xs leading-relaxed',
)

export interface FormInputProps {
  /** Label text displayed above the input. */
  label: string
  /** Current input value. */
  value: string
  /** Callback when value changes. */
  onChange: (value: string) => void
  /** HTML input type. */
  type?: string
  /** Placeholder text. */
  placeholder?: string
  /** Mark the field as required. */
  required?: boolean
  /** Disable the input. */
  disabled?: boolean
  /** Help text shown below the input. */
  hint?: string
  className?: string
  /** HTML autocomplete attribute. */
  autoComplete?: string
}

/**
 * @description A themed form input with label, validation indicator, and optional hint text.
 * Uses CSS custom property tokens for dark/light mode compatibility.
 */
export function FormInput({
  label, value, onChange, type = 'text',
  placeholder, required, disabled, hint, className, autoComplete,
}: FormInputProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className={LABEL_CLS}>
        {label}
        {required && <span className="text-[hsl(var(--status-critical))] ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        className={INPUT_CLS}
      />
      {hint && (
        <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{hint}</p>
      )}
    </div>
  )
}
