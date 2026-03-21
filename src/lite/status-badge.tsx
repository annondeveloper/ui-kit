import { forwardRef, type HTMLAttributes } from 'react'

export interface LiteStatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: 'ok' | 'warning' | 'critical' | 'info' | 'unknown' | 'maintenance'
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

export const StatusBadge = forwardRef<HTMLSpanElement, LiteStatusBadgeProps>(
  ({ status, label, size = 'md', className, ...rest }, ref) => (
    <span
      ref={ref}
      className={`ui-lite-status-badge${className ? ` ${className}` : ''}`}
      data-status={status}
      data-size={size}
      {...rest}
    >
      <span className="ui-lite-status-badge__dot" />
      {label && <span>{label}</span>}
    </span>
  )
)
StatusBadge.displayName = 'StatusBadge'
