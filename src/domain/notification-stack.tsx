'use client'

import {
  useCallback,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'
import { fmtRelative } from '../core/utils/format'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Notification {
  id: string
  title: string
  description?: string
  timestamp: number | Date
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  icon?: ReactNode
  read?: boolean
  group?: string
  action?: { label: string; onClick: () => void }
}

export interface NotificationStackProps extends HTMLAttributes<HTMLDivElement> {
  notifications: Notification[]
  onDismiss?: (id: string) => void
  onDismissAll?: () => void
  onMarkAllRead?: () => void
  onMarkRead?: (id: string) => void
  maxVisible?: number
  emptyMessage?: string
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const notificationStackStyles = css`
  @layer components {
    @scope (.ui-notification-stack) {
      :scope {
        display: flex;
        flex-direction: column;
        gap: 0;
        inline-size: 100%;
        max-inline-size: 420px;
        font-family: inherit;
      }

      /* Header */
      .ui-notification-stack__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-block: var(--space-sm, 0.5rem);
        padding-inline: var(--space-sm, 0.5rem);
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
      }

      .ui-notification-stack__title {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 600;
        color: var(--text-primary, oklch(90% 0 0));
        margin: 0;
      }

      .ui-notification-stack__actions {
        display: flex;
        gap: var(--space-xs, 0.25rem);
      }

      .ui-notification-stack__action-btn {
        display: inline-flex;
        align-items: center;
        padding-block: 0.25rem;
        padding-inline: 0.5rem;
        border: none;
        border-radius: var(--radius-sm, 0.25rem);
        background: transparent;
        color: var(--text-secondary, oklch(70% 0 0));
        font-size: var(--text-xs, 0.75rem);
        font-family: inherit;
        cursor: pointer;
        transition: background 0.15s, color 0.15s;
      }
      .ui-notification-stack__action-btn:hover {
        background: oklch(100% 0 0 / 0.06);
        color: var(--text-primary, oklch(90% 0 0));
      }
      .ui-notification-stack__action-btn:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      /* List */
      .ui-notification-stack__list {
        display: flex;
        flex-direction: column;
        overflow-y: auto;
      }

      /* Group */
      .ui-notification-stack__group-header {
        display: flex;
        align-items: center;
        padding-block: var(--space-xs, 0.25rem);
        padding-inline: var(--space-sm, 0.5rem);
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary, oklch(60% 0 0));
        text-transform: uppercase;
        letter-spacing: 0.05em;
        user-select: none;
        margin-block-start: var(--space-xs, 0.25rem);
      }

      .ui-notification-stack__group-header:first-child {
        margin-block-start: 0;
      }

      /* Notification card */
      .ui-notification {
        position: relative;
        display: flex;
        align-items: flex-start;
        gap: var(--space-sm, 0.5rem);
        padding-block: var(--space-sm, 0.5rem);
        padding-inline: var(--space-sm, 0.5rem);
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.06));
        cursor: pointer;
        transition: background 0.15s;
        border-inline-start: 3px solid transparent;
      }

      .ui-notification:hover {
        background: oklch(100% 0 0 / 0.03);
      }

      /* Unread highlight */
      .ui-notification[data-unread] {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.04);
      }
      .ui-notification[data-unread]:hover {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.07);
      }

      /* Variant left border */
      .ui-notification[data-variant="success"] {
        border-inline-start-color: var(--status-positive, oklch(72% 0.19 155));
      }
      .ui-notification[data-variant="warning"] {
        border-inline-start-color: var(--status-warning, oklch(80% 0.16 80));
      }
      .ui-notification[data-variant="error"] {
        border-inline-start-color: var(--status-critical, oklch(65% 0.25 25));
      }
      .ui-notification[data-variant="info"] {
        border-inline-start-color: var(--brand, oklch(65% 0.2 270));
      }

      /* Entry animation — stagger */
      :scope:not([data-motion="0"]) .ui-notification {
        animation: ui-notification-in 0.2s var(--ease-out, ease-out) both;
      }
      :scope:not([data-motion="0"]) .ui-notification:nth-child(1) { animation-delay: 0ms; }
      :scope:not([data-motion="0"]) .ui-notification:nth-child(2) { animation-delay: 30ms; }
      :scope:not([data-motion="0"]) .ui-notification:nth-child(3) { animation-delay: 60ms; }
      :scope:not([data-motion="0"]) .ui-notification:nth-child(4) { animation-delay: 90ms; }
      :scope:not([data-motion="0"]) .ui-notification:nth-child(5) { animation-delay: 120ms; }

      /* Unread dot */
      .ui-notification__unread-dot {
        flex-shrink: 0;
        inline-size: 0.5rem;
        block-size: 0.5rem;
        border-radius: 50%;
        background: var(--brand, oklch(65% 0.2 270));
        margin-block-start: 0.375rem;
      }

      /* Icon */
      .ui-notification__icon {
        display: flex;
        align-items: center;
        flex-shrink: 0;
        margin-block-start: 0.0625rem;
      }

      /* Content */
      .ui-notification__content {
        display: flex;
        flex-direction: column;
        gap: var(--space-2xs, 0.125rem);
        flex: 1;
        min-inline-size: 0;
      }

      .ui-notification__header-row {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--space-sm, 0.5rem);
      }

      .ui-notification__title {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 500;
        line-height: 1.4;
        color: var(--text-primary, oklch(90% 0 0));
        margin: 0;
      }
      .ui-notification[data-unread] .ui-notification__title {
        font-weight: 600;
      }

      .ui-notification__time {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary, oklch(60% 0 0));
        flex-shrink: 0;
        white-space: nowrap;
      }

      .ui-notification__description {
        font-size: var(--text-xs, 0.75rem);
        line-height: 1.5;
        color: var(--text-secondary, oklch(70% 0 0));
        margin: 0;
      }

      /* Action button */
      .ui-notification__action {
        display: inline-flex;
        align-items: center;
        padding-block: 0.125rem;
        padding-inline: 0.375rem;
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.12));
        border-radius: var(--radius-sm, 0.25rem);
        background: transparent;
        color: var(--text-primary, oklch(90% 0 0));
        font-size: var(--text-xs, 0.75rem);
        font-weight: 500;
        cursor: pointer;
        transition: background 0.15s;
        margin-block-start: var(--space-2xs, 0.125rem);
        align-self: flex-start;
        font-family: inherit;
      }
      .ui-notification__action:hover {
        background: oklch(100% 0 0 / 0.06);
      }
      .ui-notification__action:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      /* Dismiss button */
      .ui-notification__dismiss {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: 1.25rem;
        block-size: 1.25rem;
        padding: 0;
        border: none;
        border-radius: var(--radius-sm, 0.25rem);
        background: transparent;
        color: var(--text-tertiary, oklch(60% 0 0));
        cursor: pointer;
        flex-shrink: 0;
        opacity: 0;
        transition: opacity 0.15s, background 0.15s, color 0.15s;
      }
      .ui-notification:hover .ui-notification__dismiss {
        opacity: 1;
      }
      .ui-notification__dismiss:hover {
        background: oklch(100% 0 0 / 0.08);
        color: var(--text-primary, oklch(90% 0 0));
      }
      .ui-notification__dismiss:focus-visible {
        opacity: 1;
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      /* Empty state */
      .ui-notification-stack__empty {
        display: flex;
        align-items: center;
        justify-content: center;
        padding-block: var(--space-xl, 2rem);
        padding-inline: var(--space-md, 0.75rem);
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-tertiary, oklch(60% 0 0));
      }

      /* Touch targets */
      @media (pointer: coarse) {
        .ui-notification__dismiss {
          min-block-size: 44px;
          min-inline-size: 44px;
          opacity: 1;
        }
        .ui-notification__action {
          min-block-size: 44px;
        }
        .ui-notification-stack__action-btn {
          min-block-size: 44px;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-notification {
          border: 1px solid ButtonText;
        }
        .ui-notification[data-unread] {
          border-inline-start: 3px solid Highlight;
        }
        .ui-notification__unread-dot {
          background: Highlight;
        }
        .ui-notification__dismiss {
          border: 1px solid ButtonText;
        }
        .ui-notification__action {
          border: 1px solid ButtonText;
        }
      }

      /* Print */
      @media print {
        .ui-notification__dismiss,
        .ui-notification-stack__action-btn {
          display: none;
        }
        .ui-notification {
          border-block-end: 1px solid;
        }
      }
    }

    @keyframes ui-notification-in {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }
`

// ─── Close Icon ─────────────────────────────────────────────────────────────

function SmallCloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4 4L12 12M12 4L4 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

export function NotificationStack({
  notifications,
  onDismiss,
  onDismissAll,
  onMarkAllRead,
  onMarkRead,
  maxVisible = 10,
  emptyMessage = 'No notifications',
  motion: motionProp,
  className,
  ...rest
}: NotificationStackProps) {
  useStyles('notification-stack', notificationStackStyles)
  const motionLevel = useMotionLevel(motionProp)

  const visibleNotifications = notifications.slice(0, maxVisible)

  // Group notifications
  const hasGroups = visibleNotifications.some((n) => n.group)

  type Entry =
    | { type: 'group'; name: string }
    | { type: 'notification'; notification: Notification }

  const entries: Entry[] = []
  if (hasGroups) {
    const seen = new Set<string>()
    for (const n of visibleNotifications) {
      const group = n.group ?? ''
      if (group && !seen.has(group)) {
        seen.add(group)
        entries.push({ type: 'group', name: group })
      }
      entries.push({ type: 'notification', notification: n })
    }
  } else {
    for (const n of visibleNotifications) {
      entries.push({ type: 'notification', notification: n })
    }
  }

  const getTimestamp = (ts: number | Date): number =>
    ts instanceof Date ? ts.getTime() : ts

  const hasUnread = notifications.some((n) => !n.read)

  return (
    <div
      className={cn('ui-notification-stack', className)}
      data-motion={motionLevel}
      {...rest}
    >
      {/* Header */}
      <div className="ui-notification-stack__header">
        <h3 className="ui-notification-stack__title">Notifications</h3>
        <div className="ui-notification-stack__actions">
          {hasUnread && onMarkAllRead && (
            <button
              type="button"
              className="ui-notification-stack__action-btn"
              onClick={onMarkAllRead}
            >
              Mark all read
            </button>
          )}
          {notifications.length > 0 && onDismissAll && (
            <button
              type="button"
              className="ui-notification-stack__action-btn"
              onClick={onDismissAll}
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="ui-notification-stack__list">
        {notifications.length === 0 ? (
          <div className="ui-notification-stack__empty">{emptyMessage}</div>
        ) : (
          entries.map((entry, i) => {
            if (entry.type === 'group') {
              return (
                <div
                  key={`group-${entry.name}`}
                  className="ui-notification-stack__group-header"
                >
                  {entry.name}
                </div>
              )
            }

            const n = entry.notification
            const isUnread = n.read === false || n.read === undefined
            const variant = n.variant ?? 'default'
            const ts = getTimestamp(n.timestamp)

            return (
              <article
                key={n.id}
                className="ui-notification"
                data-variant={variant}
                {...(isUnread ? { 'data-unread': '' } : {})}
                onClick={() => {
                  if (isUnread) onMarkRead?.(n.id)
                }}
              >
                {/* Unread dot */}
                {isUnread && <div className="ui-notification__unread-dot" />}

                {/* Icon */}
                {n.icon && (
                  <span className="ui-notification__icon">{n.icon}</span>
                )}

                {/* Content */}
                <div className="ui-notification__content">
                  <div className="ui-notification__header-row">
                    <p className="ui-notification__title">{n.title}</p>
                    <span
                      className="ui-notification__time"
                      data-testid="notification-time"
                    >
                      {fmtRelative(ts)}
                    </span>
                  </div>
                  {n.description && (
                    <p className="ui-notification__description">
                      {n.description}
                    </p>
                  )}
                  {n.action && (
                    <button
                      type="button"
                      className="ui-notification__action"
                      onClick={(e) => {
                        e.stopPropagation()
                        n.action!.onClick()
                      }}
                    >
                      {n.action.label}
                    </button>
                  )}
                </div>

                {/* Dismiss */}
                {onDismiss && (
                  <button
                    type="button"
                    className="ui-notification__dismiss"
                    aria-label="Dismiss notification"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDismiss(n.id)
                    }}
                  >
                    <SmallCloseIcon />
                  </button>
                )}
              </article>
            )
          })
        )}
      </div>
    </div>
  )
}

NotificationStack.displayName = 'NotificationStack'
