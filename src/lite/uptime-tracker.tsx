import { forwardRef, type HTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const uptimeTrackerStyles = css`
  @layer components {
    @scope (.ui-lite-uptime-tracker) {
      .ui-lite-uptime-tracker__grid {
        display: flex;
        gap: 2px;
        flex-wrap: wrap;
      }
      .ui-lite-uptime-tracker__cell {
        inline-size: 12px;
        block-size: 12px;
        border-radius: 2px;
        background: oklch(50% 0 0 / 0.15);
      }
      .ui-lite-uptime-tracker__cell[data-status="up"] { background: oklch(72% 0.19 145); }
      .ui-lite-uptime-tracker__cell[data-status="degraded"] { background: oklch(78% 0.17 85); }
      .ui-lite-uptime-tracker__cell[data-status="down"] { background: oklch(62% 0.22 25); }
      .ui-lite-uptime-tracker__cell[data-status="unknown"] { background: oklch(50% 0 0 / 0.15); }
      .ui-lite-uptime-tracker__sla {
        font-size: 0.75rem;
        color: var(--text-secondary, oklch(70% 0 0));
        margin-block-start: 0.5rem;
      }
    }
  }
`

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
  ({ days, slaTarget, className, ...rest }, ref) => {
    useStyles('lite-uptime-tracker', uptimeTrackerStyles)
    return (
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
  }
)
UptimeTracker.displayName = 'UptimeTracker'
