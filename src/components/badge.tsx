'use client'

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
  dot?: boolean
  pulse?: boolean
  count?: number
  maxCount?: number
  icon?: ReactNode
  motion?: 0 | 1 | 2 | 3
}

const badgeStyles = css`
  @layer components {
    @scope (.ui-badge) {
      :scope {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
        border: 1px solid transparent;
        border-radius: var(--radius-full, 9999px);
        font-weight: 600;
        line-height: 1;
        white-space: nowrap;
        user-select: none;
        vertical-align: middle;
        font-family: inherit;
      }

      /* Sizes */
      :scope[data-size="sm"] {
        padding-block: 0.125rem;
        padding-inline: 0.375rem;
        font-size: var(--text-xs, 0.75rem);
      }
      :scope[data-size="md"] {
        padding-block: 0.25rem;
        padding-inline: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
      }

      /* Variants */
      :scope[data-variant="default"] {
        background: oklch(70% 0 0 / 0.12);
        color: var(--text-secondary, oklch(70% 0 0));
        border-color: oklch(70% 0 0 / 0.15);
      }
      :scope[data-variant="primary"] {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.12);
        color: var(--brand, oklch(65% 0.2 270));
        border-color: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2);
      }
      :scope[data-variant="success"] {
        background: oklch(from var(--status-ok, oklch(72% 0.19 155)) l c h / 0.12);
        color: var(--status-ok, oklch(72% 0.19 155));
        border-color: oklch(from var(--status-ok, oklch(72% 0.19 155)) l c h / 0.2);
      }
      :scope[data-variant="warning"] {
        background: oklch(from var(--status-warning, oklch(80% 0.18 85)) l c h / 0.12);
        color: var(--status-warning, oklch(80% 0.18 85));
        border-color: oklch(from var(--status-warning, oklch(80% 0.18 85)) l c h / 0.2);
      }
      :scope[data-variant="danger"] {
        background: oklch(from var(--status-critical, oklch(65% 0.25 25)) l c h / 0.12);
        color: var(--status-critical, oklch(65% 0.25 25));
        border-color: oklch(from var(--status-critical, oklch(65% 0.25 25)) l c h / 0.2);
      }
      :scope[data-variant="info"] {
        background: oklch(from var(--status-info, oklch(65% 0.2 240)) l c h / 0.12);
        color: var(--status-info, oklch(65% 0.2 240));
        border-color: oklch(from var(--status-info, oklch(65% 0.2 240)) l c h / 0.2);
      }

      /* Dot indicator */
      .ui-badge__dot {
        display: inline-block;
        inline-size: 0.5em;
        block-size: 0.5em;
        border-radius: var(--radius-full, 9999px);
        background: currentColor;
        flex-shrink: 0;
      }

      /* Pulse animation on dot — motion level 2+ */
      .ui-badge__dot[data-pulse="true"] {
        position: relative;
      }
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-badge__dot[data-pulse="true"]::after {
        content: '';
        position: absolute;
        inset: -2px;
        border-radius: var(--radius-full, 9999px);
        border: 2px solid currentColor;
        opacity: 0;
        animation: ui-badge-pulse 1.5s var(--ease-out, ease-out) infinite;
      }

      /* Icon wrapper */
      .ui-badge__icon {
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
      }
      .ui-badge__icon svg {
        inline-size: 1em;
        block-size: 1em;
      }

      /* Touch targets */
      @media (pointer: coarse) {
        :scope {
          min-block-size: 28px;
          min-inline-size: 28px;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        :scope {
          border: 1px solid ButtonText;
        }
      }

      /* Print */
      @media print {
        :scope {
          border: 1px solid;
          box-shadow: none;
        }
        .ui-badge__dot[data-pulse="true"]::after {
          animation: none;
        }
      }

      /* Reduced data */
      @media (prefers-reduced-data: reduce) {
        :scope {
          box-shadow: none;
        }
      }
    }

    @keyframes ui-badge-pulse {
      0% {
        transform: scale(1);
        opacity: 0.6;
      }
      100% {
        transform: scale(2);
        opacity: 0;
      }
    }
  }
`

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'default',
      size = 'md',
      dot = false,
      pulse = false,
      count,
      maxCount = 99,
      icon,
      motion: motionProp,
      children,
      className,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('badge', badgeStyles)
    const motionLevel = useMotionLevel(motionProp)

    const displayCount = count !== undefined
      ? count > maxCount
        ? `${maxCount}+`
        : String(count)
      : null

    return (
      <span
        ref={ref}
        className={cn(cls('root'), className)}
        data-variant={variant}
        data-size={size}
        data-motion={motionLevel}
        {...rest}
      >
        {icon && <span className="ui-badge__icon">{icon}</span>}
        {dot && <span className="ui-badge__dot" data-pulse={pulse || undefined} />}
        {displayCount ?? children}
      </span>
    )
  }
)
Badge.displayName = 'Badge'
