import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteRadioOption {
  value: string
  label: ReactNode
  disabled?: boolean
}

export interface LiteRadioGroupProps extends Omit<HTMLAttributes<HTMLFieldSetElement>, 'onChange'> {
  name: string
  legend?: ReactNode
  options: LiteRadioOption[]
  value?: string
  onChange?: (value: string) => void
  orientation?: 'horizontal' | 'vertical'
}

export const RadioGroup = forwardRef<HTMLFieldSetElement, LiteRadioGroupProps>(
  ({ name, legend, options, value, onChange, orientation = 'vertical', className, ...rest }, ref) => (
    <fieldset
      ref={ref}
      className={`ui-lite-radio-group${className ? ` ${className}` : ''}`}
      data-orientation={orientation}
      {...rest}
    >
      {legend && <legend>{legend}</legend>}
      {options.map(opt => (
        <label key={opt.value} className="ui-lite-radio-group__option">
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value !== undefined ? value === opt.value : undefined}
            disabled={opt.disabled}
            onChange={() => onChange?.(opt.value)}
          />
          <span>{opt.label}</span>
        </label>
      ))}
    </fieldset>
  )
)
RadioGroup.displayName = 'RadioGroup'
