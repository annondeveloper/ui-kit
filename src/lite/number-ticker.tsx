import { forwardRef, useMemo, type HTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const numberTickerStyles = css`
  @layer components {
    @scope (.ui-lite-number-ticker) {
      :scope {
        display: inline-flex;
        align-items: baseline;
        font-variant-numeric: tabular-nums;
        line-height: 1;
        color: var(--text-primary, oklch(97% 0 0));
      }
    }
  }
`

export interface LiteNumberTickerProps extends HTMLAttributes<HTMLSpanElement> {
  value: number
}

export const NumberTicker = forwardRef<HTMLSpanElement, LiteNumberTickerProps>(
  ({ value, className, ...rest }, ref) => {
    useStyles('lite-number-ticker', numberTickerStyles)
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
