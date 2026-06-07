import { forwardRef, useEffect, useRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const checkboxStyles = css`
  @layer components {
    @scope (.ui-lite-checkbox) {
      :scope {
        display: inline-flex;
        flex-direction: column;
        gap: 0.25rem;
        font-family: inherit;
        color: var(--text-primary, oklch(97% 0 0));
        font-size: var(--text-sm, 0.875rem);
      }
      label {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
      }
      input[type="checkbox"] {
        inline-size: 18px;
        block-size: 18px;
        accent-color: var(--brand, oklch(65% 0.2 270));
        cursor: pointer;
        flex-shrink: 0;
      }
      input[type="checkbox"]:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      /* Sizes */
      :scope[data-size="xs"] input[type="checkbox"] { inline-size: 14px; block-size: 14px; }
      :scope[data-size="sm"] input[type="checkbox"] { inline-size: 16px; block-size: 16px; }
      :scope[data-size="lg"] input[type="checkbox"] { inline-size: 20px; block-size: 20px; }
      :scope[data-size="xl"] input[type="checkbox"] { inline-size: 24px; block-size: 24px; }

      /* Disabled */
      :scope[data-disabled] {
        opacity: 0.5;
      }
      :scope[data-disabled] label {
        cursor: not-allowed;
      }

      /* Error */
      :scope[data-error] input[type="checkbox"] {
        accent-color: var(--status-critical, oklch(62% 0.22 25));
        outline: 1px solid var(--status-critical, oklch(62% 0.22 25));
      }
      .ui-lite-checkbox__error {
        display: block;
        font-size: var(--text-xs, 0.75rem);
        color: var(--status-critical, oklch(62% 0.22 25));
      }
    }
  }
`

export interface LiteCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: ReactNode
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  indeterminate?: boolean
  error?: string
}

export const Checkbox = forwardRef<HTMLInputElement, LiteCheckboxProps>(
  ({ label, size = 'md', indeterminate = false, error, className, disabled, id, ...rest }, ref) => {
    useStyles('lite-checkbox', checkboxStyles)
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
