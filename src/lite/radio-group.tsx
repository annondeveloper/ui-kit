import { forwardRef, useState, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteRadioOption {
  value: string
  label: ReactNode
  disabled?: boolean
}

export interface LiteRadioGroupProps extends Omit<HTMLAttributes<HTMLFieldSetElement>, 'onChange'> {
  name: string
  /** Legend rendered as <legend>; alias: label */
  legend?: ReactNode
  /** Alias for legend */
  label?: ReactNode
  options: LiteRadioOption[]
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  orientation?: 'horizontal' | 'vertical'
  error?: string
  size?: 'sm' | 'md' | 'lg'
}

export const RadioGroup = forwardRef<HTMLFieldSetElement, LiteRadioGroupProps>(
  ({ name, legend, label, options, value: controlledValue, defaultValue, onChange, orientation = 'vertical', error, size, className, ...rest }, ref) => {
    const [internal, setInternal] = useState(defaultValue ?? '')
    const value = controlledValue !== undefined ? controlledValue : internal

    const handleChange = (v: string) => {
      if (controlledValue === undefined) setInternal(v)
      onChange?.(v)
    }

    return (
      <fieldset
        ref={ref}
        className={`ui-lite-radio-group${className ? ` ${className}` : ''}`}
        data-orientation={orientation}
        data-size={size}
        aria-invalid={!!error}
        {...rest}
      >
        {(legend ?? label) && <legend>{legend ?? label}</legend>}
        {options.map(opt => (
          <label key={opt.value} className="ui-lite-radio-group__option">
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              disabled={opt.disabled}
              onChange={() => handleChange(opt.value)}
            />
            <span>{opt.label}</span>
          </label>
        ))}
        {error && <span className="ui-lite-radio-group__error">{error}</span>}
      </fieldset>
    )
  }
)
RadioGroup.displayName = 'RadioGroup'
