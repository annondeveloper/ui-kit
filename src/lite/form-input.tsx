import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

export interface LiteFormInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  name: string
  label?: ReactNode
  error?: string
  size?: 'sm' | 'md' | 'lg'
}

export const FormInput = forwardRef<HTMLInputElement, LiteFormInputProps>(
  ({ name, label, error, size = 'md', className, id, ...rest }, ref) => {
    const inputId = id ?? `lite-input-${name}`
    return (
      <div className={`ui-lite-form-input${className ? ` ${className}` : ''}`} data-size={size}>
        {label && <label htmlFor={inputId}>{label}</label>}
        <input ref={ref} id={inputId} name={name} aria-invalid={!!error} {...rest} />
        {error && <span className="ui-lite-form-input__error">{error}</span>}
      </div>
    )
  }
)
FormInput.displayName = 'FormInput'
