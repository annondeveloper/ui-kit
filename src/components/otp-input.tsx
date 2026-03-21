'use client'

import {
  forwardRef,
  useState,
  useRef,
  useCallback,
  type HTMLAttributes,
  type ChangeEvent,
  type KeyboardEvent,
  type ClipboardEvent,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useStableId } from '../core/a11y/stable-id'
import { cn } from '../core/utils/cn'

export interface OtpInputProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  length?: number
  value?: string
  onChange?: (value: string) => void
  onComplete?: (value: string) => void
  type?: 'number' | 'text'
  error?: string
  disabled?: boolean
  autoFocus?: boolean
  size?: 'sm' | 'md' | 'lg'
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const otpInputStyles = css`
  @layer components {
    @scope (.ui-otp-input) {
      :scope {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs, 0.25rem);
        font-family: inherit;
      }

      .ui-otp-input__digits {
        display: flex;
        gap: var(--space-sm, 0.5rem);
      }

      .ui-otp-input__digit {
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.12));
        border-radius: var(--radius-md, 0.375rem);
        background: transparent;
        color: var(--text-primary, oklch(90% 0 0));
        font-family: inherit;
        font-weight: 600;
        outline: none;
        transition: border-color 0.15s var(--ease-out, ease-out),
                    box-shadow 0.15s var(--ease-out, ease-out);
      }

      /* Sizes */
      :scope[data-size="sm"] .ui-otp-input__digit {
        inline-size: 2rem;
        block-size: 2.5rem;
        font-size: var(--text-sm, 0.875rem);
      }
      :scope[data-size="md"] .ui-otp-input__digit {
        inline-size: 2.5rem;
        block-size: 3rem;
        font-size: var(--text-lg, 1.125rem);
      }
      :scope[data-size="lg"] .ui-otp-input__digit {
        inline-size: 3rem;
        block-size: 3.5rem;
        font-size: var(--text-xl, 1.25rem);
      }

      /* Focus glow */
      .ui-otp-input__digit:focus {
        border-color: var(--brand, oklch(65% 0.2 270));
        box-shadow: 0 0 0 3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15);
      }

      /* Focus visible */
      .ui-otp-input__digit:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 1px;
      }

      /* Hover */
      .ui-otp-input__digit:hover:not(:focus):not(:disabled) {
        border-color: var(--border-strong, oklch(100% 0 0 / 0.2));
      }

      /* Disabled */
      .ui-otp-input__digit:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Error state */
      :scope[data-invalid] .ui-otp-input__digit {
        border-color: var(--status-critical, oklch(65% 0.25 25));
      }
      :scope[data-invalid] .ui-otp-input__digit:focus {
        border-color: var(--status-critical, oklch(65% 0.25 25));
        box-shadow: 0 0 0 3px oklch(from var(--status-critical, oklch(65% 0.25 25)) l c h / 0.25);
      }

      /* Error message */
      .ui-otp-input__error {
        font-size: var(--text-xs, 0.75rem);
        color: var(--status-critical, oklch(65% 0.25 25));
        line-height: 1.4;
      }

      /* Shake animation on error — motion 2+ */
      :scope[data-invalid]:not([data-motion="0"]):not([data-motion="1"]) .ui-otp-input__digits {
        animation: ui-otp-shake 0.4s var(--ease-out, ease-out);
      }

      /* Touch targets */
      @media (pointer: coarse) {
        .ui-otp-input__digit {
          min-inline-size: 44px;
          min-block-size: 44px;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-otp-input__digit {
          border: 2px solid ButtonText;
        }
        .ui-otp-input__digit:focus {
          outline: 2px solid Highlight;
        }
        :scope[data-invalid] .ui-otp-input__digit {
          border-color: LinkText;
        }
      }

      /* Print */
      @media print {
        .ui-otp-input__digit {
          box-shadow: none;
          border: 1px solid;
        }
      }
    }

    @keyframes ui-otp-shake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-4px); }
      40% { transform: translateX(4px); }
      60% { transform: translateX(-2px); }
      80% { transform: translateX(2px); }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export const OtpInput = forwardRef<HTMLDivElement, OtpInputProps>(
  (
    {
      length = 6,
      value: valueProp,
      onChange,
      onComplete,
      type = 'number',
      error,
      disabled = false,
      autoFocus = false,
      size = 'md',
      motion: motionProp,
      className,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('otp-input', otpInputStyles)
    const motionLevel = useMotionLevel(motionProp)
    const stableId = useStableId('otp')

    const isControlled = valueProp !== undefined
    const [internalValue, setInternalValue] = useState('')
    const currentValue = isControlled ? valueProp : internalValue
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    const digits = currentValue.split('').concat(Array(length).fill('')).slice(0, length)

    const updateValue = useCallback(
      (newValue: string) => {
        if (!isControlled) {
          setInternalValue(newValue)
        }
        onChange?.(newValue)
        if (newValue.length === length) {
          onComplete?.(newValue)
        }
      },
      [isControlled, onChange, onComplete, length]
    )

    const handleChange = useCallback(
      (index: number) => (e: ChangeEvent<HTMLInputElement>) => {
        const char = e.target.value.slice(-1)
        if (type === 'number' && !/^\d$/.test(char) && char !== '') return

        const chars = currentValue.split('')
        // Pad with empty strings up to index
        while (chars.length < index) chars.push('')
        chars[index] = char
        const newValue = chars.join('').replace(/\s/g, '')

        updateValue(newValue)

        // Auto-advance
        if (char && index < length - 1) {
          inputRefs.current[index + 1]?.focus()
        }
      },
      [currentValue, type, length, updateValue]
    )

    const handleKeyDown = useCallback(
      (index: number) => (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
          const chars = currentValue.split('')
          if (chars[index]) {
            // Clear current digit
            chars[index] = ''
            updateValue(chars.join('').replace(/\s+$/, ''))
          } else if (index > 0) {
            // Move to previous
            inputRefs.current[index - 1]?.focus()
          }
        }
      },
      [currentValue, updateValue]
    )

    const handlePaste = useCallback(
      (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text').slice(0, length)
        if (type === 'number' && !/^\d+$/.test(pasted)) return
        updateValue(pasted)

        // Focus last filled or end
        const focusIndex = Math.min(pasted.length, length - 1)
        inputRefs.current[focusIndex]?.focus()
      },
      [length, type, updateValue]
    )

    const errorId = error ? `${stableId}-error` : undefined

    return (
      <div
        ref={ref}
        className={cn(cls('root'), className)}
        data-size={size}
        data-motion={motionLevel}
        {...(error ? { 'data-invalid': '' } : {})}
        role="group"
        aria-label={rest['aria-label']}
        {...(errorId ? { 'aria-describedby': errorId } : {})}
        {...rest}
      >
        <div className="ui-otp-input__digits">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el }}
              type="text"
              inputMode={type === 'number' ? 'numeric' : 'text'}
              className="ui-otp-input__digit"
              value={digit}
              maxLength={1}
              disabled={disabled}
              autoFocus={autoFocus && i === 0}
              autoComplete="one-time-code"
              aria-label={`Digit ${i + 1} of ${length}`}
              aria-invalid={error ? true : undefined}
              onChange={handleChange(i)}
              onKeyDown={handleKeyDown(i)}
              onPaste={handlePaste}
            />
          ))}
        </div>

        {error && (
          <span id={errorId} className="ui-otp-input__error" role="alert">
            {error}
          </span>
        )}
      </div>
    )
  }
)
OtpInput.displayName = 'OtpInput'
