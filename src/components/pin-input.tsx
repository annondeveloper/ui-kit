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

export interface PinInputProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  length?: number
  value?: string
  onChange?: (value: string) => void
  onComplete?: (value: string) => void
  mask?: boolean
  type?: 'number' | 'alphanumeric'
  placeholder?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  error?: boolean
  disabled?: boolean
  oneTimeCode?: boolean
  manageFocus?: boolean
  motion?: 0 | 1 | 2 | 3
}

const pinInputStyles = css`
  @layer components {
    @scope (.ui-pin-input) {
      :scope {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs, 0.25rem);
        font-family: inherit;
      }

      .ui-pin-input__digits {
        display: flex;
        gap: var(--space-sm, 0.5rem);
      }

      .ui-pin-input__digit {
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

      /* Masked — show disc character */
      .ui-pin-input__digit[data-masked="true"] {
        -webkit-text-security: disc;
      }

      /* Sizes */
      :scope[data-size="xs"] .ui-pin-input__digit {
        inline-size: 1.5rem;
        block-size: 2rem;
        font-size: var(--text-xs, 0.75rem);
      }
      :scope[data-size="sm"] .ui-pin-input__digit {
        inline-size: 2rem;
        block-size: 2.5rem;
        font-size: var(--text-sm, 0.875rem);
      }
      :scope[data-size="md"] .ui-pin-input__digit {
        inline-size: 2.5rem;
        block-size: 3rem;
        font-size: var(--text-lg, 1.125rem);
      }
      :scope[data-size="lg"] .ui-pin-input__digit {
        inline-size: 3rem;
        block-size: 3.5rem;
        font-size: var(--text-xl, 1.25rem);
      }
      :scope[data-size="xl"] .ui-pin-input__digit {
        inline-size: 3.5rem;
        block-size: 4rem;
        font-size: var(--text-2xl, 1.5rem);
      }

      /* Focus glow */
      .ui-pin-input__digit:focus {
        border-color: var(--brand, oklch(65% 0.2 270));
        box-shadow: 0 0 0 3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15);
        transform: scale(1.04);
        transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.15s, box-shadow 0.15s;
      }

      /* Filled digit glow */
      .ui-pin-input__digit:not(:placeholder-shown) {
        box-shadow: 0 0 8px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.1);
      }

      /* Focus visible */
      .ui-pin-input__digit:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 1px;
      }

      /* Hover */
      .ui-pin-input__digit:hover:not(:focus):not(:disabled) {
        border-color: var(--border-strong, oklch(100% 0 0 / 0.2));
        background: oklch(100% 0 0 / 0.03);
      }

      /* Disabled */
      .ui-pin-input__digit:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Error state */
      :scope[data-error] .ui-pin-input__digit {
        border-color: var(--status-critical, oklch(65% 0.25 25));
      }
      :scope[data-error] .ui-pin-input__digit:focus {
        border-color: var(--status-critical, oklch(65% 0.25 25));
        box-shadow: 0 0 0 3px oklch(from var(--status-critical, oklch(65% 0.25 25)) l c h / 0.25);
      }

      /* Shake animation on error — motion 2+ */
      :scope[data-error]:not([data-motion="0"]):not([data-motion="1"]) .ui-pin-input__digits {
        animation: ui-pin-shake 0.4s var(--ease-out, ease-out);
      }

      /* Touch targets */
      @media (pointer: coarse) {
        .ui-pin-input__digit {
          min-inline-size: 44px;
          min-block-size: 44px;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-pin-input__digit {
          border: 2px solid ButtonText;
        }
        .ui-pin-input__digit:focus {
          outline: 2px solid Highlight;
        }
        :scope[data-error] .ui-pin-input__digit {
          border-color: LinkText;
        }
      }

      /* Print */
      @media print {
        .ui-pin-input__digit {
          box-shadow: none;
          border: 1px solid;
        }
      }
    }

    @keyframes ui-pin-shake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-4px); }
      40% { transform: translateX(4px); }
      60% { transform: translateX(-2px); }
      80% { transform: translateX(2px); }
    }
  }
`

export const PinInput = forwardRef<HTMLDivElement, PinInputProps>(
  (
    {
      length = 4,
      value: valueProp,
      onChange,
      onComplete,
      mask = true,
      type = 'number',
      placeholder = '○',
      size = 'md',
      error = false,
      disabled = false,
      oneTimeCode = false,
      manageFocus = true,
      motion: motionProp,
      className,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('pin-input', pinInputStyles)
    const motionLevel = useMotionLevel(motionProp)
    const stableId = useStableId('pin')

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
        if (type === 'alphanumeric' && !/^[a-zA-Z0-9]$/.test(char) && char !== '') return

        const chars = currentValue.split('')
        while (chars.length < index) chars.push('')
        chars[index] = char
        const newValue = chars.join('').replace(/\s/g, '')

        updateValue(newValue)

        // Auto-advance
        if (manageFocus && char && index < length - 1) {
          inputRefs.current[index + 1]?.focus()
        }
      },
      [currentValue, type, length, updateValue, manageFocus]
    )

    const handleKeyDown = useCallback(
      (index: number) => (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
          const chars = currentValue.split('')
          if (chars[index]) {
            chars[index] = ''
            updateValue(chars.join('').replace(/\s+$/, ''))
          } else if (manageFocus && index > 0) {
            inputRefs.current[index - 1]?.focus()
          }
        } else if (e.key === 'ArrowLeft' && manageFocus && index > 0) {
          inputRefs.current[index - 1]?.focus()
        } else if (e.key === 'ArrowRight' && manageFocus && index < length - 1) {
          inputRefs.current[index + 1]?.focus()
        }
      },
      [currentValue, updateValue, manageFocus, length]
    )

    const handlePaste = useCallback(
      (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text').slice(0, length)
        if (type === 'number' && !/^\d+$/.test(pasted)) return
        if (type === 'alphanumeric' && !/^[a-zA-Z0-9]+$/.test(pasted)) return
        updateValue(pasted)

        if (manageFocus) {
          const focusIndex = Math.min(pasted.length, length - 1)
          inputRefs.current[focusIndex]?.focus()
        }
      },
      [length, type, updateValue, manageFocus]
    )

    return (
      <div
        ref={ref}
        className={cn(cls('root'), className)}
        data-size={size}
        data-motion={motionLevel}
        {...(error ? { 'data-error': '' } : {})}
        role="group"
        aria-label={rest['aria-label'] || 'PIN input'}
        {...rest}
      >
        <div className="ui-pin-input__digits">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el }}
              type="text"
              inputMode={type === 'number' ? 'numeric' : 'text'}
              className="ui-pin-input__digit"
              value={digit}
              maxLength={1}
              disabled={disabled}
              placeholder={placeholder}
              autoComplete={oneTimeCode ? 'one-time-code' : 'off'}
              aria-label={`PIN digit ${i + 1} of ${length}`}
              aria-invalid={error || undefined}
              data-masked={mask && digit ? true : undefined}
              onChange={handleChange(i)}
              onKeyDown={handleKeyDown(i)}
              onPaste={handlePaste}
            />
          ))}
        </div>
      </div>
    )
  }
)
PinInput.displayName = 'PinInput'
