import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteMetricCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode
  value: ReactNode
  change?: { value: number; period?: string }
  trend?: 'up' | 'down' | 'flat'
  status?: 'ok' | 'warning' | 'critical'
  icon?: ReactNode
}

export const MetricCard = forwardRef<HTMLDivElement, LiteMetricCardProps>(
  ({ title, value, change, trend, status, icon, className, ...rest }, ref) => (
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
)
MetricCard.displayName = 'MetricCard'
