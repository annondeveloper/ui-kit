import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const toggleSwitchStyles = css`
  @layer components {
    @scope (.ui-lite-toggle-switch) {
      :scope {
        display: inline-flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.875rem;
        color: var(--text-primary, oklch(97% 0 0));
      }
      input[type="checkbox"] {
        appearance: none;
        -webkit-appearance: none;
        inline-size: 36px;
        block-size: 20px;
        background: oklch(50% 0 0 / 0.2);
        border-radius: 9999px;
        position: relative;
        cursor: pointer;
        flex-shrink: 0;
      }
      input[type="checkbox"]::before {
        content: '';
        position: absolute;
        inset-block-start: 2px;
        inset-inline-start: 2px;
        inline-size: 16px;
        block-size: 16px;
        background: oklch(100% 0 0);
        border-radius: 50%;
      }
      input[type="checkbox"]:checked {
        background: var(--brand, oklch(65% 0.2 270));
      }
      input[type="checkbox"]:checked::before {
        transform: translateX(16px);
      }
      input[type="checkbox"]:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }
      input[type="checkbox"]:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      :scope[data-size="xs"] input[type="checkbox"] { inline-size: 28px; block-size: 16px; }
      :scope[data-size="xs"] input[type="checkbox"]::before { inline-size: 12px; block-size: 12px; }
      :scope[data-size="xs"] input[type="checkbox"]:checked::before { transform: translateX(12px); }
      :scope[data-size="sm"] input[type="checkbox"] { inline-size: 32px; block-size: 18px; }
      :scope[data-size="sm"] input[type="checkbox"]::before { inline-size: 14px; block-size: 14px; }
      :scope[data-size="sm"] input[type="checkbox"]:checked::before { transform: translateX(14px); }
      :scope[data-size="lg"] input[type="checkbox"] { inline-size: 44px; block-size: 24px; }
      :scope[data-size="lg"] input[type="checkbox"]::before { inline-size: 20px; block-size: 20px; }
      :scope[data-size="lg"] input[type="checkbox"]:checked::before { transform: translateX(20px); }
      :scope[data-size="xl"] input[type="checkbox"] { inline-size: 52px; block-size: 28px; }
      :scope[data-size="xl"] input[type="checkbox"]::before { inline-size: 24px; block-size: 24px; }
      :scope[data-size="xl"] input[type="checkbox"]:checked::before { transform: translateX(24px); }
      .ui-lite-toggle-switch__error {
        font-size: 0.75rem;
        color: var(--status-critical, oklch(62% 0.22 25));
      }
    }
  }
`

export interface LiteToggleSwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: ReactNode
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  error?: string
}

export const ToggleSwitch = forwardRef<HTMLInputElement, LiteToggleSwitchProps>(
  ({ label, size = 'md', error, className, disabled, id, ...rest }, ref) => {
    useStyles('lite-toggle-switch', toggleSwitchStyles)
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
