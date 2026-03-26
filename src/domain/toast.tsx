'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ToastOptions {
  title: string
  description?: string
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  duration?: number
  action?: { label: string; onClick: () => void }
  dismissible?: boolean
  icon?: ReactNode
  id?: string
}

export interface ToastApi {
  toast: (options: ToastOptions) => string
  dismiss: (id: string) => void
  dismissAll: () => void
}

export interface ToastProviderProps {
  children: ReactNode
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center'
  maxVisible?: number
  motion?: 0 | 1 | 2 | 3
}

interface InternalToast extends ToastOptions {
  _id: string
  _createdAt: number
  _remaining: number
  _paused: boolean
}

// ─── Context ────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastApi | null>(null)

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>')
  }
  return ctx
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const toastStyles = css`
  @layer components {
    @scope (.ui-toast-container) {
      :scope {
        position: fixed;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: var(--space-sm, 0.5rem);
        padding: var(--space-md, 0.75rem);
        pointer-events: none;
        max-block-size: 100dvh;
        overflow: hidden;
      }

      /* Position variants */
      :scope[data-position="top-right"] {
        inset-block-start: 0;
        inset-inline-end: 0;
        align-items: flex-end;
      }
      :scope[data-position="top-center"] {
        inset-block-start: 0;
        inset-inline-start: 50%;
        transform: translateX(-50%);
        align-items: center;
      }
      :scope[data-position="bottom-right"] {
        inset-block-end: 0;
        inset-inline-end: 0;
        align-items: flex-end;
        flex-direction: column-reverse;
      }
      :scope[data-position="bottom-center"] {
        inset-block-end: 0;
        inset-inline-start: 50%;
        transform: translateX(-50%);
        align-items: center;
        flex-direction: column-reverse;
      }

      .ui-toast {
        position: relative;
        display: flex;
        align-items: flex-start;
        gap: var(--space-sm, 0.5rem);
        min-inline-size: 300px;
        max-inline-size: 420px;
        padding: var(--space-md, 0.75rem) var(--space-lg, 1.25rem);
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-lg, 0.75rem);
        background: var(--bg-elevated, oklch(22% 0.01 270));
        box-shadow: var(--shadow-lg, 0 8px 24px oklch(0% 0 0 / 0.3));
        color: var(--text-primary, oklch(90% 0 0));
        pointer-events: auto;
        overflow: hidden;
        border-inline-start: 3px solid transparent;
      }

      /* Variant colors — left border */
      .ui-toast[data-variant="success"] {
        border-inline-start-color: var(--status-positive, oklch(72% 0.19 155));
      }
      .ui-toast[data-variant="warning"] {
        border-inline-start-color: var(--status-warning, oklch(80% 0.16 80));
      }
      .ui-toast[data-variant="error"] {
        border-inline-start-color: var(--status-critical, oklch(65% 0.25 25));
      }
      .ui-toast[data-variant="info"] {
        border-inline-start-color: var(--brand, oklch(65% 0.2 270));
      }
      .ui-toast[data-variant="default"] {
        border-inline-start-color: var(--border-default, oklch(100% 0 0 / 0.12));
      }

      /* Entry animation */
      .ui-toast:not([data-motion="0"]) {
        animation: ui-toast-in 0.25s var(--ease-out, ease-out);
      }

      /* Icon */
      .ui-toast__icon {
        display: flex;
        align-items: center;
        flex-shrink: 0;
        margin-block-start: 0.0625rem;
      }

      /* Content */
      .ui-toast__content {
        display: flex;
        flex-direction: column;
        gap: var(--space-2xs, 0.125rem);
        flex: 1;
        min-inline-size: 0;
      }

      .ui-toast__title {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 600;
        line-height: 1.4;
        color: var(--text-primary, oklch(90% 0 0));
        margin: 0;
      }

      .ui-toast__description {
        font-size: var(--text-xs, 0.75rem);
        line-height: 1.5;
        color: var(--text-secondary, oklch(70% 0 0));
        margin: 0;
      }

      /* Action button */
      .ui-toast__action {
        display: inline-flex;
        align-items: center;
        padding-block: 0.25rem;
        padding-inline: 0.5rem;
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.12));
        border-radius: var(--radius-sm, 0.25rem);
        background: transparent;
        color: var(--text-primary, oklch(90% 0 0));
        font-size: var(--text-xs, 0.75rem);
        font-weight: 500;
        cursor: pointer;
        transition: background 0.15s;
        margin-block-start: var(--space-xs, 0.25rem);
        align-self: flex-start;
        font-family: inherit;
      }
      .ui-toast__action:hover {
        background: var(--bg-hover);
      }
      .ui-toast__action:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      /* Close button */
      .ui-toast__close {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: 1.5rem;
        block-size: 1.5rem;
        padding: 0;
        border: none;
        border-radius: var(--radius-sm, 0.25rem);
        background: transparent;
        color: var(--text-tertiary, oklch(60% 0 0));
        cursor: pointer;
        flex-shrink: 0;
        transition: background 0.15s, color 0.15s;
        font-size: 1rem;
        line-height: 1;
      }
      .ui-toast__close:hover {
        background: var(--bg-active);
        color: var(--text-primary, oklch(90% 0 0));
      }
      .ui-toast__close:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      /* Progress bar */
      .ui-toast__progress {
        position: absolute;
        inset-block-end: 0;
        inset-inline-start: 0;
        block-size: 2px;
        background: var(--brand, oklch(65% 0.2 270));
        border-radius: 1px;
        transition: inline-size 0.1s linear;
      }
      .ui-toast[data-variant="success"] .ui-toast__progress {
        background: var(--status-positive, oklch(72% 0.19 155));
      }
      .ui-toast[data-variant="warning"] .ui-toast__progress {
        background: var(--status-warning, oklch(80% 0.16 80));
      }
      .ui-toast[data-variant="error"] .ui-toast__progress {
        background: var(--status-critical, oklch(65% 0.25 25));
      }
      .ui-toast[data-variant="info"] .ui-toast__progress {
        background: var(--brand, oklch(65% 0.2 270));
      }

      /* Aurora glow */
      .ui-toast {
        box-shadow:
          var(--shadow-lg, 0 8px 24px oklch(0% 0 0 / 0.3)),
          0 0 0 1px oklch(65% 0.15 270 / 0.06);
      }

      /* Touch targets */
      @media (pointer: coarse) {
        .ui-toast__close {
          min-block-size: 44px;
          min-inline-size: 44px;
        }
        .ui-toast__action {
          min-block-size: 44px;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-toast {
          border: 2px solid ButtonText;
          background: Canvas;
          color: CanvasText;
        }
        .ui-toast__close {
          border: 1px solid ButtonText;
        }
        .ui-toast__action {
          border: 1px solid ButtonText;
        }
        .ui-toast__progress {
          background: Highlight;
        }
      }

      /* Print */
      @media print {
        :scope {
          display: none;
        }
      }
    }

    @keyframes ui-toast-in {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  }
`

// ─── Close Icon ─────────────────────────────────────────────────────────────

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4 4L12 12M12 4L4 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

// ─── Variant Icons ──────────────────────────────────────────────────────────

function VariantIcon({ variant }: { variant: string }) {
  const iconColor: Record<string, string> = {
    success: 'var(--status-positive, oklch(72% 0.19 155))',
    warning: 'var(--status-warning, oklch(80% 0.16 80))',
    error: 'var(--status-critical, oklch(65% 0.25 25))',
    info: 'var(--brand, oklch(65% 0.2 270))',
  }
  const color = iconColor[variant]
  if (!color) return null

  if (variant === 'success') {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="7" stroke={color} strokeWidth="1.5" />
        <path d="M5 8l2 2 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (variant === 'error') {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="7" stroke={color} strokeWidth="1.5" />
        <path d="M6 6l4 4M10 6l-4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }
  if (variant === 'warning') {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 1.5L14.5 13H1.5L8 1.5z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M8 6v3M8 11.5v0" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }
  // info
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" stroke={color} strokeWidth="1.5" />
      <path d="M8 7v4M8 4.5v0" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// ─── Single Toast Component ─────────────────────────────────────────────────

function ToastItem({
  toast: t,
  onDismiss,
  motionLevel,
}: {
  toast: InternalToast
  onDismiss: (id: string) => void
  motionLevel: number
}) {
  const toastRef = useRef<HTMLDivElement>(null)
  const dismissible = t.dismissible !== false
  const variant = t.variant ?? 'default'
  const duration = t.duration ?? 5000
  const isPersistent = duration === 0

  // ── Timer logic with pause on hover ──────────────────────────────
  const remainingRef = useRef(t._remaining)
  const startedRef = useRef(Date.now())
  const pausedRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const startTimer = useCallback(() => {
    if (isPersistent || remainingRef.current <= 0) return
    startedRef.current = Date.now()
    timerRef.current = setTimeout(() => {
      onDismiss(t._id)
    }, remainingRef.current)
  }, [isPersistent, onDismiss, t._id])

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    const elapsed = Date.now() - startedRef.current
    remainingRef.current = Math.max(0, remainingRef.current - elapsed)
    pausedRef.current = true
  }, [])

  const resumeTimer = useCallback(() => {
    pausedRef.current = false
    startTimer()
  }, [startTimer])

  useEffect(() => {
    startTimer()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [startTimer])

  return (
    <div
      ref={toastRef}
      className="ui-toast"
      role="status"
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      data-variant={variant}
      data-motion={motionLevel}
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
    >
      {/* Icon */}
      {t.icon ? (
        <span className="ui-toast__icon">{t.icon}</span>
      ) : variant !== 'default' ? (
        <span className="ui-toast__icon">
          <VariantIcon variant={variant} />
        </span>
      ) : null}

      {/* Content */}
      <div className="ui-toast__content">
        <p className="ui-toast__title">{t.title}</p>
        {t.description && (
          <p className="ui-toast__description">{t.description}</p>
        )}
        {t.action && (
          <button
            type="button"
            className="ui-toast__action"
            onClick={t.action.onClick}
          >
            {t.action.label}
          </button>
        )}
      </div>

      {/* Close */}
      {dismissible && (
        <button
          type="button"
          className="ui-toast__close"
          onClick={() => onDismiss(t._id)}
          aria-label="Dismiss"
        >
          <CloseIcon />
        </button>
      )}

      {/* Progress bar */}
      {!isPersistent && (
        <div
          className="ui-toast__progress"
          style={{
            inlineSize: '100%',
            animationDuration: `${duration}ms`,
          }}
        />
      )}
    </div>
  )
}

// ─── Provider ───────────────────────────────────────────────────────────────

let toastCounter = 0

export function ToastProvider({
  children,
  position = 'top-right',
  maxVisible = 5,
  motion: motionProp,
}: ToastProviderProps) {
  useStyles('toast', toastStyles)
  const motionLevel = useMotionLevel(motionProp)
  const [toasts, setToasts] = useState<InternalToast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t._id !== id))
  }, [])

  const dismissAll = useCallback(() => {
    setToasts([])
  }, [])

  const toast = useCallback((options: ToastOptions): string => {
    const id = options.id ?? `toast-${++toastCounter}`
    const duration = options.duration ?? 5000
    const internal: InternalToast = {
      ...options,
      _id: id,
      _createdAt: Date.now(),
      _remaining: duration,
      _paused: false,
    }

    setToasts((prev) => {
      // Deduplication: replace existing toast with same ID
      const filtered = options.id
        ? prev.filter((t) => t._id !== options.id)
        : prev
      return [...filtered, internal]
    })

    return id
  }, [])

  const api: ToastApi = { toast, dismiss, dismissAll }

  // Separate visible and queued
  const visibleToasts = toasts.slice(0, maxVisible)

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="ui-toast-container"
        data-position={position}
        data-motion={motionLevel}
      >
        {visibleToasts.map((t) => (
          <ToastItem
            key={t._id}
            toast={t}
            onDismiss={dismiss}
            motionLevel={motionLevel}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

ToastProvider.displayName = 'ToastProvider'
