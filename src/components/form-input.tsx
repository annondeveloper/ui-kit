'use client'

import {
  forwardRef,
  useCallback,
  type InputHTMLAttributes,
  type ReactNode,
  type ChangeEvent,
  type FocusEvent,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useStableId } from '../core/a11y/stable-id'
import { useFormContextOptional } from '../core/forms/form-context'
import { cn } from '../core/utils/cn'

export interface FormInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  name: string
  label?: ReactNode
  description?: string
  error?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'filled'
  icon?: ReactNode
  iconEnd?: ReactNode
  motion?: 0 | 1 | 2 | 3
}

const formInputStyles = css`
  @layer components {
    @scope (.ui-form-input) {
      :scope {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs, 0.25rem);
        position: relative;
        font-family: inherit;
      }

      .ui-form-input__label {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 500;
        color: var(--text-primary, oklch(90% 0 0));
        line-height: 1.4;
        user-select: none;
      }

      .ui-form-input__field-wrapper {
        position: relative;
        display: flex;
        align-items: center;
      }

      .ui-form-input__field {
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
        transition: border-color 0.15s var(--ease-out, ease-out),
                    box-shadow 0.15s var(--ease-out, ease-out);
      }

      /* Sizes */
      :scope[data-size="xs"] .ui-form-input__field {
        min-block-size: 28px;
        padding-block: 0.125rem;
        padding-inline: 0.375rem;
        font-size: var(--text-xs, 0.6875rem);
      }
      :scope[data-size="sm"] .ui-form-input__field {
        min-block-size: 32px;
        padding-block: 0.25rem;
        padding-inline: 0.5rem;
        font-size: var(--text-xs, 0.75rem);
      }
      :scope[data-size="md"] .ui-form-input__field {
        min-block-size: 36px;
        padding-block: 0.375rem;
        padding-inline: 0.75rem;
        font-size: var(--text-sm, 0.875rem);
      }
      :scope[data-size="lg"] .ui-form-input__field {
        min-block-size: 44px;
        padding-block: 0.5rem;
        padding-inline: 1rem;
        font-size: var(--text-base, 1rem);
      }
      :scope[data-size="xl"] .ui-form-input__field {
        min-block-size: 48px;
        padding-block: 0.625rem;
        padding-inline: 1.25rem;
        font-size: var(--text-lg, 1.125rem);
      }

      /* Icon padding adjustments */
      :scope[data-has-icon] .ui-form-input__field {
        padding-inline-start: 2.25rem;
      }
      :scope[data-has-icon-end] .ui-form-input__field {
        padding-inline-end: 2.25rem;
      }

      /* Filled variant */
      :scope[data-variant="filled"] .ui-form-input__field {
        background: var(--bg-hover);
        border-color: transparent;
      }
      :scope[data-variant="filled"] .ui-form-input__field:hover:not(:disabled) {
        background: var(--bg-active);
      }
      :scope[data-variant="filled"] .ui-form-input__field:focus {
        background: transparent;
        border-color: var(--brand, oklch(65% 0.2 270));
      }

      /* Focus glow */
      .ui-form-input__field:focus {
        border-color: var(--brand, oklch(65% 0.2 270));
        box-shadow: 0 0 0 3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15);
      }

      /* Hover */
      .ui-form-input__field:hover:not(:focus):not(:disabled) {
        border-color: var(--border-strong, oklch(100% 0 0 / 0.2));
      }

      /* Disabled */
      :scope[data-disabled] {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      .ui-form-input__field:disabled {
        cursor: not-allowed;
      }

      /* Placeholder */
      .ui-form-input__field::placeholder {
        color: var(--text-tertiary, oklch(60% 0 0));
      }

      /* Icons */
      .ui-form-input__icon,
      .ui-form-input__icon-end {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        color: var(--text-tertiary, oklch(60% 0 0));
        block-size: 100%;
        inline-size: 2.25rem;
      }

      .ui-form-input__icon {
        inset-inline-start: 0;
      }

      .ui-form-input__icon-end {
        inset-inline-end: 0;
      }

      .ui-form-input__icon svg,
      .ui-form-input__icon-end svg {
        inline-size: 1em;
        block-size: 1em;
      }

      /* Description */
      .ui-form-input__description {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary, oklch(70% 0 0));
        line-height: 1.4;
      }

      /* Error state */
      :scope[data-invalid] .ui-form-input__field {
        border-color: var(--status-critical, oklch(65% 0.25 25));
        box-shadow: 0 0 0 1px oklch(from var(--status-critical, oklch(65% 0.25 25)) l c h / 0.2);
      }
      :scope[data-invalid] .ui-form-input__field:focus {
        border-color: var(--status-critical, oklch(65% 0.25 25));
        box-shadow: 0 0 0 3px oklch(from var(--status-critical, oklch(65% 0.25 25)) l c h / 0.25);
      }

      /* Error message */
      .ui-form-input__error {
        font-size: var(--text-xs, 0.75rem);
        color: var(--status-critical, oklch(65% 0.25 25));
        line-height: 1.4;
      }

      /* Error message entry animation — motion level 1+ */
      :scope:not([data-motion="0"]) .ui-form-input__error {
        animation: ui-form-input-error-in 0.2s var(--ease-out, ease-out);
      }

      /* Focus visible ring on the input itself (keyboard navigation) */
      .ui-form-input__field:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 1px;
      }

      /* Touch targets */
      @media (pointer: coarse) {
        .ui-form-input__field {
          min-block-size: 44px;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-form-input__field {
          border: 2px solid ButtonText;
        }
        .ui-form-input__field:focus {
          outline: 2px solid Highlight;
        }
        :scope[data-invalid] .ui-form-input__field {
          border-color: LinkText;
        }
      }

      /* Print */
      @media print {
        .ui-form-input__field {
          box-shadow: none;
          border: 1px solid;
        }
      }
    }

    @keyframes ui-form-input-error-in {
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

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      name,
      label,
      description,
      error: errorProp,
      size = 'md',
      variant = 'default',
      icon,
      iconEnd,
      motion: motionProp,
      className,
      disabled,
      id: idProp,
      value: valueProp,
      onChange: onChangeProp,
      onBlur: onBlurProp,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('form-input', formInputStyles)
    const motionLevel = useMotionLevel(motionProp)
    const stableId = useStableId('form-input')
    const inputId = idProp || stableId

    // ── Form context integration ──────────────────────────────────────
    const formCtx = useFormContextOptional()
    const fieldProps = formCtx ? formCtx.getFieldProps(name) : null

    // Determine effective values: explicit props override context
    const value = valueProp !== undefined ? valueProp : fieldProps?.value ?? undefined
    const touched = fieldProps?.touched ?? false
    const contextError = fieldProps && touched ? fieldProps.error : undefined
    const error = errorProp !== undefined ? errorProp : contextError

    // ── IDs for aria-describedby ──────────────────────────────────────
    const errorId = error ? `${inputId}-error` : undefined
    const descriptionId = description ? `${inputId}-description` : undefined
    const describedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined

    // ── Handlers ──────────────────────────────────────────────────────

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        // If explicit onChange provided, always call it
        onChangeProp?.(e)
        // If inside form context and no explicit value prop, update context
        if (fieldProps && valueProp === undefined) {
          fieldProps.onChange(e.target.value)
        }
      },
      [onChangeProp, fieldProps, valueProp]
    )

    const handleBlur = useCallback(
      (e: FocusEvent<HTMLInputElement>) => {
        onBlurProp?.(e)
        if (fieldProps) {
          fieldProps.onBlur()
        }
      },
      [onBlurProp, fieldProps]
    )

    return (
      <div
        className={cn(cls('root'), className)}
        data-size={size}
        data-variant={variant}
        data-motion={motionLevel}
        {...(error ? { 'data-invalid': '' } : {})}
        {...(disabled ? { 'data-disabled': '' } : {})}
        {...(icon ? { 'data-has-icon': '' } : {})}
        {...(iconEnd ? { 'data-has-icon-end': '' } : {})}
      >
        {label && (
          <label htmlFor={inputId} className="ui-form-input__label">
            {label}
          </label>
        )}

        <div className="ui-form-input__field-wrapper">
          {icon && (
            <span className="ui-form-input__icon" aria-hidden="true">
              {icon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            name={name}
            className="ui-form-input__field"
            disabled={disabled}
            value={value as string | number | readonly string[] | undefined}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            {...rest}
          />

          {iconEnd && (
            <span className="ui-form-input__icon-end" aria-hidden="true">
              {iconEnd}
            </span>
          )}
        </div>

        {description && (
          <span id={descriptionId} className="ui-form-input__description">
            {description}
          </span>
        )}

        {error && (
          <span id={errorId} className="ui-form-input__error" role="alert">
            {error}
          </span>
        )}
      </div>
    )
  }
)
FormInput.displayName = 'FormInput'
