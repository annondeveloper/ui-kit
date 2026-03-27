'use client'

import {
  forwardRef,
  useCallback,
  useState,
  useEffect,
  type HTMLAttributes,
  type ChangeEvent,
  type FocusEvent,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useStableId } from '../core/a11y/stable-id'
import { useFormContextOptional } from '../core/forms/form-context'
import { cn } from '../core/utils/cn'

export interface PasswordInputProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  label?: string
  description?: string
  error?: string
  placeholder?: string
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  disabled?: boolean
  required?: boolean
  showStrengthMeter?: boolean
  strengthLabels?: string[]
  visibilityToggle?: boolean
  onStrengthChange?: (strength: number) => void
  motion?: 0 | 1 | 2 | 3
}

// ── Strength calculation ─────────────────────────────────────────────────────

function calculateStrength(password: string): number {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  // Map 0-5 to 0-4
  if (score === 0) return 0
  if (score <= 1) return 1
  if (score === 2) return 2
  if (score === 3) return 3
  return 4
}

const DEFAULT_STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong']

// ── Styles ──────────────────────────────────────────────────────────────────

const passwordInputStyles = css`
  @layer components {
    @scope (.ui-password-input) {
      :scope {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs, 0.25rem);
        position: relative;
        font-family: inherit;
      }

      .ui-password-input__label {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 500;
        color: var(--text-primary, oklch(90% 0 0));
        line-height: 1.4;
        user-select: none;
      }

      .ui-password-input__field-wrapper {
        position: relative;
        display: flex;
        align-items: center;
      }

      .ui-password-input__field {
        display: block;
        inline-size: 100%;
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.12));
        border-radius: var(--radius-md, 0.375rem);
        background: transparent;
        color: var(--text-primary, oklch(90% 0 0));
        font-family: inherit;
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.5;
        outline: none;
        box-shadow: inset 0 2px 4px oklch(0% 0 0 / 0.06), inset 0 1px 0 oklch(100% 0 0 / 0.04);
        padding-inline-end: 2.5rem;
        transition: border-color 0.15s var(--ease-out, ease-out),
                    box-shadow 0.15s var(--ease-out, ease-out);
      }

      /* Sizes */
      :scope[data-size="xs"] .ui-password-input__field {
        min-block-size: 28px;
        padding-block: 0.125rem;
        padding-inline-start: 0.375rem;
        font-size: var(--text-xs, 0.6875rem);
      }
      :scope[data-size="sm"] .ui-password-input__field {
        min-block-size: 32px;
        padding-block: 0.25rem;
        padding-inline-start: 0.5rem;
        font-size: var(--text-xs, 0.75rem);
      }
      :scope[data-size="md"] .ui-password-input__field {
        min-block-size: 36px;
        padding-block: 0.375rem;
        padding-inline-start: 0.75rem;
        font-size: var(--text-sm, 0.875rem);
      }
      :scope[data-size="lg"] .ui-password-input__field {
        min-block-size: 44px;
        padding-block: 0.5rem;
        padding-inline-start: 1rem;
        font-size: var(--text-base, 1rem);
      }
      :scope[data-size="xl"] .ui-password-input__field {
        min-block-size: 48px;
        padding-block: 0.625rem;
        padding-inline-start: 1.25rem;
        font-size: var(--text-lg, 1.125rem);
      }

      /* Focus glow */
      .ui-password-input__field:focus {
        border-color: var(--brand, oklch(65% 0.2 270));
        box-shadow: 0 0 0 3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15),
                    0 0 16px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.1),
                    inset 0 2px 4px oklch(0% 0 0 / 0.06);
      }

      /* Hover */
      .ui-password-input__field:hover:not(:focus):not(:disabled) {
        border-color: var(--border-strong, oklch(100% 0 0 / 0.2));
      }

      /* Disabled */
      :scope[data-disabled] {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      .ui-password-input__field:disabled {
        cursor: not-allowed;
      }

      /* Placeholder */
      .ui-password-input__field::placeholder {
        color: var(--text-tertiary, oklch(60% 0 0));
      }

      /* Visibility toggle */
      .ui-password-input__toggle {
        position: absolute;
        inset-inline-end: 0.5rem;
        inset-block: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        background: none;
        color: var(--text-tertiary, oklch(60% 0 0));
        cursor: pointer;
        padding: 0.25rem;
        border-radius: var(--radius-sm, 0.25rem);
        transition: color 0.15s var(--ease-out, ease-out),
                    background 0.15s var(--ease-out, ease-out);
      }

      .ui-password-input__toggle:hover {
        color: var(--text-primary, oklch(90% 0 0));
        background: oklch(100% 0 0 / 0.06);
      }

      .ui-password-input__toggle:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 1px;
      }

      /* Description */
      .ui-password-input__description {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary, oklch(70% 0 0));
        line-height: 1.4;
      }

      /* Error state */
      :scope[data-invalid] .ui-password-input__field {
        border-color: var(--status-critical, oklch(65% 0.25 25));
        box-shadow: 0 0 0 1px oklch(from var(--status-critical, oklch(65% 0.25 25)) l c h / 0.2);
      }
      :scope[data-invalid] .ui-password-input__field:focus {
        border-color: var(--status-critical, oklch(65% 0.25 25));
        box-shadow: 0 0 0 3px oklch(from var(--status-critical, oklch(65% 0.25 25)) l c h / 0.25);
      }

      .ui-password-input__error {
        font-size: var(--text-xs, 0.75rem);
        color: var(--status-critical, oklch(65% 0.25 25));
        line-height: 1.4;
      }

      :scope:not([data-motion="0"]) .ui-password-input__error {
        animation: ui-password-input-error-in 0.2s var(--ease-out, ease-out);
      }

      /* Focus visible ring */
      .ui-password-input__field:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 1px;
      }

      /* Required indicator */
      .ui-password-input__required {
        color: var(--status-critical, oklch(65% 0.25 25));
        margin-inline-start: 0.25rem;
      }

      /* Strength meter */
      .ui-password-input__strength {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .ui-password-input__strength-bar {
        display: flex;
        gap: 0.25rem;
        block-size: 4px;
      }

      .ui-password-input__strength-segment {
        flex: 1;
        border-radius: 2px;
        background: var(--bg-hover, oklch(50% 0 0 / 0.2));
        transition: background 0.3s var(--ease-out, ease-out);
      }

      .ui-password-input__strength-segment[data-active][data-level="1"] {
        background: oklch(60% 0.25 25);
      }
      .ui-password-input__strength-segment[data-active][data-level="2"] {
        background: oklch(70% 0.18 60);
      }
      .ui-password-input__strength-segment[data-active][data-level="3"] {
        background: oklch(75% 0.18 130);
      }
      .ui-password-input__strength-segment[data-active][data-level="4"] {
        background: oklch(70% 0.2 145);
      }

      .ui-password-input__strength-label {
        font-size: var(--text-xs, 0.75rem);
        line-height: 1.4;
        color: var(--text-secondary, oklch(70% 0 0));
      }

      /* Touch targets */
      @media (pointer: coarse) {
        .ui-password-input__field {
          min-block-size: 44px;
        }
        .ui-password-input__toggle {
          min-inline-size: 44px;
          min-block-size: 44px;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-password-input__field {
          border: 2px solid ButtonText;
        }
        .ui-password-input__field:focus {
          outline: 2px solid Highlight;
        }
        :scope[data-invalid] .ui-password-input__field {
          border-color: LinkText;
        }
        .ui-password-input__strength-segment {
          border: 1px solid ButtonText;
        }
        .ui-password-input__strength-segment[data-active] {
          background: Highlight;
        }
      }

      /* Print */
      @media print {
        .ui-password-input__field {
          box-shadow: none;
          border: 1px solid;
        }
        .ui-password-input__toggle {
          display: none;
        }
      }
    }

    @keyframes ui-password-input-error-in {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }
`

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      value: valueProp,
      onChange: onChangeProp,
      label,
      description,
      error: errorProp,
      placeholder,
      name,
      size = 'md',
      disabled,
      required,
      showStrengthMeter,
      strengthLabels = DEFAULT_STRENGTH_LABELS,
      visibilityToggle = true,
      onStrengthChange,
      motion: motionProp,
      className,
      id: idProp,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('password-input', passwordInputStyles)
    const motionLevel = useMotionLevel(motionProp)
    const stableId = useStableId('password-input')
    const inputId = idProp || stableId

    const [visible, setVisible] = useState(false)

    // ── Form context integration ──────────────────────────────────────
    const formCtx = useFormContextOptional()
    const fieldProps = formCtx && name ? formCtx.getFieldProps(name) : null

    const value = valueProp !== undefined
      ? valueProp
      : fieldProps
        ? (fieldProps.value as string) ?? ''
        : undefined

    const touched = fieldProps?.touched ?? false
    const contextError = fieldProps && touched ? fieldProps.error : undefined
    const error = errorProp !== undefined ? errorProp : contextError

    // ── Strength ─────────────────────────────────────────────────────
    const strength = calculateStrength(typeof value === 'string' ? value : '')

    useEffect(() => {
      onStrengthChange?.(strength)
    }, [strength, onStrengthChange])

    // ── IDs for aria-describedby ──────────────────────────────────────
    const errorId = error ? `${inputId}-error` : undefined
    const descriptionId = description ? `${inputId}-description` : undefined
    const strengthId = showStrengthMeter ? `${inputId}-strength` : undefined
    const describedBy = [descriptionId, strengthId, errorId].filter(Boolean).join(' ') || undefined

    // ── Handlers ─────────────────────────────────────────────────────
    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        onChangeProp?.(e)
        if (fieldProps && valueProp === undefined) {
          fieldProps.onChange(e.target.value)
        }
      },
      [onChangeProp, fieldProps, valueProp]
    )

    const handleBlur = useCallback(
      (e: FocusEvent<HTMLInputElement>) => {
        if (fieldProps) {
          fieldProps.onBlur()
        }
      },
      [fieldProps]
    )

    const toggleVisibility = useCallback(() => {
      setVisible(v => !v)
    }, [])

    return (
      <div
        className={cn(cls('root'), className)}
        data-size={size}
        data-motion={motionLevel}
        {...(error ? { 'data-invalid': '' } : {})}
        {...(disabled ? { 'data-disabled': '' } : {})}
        {...rest}
      >
        {label && (
          <label htmlFor={inputId} className="ui-password-input__label">
            {label}
            {required && (
              <span className="ui-password-input__required" aria-hidden="true">*</span>
            )}
          </label>
        )}

        <div className="ui-password-input__field-wrapper">
          <input
            ref={ref}
            id={inputId}
            name={name}
            type={visible ? 'text' : 'password'}
            className="ui-password-input__field"
            disabled={disabled}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            required={required}
          />

          {visibilityToggle && (
            <button
              type="button"
              className="ui-password-input__toggle"
              onClick={toggleVisibility}
              aria-label={visible ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {visible ? (
                <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M2 2L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M6.5 6.5C6.18 6.82 6 7.27 6 7.75C6 8.85 6.9 9.75 8 9.75C8.48 9.75 8.93 9.57 9.25 9.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M3 5C1.8 6.2 1 7.75 1 7.75S3.5 12.5 8 12.5C9.16 12.5 10.2 12.15 11.12 11.62" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M13 10.5C14.2 9.3 15 7.75 15 7.75S12.5 3 8 3C7.36 3 6.74 3.1 6.15 3.27" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M1 8C1 8 3.5 3 8 3C12.5 3 15 8 15 8C15 8 12.5 13 8 13C3.5 13 1 8 1 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              )}
            </button>
          )}
        </div>

        {description && (
          <span id={descriptionId} className="ui-password-input__description">
            {description}
          </span>
        )}

        {error && (
          <span id={errorId} className="ui-password-input__error" role="alert">
            {error}
          </span>
        )}

        {showStrengthMeter && (
          <div id={strengthId} className="ui-password-input__strength" aria-live="polite">
            <div className="ui-password-input__strength-bar" role="meter" aria-valuemin={0} aria-valuemax={4} aria-valuenow={strength}>
              {[1, 2, 3, 4].map(level => (
                <div
                  key={level}
                  className="ui-password-input__strength-segment"
                  data-level={strength}
                  {...(level <= strength ? { 'data-active': '' } : {})}
                />
              ))}
            </div>
            {strengthLabels[strength] && (
              <span className="ui-password-input__strength-label">
                {strengthLabels[strength]}
              </span>
            )}
          </div>
        )}
      </div>
    )
  }
)
PasswordInput.displayName = 'PasswordInput'
