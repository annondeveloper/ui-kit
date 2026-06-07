import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const formInputStyles = css`
  @layer components {
    @scope (.ui-lite-form-input) {
      :scope {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-family: inherit;
      }
      label {
        font-size: 0.8125rem;
        font-weight: 500;
        color: var(--text-secondary, oklch(70% 0 0));
      }
      .ui-lite-form-input__required {
        color: oklch(62% 0.22 25);
      }
      input {
        inline-size: 100%;
        padding: 0.5rem 0.75rem;
        background: var(--bg-surface, oklch(12% 0.015 270));
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-md, 10px);
        color: var(--text-primary, oklch(97% 0 0));
        font-family: inherit;
        font-size: 0.875rem;
        line-height: 1.5;
      }
      input:focus {
        outline: none;
        border-color: var(--brand, oklch(65% 0.2 270));
        box-shadow: 0 0 0 3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15);
      }
      input::placeholder {
        color: var(--text-tertiary, oklch(60% 0 0));
      }

      /* Sizes */
      :scope[data-size="xs"] input { padding: 0.25rem 0.5rem; font-size: 0.6875rem; }
      :scope[data-size="sm"] input { padding: 0.375rem 0.5rem; font-size: 0.75rem; }
      :scope[data-size="lg"] input { padding: 0.625rem 1rem; font-size: 1rem; }
      :scope[data-size="xl"] input { padding: 0.75rem 1.25rem; font-size: 1.125rem; }

      /* Icon padding */
      :scope[data-has-icon] input { padding-inline-start: 2.25rem; }
      :scope[data-has-icon-end] input { padding-inline-end: 2.25rem; }

      /* Filled variant */
      :scope[data-variant="filled"] input {
        background: oklch(100% 0 0 / 0.06);
        border-color: transparent;
      }
      :scope[data-variant="filled"] input:focus {
        background: var(--bg-surface, oklch(12% 0.015 270));
        border-color: var(--brand, oklch(65% 0.2 270));
      }

      /* Invalid */
      :scope[data-invalid] input,
      input[aria-invalid="true"] {
        border-color: oklch(62% 0.22 25);
      }

      /* Icons */
      .ui-lite-form-input__icon,
      .ui-lite-form-input__icon-end {
        color: var(--text-tertiary, oklch(60% 0 0));
      }
      .ui-lite-form-input__clear {
        color: var(--text-secondary, oklch(70% 0 0));
      }
      .ui-lite-form-input__clear:hover {
        color: var(--text-primary, oklch(97% 0 0));
      }

      .ui-lite-form-input__description {
        font-size: 0.75rem;
        color: var(--text-secondary, oklch(70% 0 0));
        line-height: 1.4;
      }
      .ui-lite-form-input__error {
        font-size: 0.75rem;
        color: oklch(62% 0.22 25);
      }
      .ui-lite-form-input__counter {
        font-size: 0.75rem;
        color: var(--text-tertiary, oklch(60% 0 0));
        text-align: end;
        font-variant-numeric: tabular-nums;
      }

      @media (forced-colors: active) {
        input { border: 1px solid ButtonText; }
      }
    }
  }
`

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
    useStyles('lite-form-input', formInputStyles)
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
