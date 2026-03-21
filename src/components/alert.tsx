'use client'

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  variant: 'info' | 'success' | 'warning' | 'error'
  title?: ReactNode
  icon?: ReactNode
  dismissible?: boolean
  onDismiss?: () => void
  action?: { label: string; onClick: () => void }
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  motion?: 0 | 1 | 2 | 3
  children: ReactNode
}

// ─── Variant icons (inline SVGs) ──────────────────────────────────────────

const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
)

const SuccessIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const WarningIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const ErrorIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
)

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const variantIcons = {
  info: InfoIcon,
  success: SuccessIcon,
  warning: WarningIcon,
  error: ErrorIcon,
}

const variantRoles = {
  info: 'status',
  success: 'status',
  warning: 'alert',
  error: 'alert',
} as const

// ─── Styles ─────────────────────────────────────────────────────────────────

const alertStyles = css`
  @layer components {
    @scope (.ui-alert) {
      :scope {
        position: relative;
        display: flex;
        gap: var(--space-sm, 0.5rem);
        padding-block: var(--space-sm, 0.75rem);
        padding-inline: var(--space-md, 1rem);
        border-radius: var(--radius-md, 0.375rem);
        border-inline-start: 4px solid transparent;
        font-family: inherit;
        line-height: 1.5;
      }

      /* Sizes */
      :scope[data-size="xs"] {
        padding-block: 0.25rem;
        padding-inline: 0.5rem;
        gap: var(--space-xs, 0.25rem);
        font-size: var(--text-xs, 0.6875rem);
        border-inline-start-width: 2px;
      }
      :scope[data-size="sm"] {
        padding-block: 0.375rem;
        padding-inline: 0.75rem;
        gap: var(--space-xs, 0.375rem);
        font-size: var(--text-xs, 0.75rem);
        border-inline-start-width: 3px;
      }
      :scope[data-size="md"] {
        padding-block: 0.75rem;
        padding-inline: 1rem;
        font-size: var(--text-sm, 0.875rem);
      }
      :scope[data-size="lg"] {
        padding-block: 1rem;
        padding-inline: 1.25rem;
        gap: var(--space-md, 0.75rem);
        font-size: var(--text-base, 1rem);
        border-inline-start-width: 5px;
      }
      :scope[data-size="xl"] {
        padding-block: 1.25rem;
        padding-inline: 1.5rem;
        gap: var(--space-md, 1rem);
        font-size: var(--text-lg, 1.125rem);
        border-inline-start-width: 6px;
      }

      /* Variant colors */
      :scope[data-variant="info"] {
        border-inline-start-color: var(--status-info, oklch(65% 0.2 250));
        background: oklch(from var(--status-info, oklch(65% 0.2 250)) l c h / 0.08);
      }
      :scope[data-variant="success"] {
        border-inline-start-color: var(--status-positive, oklch(65% 0.2 145));
        background: oklch(from var(--status-positive, oklch(65% 0.2 145)) l c h / 0.08);
      }
      :scope[data-variant="warning"] {
        border-inline-start-color: var(--status-warning, oklch(75% 0.15 80));
        background: oklch(from var(--status-warning, oklch(75% 0.15 80)) l c h / 0.08);
      }
      :scope[data-variant="error"] {
        border-inline-start-color: var(--status-critical, oklch(65% 0.25 25));
        background: oklch(from var(--status-critical, oklch(65% 0.25 25)) l c h / 0.08);
      }

      /* Icon */
      .ui-alert__icon {
        flex-shrink: 0;
        display: flex;
        align-items: flex-start;
        padding-block-start: 0.125rem;
      }
      .ui-alert__icon svg {
        inline-size: 1.25rem;
        block-size: 1.25rem;
      }
      :scope[data-variant="info"] .ui-alert__icon {
        color: var(--status-info, oklch(65% 0.2 250));
      }
      :scope[data-variant="success"] .ui-alert__icon {
        color: var(--status-positive, oklch(65% 0.2 145));
      }
      :scope[data-variant="warning"] .ui-alert__icon {
        color: var(--status-warning, oklch(75% 0.15 80));
      }
      :scope[data-variant="error"] .ui-alert__icon {
        color: var(--status-critical, oklch(65% 0.25 25));
      }

      /* Content */
      .ui-alert__content {
        flex: 1;
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: var(--space-xs, 0.25rem);
      }

      .ui-alert__title {
        font-weight: 600;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-primary, oklch(90% 0 0));
      }

      .ui-alert__body {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary, oklch(70% 0 0));
      }

      /* Actions */
      .ui-alert__actions {
        padding-block-start: var(--space-xs, 0.25rem);
      }
      .ui-alert__action-btn {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
        padding: 0;
        border: none;
        background: none;
        font-family: inherit;
        font-size: var(--text-sm, 0.875rem);
        font-weight: 600;
        cursor: pointer;
        text-decoration: underline;
        text-underline-offset: 2px;
      }
      :scope[data-variant="info"] .ui-alert__action-btn {
        color: var(--status-info, oklch(65% 0.2 250));
      }
      :scope[data-variant="success"] .ui-alert__action-btn {
        color: var(--status-positive, oklch(65% 0.2 145));
      }
      :scope[data-variant="warning"] .ui-alert__action-btn {
        color: var(--status-warning, oklch(75% 0.15 80));
      }
      :scope[data-variant="error"] .ui-alert__action-btn {
        color: var(--status-critical, oklch(65% 0.25 25));
      }
      .ui-alert__action-btn:hover {
        opacity: 0.8;
      }
      .ui-alert__action-btn:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
        border-radius: var(--radius-sm, 0.25rem);
      }

      /* Dismiss button */
      .ui-alert__dismiss {
        position: absolute;
        inset-block-start: var(--space-xs, 0.5rem);
        inset-inline-end: var(--space-xs, 0.5rem);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.25rem;
        border: none;
        background: none;
        color: var(--text-tertiary, oklch(60% 0 0));
        cursor: pointer;
        border-radius: var(--radius-sm, 0.25rem);
        transition: color 0.15s var(--ease-out, ease-out);
      }
      .ui-alert__dismiss:hover {
        color: var(--text-primary, oklch(90% 0 0));
      }
      .ui-alert__dismiss:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 1px;
      }
      .ui-alert__dismiss svg {
        inline-size: 1rem;
        block-size: 1rem;
      }

      /* Entry animation — motion level 1+ */
      :scope:not([data-motion="0"]) {
        animation: ui-alert-slide-in 0.25s var(--ease-out, ease-out);
      }

      /* Forced colors */
      @media (forced-colors: active) {
        :scope {
          border: 2px solid CanvasText;
        }
        .ui-alert__dismiss {
          color: ButtonText;
        }
        .ui-alert__action-btn {
          color: LinkText;
        }
      }

      /* Print */
      @media print {
        :scope {
          border-inline-start-width: 4px;
          background: none;
        }
      }
    }

    @keyframes ui-alert-slide-in {
      from {
        opacity: 0;
        transform: translateX(-8px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      variant,
      title,
      icon,
      dismissible = false,
      onDismiss,
      action,
      size = 'md',
      motion: motionProp,
      children,
      className,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('alert', alertStyles)
    const motionLevel = useMotionLevel(motionProp)

    const IconComponent = variantIcons[variant]
    const role = variantRoles[variant]

    return (
      <div
        ref={ref}
        className={cn(cls('root'), className)}
        data-variant={variant}
        data-size={size}
        data-motion={motionLevel}
        role={role}
        {...rest}
      >
        <span className="ui-alert__icon" aria-hidden="true">
          {icon || <IconComponent />}
        </span>

        <div className="ui-alert__content">
          {title && <div className="ui-alert__title">{title}</div>}
          <div className="ui-alert__body">{children}</div>
          {action && (
            <div className="ui-alert__actions">
              <button
                type="button"
                className="ui-alert__action-btn"
                onClick={action.onClick}
              >
                {action.label}
              </button>
            </div>
          )}
        </div>

        {dismissible && (
          <button
            type="button"
            className="ui-alert__dismiss"
            onClick={onDismiss}
            aria-label="Dismiss"
          >
            <CloseIcon />
          </button>
        )}
      </div>
    )
  }
)
Alert.displayName = 'Alert'
