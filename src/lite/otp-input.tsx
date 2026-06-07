import { forwardRef, useCallback, useEffect, useRef, type HTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const otpInputStyles = css`
  @layer components {
    @scope (.ui-lite-otp-input) {
      :scope { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; }
      :scope input {
        inline-size: 2.5rem; block-size: 2.5rem;
        text-align: center; font-size: 1.25rem; font-family: inherit;
        background: var(--bg-surface, oklch(12% 0.015 270));
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-md, 10px);
        color: var(--text-primary, oklch(97% 0 0));
      }
      :scope[data-size="sm"] input { inline-size: 2rem; block-size: 2rem; font-size: 1rem; }
      :scope[data-size="lg"] input { inline-size: 3rem; block-size: 3rem; font-size: 1.5rem; }
      :scope input:focus { outline: none; border-color: var(--brand, oklch(65% 0.2 270)); }
      :scope input:disabled { opacity: 0.5; cursor: not-allowed; }
      :scope[aria-invalid="true"] input { border-color: oklch(62% 0.22 25); }
      .ui-lite-otp-input__error { font-size: 0.75rem; color: oklch(62% 0.22 25); flex-basis: 100%; }
    }
  }
`

export interface LiteOtpInputProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  length?: number
  value?: string
  onChange?: (value: string) => void
  onComplete?: (value: string) => void
  error?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  /** 'number' sets inputMode numeric; 'text' allows any character */
  type?: 'number' | 'text'
  autoFocus?: boolean
}

export const OtpInput = forwardRef<HTMLDivElement, LiteOtpInputProps>(
  ({ length = 6, value = '', onChange, onComplete, error, disabled, size, type = 'number', autoFocus, className, ...rest }, ref) => {
    useStyles('lite-otp-input', otpInputStyles)
    const inputsRef = useRef<(HTMLInputElement | null)[]>([])

    useEffect(() => {
      if (autoFocus) inputsRef.current[0]?.focus()
    }, [autoFocus])

    const handleInput = useCallback((index: number, char: string) => {
      const chars = value.split('')
      chars[index] = char
      const next = chars.join('').slice(0, length)
      onChange?.(next)
      if (char && index < length - 1) inputsRef.current[index + 1]?.focus()
      if (next.length === length) onComplete?.(next)
    }, [value, length, onChange, onComplete])

    return (
      <div
        ref={ref}
        className={`ui-lite-otp-input${className ? ` ${className}` : ''}`}
        aria-invalid={!!error}
        data-size={size}
        {...rest}
      >
        {Array.from({ length }, (_, i) => (
          <input
            key={i}
            ref={el => { inputsRef.current[i] = el }}
            type="text"
            inputMode={type === 'number' ? 'numeric' : 'text'}
            maxLength={1}
            value={value[i] ?? ''}
            disabled={disabled}
            aria-label={`Digit ${i + 1} of ${length}`}
            onChange={e => handleInput(i, e.target.value)}
            onKeyDown={e => { if (e.key === 'Backspace' && !value[i] && i > 0) inputsRef.current[i - 1]?.focus() }}
          />
        ))}
        {error && <span className="ui-lite-otp-input__error">{error}</span>}
      </div>
    )
  }
)
OtpInput.displayName = 'OtpInput'
