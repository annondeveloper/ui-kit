import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react'

export interface LiteComboboxOption {
  value: string
  label: string
  disabled?: boolean
}

export interface LiteComboboxProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'onChange'> {
  label?: ReactNode
  options: LiteComboboxOption[]
  error?: string
  placeholder?: string
  /** Controlled value */
  value?: string
  /** Uncontrolled default value */
  defaultValue?: string
  disabled?: boolean
  /** data-size attribute on wrapper */
  size?: 'sm' | 'md' | 'lg'
  /** Called with the selected value string */
  onChange?: (value: string) => void
  /** Interface only — not possible with native select */
  onSearch?: (query: string) => void
  /** Interface only — not possible with native select */
  allowCreate?: boolean
  /** Interface only — called when a new option is created */
  onCreate?: (value: string) => void
  /** Interface only — show loading state */
  loading?: boolean
  /** Interface only — message shown when no options match */
  emptyMessage?: ReactNode
}

/** Lite combobox — falls back to a native select (no search/filter) */
export const Combobox = forwardRef<HTMLSelectElement, LiteComboboxProps>(
  (
    {
      label,
      options,
      error,
      placeholder,
      className,
      id,
      name,
      value,
      defaultValue,
      disabled,
      size = 'md',
      onChange,
      // destructure interface-only props so they don't land on <select>
      onSearch: _onSearch,
      allowCreate: _allowCreate,
      onCreate: _onCreate,
      loading: _loading,
      emptyMessage: _emptyMessage,
      ...rest
    },
    ref,
  ) => {
    const selectId = id ?? (name ? `lite-combobox-${name}` : undefined)
    return (
      <div className={`ui-lite-select${className ? ` ${className}` : ''}`} data-size={size}>
        {label && <label htmlFor={selectId}>{label}</label>}
        <select
          ref={ref}
          id={selectId}
          name={name}
          aria-invalid={!!error}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          onChange={onChange ? e => onChange(e.target.value) : undefined}
          {...rest}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map(o => (
            <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>
          ))}
        </select>
        {error && <span className="ui-lite-select__error">{error}</span>}
      </div>
    )
  },
)
Combobox.displayName = 'Combobox'
