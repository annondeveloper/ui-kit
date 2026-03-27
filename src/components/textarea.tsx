'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
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

export interface TextareaProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string
  defaultValue?: string
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  label?: string
  description?: string
  error?: string
  placeholder?: string
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  disabled?: boolean
  required?: boolean
  autoResize?: boolean
  minRows?: number
  maxRows?: number
  maxLength?: number
  showCount?: boolean
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
  motion?: 0 | 1 | 2 | 3
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getLineHeight(el: HTMLTextAreaElement): number {
  const computed = window.getComputedStyle(el)
  const lh = parseFloat(computed.lineHeight)
  return isNaN(lh) ? parseFloat(computed.fontSize) * 1.5 : lh
}

// ── Styles ──────────────────────────────────────────────────────────────────

const textareaStyles = css`
  @layer components {
    @scope (.ui-textarea) {
      :scope {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs, 0.25rem);
        position: relative;
        font-family: inherit;
      }

      .ui-textarea__label {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 500;
        color: var(--text-primary, oklch(90% 0 0));
        line-height: 1.4;
        user-select: none;
      }

      .ui-textarea__field-wrapper {
        position: relative;
        display: flex;
      }

      .ui-textarea__field {
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
        transition: border-color 0.15s var(--ease-out, ease-out),
                    box-shadow 0.15s var(--ease-out, ease-out);
      }

      /* Auto-resize smooth transition */
      :scope:not([data-motion="0"]) .ui-textarea__field[data-auto-resize] {
        transition: border-color 0.15s var(--ease-out, ease-out),
                    box-shadow 0.15s var(--ease-out, ease-out),
                    block-size 0.15s var(--ease-out, ease-out);
      }

      /* Sizes */
      :scope[data-size="xs"] .ui-textarea__field {
        padding-block: 0.25rem;
        padding-inline: 0.375rem;
        font-size: var(--text-xs, 0.6875rem);
      }
      :scope[data-size="sm"] .ui-textarea__field {
        padding-block: 0.375rem;
        padding-inline: 0.5rem;
        font-size: var(--text-xs, 0.75rem);
      }
      :scope[data-size="md"] .ui-textarea__field {
        padding-block: 0.5rem;
        padding-inline: 0.75rem;
        font-size: var(--text-sm, 0.875rem);
      }
      :scope[data-size="lg"] .ui-textarea__field {
        padding-block: 0.625rem;
        padding-inline: 1rem;
        font-size: var(--text-base, 1rem);
      }
      :scope[data-size="xl"] .ui-textarea__field {
        padding-block: 0.75rem;
        padding-inline: 1.25rem;
        font-size: var(--text-lg, 1.125rem);
      }

      /* Focus glow */
      .ui-textarea__field:focus {
        border-color: var(--brand, oklch(65% 0.2 270));
        box-shadow: 0 0 0 3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15),
                    0 0 16px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.1),
                    inset 0 2px 4px oklch(0% 0 0 / 0.06);
      }

      /* Hover */
      .ui-textarea__field:hover:not(:focus):not(:disabled) {
        border-color: var(--border-strong, oklch(100% 0 0 / 0.2));
        background: oklch(100% 0 0 / 0.02);
      }

      /* Disabled */
      :scope[data-disabled] {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      .ui-textarea__field:disabled {
        cursor: not-allowed;
      }

      /* Placeholder */
      .ui-textarea__field::placeholder {
        color: var(--text-tertiary, oklch(60% 0 0));
      }

      /* Resize control */
      :scope[data-resize="none"] .ui-textarea__field { resize: none; }
      :scope[data-resize="vertical"] .ui-textarea__field { resize: vertical; }
      :scope[data-resize="horizontal"] .ui-textarea__field { resize: horizontal; }
      :scope[data-resize="both"] .ui-textarea__field { resize: both; }

      /* Auto resize disables manual resize */
      .ui-textarea__field[data-auto-resize] {
        resize: none;
        overflow: hidden;
      }

      /* Description */
      .ui-textarea__description {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary, oklch(70% 0 0));
        line-height: 1.4;
      }

      /* Error state */
      :scope[data-invalid] .ui-textarea__field {
        border-color: var(--status-critical, oklch(65% 0.25 25));
        box-shadow: 0 0 0 1px oklch(from var(--status-critical, oklch(65% 0.25 25)) l c h / 0.2);
      }
      :scope[data-invalid] .ui-textarea__field:focus {
        border-color: var(--status-critical, oklch(65% 0.25 25));
        box-shadow: 0 0 0 3px oklch(from var(--status-critical, oklch(65% 0.25 25)) l c h / 0.25);
      }

      .ui-textarea__error {
        font-size: var(--text-xs, 0.75rem);
        color: var(--status-critical, oklch(65% 0.25 25));
        line-height: 1.4;
      }

      :scope:not([data-motion="0"]) .ui-textarea__error {
        animation: ui-textarea-error-in 0.2s var(--ease-out, ease-out);
      }

      /* Focus visible ring */
      .ui-textarea__field:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 1px;
      }

      /* Required indicator */
      .ui-textarea__required {
        color: var(--status-critical, oklch(65% 0.25 25));
        margin-inline-start: 0.25rem;
      }

      /* Character counter */
      .ui-textarea__footer {
        display: flex;
        justify-content: flex-end;
        align-items: center;
      }

      .ui-textarea__counter {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary, oklch(60% 0 0));
        text-align: end;
        line-height: 1.4;
      }
      .ui-textarea__counter[data-at-limit] {
        color: var(--status-critical, oklch(65% 0.25 25));
        font-weight: 600;
      }

      /* Touch targets */
      @media (pointer: coarse) {
        .ui-textarea__field {
          min-block-size: 44px;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-textarea__field {
          border: 2px solid ButtonText;
        }
        .ui-textarea__field:focus {
          outline: 2px solid Highlight;
        }
        :scope[data-invalid] .ui-textarea__field {
          border-color: LinkText;
        }
      }

      /* Print */
      @media print {
        .ui-textarea__field {
          box-shadow: none;
          border: 1px solid;
          resize: none;
        }
      }
    }

    @keyframes ui-textarea-error-in {
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

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      value: valueProp,
      defaultValue,
      onChange: onChangeProp,
      label,
      description,
      error: errorProp,
      placeholder,
      name,
      size = 'md',
      disabled,
      required,
      autoResize,
      minRows = 3,
      maxRows,
      maxLength,
      showCount,
      resize = 'vertical',
      motion: motionProp,
      className,
      id: idProp,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('textarea', textareaStyles)
    const motionLevel = useMotionLevel(motionProp)
    const stableId = useStableId('textarea')
    const inputId = idProp || stableId

    const textareaRef = useRef<HTMLTextAreaElement | null>(null)

    // ── Form context integration ──────────────────────────────────────
    const formCtx = useFormContextOptional()
    const fieldProps = formCtx && name ? formCtx.getFieldProps(name) : null

    const isControlled = valueProp !== undefined
    const [internalValue, setInternalValue] = useState(defaultValue ?? '')

    const value = isControlled
      ? valueProp
      : fieldProps
        ? (fieldProps.value as string) ?? ''
        : internalValue

    const touched = fieldProps?.touched ?? false
    const contextError = fieldProps && touched ? fieldProps.error : undefined
    const error = errorProp !== undefined ? errorProp : contextError

    // ── IDs for aria-describedby ──────────────────────────────────────
    const errorId = error ? `${inputId}-error` : undefined
    const descriptionId = description ? `${inputId}-description` : undefined
    const describedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined

    // ── Auto-resize logic ────────────────────────────────────────────
    const adjustHeight = useCallback(() => {
      const el = textareaRef.current
      if (!el || !autoResize) return

      // Reset height to auto to get correct scrollHeight
      el.style.height = 'auto'

      const lineHeight = getLineHeight(el)
      const paddingBlock = parseFloat(getComputedStyle(el).paddingTop) + parseFloat(getComputedStyle(el).paddingBottom)
      const borderBlock = parseFloat(getComputedStyle(el).borderTopWidth) + parseFloat(getComputedStyle(el).borderBottomWidth)

      const minHeight = lineHeight * minRows + paddingBlock + borderBlock
      const maxHeight = maxRows ? lineHeight * maxRows + paddingBlock + borderBlock : Infinity

      const scrollHeight = el.scrollHeight
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight)
      el.style.height = `${newHeight}px`

      // Show scrollbar if content exceeds maxRows
      if (maxRows && scrollHeight > maxHeight) {
        el.style.overflow = 'auto'
      } else {
        el.style.overflow = 'hidden'
      }
    }, [autoResize, minRows, maxRows])

    useEffect(() => {
      adjustHeight()
    }, [value, adjustHeight])

    // ── Value length for counter ─────────────────────────────────────
    const valueStr = typeof value === 'string' ? value : ''
    const valueLength = valueStr.length
    const showCounter = showCount || maxLength !== undefined
    const atLimit = maxLength !== undefined && valueLength >= maxLength

    // ── Handlers ─────────────────────────────────────────────────────
    const handleChange = useCallback(
      (e: ChangeEvent<HTMLTextAreaElement>) => {
        onChangeProp?.(e)
        if (!isControlled) {
          setInternalValue(e.target.value)
        }
        if (fieldProps && !isControlled) {
          fieldProps.onChange(e.target.value)
        }
      },
      [onChangeProp, isControlled, fieldProps]
    )

    const handleBlur = useCallback(
      (e: FocusEvent<HTMLTextAreaElement>) => {
        if (fieldProps) {
          fieldProps.onBlur()
        }
      },
      [fieldProps]
    )

    // ── Ref merging ──────────────────────────────────────────────────
    const setRef = useCallback(
      (el: HTMLTextAreaElement | null) => {
        textareaRef.current = el
        if (typeof ref === 'function') ref(el)
        else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = el
      },
      [ref]
    )

    return (
      <div
        className={cn(cls('root'), className)}
        data-size={size}
        data-motion={motionLevel}
        data-resize={autoResize ? 'none' : resize}
        {...(error ? { 'data-invalid': '' } : {})}
        {...(disabled ? { 'data-disabled': '' } : {})}
        {...rest}
      >
        {label && (
          <label htmlFor={inputId} className="ui-textarea__label">
            {label}
            {required && (
              <span className="ui-textarea__required" aria-hidden="true">*</span>
            )}
          </label>
        )}

        <div className="ui-textarea__field-wrapper">
          <textarea
            ref={setRef}
            id={inputId}
            name={name}
            className="ui-textarea__field"
            disabled={disabled}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            required={required}
            maxLength={maxLength}
            rows={autoResize ? minRows : minRows}
            {...(autoResize ? { 'data-auto-resize': '' } : {})}
          />
        </div>

        {description && (
          <span id={descriptionId} className="ui-textarea__description">
            {description}
          </span>
        )}

        {error && (
          <span id={errorId} className="ui-textarea__error" role="alert">
            {error}
          </span>
        )}

        {showCounter && (
          <div className="ui-textarea__footer">
            <span
              className="ui-textarea__counter"
              {...(atLimit ? { 'data-at-limit': '' } : {})}
            >
              {maxLength !== undefined ? `${valueLength}/${maxLength}` : valueLength}
            </span>
          </div>
        )}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'
