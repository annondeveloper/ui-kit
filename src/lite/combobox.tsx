import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react'

export interface LiteComboboxOption {
  value: string
  label: string
  disabled?: boolean
}

export interface LiteComboboxProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: ReactNode
  options: LiteComboboxOption[]
  error?: string
  placeholder?: string
}

/** Lite combobox — falls back to a native select (no search/filter) */
export const Combobox = forwardRef<HTMLSelectElement, LiteComboboxProps>(
  ({ label, options, error, placeholder, className, id, name, ...rest }, ref) => {
    const selectId = id ?? (name ? `lite-combobox-${name}` : undefined)
    return (
      <div className={`ui-lite-select${className ? ` ${className}` : ''}`}>
        {label && <label htmlFor={selectId}>{label}</label>}
        <select ref={ref} id={selectId} name={name} aria-invalid={!!error} {...rest}>
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map(o => (
            <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>
          ))}
        </select>
        {error && <span className="ui-lite-select__error">{error}</span>}
      </div>
    )
  }
)
Combobox.displayName = 'Combobox'
