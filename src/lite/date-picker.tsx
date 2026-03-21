import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

export interface LiteDatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: ReactNode
  error?: string
}

export const DatePicker = forwardRef<HTMLInputElement, LiteDatePickerProps>(
  ({ label, error, className, id, name, ...rest }, ref) => {
    const inputId = id ?? (name ? `lite-date-${name}` : undefined)
    return (
      <div className={`ui-lite-date-picker${className ? ` ${className}` : ''}`}>
        {label && <label htmlFor={inputId}>{label}</label>}
        <input ref={ref} type="date" id={inputId} name={name} aria-invalid={!!error} {...rest} />
        {error && <span className="ui-lite-date-picker__error">{error}</span>}
      </div>
    )
  }
)
DatePicker.displayName = 'DatePicker'
