import { forwardRef, useEffect, useRef, type InputHTMLAttributes, type ReactNode } from 'react'

export interface LiteCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: ReactNode
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  indeterminate?: boolean
  error?: string
}

export const Checkbox = forwardRef<HTMLInputElement, LiteCheckboxProps>(
  ({ label, size = 'md', indeterminate = false, error, className, disabled, id, ...rest }, ref) => {
    const internalRef = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
      if (internalRef.current) {
        internalRef.current.indeterminate = indeterminate
      }
    }, [indeterminate])

    const setRefs = (el: HTMLInputElement | null) => {
      internalRef.current = el
      if (typeof ref === 'function') ref(el)
      else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el
    }

    const inputId = id ?? `lite-checkbox-${Math.random().toString(36).slice(2)}`

    return (
      <div
        className={`ui-lite-checkbox${className ? ` ${className}` : ''}`}
        data-size={size}
        {...(disabled ? { 'data-disabled': '' } : {})}
        {...(error ? { 'data-error': '' } : {})}
        {...(indeterminate ? { 'data-indeterminate': '' } : {})}
      >
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: disabled ? 'not-allowed' : 'pointer' }}>
          <input
            ref={setRefs}
            type="checkbox"
            id={inputId}
            disabled={disabled}
            aria-invalid={!!error}
            {...rest}
          />
          {label != null && <span>{label}</span>}
        </label>
        {error && (
          <span className="ui-lite-checkbox__error" role="alert" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--status-critical, oklch(65% 0.25 25))' }}>
            {error}
          </span>
        )}
      </div>
    )
  }
)
Checkbox.displayName = 'Checkbox'
