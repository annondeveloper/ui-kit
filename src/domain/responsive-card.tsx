'use client'

import {
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ResponsiveCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  image?: ReactNode
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  badge?: ReactNode
  variant?: 'default' | 'horizontal' | 'compact'
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const responsiveCardStyles = css`
  @layer components {
    @scope (.ui-responsive-card) {
      :scope {
        position: relative;
        display: flex;
        flex-direction: column;
        container-type: inline-size;
        border-radius: var(--radius-lg, 0.75rem);
        background: var(--bg-surface, oklch(22% 0.02 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        overflow: hidden;
        transition: box-shadow 0.2s var(--ease-out, ease-out),
                    transform 0.2s var(--ease-out, ease-out);
      }

      :scope[data-motion="0"] {
        transition: none;
      }

      /* Aurora glow */
      :scope::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: radial-gradient(
          ellipse at 20% 0%,
          oklch(from var(--aurora-1, oklch(70% 0.15 270)) l c h / 0.04) 0%,
          transparent 60%
        ),
        radial-gradient(
          ellipse at 80% 100%,
          oklch(from var(--aurora-2, oklch(70% 0.15 330)) l c h / 0.03) 0%,
          transparent 50%
        );
        pointer-events: none;
        z-index: 0;
      }

      :scope > * {
        position: relative;
        z-index: 1;
      }

      /* Hover lift — motion 1+ */
      @media (hover: hover) {
        :scope:hover:not([data-motion="0"]) {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md, 0 4px 12px oklch(0% 0 0 / 0.2));
        }
      }

      /* ── Horizontal variant: always horizontal ─────────── */

      :scope[data-variant="horizontal"] {
        flex-direction: row;
      }
      :scope[data-variant="horizontal"] .ui-responsive-card__image {
        max-inline-size: 40%;
        block-size: auto;
        aspect-ratio: auto;
      }
      :scope[data-variant="horizontal"] .ui-responsive-card__content {
        flex: 1;
        min-inline-size: 0;
      }

      /* ── Compact variant: minimal padding ──────────────── */

      :scope[data-variant="compact"] .ui-responsive-card__content {
        padding: var(--space-sm, 0.5rem);
      }
      :scope[data-variant="compact"] .ui-responsive-card__title {
        font-size: var(--text-sm, 0.875rem);
      }
      :scope[data-variant="compact"] .ui-responsive-card__description {
        font-size: var(--text-xs, 0.75rem);
      }

      /* ── Image ─────────────────────────────────────────── */

      .ui-responsive-card__image {
        overflow: hidden;
        line-height: 0;
      }
      .ui-responsive-card__image img,
      .ui-responsive-card__image video,
      .ui-responsive-card__image svg {
        inline-size: 100%;
        block-size: 100%;
        object-fit: cover;
      }

      /* ── Content ───────────────────────────────────────── */

      .ui-responsive-card__content {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs, 0.25rem);
        padding: var(--space-md, 1rem);
        flex: 1;
      }

      .ui-responsive-card__title {
        margin: 0;
        font-size: var(--text-base, 1rem);
        font-weight: 600;
        line-height: 1.4;
        color: var(--text-primary, oklch(90% 0 0));
        text-wrap: balance;
      }

      .ui-responsive-card__description {
        margin: 0;
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.5;
        color: var(--text-secondary, oklch(70% 0 0));
        text-wrap: pretty;
      }

      /* ── Badge ─────────────────────────────────────────── */

      .ui-responsive-card__badge {
        position: absolute;
        inset-block-start: var(--space-sm, 0.5rem);
        inset-inline-end: var(--space-sm, 0.5rem);
        z-index: 2;
      }

      /* ── Actions ───────────────────────────────────────── */

      .ui-responsive-card__actions {
        display: flex;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
        padding-block-start: var(--space-xs, 0.25rem);
        padding-inline: var(--space-md, 1rem);
        padding-block-end: var(--space-md, 1rem);
      }

      /* ── Container-query responsive: narrow (< 280px) ─── */

      @container (max-width: 279px) {
        :scope:not([data-variant="horizontal"]) {
          flex-direction: column;
        }
        .ui-responsive-card__content {
          padding: var(--space-sm, 0.5rem);
        }
        .ui-responsive-card__title {
          font-size: var(--text-sm, 0.875rem);
        }
        .ui-responsive-card__actions {
          padding-inline: var(--space-sm, 0.5rem);
          padding-block-end: var(--space-sm, 0.5rem);
        }
      }

      /* ── Container-query responsive: medium (280-480px) ── */

      @container (min-width: 280px) and (max-width: 480px) {
        :scope:not([data-variant="horizontal"]) {
          flex-direction: column;
        }
      }

      /* ── Container-query responsive: wide (> 480px) ────── */

      @container (min-width: 481px) {
        :scope[data-variant="default"] {
          flex-direction: row;
        }
        :scope[data-variant="default"] .ui-responsive-card__image {
          max-inline-size: 40%;
          block-size: auto;
        }
        :scope[data-variant="default"] .ui-responsive-card__content {
          flex: 1;
          min-inline-size: 0;
        }
      }

      /* ── Focus visible ─────────────────────────────────── */

      :scope:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      /* ── Forced colors ─────────────────────────────────── */

      @media (forced-colors: active) {
        :scope {
          border: 2px solid ButtonText;
        }
        :scope::before {
          display: none;
        }
        :scope:focus-visible {
          outline: 2px solid Highlight;
        }
      }

      /* ── Print ─────────────────────────────────────────── */

      @media print {
        :scope {
          box-shadow: none;
          border: 1px solid;
          break-inside: avoid;
        }
        :scope::before {
          display: none;
        }
      }

      /* ── Reduced data ──────────────────────────────────── */

      @media (prefers-reduced-data: reduce) {
        :scope {
          box-shadow: none;
        }
        :scope::before {
          display: none;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export function ResponsiveCard({
  image,
  title,
  description,
  actions,
  badge,
  variant = 'default',
  motion: motionProp,
  className,
  ...rest
}: ResponsiveCardProps) {
  useStyles('responsive-card', responsiveCardStyles)
  const motionLevel = useMotionLevel(motionProp)

  return (
    <article
      className={cn('ui-responsive-card', className)}
      data-variant={variant}
      data-motion={motionLevel}
      {...rest}
    >
      {badge && (
        <div className="ui-responsive-card__badge">{badge}</div>
      )}

      {image && (
        <div className="ui-responsive-card__image">{image}</div>
      )}

      <div className="ui-responsive-card__content">
        <h3 className="ui-responsive-card__title">{title}</h3>
        {description && (
          <p className="ui-responsive-card__description">{description}</p>
        )}
      </div>

      {actions && (
        <div className="ui-responsive-card__actions">{actions}</div>
      )}
    </article>
  )
}

ResponsiveCard.displayName = 'ResponsiveCard'
