'use client'

import type React from 'react'
import { useEffect, useRef, useCallback, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from '../utils'
import {
  Info, CheckCircle2, AlertTriangle, XCircle, X,
} from 'lucide-react'

export interface Notification {
  id: string
  title: string
  message?: string
  type: 'info' | 'success' | 'warning' | 'error'
  action?: { label: string; onClick: () => void }
  /** Whether the notification can be dismissed. */
  dismissible?: boolean
  /** Auto-dismiss after this many ms. 0 = persistent. */
  duration?: number
  timestamp?: Date
}

export interface NotificationStackProps {
  notifications: Notification[]
  /** Callback to dismiss a notification by id. */
  onDismiss: (id: string) => void
  /** Screen corner positioning. */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  /** Max visible cards before stacking remainder. */
  maxVisible?: number
  className?: string
}

const TYPE_ICON: Record<Notification['type'], React.FC<{ className?: string }>> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
}

const TYPE_COLOR: Record<Notification['type'], string> = {
  info: 'border-l-[hsl(var(--brand-secondary))]',
  success: 'border-l-[hsl(var(--status-ok))]',
  warning: 'border-l-[hsl(var(--status-warning))]',
  error: 'border-l-[hsl(var(--status-critical))]',
}

const TYPE_ICON_COLOR: Record<Notification['type'], string> = {
  info: 'text-[hsl(var(--brand-secondary))]',
  success: 'text-[hsl(var(--status-ok))]',
  warning: 'text-[hsl(var(--status-warning))]',
  error: 'text-[hsl(var(--status-critical))]',
}

const POSITION_CLASSES: Record<NonNullable<NotificationStackProps['position']>, string> = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
}

const SLIDE_FROM: Record<NonNullable<NotificationStackProps['position']>, { x: number }> = {
  'top-right': { x: 80 },
  'top-left': { x: -80 },
  'bottom-right': { x: 80 },
  'bottom-left': { x: -80 },
}

/**
 * @description A fixed-position notification stack with auto-dismiss progress bars,
 * type-specific icons and colors, action buttons, and stacking overflow.
 */
export function NotificationStack({
  notifications,
  onDismiss,
  position = 'top-right',
  maxVisible = 5,
  className,
}: NotificationStackProps): React.JSX.Element {
  const reduced = useReducedMotion()
  const visible = notifications.slice(0, maxVisible)
  const overflow = notifications.length - maxVisible

  return (
    <div
      className={cn(
        'fixed z-50 flex flex-col gap-2 w-[360px] max-w-[calc(100vw-2rem)]',
        POSITION_CLASSES[position],
        className,
      )}
      role="region"
      aria-label="Notifications"
    >
      <AnimatePresence initial={false}>
        {visible.map((notification, idx) => (
          <motion.div
            key={notification.id}
            layout={!reduced}
            initial={reduced ? { opacity: 1 } : { opacity: 0, ...SLIDE_FROM[position] }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, ...SLIDE_FROM[position], transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <NotificationCard
              notification={notification}
              onDismiss={onDismiss}
              reduced={!!reduced}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Overflow indicator */}
      {overflow > 0 && (
        <div className="text-center text-xs text-[hsl(var(--text-tertiary))] py-1">
          +{overflow} more {overflow === 1 ? 'notification' : 'notifications'}
        </div>
      )}
    </div>
  )
}

function NotificationCard({
  notification,
  onDismiss,
  reduced,
}: {
  notification: Notification
  onDismiss: (id: string) => void
  reduced: boolean
}): React.JSX.Element {
  const { id, title, message, type, action, dismissible = true, duration = 0 } = notification
  const Icon = TYPE_ICON[type]
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [progress, setProgress] = useState(100)
  const startTimeRef = useRef(Date.now())

  // Auto-dismiss timer
  useEffect(() => {
    if (duration <= 0) return

    startTimeRef.current = Date.now()

    // Progress countdown
    const intervalId = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)
      if (remaining <= 0) {
        clearInterval(intervalId)
      }
    }, 50)

    timerRef.current = setTimeout(() => {
      onDismiss(id)
    }, duration)

    return () => {
      clearInterval(intervalId)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [id, duration, onDismiss])

  const handleDismiss = useCallback(() => {
    onDismiss(id)
  }, [id, onDismiss])

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border-l-[3px] shadow-lg',
        'bg-[hsl(var(--bg-elevated))] border border-[hsl(var(--border-subtle))]',
        TYPE_COLOR[type],
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <Icon className={cn('size-5 shrink-0 mt-0.5', TYPE_ICON_COLOR[type])} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[hsl(var(--text-primary))]">{title}</p>
          {message && (
            <p className="mt-0.5 text-xs text-[hsl(var(--text-secondary))] line-clamp-2">
              {message}
            </p>
          )}
          {action && (
            <button
              type="button"
              onClick={action.onClick}
              className={cn(
                'mt-2 text-xs font-medium cursor-pointer',
                'text-[hsl(var(--brand-primary))] hover:underline',
              )}
            >
              {action.label}
            </button>
          )}
        </div>
        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            className={cn(
              'shrink-0 p-0.5 rounded cursor-pointer',
              'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]',
              'hover:bg-[hsl(var(--bg-overlay))] transition-colors duration-100',
            )}
            aria-label="Dismiss notification"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {/* Auto-dismiss progress bar */}
      {duration > 0 && (
        <div className="h-0.5 bg-[hsl(var(--bg-overlay))]">
          <div
            className={cn('h-full transition-[width] duration-100', TYPE_COLOR[type].replace('border-l-', 'bg-'))}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}
