import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

export interface LiteFormInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  name: string
  label?: ReactNode
  description?: string
  error?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'filled'
  icon?: ReactNode
  iconEnd?: ReactNode
  maxLength?: number
  showCount?: boolean
  clearable?: boolean
  onClear?: () => void
  required?: boolean
  /** Accepted for API parity but ignored in Lite */
  classNames?: Partial<Record<'root' | 'label' | 'field' | 'icon' | 'iconEnd' | 'description' | 'error', string>>
}

export const FormInput = forwardRef<HTMLInputElement, LiteFormInputProps>(
  (
    {
      name,
      label,
      description,
      error,
      size = 'md',
      variant = 'default',
      icon,
      iconEnd,
      maxLength,
      showCount,
      clearable,
      onClear,
      required,
      classNames: _classNames,
      className,
      id,
      value,
      ...rest
    },
    ref
  ) => {
    const inputId = id ?? `lite-input-${name}`
    const descriptionId = description ? `${inputId}-description` : undefined
    const errorId = error ? `${inputId}-error` : undefined
    const describedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined

    const valueStr = typeof value === 'string' ? value : typeof value === 'number' ? String(value) : ''
    const valueLength = valueStr.length
    const showCounter = showCount || maxLength !== undefined
    const showClearButton = clearable && valueLength > 0

    return (
      <div
        className={`ui-lite-form-input${className ? ` ${className}` : ''}`}
        data-size={size}
        data-variant={variant}
        {...(error ? { 'data-invalid': '' } : {})}
        {...(icon ? { 'data-has-icon': '' } : {})}
        {...(iconEnd || clearable ? { 'data-has-icon-end': '' } : {})}
      >
        {label && (
          <label htmlFor={inputId}>
            {label}
            {required && (
              <span className="ui-lite-form-input__required" aria-hidden="true"> *</span>
            )}
          </label>
        )}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {icon && (
            <span className="ui-lite-form-input__icon" aria-hidden="true" style={{ position: 'absolute', insetInlineStart: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', blockSize: '100%', inlineSize: '2.25rem', pointerEvents: 'none' }}>
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            name={name}
            value={value}
            maxLength={maxLength}
            required={required}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            {...rest}
          />
          {iconEnd && (
            <span className="ui-lite-form-input__icon-end" aria-hidden="true" style={{ position: 'absolute', insetInlineEnd: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', blockSize: '100%', inlineSize: '2.25rem', pointerEvents: 'none' }}>
              {iconEnd}
            </span>
          )}
          {showClearButton && (
            <button
              type="button"
              className="ui-lite-form-input__clear"
              onClick={onClear}
              aria-label="Clear input"
              style={{ position: 'absolute', insetInlineEnd: '0.5rem', insetBlock: 0, display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
        {description && (
          <span id={descriptionId} className="ui-lite-form-input__description">
            {description}
          </span>
        )}
        {error && (
          <span id={errorId} className="ui-lite-form-input__error" role="alert">
            {error}
          </span>
        )}
        {showCounter && (
          <span className="ui-lite-form-input__counter" style={{ fontSize: '0.75rem', textAlign: 'end' }}>
            {maxLength !== undefined ? `${valueLength}/${maxLength}` : valueLength}
          </span>
        )}
      </div>
    )
  }
)
FormInput.displayName = 'FormInput'
