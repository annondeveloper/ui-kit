import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

export interface LiteColorInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: ReactNode
}

export const ColorInput = forwardRef<HTMLInputElement, LiteColorInputProps>(
  ({ label, className, ...rest }, ref) => (
    <div className={`ui-lite-color-input${className ? ` ${className}` : ''}`}>
      {label && <label>{label}</label>}
      <input ref={ref} type="color" {...rest} />
    </div>
  )
)
ColorInput.displayName = 'ColorInput'
