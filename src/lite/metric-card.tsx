import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

export interface LiteMetricCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode
  value: ReactNode
  change?: { value: number; period?: string }
  trend?: 'up' | 'down' | 'flat'
  status?: 'ok' | 'warning' | 'critical'
  icon?: ReactNode
}

const metricCardStyles = css`
  @layer components {
    @scope (.ui-lite-metric-card) {
      :scope {
        padding: 1rem;
        background: var(--bg-surface, oklch(12% 0.015 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.04));
        border-radius: var(--radius-lg, 14px);
      }

      .ui-lite-metric-card__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-block-end: 0.5rem;
      }
      .ui-lite-metric-card__title {
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--text-secondary, oklch(70% 0 0));
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .ui-lite-metric-card__icon {
        font-size: 1.125rem;
        opacity: 0.6;
      }
      .ui-lite-metric-card__value {
        font-size: 1.75rem;
        font-weight: 700;
        line-height: 1.2;
      }
      .ui-lite-metric-card__change {
        font-size: 0.75rem;
        margin-block-start: 0.25rem;
      }
      .ui-lite-metric-card__change[data-trend="up"] { color: oklch(72% 0.19 145); }
      .ui-lite-metric-card__change[data-trend="down"] { color: oklch(62% 0.22 25); }
      .ui-lite-metric-card__change[data-trend="flat"] { color: var(--text-secondary, oklch(70% 0 0)); }
      .ui-lite-metric-card__period {
        margin-inline-start: 0.25rem;
        color: var(--text-secondary, oklch(70% 0 0));
      }

      :scope[data-status="warning"] { border-inline-start: 3px solid oklch(78% 0.17 85); }
      :scope[data-status="critical"] { border-inline-start: 3px solid oklch(62% 0.22 25); }
    }
  }
`

export const MetricCard = forwardRef<HTMLDivElement, LiteMetricCardProps>(
  ({ title, value, change, trend, status, icon, className, ...rest }, ref) => {
    useStyles('lite-metric-card', metricCardStyles)
    return (
    <div
      ref={ref}
      className={`ui-lite-metric-card${className ? ` ${className}` : ''}`}
      data-status={status}
      data-trend={trend}
      {...rest}
    >
      <div className="ui-lite-metric-card__header">
        <span className="ui-lite-metric-card__title">{title}</span>
        {icon && <span className="ui-lite-metric-card__icon">{icon}</span>}
      </div>
      <div className="ui-lite-metric-card__value">{value}</div>
      {change && (
        <div className="ui-lite-metric-card__change" data-trend={trend}>
          <span>{change.value > 0 ? '+' : ''}{change.value}%</span>
          {change.period && <span className="ui-lite-metric-card__period">{change.period}</span>}
        </div>
      )}
    </div>
  )
  }
)
MetricCard.displayName = 'MetricCard'
