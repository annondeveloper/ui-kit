import { forwardRef, useMemo, type HTMLAttributes } from 'react'

export interface LiteNumberTickerProps extends HTMLAttributes<HTMLSpanElement> {
  value: number
}

export const NumberTicker = forwardRef<HTMLSpanElement, LiteNumberTickerProps>(
  ({ value, className, ...rest }, ref) => {
    const formatted = useMemo(
      () => new Intl.NumberFormat().format(value),
      [value]
    )

    return (
      <span
        ref={ref}
        className={`ui-lite-number-ticker${className ? ` ${className}` : ''}`}
        data-value={value}
        aria-label={String(value)}
        role="img"
        {...rest}
      >
        {formatted}
      </span>
    )
  }
)
NumberTicker.displayName = 'NumberTicker'
