'use client'

import {
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useEntrance } from '../core/motion/use-entrance'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  secondaryAction?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const emptyStateStyles = css`
  @layer components {
    @scope (.ui-empty-state) {
      :scope {
        display: flex;
        min-inline-size: 240px;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        container-type: inline-size;
      }

      /* ── Size: sm ───────────────────────────────────────── */

      :scope[data-size="sm"] {
        gap: var(--space-xs, 0.25rem);
        padding: var(--space-md, 1rem);
      }

      :scope[data-size="sm"] .ui-empty-state__icon {
        font-size: 2rem;
        block-size: 2rem;
        inline-size: 2rem;
      }

      :scope[data-size="sm"] .ui-empty-state__title {
        font-size: var(--text-sm, 0.875rem);
      }

      :scope[data-size="sm"] .ui-empty-state__description {
        font-size: var(--text-xs, 0.75rem);
      }

      /* ── Size: md (default) ─────────────────────────────── */

      :scope[data-size="md"] {
        gap: var(--space-sm, 0.5rem);
        padding: var(--space-xl, 2rem);
      }

      :scope[data-size="md"] .ui-empty-state__icon {
        font-size: 3rem;
        block-size: 3rem;
        inline-size: 3rem;
      }

      :scope[data-size="md"] .ui-empty-state__title {
        font-size: var(--text-lg, 1.125rem);
      }

      :scope[data-size="md"] .ui-empty-state__description {
        font-size: var(--text-sm, 0.875rem);
      }

      /* ── Size: lg ───────────────────────────────────────── */

      :scope[data-size="lg"] {
        gap: var(--space-md, 1rem);
        padding: var(--space-2xl, 3rem) var(--space-xl, 2rem);
      }

      :scope[data-size="lg"] .ui-empty-state__icon {
        font-size: 4rem;
        block-size: 4rem;
        inline-size: 4rem;
      }

      :scope[data-size="lg"] .ui-empty-state__title {
        font-size: var(--text-2xl, 1.5rem);
      }

      :scope[data-size="lg"] .ui-empty-state__description {
        font-size: var(--text-base, 1rem);
        max-inline-size: 32rem;
      }

      /* ── Icon ───────────────────────────────────────────── */

      .ui-empty-state__icon {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-tertiary, oklch(55% 0 0));
        margin-block-end: var(--space-xs, 0.25rem);
      }

      .ui-empty-state__icon > svg,
      .ui-empty-state__icon > img {
        block-size: 100%;
        inline-size: 100%;
      }

      /* Aurora glow on icon — motion 2+ */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-empty-state__icon::before {
        content: '';
        position: absolute;
        inset: -50%;
        border-radius: 50%;
        background: radial-gradient(
          circle,
          oklch(from var(--aurora-1, oklch(70% 0.15 270)) l c h / 0.06) 0%,
          oklch(from var(--aurora-2, oklch(70% 0.15 330)) l c h / 0.03) 40%,
          transparent 70%
        );
        pointer-events: none;
        z-index: -1;
      }

      /* ── Title ──────────────────────────────────────────── */

      .ui-empty-state__title {
        margin: 0;
        font-weight: 600;
        line-height: 1.3;
        color: var(--text-primary, oklch(90% 0 0));
        text-wrap: balance;
      }

      /* ── Description ────────────────────────────────────── */

      .ui-empty-state__description {
        margin: 0;
        line-height: 1.5;
        color: var(--text-secondary, oklch(70% 0 0));
        text-wrap: pretty;
        max-inline-size: 28rem;
      }

      /* ── Actions ────────────────────────────────────────── */

      .ui-empty-state__actions {
        display: flex;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
        margin-block-start: var(--space-sm, 0.5rem);
        flex-wrap: wrap;
        justify-content: center;
      }

      /* ── Container-query responsive: narrow ─────────────── */

      @container (max-width: 280px) {
        :scope[data-size="md"] {
          padding: var(--space-md, 1rem);
        }
        :scope[data-size="md"] .ui-empty-state__icon {
          font-size: 2.5rem;
          block-size: 2.5rem;
          inline-size: 2.5rem;
        }
        :scope[data-size="lg"] {
          padding: var(--space-lg, 1.5rem);
        }
        :scope[data-size="lg"] .ui-empty-state__icon {
          font-size: 3rem;
          block-size: 3rem;
          inline-size: 3rem;
        }
        :scope[data-size="lg"] .ui-empty-state__title {
          font-size: var(--text-xl, 1.25rem);
        }
      }

      /* ── Forced colors ──────────────────────────────────── */

      @media (forced-colors: active) {
        .ui-empty-state__icon::before {
          display: none;
        }
        .ui-empty-state__title {
          color: CanvasText;
        }
        .ui-empty-state__description {
          color: GrayText;
        }
      }

      /* ── Reduced motion ─────────────────────────────────── */

      @media (prefers-reduced-motion: reduce) {
        .ui-empty-state__icon::before {
          display: none;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  size = 'md',
  motion: motionProp,
  className,
  ...rest
}: EmptyStateProps) {
  useStyles('empty-state', emptyStateStyles)
  const motionLevel = useMotionLevel(motionProp)
  const containerRef = useRef<HTMLDivElement>(null)

  // Scale entrance at motion level 2+
  useEntrance(
    containerRef,
    motionLevel >= 2 ? 'scale' : 'none',
    { duration: 350 }
  )

  const hasActions = Boolean(action || secondaryAction)

  return (
    <div
      ref={containerRef}
      className={cn('ui-empty-state', className)}
      data-size={size}
      data-motion={motionLevel}
      {...rest}
    >
      {icon && (
        <div className="ui-empty-state__icon" aria-hidden="true">
          {icon}
        </div>
      )}

      <h3 className="ui-empty-state__title">{title}</h3>

      {description && (
        <p className="ui-empty-state__description">{description}</p>
      )}

      {hasActions && (
        <div className="ui-empty-state__actions">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  )
}

EmptyState.displayName = 'EmptyState'
