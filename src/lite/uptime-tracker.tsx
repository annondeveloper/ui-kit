import { forwardRef, type HTMLAttributes } from 'react'

export interface LiteUptimeDay {
  date: string
  status: 'up' | 'degraded' | 'down' | 'unknown'
  uptime?: number
}

export interface LiteUptimeTrackerProps extends HTMLAttributes<HTMLDivElement> {
  days: LiteUptimeDay[]
  slaTarget?: number
}

export const UptimeTracker = forwardRef<HTMLDivElement, LiteUptimeTrackerProps>(
  ({ days, slaTarget, className, ...rest }, ref) => (
    <div ref={ref} className={`ui-lite-uptime-tracker${className ? ` ${className}` : ''}`} {...rest}>
      <div className="ui-lite-uptime-tracker__grid">
        {days.map(day => (
          <div
            key={day.date}
            className="ui-lite-uptime-tracker__cell"
            data-status={day.status}
            title={`${day.date}: ${day.status}${day.uptime != null ? ` (${(day.uptime * 100).toFixed(1)}%)` : ''}`}
          />
        ))}
      </div>
      {slaTarget != null && (
        <div className="ui-lite-uptime-tracker__sla">SLA Target: {(slaTarget * 100).toFixed(2)}%</div>
      )}
    </div>
  )
)
UptimeTracker.displayName = 'UptimeTracker'
