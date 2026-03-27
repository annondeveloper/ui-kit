import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

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
  ({ name, type, status, icon, metrics, tags, compact, size, className, ...rest }, ref) => (
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
)
EntityCard.displayName = 'EntityCard'
