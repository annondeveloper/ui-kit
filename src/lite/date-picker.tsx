import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

export interface LiteDatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: ReactNode
  error?: string
  /** Controlled date value (YYYY-MM-DD) */
  value?: string
  /** Uncontrolled initial value */
  defaultValue?: string
  /** Min date (YYYY-MM-DD) */
  min?: string
  /** Max date (YYYY-MM-DD) */
  max?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  placeholder?: string
  /** Show week numbers in the picker (interface only; browser support varies) */
  showWeekNumbers?: boolean
  /** First day of week: 0=Sunday, 1=Monday (interface only) */
  firstDayOfWeek?: 0 | 1
  onChange?: React.ChangeEventHandler<HTMLInputElement>
}

export const DatePicker = forwardRef<HTMLInputElement, LiteDatePickerProps>(
  ({ label, error, value, defaultValue, min, max, disabled, size, placeholder, showWeekNumbers: _showWeekNumbers, firstDayOfWeek: _firstDayOfWeek, onChange, className, id, name, ...rest }, ref) => {
    const inputId = id ?? (name ? `lite-date-${name}` : undefined)
    return (
      <div className={`ui-lite-date-picker${className ? ` ${className}` : ''}`} data-size={size}>
        {label && <label htmlFor={inputId}>{label}</label>}
        <input
          ref={ref}
          type="date"
          id={inputId}
          name={name}
          value={value}
          defaultValue={defaultValue}
          min={min}
          max={max}
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={!!error}
          onChange={onChange}
          {...rest}
        />
        {error && <span className="ui-lite-date-picker__error">{error}</span>}
      </div>
    )
  }
)
DatePicker.displayName = 'DatePicker'
