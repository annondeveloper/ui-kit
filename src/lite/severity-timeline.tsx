import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const severityTimelineStyles = css`
  @layer components {
    @scope (.ui-lite-severity-timeline) {
      :scope {
        position: relative;
        display: flex;
        flex-direction: column;
      }
      .ui-lite-severity-timeline__event {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0 0.5rem;
        position: relative;
        padding-block-end: 1rem;
      }
      .ui-lite-severity-timeline__event:not(:last-child)::before {
        content: '';
        position: absolute;
        inset-inline-start: calc(0.5rem - 1px);
        inset-block-start: 1.25rem;
        inset-block-end: 0;
        inline-size: 2px;
        background: var(--border-subtle, oklch(100% 0 0 / 0.08));
      }
      .ui-lite-severity-timeline__dot {
        inline-size: 1rem;
        block-size: 1rem;
        border-radius: 50%;
        flex-shrink: 0;
        position: relative;
        z-index: 1;
      }
      .ui-lite-severity-timeline__event[data-severity="info"] .ui-lite-severity-timeline__dot {
        background: var(--status-info, oklch(65% 0.2 270));
      }
      .ui-lite-severity-timeline__event[data-severity="warning"] .ui-lite-severity-timeline__dot {
        background: var(--status-warning, oklch(80% 0.18 85));
      }
      .ui-lite-severity-timeline__event[data-severity="critical"] .ui-lite-severity-timeline__dot {
        background: var(--status-critical, oklch(62% 0.22 25));
      }
      .ui-lite-severity-timeline__event[data-severity="ok"] .ui-lite-severity-timeline__dot {
        background: var(--status-ok, oklch(72% 0.19 155));
      }
      .ui-lite-severity-timeline__content {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
      }
      .ui-lite-severity-timeline__time {
        font-size: 0.75rem;
        color: var(--text-tertiary, oklch(55% 0 0));
        font-variant-numeric: tabular-nums;
      }
      .ui-lite-severity-timeline__content strong {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-primary, oklch(90% 0 0));
        line-height: 1.4;
      }
      .ui-lite-severity-timeline__content p {
        margin: 0;
        font-size: 0.875rem;
        color: var(--text-secondary, oklch(70% 0 0));
        line-height: 1.5;
      }
      @media (forced-colors: active) {
        .ui-lite-severity-timeline__dot {
          forced-color-adjust: none;
          border: 2px solid CanvasText;
        }
      }
    }
  }
`

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
  ({ events, className, ...rest }, ref) => {
    useStyles('lite-severity-timeline', severityTimelineStyles)
    return (
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
  }
)
SeverityTimeline.displayName = 'SeverityTimeline'
