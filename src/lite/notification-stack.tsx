import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteNotification {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  read?: boolean
}

export interface LiteNotificationStackProps extends HTMLAttributes<HTMLDivElement> {
  notifications: LiteNotification[]
  onDismiss?: (id: string) => void
}

export const NotificationStack = forwardRef<HTMLDivElement, LiteNotificationStackProps>(
  ({ notifications, onDismiss, className, ...rest }, ref) => (
    <div ref={ref} className={`ui-lite-notification-stack${className ? ` ${className}` : ''}`} aria-live="polite" {...rest}>
      {notifications.map(n => (
        <div key={n.id} className="ui-lite-notification-stack__item" data-variant={n.variant ?? 'default'} data-read={n.read ? '' : undefined}>
          <div>
            <strong>{n.title}</strong>
            {n.description && <p>{n.description}</p>}
          </div>
          {onDismiss && <button type="button" aria-label="Dismiss" onClick={() => onDismiss(n.id)}>&times;</button>}
        </div>
      ))}
    </div>
  )
)
NotificationStack.displayName = 'NotificationStack'
