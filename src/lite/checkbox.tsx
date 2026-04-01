import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

export interface LiteCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode
}

export const Checkbox = forwardRef<HTMLInputElement, LiteCheckboxProps>(
  ({ label, className, ...rest }, ref) => (
    <label className={`ui-lite-checkbox${className ? ` ${className}` : ''}`}>
      <input ref={ref} type="checkbox" {...rest} />
      {label != null && <span>{label}</span>}
    </label>
  )
)
Checkbox.displayName = 'Checkbox'
