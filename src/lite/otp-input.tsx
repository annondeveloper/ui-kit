import { forwardRef, useRef, useCallback, type HTMLAttributes } from 'react'

export interface LiteOtpInputProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  length?: number
  value?: string
  onChange?: (value: string) => void
  onComplete?: (value: string) => void
  error?: string
}

export const OtpInput = forwardRef<HTMLDivElement, LiteOtpInputProps>(
  ({ length = 6, value = '', onChange, onComplete, error, className, ...rest }, ref) => {
    const inputsRef = useRef<(HTMLInputElement | null)[]>([])

    const handleInput = useCallback((index: number, char: string) => {
      const chars = value.split('')
      chars[index] = char
      const next = chars.join('').slice(0, length)
      onChange?.(next)
      if (char && index < length - 1) inputsRef.current[index + 1]?.focus()
      if (next.length === length) onComplete?.(next)
    }, [value, length, onChange, onComplete])

    return (
      <div ref={ref} className={`ui-lite-otp-input${className ? ` ${className}` : ''}`} aria-invalid={!!error} {...rest}>
        {Array.from({ length }, (_, i) => (
          <input
            key={i}
            ref={el => { inputsRef.current[i] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[i] ?? ''}
            aria-label={`Digit ${i + 1}`}
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
