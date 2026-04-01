import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteAlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: 'info' | 'success' | 'warning' | 'error'
  title?: ReactNode
  icon?: ReactNode
  dismissible?: boolean
  onDismiss?: () => void
  action?: { label: string; onClick: () => void }
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  banner?: boolean
  compact?: boolean
  children?: ReactNode
}

export const Alert = forwardRef<HTMLDivElement, LiteAlertProps>(
  ({ variant = 'info', title, icon, dismissible, onDismiss, action, size = 'md', banner, compact, className, role = 'alert', children, ...rest }, ref) => (
    <div
      ref={ref}
      className={`ui-lite-alert${className ? ` ${className}` : ''}`}
      data-variant={variant}
      data-size={size}
      data-banner={banner || undefined}
      data-compact={compact || undefined}
      role={role}
      {...rest}
    >
      {icon && <span className="ui-lite-alert__icon">{icon}</span>}
      <div className="ui-lite-alert__content">
        {title && <div className="ui-lite-alert__title">{title}</div>}
        {children && <div className="ui-lite-alert__body">{children}</div>}
      </div>
      {action && (
        <button type="button" className="ui-lite-alert__action" onClick={action.onClick}>
          {action.label}
        </button>
      )}
      {dismissible && (
        <button type="button" className="ui-lite-alert__dismiss" onClick={onDismiss} aria-label="Dismiss">
          ×
        </button>
      )}
    </div>
  )
)
Alert.displayName = 'Alert'
