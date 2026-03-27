'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type WheelEvent,
  type FocusEvent,
  type ChangeEvent,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useStableId } from '../core/a11y/stable-id'
import { useFormContextOptional } from '../core/forms/form-context'
import { cn } from '../core/utils/cn'

export interface NumberInputProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: number | null
  defaultValue?: number
  onChange?: (value: number | null) => void
  min?: number
  max?: number
  step?: number
  precision?: number
  label?: string
  description?: string
  error?: string
  placeholder?: string
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  disabled?: boolean
  readOnly?: boolean
  hideControls?: boolean
  clampBehavior?: 'strict' | 'blur'
  prefix?: string
  suffix?: string
  thousandSeparator?: boolean
  allowNegative?: boolean
  allowDecimal?: boolean
  required?: boolean
  motion?: 0 | 1 | 2 | 3
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function clampValue(val: number, min?: number, max?: number): number {
  let result = val
  if (min !== undefined && result < min) result = min
  if (max !== undefined && result > max) result = max
  return result
}

function roundToPrecision(val: number, precision?: number): number {
  if (precision === undefined) return val
  const factor = Math.pow(10, precision)
  return Math.round(val * factor) / factor
}

function formatDisplay(
  val: number | null,
  opts: {
    prefix?: string
    suffix?: string
    thousandSeparator?: boolean
    precision?: number
  }
): string {
  if (val === null || val === undefined) return ''
  let str: string
  if (opts.precision !== undefined) {
    str = val.toFixed(opts.precision)
  } else {
    str = String(val)
  }
  if (opts.thousandSeparator) {
    const [intPart, decPart] = str.split('.')
    const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    str = decPart !== undefined ? `${formatted}.${decPart}` : formatted
  }
  if (opts.prefix) str = `${opts.prefix}${str}`
  if (opts.suffix) str = `${str}${opts.suffix}`
  return str
}

function stripFormatting(str: string, prefix?: string, suffix?: string): string {
  let result = str
  if (prefix && result.startsWith(prefix)) result = result.slice(prefix.length)
  if (suffix && result.endsWith(suffix)) result = result.slice(0, -suffix.length)
  result = result.replace(/,/g, '')
  return result
}

// ── Styles ──────────────────────────────────────────────────────────────────

const numberInputStyles = css`
  @layer components {
    @scope (.ui-number-input) {
      :scope {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs, 0.25rem);
        position: relative;
        font-family: inherit;
      }

      .ui-number-input__label {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 500;
        color: var(--text-primary, oklch(90% 0 0));
        line-height: 1.4;
        user-select: none;
      }

      .ui-number-input__field-wrapper {
        position: relative;
        display: flex;
        align-items: stretch;
      }

      .ui-number-input__field {
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
        -moz-appearance: textfield;
      }

      .ui-number-input__field::-webkit-inner-spin-button,
      .ui-number-input__field::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      /* Sizes */
      :scope[data-size="xs"] .ui-number-input__field {
        min-block-size: 28px;
        padding-block: 0.125rem;
        padding-inline: 0.375rem;
        font-size: var(--text-xs, 0.6875rem);
      }
      :scope[data-size="sm"] .ui-number-input__field {
        min-block-size: 32px;
        padding-block: 0.25rem;
        padding-inline: 0.5rem;
        font-size: var(--text-xs, 0.75rem);
      }
      :scope[data-size="md"] .ui-number-input__field {
        min-block-size: 36px;
        padding-block: 0.375rem;
        padding-inline: 0.75rem;
        font-size: var(--text-sm, 0.875rem);
      }
      :scope[data-size="lg"] .ui-number-input__field {
        min-block-size: 44px;
        padding-block: 0.5rem;
        padding-inline: 1rem;
        font-size: var(--text-base, 1rem);
      }
      :scope[data-size="xl"] .ui-number-input__field {
        min-block-size: 48px;
        padding-block: 0.625rem;
        padding-inline: 1.25rem;
        font-size: var(--text-lg, 1.125rem);
      }

      /* Controls padding */
      :scope:not([data-hide-controls]) .ui-number-input__field {
        padding-inline-end: 2rem;
      }

      /* Focus glow */
      .ui-number-input__field:focus {
        border-color: var(--brand, oklch(65% 0.2 270));
        box-shadow: 0 0 0 3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15),
                    0 0 16px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.1),
                    inset 0 2px 4px oklch(0% 0 0 / 0.06);
      }

      /* Hover */
      .ui-number-input__field:hover:not(:focus):not(:disabled) {
        border-color: var(--border-strong, oklch(100% 0 0 / 0.2));
      }

      /* Disabled */
      :scope[data-disabled] {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      .ui-number-input__field:disabled {
        cursor: not-allowed;
      }

      /* Placeholder */
      .ui-number-input__field::placeholder {
        color: var(--text-tertiary, oklch(60% 0 0));
      }

      /* Stepper controls */
      .ui-number-input__controls {
        position: absolute;
        inset-inline-end: 1px;
        inset-block: 1px;
        display: flex;
        flex-direction: column;
        border-inline-start: 1px solid var(--border-default, oklch(100% 0 0 / 0.12));
        border-start-end-radius: calc(var(--radius-md, 0.375rem) - 1px);
        border-end-end-radius: calc(var(--radius-md, 0.375rem) - 1px);
        overflow: hidden;
        background: linear-gradient(to right, transparent, oklch(100% 0 0 / 0.02));
      }

      .ui-number-input__stepper {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 1;
        border: none;
        background: transparent;
        color: var(--text-secondary, oklch(70% 0 0));
        cursor: pointer;
        padding: 0;
        inline-size: 1.75rem;
        min-block-size: 0;
        font-size: 0.625rem;
        line-height: 1;
        user-select: none;
        transition: background 0.1s var(--ease-out, ease-out),
                    color 0.1s var(--ease-out, ease-out),
                    box-shadow 0.1s var(--ease-out, ease-out);
      }

      .ui-number-input__stepper:hover {
        background: var(--bg-hover, oklch(100% 0 0 / 0.06));
        color: var(--text-primary, oklch(90% 0 0));
        transform: translateY(-1px);
        box-shadow: 0 0 8px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.12);
      }

      .ui-number-input__stepper:active {
        background: var(--bg-active, oklch(100% 0 0 / 0.1));
        transform: scale(0.94);
        transition: transform 0.06s ease-out;
      }

      .ui-number-input__stepper + .ui-number-input__stepper {
        border-block-start: 1px solid var(--border-default, oklch(100% 0 0 / 0.12));
      }

      .ui-number-input__stepper:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }

      /* Description */
      .ui-number-input__description {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary, oklch(70% 0 0));
        line-height: 1.4;
      }

      /* Error state */
      :scope[data-invalid] .ui-number-input__field {
        border-color: var(--status-critical, oklch(65% 0.25 25));
        box-shadow: 0 0 0 1px oklch(from var(--status-critical, oklch(65% 0.25 25)) l c h / 0.2);
      }
      :scope[data-invalid] .ui-number-input__field:focus {
        border-color: var(--status-critical, oklch(65% 0.25 25));
        box-shadow: 0 0 0 3px oklch(from var(--status-critical, oklch(65% 0.25 25)) l c h / 0.25);
      }

      .ui-number-input__error {
        font-size: var(--text-xs, 0.75rem);
        color: var(--status-critical, oklch(65% 0.25 25));
        line-height: 1.4;
      }

      :scope:not([data-motion="0"]) .ui-number-input__error {
        animation: ui-number-input-error-in 0.2s var(--ease-out, ease-out);
      }

      /* Focus visible ring */
      .ui-number-input__field:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 1px;
      }

      /* Required indicator */
      .ui-number-input__required {
        color: var(--status-critical, oklch(65% 0.25 25));
        margin-inline-start: 0.25rem;
      }

      /* Touch targets */
      @media (pointer: coarse) {
        .ui-number-input__field {
          min-block-size: 44px;
        }
        .ui-number-input__stepper {
          min-block-size: 22px;
          inline-size: 2.5rem;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-number-input__field {
          border: 2px solid ButtonText;
        }
        .ui-number-input__field:focus {
          outline: 2px solid Highlight;
        }
        :scope[data-invalid] .ui-number-input__field {
          border-color: LinkText;
        }
        .ui-number-input__stepper {
          border: 1px solid ButtonText;
        }
      }

      /* Print */
      @media print {
        .ui-number-input__field {
          box-shadow: none;
          border: 1px solid;
        }
        .ui-number-input__controls {
          display: none;
        }
      }
    }

    @keyframes ui-number-input-error-in {
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

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value: valueProp,
      defaultValue,
      onChange,
      min,
      max,
      step = 1,
      precision,
      label,
      description,
      error: errorProp,
      placeholder,
      name,
      size = 'md',
      disabled,
      readOnly,
      hideControls,
      clampBehavior = 'blur',
      prefix,
      suffix,
      thousandSeparator,
      allowNegative = true,
      allowDecimal = true,
      required,
      motion: motionProp,
      className,
      id: idProp,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('number-input', numberInputStyles)
    const motionLevel = useMotionLevel(motionProp)
    const stableId = useStableId('number-input')
    const inputId = idProp || stableId

    // ── Form context integration ──────────────────────────────────────
    const formCtx = useFormContextOptional()
    const fieldProps = formCtx && name ? formCtx.getFieldProps(name) : null

    // Determine controlled vs uncontrolled
    const isControlled = valueProp !== undefined
    const [internalValue, setInternalValue] = useState<number | null>(
      defaultValue !== undefined ? defaultValue : null
    )
    const numericValue = isControlled
      ? valueProp
      : fieldProps
        ? (fieldProps.value as number | null) ?? null
        : internalValue

    const touched = fieldProps?.touched ?? false
    const contextError = fieldProps && touched ? fieldProps.error : undefined
    const error = errorProp !== undefined ? errorProp : contextError

    // Track whether the input is focused and its raw text
    const [focused, setFocused] = useState(false)
    const [rawText, setRawText] = useState('')
    const inputRef = useRef<HTMLInputElement | null>(null)
    const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    // ── IDs for aria-describedby ──────────────────────────────────────
    const errorId = error ? `${inputId}-error` : undefined
    const descriptionId = description ? `${inputId}-description` : undefined
    const describedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined

    // ── Set value helper ─────────────────────────────────────────────
    const setValue = useCallback(
      (val: number | null) => {
        let next = val
        if (next !== null) {
          next = roundToPrecision(next, precision)
        }
        if (!isControlled) {
          setInternalValue(next)
        }
        onChange?.(next)
        if (fieldProps && !isControlled) {
          fieldProps.onChange(next)
        }
      },
      [isControlled, onChange, fieldProps, precision]
    )

    // ── Increment / Decrement ────────────────────────────────────────
    const increment = useCallback(
      (multiplier = 1) => {
        const current = numericValue ?? 0
        let next = current + step * multiplier
        next = roundToPrecision(next, precision)
        next = clampValue(next, min, max)
        if (!allowNegative && next < 0) next = 0
        setValue(next)
      },
      [numericValue, step, precision, min, max, allowNegative, setValue]
    )

    const decrement = useCallback(
      (multiplier = 1) => {
        const current = numericValue ?? 0
        let next = current - step * multiplier
        next = roundToPrecision(next, precision)
        next = clampValue(next, min, max)
        if (!allowNegative && next < 0) next = 0
        setValue(next)
      },
      [numericValue, step, precision, min, max, allowNegative, setValue]
    )

    // ── Hold-to-repeat ───────────────────────────────────────────────
    const stopHold = useCallback(() => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current)
        holdTimerRef.current = null
      }
      if (holdIntervalRef.current) {
        clearInterval(holdIntervalRef.current)
        holdIntervalRef.current = null
      }
    }, [])

    const startHold = useCallback(
      (direction: 'up' | 'down') => {
        const fn = direction === 'up' ? increment : decrement
        holdTimerRef.current = setTimeout(() => {
          holdIntervalRef.current = setInterval(() => fn(), 60)
        }, 400)
      },
      [increment, decrement]
    )

    useEffect(() => {
      return stopHold
    }, [stopHold])

    // ── Display value ────────────────────────────────────────────────
    const displayValue = focused
      ? rawText
      : formatDisplay(numericValue, { prefix, suffix, thousandSeparator, precision })

    // ── Handlers ─────────────────────────────────────────────────────
    const handleInputChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value
        setRawText(raw)

        const stripped = stripFormatting(raw, prefix, suffix)
        if (stripped === '' || stripped === '-') {
          setValue(null)
          return
        }

        const parsed = parseFloat(stripped)
        if (isNaN(parsed)) return

        if (!allowNegative && parsed < 0) return
        if (!allowDecimal && stripped.includes('.')) return

        if (clampBehavior === 'strict') {
          setValue(clampValue(parsed, min, max))
        } else {
          setValue(parsed)
        }
      },
      [prefix, suffix, allowNegative, allowDecimal, clampBehavior, min, max, setValue]
    )

    const handleFocus = useCallback(() => {
      setFocused(true)
      const stripped = numericValue !== null && numericValue !== undefined
        ? (precision !== undefined ? numericValue.toFixed(precision) : String(numericValue))
        : ''
      setRawText(stripped)
    }, [numericValue, precision])

    const handleBlur = useCallback(
      (e: FocusEvent<HTMLInputElement>) => {
        setFocused(false)
        stopHold()
        if (numericValue !== null && numericValue !== undefined && clampBehavior === 'blur') {
          const clamped = clampValue(numericValue, min, max)
          if (clamped !== numericValue) {
            setValue(clamped)
          }
        }
        if (fieldProps) {
          fieldProps.onBlur()
        }
      },
      [numericValue, clampBehavior, min, max, setValue, fieldProps, stopHold]
    )

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLInputElement>) => {
        if (readOnly) return
        const multiplier = e.shiftKey ? 10 : 1
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          increment(multiplier)
        } else if (e.key === 'ArrowDown') {
          e.preventDefault()
          decrement(multiplier)
        }
      },
      [readOnly, increment, decrement]
    )

    const handleWheel = useCallback(
      (e: WheelEvent<HTMLInputElement>) => {
        if (readOnly || disabled) return
        if (document.activeElement !== inputRef.current) return
        e.preventDefault()
        if (e.deltaY < 0) {
          increment()
        } else {
          decrement()
        }
      },
      [readOnly, disabled, increment, decrement]
    )

    // ── Ref merging ──────────────────────────────────────────────────
    const setRef = useCallback(
      (el: HTMLInputElement | null) => {
        inputRef.current = el
        if (typeof ref === 'function') ref(el)
        else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el
      },
      [ref]
    )

    const isAtMax = max !== undefined && numericValue !== null && numericValue !== undefined && numericValue >= max
    const isAtMin = min !== undefined && numericValue !== null && numericValue !== undefined && numericValue <= min

    return (
      <div
        className={cn(cls('root'), className)}
        data-size={size}
        data-motion={motionLevel}
        {...(error ? { 'data-invalid': '' } : {})}
        {...(disabled ? { 'data-disabled': '' } : {})}
        {...(hideControls ? { 'data-hide-controls': '' } : {})}
        {...rest}
      >
        {label && (
          <label htmlFor={inputId} className="ui-number-input__label">
            {label}
            {required && (
              <span className="ui-number-input__required" aria-hidden="true">*</span>
            )}
          </label>
        )}

        <div className="ui-number-input__field-wrapper">
          <input
            ref={setRef}
            id={inputId}
            name={name}
            type="text"
            inputMode="decimal"
            role="spinbutton"
            className="ui-number-input__field"
            disabled={disabled}
            readOnly={readOnly}
            placeholder={placeholder}
            value={displayValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onWheel={handleWheel}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={numericValue ?? undefined}
            required={required}
          />

          {!hideControls && (
            <div className="ui-number-input__controls" aria-hidden="true">
              <button
                type="button"
                className="ui-number-input__stepper"
                tabIndex={-1}
                disabled={disabled || readOnly || isAtMax}
                onMouseDown={() => {
                  increment()
                  startHold('up')
                }}
                onMouseUp={stopHold}
                onMouseLeave={stopHold}
                aria-label="Increment"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path d="M2 6.5L5 3.5L8 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                className="ui-number-input__stepper"
                tabIndex={-1}
                disabled={disabled || readOnly || isAtMin}
                onMouseDown={() => {
                  decrement()
                  startHold('down')
                }}
                onMouseUp={stopHold}
                onMouseLeave={stopHold}
                aria-label="Decrement"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {description && (
          <span id={descriptionId} className="ui-number-input__description">
            {description}
          </span>
        )}

        {error && (
          <span id={errorId} className="ui-number-input__error" role="alert">
            {error}
          </span>
        )}
      </div>
    )
  }
)
NumberInput.displayName = 'NumberInput'
