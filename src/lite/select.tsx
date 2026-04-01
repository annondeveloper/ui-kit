import { forwardRef, type ChangeEvent, type SelectHTMLAttributes, type ReactNode } from 'react'

export interface LiteSelectOption {
  value: string
  label: string
  disabled?: boolean
  group?: string
}

export interface LiteSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'onChange'> {
  label?: ReactNode
  options: LiteSelectOption[]
  error?: string
  size?: 'sm' | 'md' | 'lg'
  placeholder?: string
  /** Controlled value */
  value?: string | string[]
  /** Uncontrolled default value */
  defaultValue?: string | string[]
  disabled?: boolean
  /** Allow multiple selections — wired to native select */
  multiple?: boolean
  /** Called with the selected value string (or comma-joined for multiple) */
  onChange?: (value: string) => void
  /** Interface only — not possible with native select */
  clearable?: boolean
  /** Interface only — not possible with native select */
  searchable?: boolean
}

export const Select = forwardRef<HTMLSelectElement, LiteSelectProps>(
  (
    {
      label,
      options,
      error,
      size = 'md',
      placeholder,
      className,
      id,
      name,
      value,
      defaultValue,
      disabled,
      multiple,
      onChange,
      // destructure interface-only props so they don't land on <select>
      clearable: _clearable,
      searchable: _searchable,
      ...rest
    },
    ref,
  ) => {
    const selectId = id ?? (name ? `lite-select-${name}` : undefined)
    const groups = new Map<string, LiteSelectOption[]>()
    const ungrouped: LiteSelectOption[] = []
    for (const opt of options) {
      if (opt.group) {
        const g = groups.get(opt.group) ?? []
        g.push(opt)
        groups.set(opt.group, g)
      } else {
        ungrouped.push(opt)
      }
    }

    function handleChange(e: ChangeEvent<HTMLSelectElement>) {
      if (!onChange) return
      if (multiple) {
        const selected = Array.from(e.target.selectedOptions).map(o => o.value)
        onChange(selected.join(','))
      } else {
        onChange(e.target.value)
      }
    }

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
          multiple={multiple}
          onChange={handleChange}
          {...rest}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {ungrouped.map(o => (
            <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>
          ))}
          {[...groups.entries()].map(([group, opts]) => (
            <optgroup key={group} label={group}>
              {opts.map(o => (
                <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
        {error && <span className="ui-lite-select__error">{error}</span>}
      </div>
    )
  },
)
Select.displayName = 'Select'
