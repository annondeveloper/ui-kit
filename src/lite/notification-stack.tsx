import { forwardRef, type HTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const notificationStackStyles = css`
  @layer components {
    @scope (.ui-lite-notification-stack) {
      :scope { display: flex; flex-direction: column; gap: 0.375rem; }
      .ui-lite-notification-stack__item {
        display: flex; align-items: flex-start; justify-content: space-between;
        gap: 0.5rem;
        padding: 0.625rem 0.75rem; border-radius: var(--radius-md, 10px);
        background: var(--bg-surface, oklch(12% 0.015 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.04));
        font-size: 0.8125rem;
      }
      .ui-lite-notification-stack__item[data-variant="success"] { border-inline-start: 3px solid oklch(72% 0.19 155); }
      .ui-lite-notification-stack__item[data-variant="warning"] { border-inline-start: 3px solid oklch(80% 0.18 85); }
      .ui-lite-notification-stack__item[data-variant="error"] { border-inline-start: 3px solid oklch(62% 0.22 25); }
      .ui-lite-notification-stack__item[data-variant="info"] { border-inline-start: 3px solid oklch(65% 0.2 270); }
      .ui-lite-notification-stack__item[data-read] { opacity: 0.6; }
      .ui-lite-notification-stack__item strong { display: block; font-size: 0.8125rem; color: var(--text-primary, oklch(97% 0 0)); }
      .ui-lite-notification-stack__item p { margin: 0.125rem 0 0; font-size: 0.75rem; color: var(--text-secondary, oklch(70% 0 0)); }
      .ui-lite-notification-stack__item button {
        background: none; border: none; cursor: pointer;
        color: var(--text-secondary, oklch(70% 0 0));
        font-size: 1rem; padding: 0; flex-shrink: 0; line-height: 1;
      }
      .ui-lite-notification-stack__item button:hover { color: var(--text-primary, oklch(97% 0 0)); }
      .ui-lite-notification-stack__item button:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270)); outline-offset: 2px; border-radius: 2px;
      }
    }
  }
`

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
  ({ notifications, onDismiss, className, ...rest }, ref) => {
    useStyles('lite-notification-stack', notificationStackStyles)
    return (
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
  }
)
NotificationStack.displayName = 'NotificationStack'
