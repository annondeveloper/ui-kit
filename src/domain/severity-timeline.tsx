'use client'

import {
  type HTMLAttributes,
  type ReactNode,
  useState,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'
import { ComponentErrorBoundary } from '../core/utils/error-boundary'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TimelineEvent {
  id: string
  timestamp: number | Date
  severity: 'info' | 'warning' | 'critical' | 'ok'
  title: ReactNode
  description?: ReactNode
}

export interface SeverityTimelineProps extends HTMLAttributes<HTMLDivElement> {
  events: TimelineEvent[]
  orientation?: 'vertical' | 'horizontal'
  expandable?: boolean
  maxVisible?: number
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const timelineStyles = css`
  @layer components {
    @scope (.ui-severity-timeline) {
      :scope {
        position: relative;
      }

      .ui-severity-timeline__list {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      /* Vertical orientation */
      :scope[data-orientation="vertical"] .ui-severity-timeline__list {
        display: flex;
        flex-direction: column;
        gap: 0;
      }

      :scope[data-orientation="vertical"] .ui-severity-timeline__item {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0 var(--space-sm, 0.5rem);
        position: relative;
        padding-block-end: var(--space-md, 1rem);
      }

      :scope[data-orientation="vertical"] .ui-severity-timeline__connector {
        position: absolute;
        inset-inline-start: calc(0.5rem - 1px);
        inset-block-start: 1.25rem;
        inset-block-end: 0;
        inline-size: 2px;
        background: var(--border-subtle, oklch(100% 0 0 / 0.08));
      }

      :scope[data-orientation="vertical"] .ui-severity-timeline__item:last-child .ui-severity-timeline__connector {
        display: none;
      }

      /* Horizontal orientation */
      :scope[data-orientation="horizontal"] .ui-severity-timeline__list {
        display: flex;
        flex-direction: row;
        gap: var(--space-md, 1rem);
        overflow-x: auto;
        padding-block-end: var(--space-sm, 0.5rem);
      }

      :scope[data-orientation="horizontal"] .ui-severity-timeline__item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
        min-inline-size: 8rem;
        position: relative;
      }

      :scope[data-orientation="horizontal"] .ui-severity-timeline__connector {
        position: absolute;
        inset-block-start: 0.5rem;
        inset-inline-start: calc(50% + 0.75rem);
        inset-inline-end: calc(-50% - 0.25rem);
        block-size: 2px;
        background: var(--border-subtle, oklch(100% 0 0 / 0.08));
      }

      :scope[data-orientation="horizontal"] .ui-severity-timeline__item:last-child .ui-severity-timeline__connector {
        display: none;
      }

      /* Severity dot */
      .ui-severity-timeline__dot {
        inline-size: 1rem;
        block-size: 1rem;
        border-radius: 50%;
        flex-shrink: 0;
        position: relative;
        z-index: 1;
      }

      .ui-severity-timeline__dot[data-severity="info"] {
        background: oklch(65% 0.2 270);
      }
      .ui-severity-timeline__dot[data-severity="warning"] {
        background: oklch(80% 0.18 85);
      }
      .ui-severity-timeline__dot[data-severity="critical"] {
        background: oklch(62% 0.22 25);
      }
      .ui-severity-timeline__dot[data-severity="ok"] {
        background: oklch(72% 0.19 155);
      }

      /* Content */
      .ui-severity-timeline__content {
        min-inline-size: 0;
      }

      .ui-severity-timeline__title {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 600;
        color: var(--text-primary, oklch(90% 0 0));
        line-height: 1.4;
      }

      .ui-severity-timeline__time {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary, oklch(55% 0 0));
        font-variant-numeric: tabular-nums;
      }

      .ui-severity-timeline__description {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary, oklch(70% 0 0));
        margin-block-start: var(--space-2xs, 0.125rem);
        line-height: 1.5;
      }

      .ui-severity-timeline__description[data-expanded="false"] {
        display: none;
      }

      .ui-severity-timeline__expand-btn {
        background: none;
        border: none;
        padding: 0;
        font-size: var(--text-xs, 0.75rem);
        color: oklch(65% 0.2 270);
        cursor: pointer;
        text-decoration: underline;
        text-decoration-thickness: 1px;
        text-underline-offset: 2px;
      }

      .ui-severity-timeline__expand-btn:hover {
        color: oklch(75% 0.2 270);
      }

      /* More indicator */
      .ui-severity-timeline__more {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-tertiary, oklch(55% 0 0));
        padding-inline-start: 1.5rem;
        padding-block-start: var(--space-xs, 0.25rem);
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-severity-timeline__dot {
          forced-color-adjust: none;
          border: 2px solid CanvasText;
        }
        .ui-severity-timeline__connector {
          background: GrayText;
        }
      }
    }
  }
`

// ─── Time formatter ──────────────────────────────────────────────────────────

function formatTime(timestamp: number | Date): string {
  const d = timestamp instanceof Date ? timestamp : new Date(timestamp)
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

// ─── Component ──────────────────────────────────────────────────────────────

function SeverityTimelineInner({
  events,
  orientation = 'vertical',
  expandable = false,
  maxVisible,
  motion: motionProp,
  className,
  ...rest
}: SeverityTimelineProps) {
  useStyles('severity-timeline', timelineStyles)
  const motionLevel = useMotionLevel(motionProp)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const visibleEvents = maxVisible !== undefined ? events.slice(0, maxVisible) : events
  const hasMore = maxVisible !== undefined && events.length > maxVisible

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div
      className={cn('ui-severity-timeline', className)}
      data-orientation={orientation}
      data-motion={motionLevel}
      {...rest}
    >
      <ol className="ui-severity-timeline__list">
        {visibleEvents.map(event => {
          const isExpanded = expandedIds.has(event.id)
          const hasDescription = !!event.description

          return (
            <li key={event.id} className="ui-severity-timeline__item">
              <div className="ui-severity-timeline__dot" data-severity={event.severity} />
              <div className="ui-severity-timeline__connector" />

              <div className="ui-severity-timeline__content">
                <div className="ui-severity-timeline__title">{event.title}</div>
                <div className="ui-severity-timeline__time">{formatTime(event.timestamp)}</div>

                {hasDescription && expandable ? (
                  <>
                    <button
                      className="ui-severity-timeline__expand-btn"
                      onClick={() => toggleExpand(event.id)}
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? 'Hide details' : 'Show details'}
                    </button>
                    <div
                      className="ui-severity-timeline__description"
                      data-expanded={isExpanded ? 'true' : 'false'}
                    >
                      {event.description}
                    </div>
                  </>
                ) : hasDescription ? (
                  <div className="ui-severity-timeline__description">
                    {event.description}
                  </div>
                ) : null}
              </div>
            </li>
          )
        })}
      </ol>

      {hasMore && (
        <div className="ui-severity-timeline__more">
          +{events.length - maxVisible!} more events
        </div>
      )}
    </div>
  )
}

export function SeverityTimeline(props: SeverityTimelineProps) {
  return (
    <ComponentErrorBoundary>
      <SeverityTimelineInner {...props} />
    </ComponentErrorBoundary>
  )
}

SeverityTimeline.displayName = 'SeverityTimeline'
