import { forwardRef, type HTMLAttributes } from 'react'

export interface LiteStatusPulseProps extends HTMLAttributes<HTMLSpanElement> {
  status: 'ok' | 'warning' | 'critical' | 'info'
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

export const StatusPulse = forwardRef<HTMLSpanElement, LiteStatusPulseProps>(
  ({ status, size = 'md', label, className, ...rest }, ref) => (
    <span
      ref={ref}
      className={`ui-lite-status-pulse${className ? ` ${className}` : ''}`}
      data-status={status}
      data-size={size}
      aria-label={label ?? status}
      {...rest}
    />
  )
)
StatusPulse.displayName = 'StatusPulse'
