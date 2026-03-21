import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteTimelineEvent {
  id: string
  timestamp: number | Date
  severity: 'info' | 'warning' | 'critical' | 'ok'
  title: ReactNode
  description?: ReactNode
}

export interface LiteSeverityTimelineProps extends HTMLAttributes<HTMLDivElement> {
  events: LiteTimelineEvent[]
}

export const SeverityTimeline = forwardRef<HTMLDivElement, LiteSeverityTimelineProps>(
  ({ events, className, ...rest }, ref) => (
    <div ref={ref} className={`ui-lite-severity-timeline${className ? ` ${className}` : ''}`} {...rest}>
      {events.map(event => (
        <div key={event.id} className="ui-lite-severity-timeline__event" data-severity={event.severity}>
          <span className="ui-lite-severity-timeline__dot" />
          <div className="ui-lite-severity-timeline__content">
            <span className="ui-lite-severity-timeline__time">
              {new Date(event.timestamp).toLocaleString()}
            </span>
            <strong>{event.title}</strong>
            {event.description && <p>{event.description}</p>}
          </div>
        </div>
      ))}
    </div>
  )
)
SeverityTimeline.displayName = 'SeverityTimeline'
