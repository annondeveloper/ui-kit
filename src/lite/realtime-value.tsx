import { forwardRef, type HTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const realtimeValueStyles = css`
  @layer components {
    @scope (.ui-lite-realtime-value) {
      :scope {
        display: inline-flex;
        align-items: baseline;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        color: var(--text-primary, oklch(97% 0 0));
      }
      :scope[data-trend="up"] { color: oklch(72% 0.19 145); }
      :scope[data-trend="down"] { color: oklch(62% 0.22 25); }
      :scope[data-trend="flat"] { color: var(--text-secondary, oklch(70% 0 0)); }
      @media (forced-colors: active) {
        :scope[data-trend="up"],
        :scope[data-trend="down"] { color: LinkText; }
      }
    }
  }
`

export interface LiteRealtimeValueProps extends HTMLAttributes<HTMLSpanElement> {
  value: number
  previousValue?: number
  format?: (value: number) => string
}

export const RealtimeValue = forwardRef<HTMLSpanElement, LiteRealtimeValueProps>(
  ({ value, previousValue, format, className, ...rest }, ref) => {
    useStyles('lite-realtime-value', realtimeValueStyles)
    const trend = previousValue != null ? (value > previousValue ? 'up' : value < previousValue ? 'down' : 'flat') : undefined
    const display = format ? format(value) : String(value)
    return (
      <span
        ref={ref}
        className={`ui-lite-realtime-value${className ? ` ${className}` : ''}`}
        data-trend={trend}
        {...rest}
      >
        {display}
      </span>
    )
  }
)
RealtimeValue.displayName = 'RealtimeValue'
