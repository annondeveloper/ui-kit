'use client'

import {
  type HTMLAttributes,
  useMemo,
  useState,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'
import { ComponentErrorBoundary } from '../core/utils/error-boundary'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface UptimeDay {
  date: string // YYYY-MM-DD
  status: 'up' | 'degraded' | 'down' | 'unknown'
  uptime?: number // 0-1
}

export interface UptimeTrackerProps extends HTMLAttributes<HTMLDivElement> {
  days: UptimeDay[]
  slaTarget?: number
  showSla?: boolean
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const uptimeStyles = css`
  @layer components {
    @scope (.ui-uptime-tracker) {
      :scope {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: var(--space-sm, 0.5rem);
      }

      .ui-uptime-tracker__bar {
        display: flex;
        gap: 2px;
        align-items: flex-end;
      }

      .ui-uptime-tracker__day {
        flex: 1;
        block-size: 2rem;
        border-radius: 2px;
        cursor: default;
        position: relative;
        transition: transform 0.1s ease;
      }

      :scope[data-motion="0"] .ui-uptime-tracker__day {
        transition: none;
      }

      @media (hover: hover) {
        .ui-uptime-tracker__day:hover {
          transform: scaleY(1.3);
          z-index: 1;
        }
      }

      /* Status colors */
      .ui-uptime-tracker__day[data-day-status="up"] {
        background: oklch(72% 0.19 155);
      }
      .ui-uptime-tracker__day[data-day-status="degraded"] {
        background: oklch(80% 0.18 85);
      }
      .ui-uptime-tracker__day[data-day-status="down"] {
        background: oklch(62% 0.22 25);
      }
      .ui-uptime-tracker__day[data-day-status="unknown"] {
        background: var(--bg-active);
      }

      /* SLA section */
      .ui-uptime-tracker__sla {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary, oklch(70% 0 0));
      }

      .ui-uptime-tracker__sla-value {
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        color: var(--text-primary, oklch(90% 0 0));
      }

      .ui-uptime-tracker__sla-target {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary, oklch(55% 0 0));
      }

      /* Tooltip */
      .ui-uptime-tracker__tooltip {
        position: absolute;
        inset-block-end: calc(100% + 4px);
        inset-inline-start: 50%;
        transform: translateX(-50%);
        padding: 0.25rem 0.5rem;
        background: var(--bg-elevated, oklch(28% 0.02 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.1));
        border-radius: var(--radius-sm, 0.375rem);
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-primary, oklch(90% 0 0));
        pointer-events: none;
        white-space: nowrap;
        z-index: 10;
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-uptime-tracker__day {
          forced-color-adjust: none;
          border: 1px solid CanvasText;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

function UptimeTrackerInner({
  days,
  slaTarget,
  showSla = false,
  motion: motionProp,
  className,
  ...rest
}: UptimeTrackerProps) {
  useStyles('uptime-tracker', uptimeStyles)
  const motionLevel = useMotionLevel(motionProp)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  // Calculate overall uptime
  const currentUptime = useMemo(() => {
    const withUptime = days.filter(d => d.uptime !== undefined)
    if (withUptime.length === 0) return null
    const sum = withUptime.reduce((acc, d) => acc + (d.uptime ?? 0), 0)
    return sum / withUptime.length
  }, [days])

  return (
    <div
      className={cn('ui-uptime-tracker', className)}
      data-motion={motionLevel}
      role="group"
      aria-label="Uptime history"
      {...rest}
    >
      <div className="ui-uptime-tracker__bar">
        {days.map((day, i) => (
          <div
            key={day.date}
            className="ui-uptime-tracker__day"
            data-day-status={day.status}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            role="img"
            aria-label={`${day.date}: ${day.status}${day.uptime !== undefined ? ` (${(day.uptime * 100).toFixed(1)}%)` : ''}`}
          >
            {hoveredIdx === i && (
              <div className="ui-uptime-tracker__tooltip">
                {day.date} — {day.status}
                {day.uptime !== undefined && ` (${(day.uptime * 100).toFixed(1)}%)`}
              </div>
            )}
          </div>
        ))}
      </div>

      {showSla && (
        <div className="ui-uptime-tracker__sla">
          <span>
            <span className="ui-uptime-tracker__sla-value">
              {currentUptime !== null ? `${(currentUptime * 100).toFixed(currentUptime === 1 ? 0 : 2)}%` : 'N/A'}
            </span>
            {' '}uptime
          </span>
          {slaTarget !== undefined && (
            <span className="ui-uptime-tracker__sla-target">
              Target: {(slaTarget * 100).toFixed(1)}%
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export function UptimeTracker(props: UptimeTrackerProps) {
  return (
    <ComponentErrorBoundary>
      <UptimeTrackerInner {...props} />
    </ComponentErrorBoundary>
  )
}

UptimeTracker.displayName = 'UptimeTracker'
