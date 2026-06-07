import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const datePickerStyles = css`
  @layer components {
    @scope (.ui-lite-date-picker) {
      :scope {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs, 0.25rem);
      }
      label {
        font-size: var(--text-sm, 0.8125rem);
        font-weight: 500;
        color: var(--text-secondary, oklch(70% 0 0));
      }
      input[type="date"] {
        padding: 0.5rem 0.75rem;
        background: var(--bg-surface, oklch(12% 0.015 270));
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-md, 0.5rem);
        color: var(--text-primary, oklch(97% 0 0));
        font-family: inherit;
        font-size: var(--text-sm, 0.875rem);
      }
      input[type="date"]:focus {
        outline: none;
        border-color: var(--brand, oklch(65% 0.2 270));
      }
      input[type="date"]:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      input[type="date"][aria-invalid="true"] {
        border-color: var(--status-critical, oklch(62% 0.22 25));
      }
      :scope[data-size="sm"] input[type="date"] { padding: 0.375rem 0.5rem; font-size: var(--text-xs, 0.75rem); }
      :scope[data-size="lg"] input[type="date"] { padding: 0.625rem 1rem; font-size: var(--text-base, 1rem); }
      .ui-lite-date-picker__error {
        font-size: var(--text-xs, 0.75rem);
        color: var(--status-critical, oklch(62% 0.22 25));
      }
      @media (forced-colors: active) {
        input[type="date"] { border: 1px solid ButtonText; }
      }
    }
  }
`

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
    useStyles('lite-date-picker', datePickerStyles)
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
