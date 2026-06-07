import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const entityCardStyles = css`
  @layer components {
    @scope (.ui-lite-entity-card) {
      :scope {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm, 0.5rem);
        padding: var(--space-md, 1rem);
        border-radius: var(--radius-lg, 0.75rem);
        background: var(--bg-surface, oklch(22% 0.02 270));
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.08));
        color: var(--text-primary, oklch(90% 0 0));
        font-family: inherit;
        min-inline-size: 280px;
      }

      /* Sizes */
      :scope[data-size="sm"] {
        padding: var(--space-sm, 0.5rem);
        gap: var(--space-xs, 0.25rem);
        font-size: var(--text-xs, 0.75rem);
      }
      :scope[data-size="lg"] {
        padding: var(--space-lg, 1.5rem);
        gap: var(--space-md, 1rem);
      }

      /* Compact */
      :scope[data-compact] {
        flex-direction: row;
        align-items: center;
        padding: var(--space-sm, 0.5rem) var(--space-md, 1rem);
        gap: var(--space-md, 1rem);
      }
      :scope[data-compact] .ui-lite-entity-card__metrics,
      :scope[data-compact] .ui-lite-entity-card__tags {
        display: none;
      }

      /* Status accents */
      :scope[data-status="ok"] { border-inline-start: 3px solid oklch(72% 0.19 155); }
      :scope[data-status="warning"] { border-inline-start: 3px solid oklch(80% 0.18 85); }
      :scope[data-status="critical"] { border-inline-start: 3px solid oklch(62% 0.22 25); }
      :scope[data-status="unknown"] { border-inline-start: 3px solid var(--text-tertiary, oklch(55% 0 0)); }
      :scope[data-status="maintenance"] { border-inline-start: 3px solid oklch(65% 0.15 270); }

      /* Header */
      .ui-lite-entity-card__header {
        display: flex;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
      }
      .ui-lite-entity-card__icon {
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
      .ui-lite-entity-card__name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 600;
        color: var(--text-primary, oklch(90% 0 0));
        line-height: 1.3;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .ui-lite-entity-card__type {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary, oklch(55% 0 0));
        text-transform: capitalize;
      }

      /* Status badge */
      .ui-lite-entity-card__status {
        flex-shrink: 0;
        margin-inline-start: auto;
        display: inline-flex;
        align-items: center;
        padding: 0.125rem 0.5rem;
        border-radius: 9999px;
        font-size: var(--text-xs, 0.75rem);
        font-weight: 500;
        line-height: 1.4;
        text-transform: capitalize;
      }
      .ui-lite-entity-card__status[data-status="ok"] { background: oklch(72% 0.19 155 / 0.12); color: oklch(72% 0.19 155); }
      .ui-lite-entity-card__status[data-status="warning"] { background: oklch(80% 0.18 85 / 0.12); color: oklch(80% 0.18 85); }
      .ui-lite-entity-card__status[data-status="critical"] { background: oklch(62% 0.22 25 / 0.12); color: oklch(62% 0.22 25); }
      .ui-lite-entity-card__status[data-status="unknown"] { background: oklch(55% 0 0 / 0.12); color: var(--text-tertiary, oklch(55% 0 0)); }
      .ui-lite-entity-card__status[data-status="maintenance"] { background: oklch(65% 0.15 270 / 0.12); color: oklch(65% 0.15 270); }

      /* Metrics */
      .ui-lite-entity-card__metrics {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-sm, 0.5rem) var(--space-md, 1rem);
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary, oklch(70% 0 0));
        font-variant-numeric: tabular-nums;
      }

      /* Tags */
      .ui-lite-entity-card__tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
      }
      .ui-lite-entity-card__tag {
        display: inline-flex;
        padding: 0.0625rem 0.375rem;
        border-radius: var(--radius-sm, 0.375rem);
        font-size: var(--text-xs, 0.75rem);
        background: var(--bg-hover, oklch(100% 0 0 / 0.06));
        color: var(--text-secondary, oklch(70% 0 0));
        line-height: 1.5;
      }

      @media (forced-colors: active) {
        :scope { border: 1px solid ButtonText; }
      }
    }
  }
`

export interface LiteEntityCardProps extends HTMLAttributes<HTMLDivElement> {
  name: string
  type?: string
  status?: 'ok' | 'warning' | 'critical' | 'unknown' | 'maintenance'
  icon?: ReactNode
  metrics?: { label: string; value: string }[]
  tags?: string[]
  compact?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const EntityCard = forwardRef<HTMLDivElement, LiteEntityCardProps>(
  ({ name, type, status, icon, metrics, tags, compact, size, className, ...rest }, ref) => {
    useStyles('lite-entity-card', entityCardStyles)
    return (
    <div
      ref={ref}
      className={`ui-lite-entity-card${className ? ` ${className}` : ''}`}
      data-status={status}
      data-size={size}
      {...(compact && { 'data-compact': '' })}
      {...rest}
    >
      <div className="ui-lite-entity-card__header">
        {icon && <span className="ui-lite-entity-card__icon">{icon}</span>}
        <div>
          <div className="ui-lite-entity-card__name">{name}</div>
          {type && <div className="ui-lite-entity-card__type">{type}</div>}
        </div>
        {status && <span className="ui-lite-entity-card__status" data-status={status}>{status}</span>}
      </div>
      {metrics && metrics.length > 0 && (
        <div className="ui-lite-entity-card__metrics">
          {metrics.map((m, i) => (
            <span key={`${m.label}-${i}`}>{m.label}: {m.value}</span>
          ))}
        </div>
      )}
      {tags && tags.length > 0 && (
        <div className="ui-lite-entity-card__tags">
          {tags.map((t) => <span key={t} className="ui-lite-entity-card__tag">{t}</span>)}
        </div>
      )}
    </div>
    )
  }
)
EntityCard.displayName = 'EntityCard'
