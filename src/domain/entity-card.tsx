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
import { ComponentErrorBoundary } from '../core/utils/error-boundary'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface EntityCardProps extends HTMLAttributes<HTMLDivElement> {
  name: string
  type?: string
  status?: 'ok' | 'warning' | 'critical' | 'unknown' | 'maintenance'
  icon?: ReactNode
  metrics?: { label: string; value: string }[]
  tags?: string[]
  href?: string
  actions?: { label: string; icon?: ReactNode; onClick: () => void }[]
  compact?: boolean
  size?: 'sm' | 'md' | 'lg'
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const entityCardStyles = css`
  @layer components {
    @scope (.ui-entity-card) {
      :scope {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: var(--space-sm, 0.5rem);
        padding: var(--space-md, 1rem);
        container-type: inline-size;
        border-radius: var(--radius-lg, 0.75rem);
        background: var(--bg-surface, oklch(22% 0.02 270));
        border: 1px solid var(--border-default);
        box-shadow: var(--shadow-sm);
        overflow: hidden;
        min-inline-size: 280px;
        transition: box-shadow 0.2s var(--ease-out, ease-out),
                    transform 0.2s var(--ease-out, ease-out),
                    border-color 0.2s ease;
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

      /* Clickable card */
      :scope[data-clickable] {
        cursor: pointer;
      }

      /* Size variants */
      :scope[data-size="sm"] {
        padding: var(--space-sm, 0.5rem);
        gap: var(--space-xs, 0.25rem);
        font-size: var(--text-xs, 0.75rem);
      }
      :scope[data-size="lg"] {
        padding: var(--space-lg, 1.5rem);
        gap: var(--space-md, 1rem);
      }

      /* Compact variant */
      :scope[data-compact] {
        flex-direction: row;
        align-items: center;
        padding: var(--space-sm, 0.5rem) var(--space-md, 1rem);
        gap: var(--space-md, 1rem);
      }
      :scope[data-compact] .ui-entity-card__body {
        flex: 1;
        min-inline-size: 0;
      }
      :scope[data-compact] .ui-entity-card__metrics,
      :scope[data-compact] .ui-entity-card__tags,
      :scope[data-compact] .ui-entity-card__actions {
        display: none;
      }

      /* Status accents */
      :scope[data-status="ok"] {
        border-inline-start: 3px solid oklch(72% 0.19 155);
      }
      :scope[data-status="warning"] {
        border-inline-start: 3px solid oklch(80% 0.18 85);
      }
      :scope[data-status="critical"] {
        border-inline-start: 3px solid oklch(62% 0.22 25);
      }
      :scope[data-status="unknown"] {
        border-inline-start: 3px solid var(--text-tertiary, oklch(55% 0 0));
      }
      :scope[data-status="maintenance"] {
        border-inline-start: 3px solid oklch(65% 0.15 270);
      }

      /* Header */
      .ui-entity-card__header {
        display: flex;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
      }

      .ui-entity-card__icon {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        inline-size: 2rem;
        block-size: 2rem;
        border-radius: var(--radius-md, 0.5rem);
        background: var(--bg-hover, oklch(100% 0 0 / 0.06));
        color: var(--text-secondary, oklch(70% 0 0));
      }

      :scope[data-size="sm"] .ui-entity-card__icon {
        inline-size: 1.5rem;
        block-size: 1.5rem;
      }
      :scope[data-size="lg"] .ui-entity-card__icon {
        inline-size: 2.5rem;
        block-size: 2.5rem;
      }

      .ui-entity-card__info {
        flex: 1;
        min-inline-size: 0;
      }

      .ui-entity-card__name {
        margin: 0;
        font-size: var(--text-sm, 0.875rem);
        font-weight: 600;
        color: var(--text-primary, oklch(90% 0 0));
        text-wrap: balance;
        line-height: 1.3;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      :scope[data-size="lg"] .ui-entity-card__name {
        font-size: var(--text-base, 1rem);
      }

      .ui-entity-card__type {
        margin: 0;
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary, oklch(55% 0 0));
        text-transform: capitalize;
      }

      /* Status badge */
      .ui-entity-card__status {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.125rem 0.5rem;
        border-radius: 9999px;
        font-size: var(--text-xs, 0.75rem);
        font-weight: 500;
        line-height: 1.4;
        text-transform: capitalize;
      }

      .ui-entity-card__status-dot {
        inline-size: 6px;
        block-size: 6px;
        border-radius: 9999px;
        animation: ui-entity-card-pulse 2s ease-in-out infinite;
      }

      @keyframes ui-entity-card-pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.6; transform: scale(0.85); }
      }

      :scope[data-motion="0"] .ui-entity-card__status-dot {
        animation: none;
      }

      @media (prefers-reduced-motion: reduce) {
        .ui-entity-card__status-dot { animation: none; }
      }

      .ui-entity-card__status[data-status="ok"] {
        background: oklch(72% 0.19 155 / 0.12);
        color: oklch(72% 0.19 155);
      }
      .ui-entity-card__status[data-status="ok"] .ui-entity-card__status-dot {
        background: oklch(72% 0.19 155);
      }
      .ui-entity-card__status[data-status="warning"] {
        background: oklch(80% 0.18 85 / 0.12);
        color: oklch(80% 0.18 85);
      }
      .ui-entity-card__status[data-status="warning"] .ui-entity-card__status-dot {
        background: oklch(80% 0.18 85);
      }
      .ui-entity-card__status[data-status="critical"] {
        background: oklch(62% 0.22 25 / 0.12);
        color: oklch(62% 0.22 25);
      }
      .ui-entity-card__status[data-status="critical"] .ui-entity-card__status-dot {
        background: oklch(62% 0.22 25);
      }
      .ui-entity-card__status[data-status="unknown"] {
        background: oklch(55% 0 0 / 0.12);
        color: var(--text-tertiary, oklch(55% 0 0));
      }
      .ui-entity-card__status[data-status="unknown"] .ui-entity-card__status-dot {
        background: var(--text-tertiary, oklch(55% 0 0));
      }
      .ui-entity-card__status[data-status="maintenance"] {
        background: oklch(65% 0.15 270 / 0.12);
        color: oklch(65% 0.15 270);
      }
      .ui-entity-card__status[data-status="maintenance"] .ui-entity-card__status-dot {
        background: oklch(65% 0.15 270);
      }

      /* Metrics row */
      .ui-entity-card__metrics {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-sm, 0.5rem) var(--space-md, 1rem);
      }

      .ui-entity-card__metric {
        display: flex;
        flex-direction: column;
        gap: 0;
      }

      .ui-entity-card__metric-value {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 600;
        color: var(--text-primary, oklch(90% 0 0));
        font-variant-numeric: tabular-nums;
        line-height: 1.3;
      }

      .ui-entity-card__metric-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary, oklch(55% 0 0));
        line-height: 1.3;
      }

      /* Tags */
      .ui-entity-card__tags {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-2xs, 0.125rem);
      }

      .ui-entity-card__tag {
        display: inline-flex;
        padding: 0.0625rem 0.375rem;
        border-radius: var(--radius-sm, 0.375rem);
        font-size: var(--text-xs, 0.75rem);
        background: var(--bg-hover, oklch(100% 0 0 / 0.06));
        color: var(--text-secondary, oklch(70% 0 0));
        line-height: 1.5;
      }

      /* Actions footer */
      .ui-entity-card__actions {
        display: flex;
        gap: var(--space-xs, 0.25rem);
        border-block-start: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.06));
        padding-block-start: var(--space-sm, 0.5rem);
        margin-block-start: var(--space-2xs, 0.125rem);
      }

      .ui-entity-card__action {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.25rem 0.5rem;
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-sm, 0.375rem);
        background: transparent;
        color: var(--text-secondary, oklch(70% 0 0));
        font-size: var(--text-xs, 0.75rem);
        cursor: pointer;
        transition: background 0.15s ease, color 0.15s ease;
      }
      .ui-entity-card__action:hover {
        background: var(--bg-hover, oklch(100% 0 0 / 0.06));
        color: var(--text-primary, oklch(90% 0 0));
      }

      /* Hover lift */
      @media (hover: hover) {
        :scope:hover:not([data-motion="0"]) {
          transform: translateY(-1px);
          box-shadow: var(--shadow-md, 0 4px 12px oklch(0% 0 0 / 0.2));
        }
      }

      /* Container query: narrow — hide metrics/tags */
      @container (max-width: 200px) {
        .ui-entity-card__metrics,
        .ui-entity-card__tags,
        .ui-entity-card__actions {
          display: none;
        }
        :scope {
          padding: var(--space-sm, 0.5rem);
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        :scope {
          border: 2px solid ButtonText;
        }
        :scope::before {
          display: none;
        }
        :scope[data-status="ok"],
        :scope[data-status="warning"],
        :scope[data-status="critical"],
        :scope[data-status="unknown"],
        :scope[data-status="maintenance"] {
          border-inline-start: 3px solid Highlight;
        }
        .ui-entity-card__status {
          border: 1px solid ButtonText;
        }
      }

      /* Print */
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
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

function EntityCardInner({
  name,
  type,
  status,
  icon,
  metrics,
  tags,
  href,
  actions,
  compact,
  size = 'md',
  motion: motionProp,
  className,
  onClick,
  ...rest
}: EntityCardProps) {
  useStyles('entity-card', entityCardStyles)
  const motionLevel = useMotionLevel(motionProp)
  const cardRef = useRef<HTMLDivElement>(null)

  useEntrance(
    cardRef,
    motionLevel >= 2 ? 'fade-up' : 'none',
    { duration: 280 }
  )

  const isClickable = !!href || !!onClick
  const Tag = href ? 'a' : 'div'

  const linkProps = href
    ? { href, target: undefined, rel: undefined }
    : {}

  return (
    <Tag
      {...linkProps}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div
        ref={cardRef}
        className={cn('ui-entity-card', className)}
        data-motion={motionLevel}
        data-size={size}
        {...(status && { 'data-status': status })}
        {...(compact && { 'data-compact': '' })}
        {...(isClickable && { 'data-clickable': '' })}
        role="group"
        aria-label={name}
        onClick={onClick}
        {...rest}
      >
        <div className="ui-entity-card__header">
          {icon && <span className="ui-entity-card__icon">{icon}</span>}
          <div className="ui-entity-card__info">
            <h3 className="ui-entity-card__name" title={name}>{name}</h3>
            {type && <p className="ui-entity-card__type">{type}</p>}
          </div>
          {status && (
            <span className="ui-entity-card__status" data-status={status}>
              <span className="ui-entity-card__status-dot" aria-hidden="true" />
              {status}
            </span>
          )}
        </div>

        {metrics && metrics.length > 0 && (
          <div className="ui-entity-card__metrics">
            {metrics.map((m, i) => (
              <div key={`${m.label}-${i}`} className="ui-entity-card__metric">
                <span className="ui-entity-card__metric-value">{m.value}</span>
                <span className="ui-entity-card__metric-label">{m.label}</span>
              </div>
            ))}
          </div>
        )}

        {tags && tags.length > 0 && (
          <div className="ui-entity-card__tags">
            {tags.map((tag) => (
              <span key={tag} className="ui-entity-card__tag">{tag}</span>
            ))}
          </div>
        )}

        {actions && actions.length > 0 && (
          <div className="ui-entity-card__actions">
            {actions.map((action) => (
              <button
                key={action.label}
                className="ui-entity-card__action"
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  action.onClick()
                }}
                type="button"
                aria-label={action.label}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </Tag>
  )
}

export function EntityCard(props: EntityCardProps) {
  return (
    <ComponentErrorBoundary>
      <EntityCardInner {...props} />
    </ComponentErrorBoundary>
  )
}

EntityCard.displayName = 'EntityCard'
