import { forwardRef, type HTMLAttributes } from 'react'

export interface LiteRealtimeValueProps extends HTMLAttributes<HTMLSpanElement> {
  value: number
  previousValue?: number
  format?: (value: number) => string
}

export const RealtimeValue = forwardRef<HTMLSpanElement, LiteRealtimeValueProps>(
  ({ value, previousValue, format, className, ...rest }, ref) => {
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
