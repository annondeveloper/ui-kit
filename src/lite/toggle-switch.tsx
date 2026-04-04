import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

export interface LiteToggleSwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: ReactNode
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  error?: string
}

export const ToggleSwitch = forwardRef<HTMLInputElement, LiteToggleSwitchProps>(
  ({ label, size = 'md', error, className, disabled, id, ...rest }, ref) => {
    const inputId = id ?? `lite-toggle-${Math.random().toString(36).slice(2)}`
    const errorId = error ? `${inputId}-error` : undefined

    return (
      <div
        className={`ui-lite-toggle-switch${className ? ` ${className}` : ''}`}
        data-size={size}
        {...(disabled ? { 'data-disabled': '' } : {})}
        {...(error ? { 'data-error': '' } : {})}
      >
        <label htmlFor={inputId} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: disabled ? 'not-allowed' : 'pointer' }}>
          <input
            ref={ref}
            type="checkbox"
            role="switch"
            id={inputId}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={errorId}
            {...rest}
          />
          {label != null && <span>{label}</span>}
        </label>
        {error && (
          <span id={errorId} className="ui-lite-toggle-switch__error" role="alert" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--status-critical, oklch(65% 0.25 25))' }}>
            {error}
          </span>
        )}
      </div>
    )
  }
)
ToggleSwitch.displayName = 'ToggleSwitch'
