import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

export interface LiteToggleSwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode
}

export const ToggleSwitch = forwardRef<HTMLInputElement, LiteToggleSwitchProps>(
  ({ label, className, ...rest }, ref) => (
    <label className={`ui-lite-toggle${className ? ` ${className}` : ''}`}>
      <input ref={ref} type="checkbox" role="switch" {...rest} />
      {label != null && <span>{label}</span>}
    </label>
  )
)
ToggleSwitch.displayName = 'ToggleSwitch'
