import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react'

export interface LiteSelectOption {
  value: string
  label: string
  disabled?: boolean
  group?: string
}

export interface LiteSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: ReactNode
  options: LiteSelectOption[]
  error?: string
  size?: 'sm' | 'md' | 'lg'
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, LiteSelectProps>(
  ({ label, options, error, size = 'md', placeholder, className, id, name, ...rest }, ref) => {
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
    return (
      <div className={`ui-lite-select${className ? ` ${className}` : ''}`} data-size={size}>
        {label && <label htmlFor={selectId}>{label}</label>}
        <select ref={ref} id={selectId} name={name} aria-invalid={!!error} {...rest}>
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
  }
)
Select.displayName = 'Select'
