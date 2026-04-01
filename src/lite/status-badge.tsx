import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteStatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: 'ok' | 'warning' | 'critical' | 'info' | 'unknown' | 'maintenance'
  label?: string
  size?: 'sm' | 'md' | 'lg'
  /** Icon rendered before label */
  icon?: ReactNode
  /** Animate the status dot with a pulse effect */
  pulse?: boolean
}

export const StatusBadge = forwardRef<HTMLSpanElement, LiteStatusBadgeProps>(
  ({ status, label, size = 'md', icon, pulse, className, ...rest }, ref) => (
    <span
      ref={ref}
      className={`ui-lite-status-badge${className ? ` ${className}` : ''}`}
      data-status={status}
      data-size={size}
      data-pulse={pulse ? '' : undefined}
      {...rest}
    >
      <span className="ui-lite-status-badge__dot" />
      {icon && <span className="ui-lite-status-badge__icon" aria-hidden="true">{icon}</span>}
      {label && <span>{label}</span>}
    </span>
  )
)
StatusBadge.displayName = 'StatusBadge'
