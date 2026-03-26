'use client'

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: 'ok' | 'warning' | 'critical' | 'info' | 'unknown' | 'maintenance'
  label?: string
  icon?: ReactNode
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  pulse?: boolean
  motion?: 0 | 1 | 2 | 3
}

const statusBadgeStyles = css`
  @layer components {
    @scope (.ui-status-badge) {
      :scope {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs, 0.375rem);
        padding-block: 0.125rem;
        padding-inline: 0.5rem;
        border-radius: var(--radius-full, 9999px);
        background: var(--bg-hover);
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.1));
        font-size: var(--text-xs, 0.75rem);
        font-weight: 500;
        line-height: 1.4;
        font-family: inherit;
        white-space: nowrap;
      }

      /* Sizes */
      :scope[data-size="xs"] {
        padding-block: 0.0625rem;
        padding-inline: 0.375rem;
        font-size: var(--text-xs, 0.6875rem);
        gap: var(--space-xs, 0.1875rem);
      }
      :scope[data-size="sm"] {
        padding-block: 0.125rem;
        padding-inline: 0.5rem;
        font-size: var(--text-xs, 0.75rem);
        gap: var(--space-xs, 0.25rem);
      }
      :scope[data-size="md"] {
        padding-block: 0.25rem;
        padding-inline: 0.625rem;
        font-size: var(--text-sm, 0.875rem);
        gap: var(--space-xs, 0.375rem);
      }
      :scope[data-size="lg"] {
        padding-block: 0.375rem;
        padding-inline: 0.75rem;
        font-size: var(--text-base, 1rem);
        gap: var(--space-sm, 0.5rem);
      }
      :scope[data-size="xl"] {
        padding-block: 0.5rem;
        padding-inline: 0.875rem;
        font-size: var(--text-lg, 1.125rem);
        gap: var(--space-sm, 0.5rem);
      }

      /* Status dot */
      .ui-status-badge__dot {
        position: relative;
        display: inline-block;
        inline-size: 0.5rem;
        block-size: 0.5rem;
        border-radius: var(--radius-full, 9999px);
        flex-shrink: 0;
      }

      /* Status colors for dot */
      :scope[data-status="ok"] .ui-status-badge__dot {
        background: var(--status-ok, oklch(72% 0.19 145));
      }
      :scope[data-status="warning"] .ui-status-badge__dot {
        background: var(--status-warning, oklch(80% 0.15 75));
      }
      :scope[data-status="critical"] .ui-status-badge__dot {
        background: var(--status-critical, oklch(63% 0.24 25));
      }
      :scope[data-status="info"] .ui-status-badge__dot {
        background: var(--status-info, oklch(65% 0.2 270));
      }
      :scope[data-status="unknown"] .ui-status-badge__dot {
        background: var(--text-tertiary, oklch(60% 0 0));
      }
      :scope[data-status="maintenance"] .ui-status-badge__dot {
        background: var(--text-secondary, oklch(70% 0 0));
      }

      /* Status colors for label text */
      :scope[data-status="ok"] {
        color: var(--status-ok, oklch(72% 0.19 145));
      }
      :scope[data-status="warning"] {
        color: var(--status-warning, oklch(80% 0.15 75));
      }
      :scope[data-status="critical"] {
        color: var(--status-critical, oklch(63% 0.24 25));
      }
      :scope[data-status="info"] {
        color: var(--status-info, oklch(65% 0.2 270));
      }
      :scope[data-status="unknown"] {
        color: var(--text-tertiary, oklch(60% 0 0));
      }
      :scope[data-status="maintenance"] {
        color: var(--text-secondary, oklch(70% 0 0));
      }

      /* Pulse animation on dot */
      .ui-status-badge__dot[data-pulse="true"]::after {
        content: '';
        position: absolute;
        inset: -2px;
        border-radius: var(--radius-full, 9999px);
        border: 1.5px solid currentColor;
        opacity: 0;
      }

      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-status-badge__dot[data-pulse="true"]::after {
        animation: ui-status-badge-pulse 2s var(--ease-out, ease-out) infinite;
      }

      /* Icon wrapper */
      .ui-status-badge__icon {
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
      }
      .ui-status-badge__icon svg {
        inline-size: 0.875em;
        block-size: 0.875em;
      }

      /* Label text */
      .ui-status-badge__label {
        font-weight: inherit;
      }

      /* Forced colors */
      @media (forced-colors: active) {
        :scope {
          border: 1px solid ButtonText;
        }
        .ui-status-badge__dot {
          background: ButtonText;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .ui-status-badge__dot[data-pulse="true"]::after {
          animation: none;
        }
      }
    }

    @keyframes ui-status-badge-pulse {
      0% {
        transform: scale(1);
        opacity: 0.6;
      }
      100% {
        transform: scale(2.2);
        opacity: 0;
      }
    }
  }
`

export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  (
    {
      status,
      label,
      icon,
      size = 'sm',
      pulse = false,
      motion: motionProp,
      className,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('status-badge', statusBadgeStyles)
    const motionLevel = useMotionLevel(motionProp)

    return (
      <span
        ref={ref}
        role="status"
        className={cn(cls('root'), className)}
        data-status={status}
        data-size={size}
        data-motion={motionLevel}
        {...rest}
      >
        <span
          className="ui-status-badge__dot"
          data-pulse={pulse || undefined}
          aria-hidden="true"
        />
        {icon && <span className="ui-status-badge__icon" aria-hidden="true">{icon}</span>}
        {label && <span className="ui-status-badge__label">{label}</span>}
      </span>
    )
  }
)
StatusBadge.displayName = 'StatusBadge'
