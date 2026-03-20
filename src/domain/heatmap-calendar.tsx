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

export interface HeatmapData {
  date: string // YYYY-MM-DD
  value: number
}

export interface HeatmapCalendarProps extends HTMLAttributes<HTMLDivElement> {
  data: HeatmapData[]
  colorScale?: [string, string]
  startDate?: string
  endDate?: string
  showTooltip?: boolean
  onDateClick?: (date: string) => void
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const heatmapStyles = css`
  @layer components {
    @scope (.ui-heatmap-calendar) {
      :scope {
        position: relative;
        container-type: inline-size;
        overflow-x: auto;
      }

      .ui-heatmap-calendar__wrapper {
        display: flex;
        gap: var(--space-2xs, 0.125rem);
      }

      /* Day-of-week labels column */
      .ui-heatmap-calendar__day-labels {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding-block-start: 1.25rem; /* offset for month labels */
      }

      .ui-heatmap-calendar__day-label {
        block-size: var(--cell-size, 0.75rem);
        display: flex;
        align-items: center;
        font-size: 0.5625rem;
        color: var(--text-tertiary, oklch(55% 0 0));
        user-select: none;
        padding-inline-end: var(--space-2xs, 0.125rem);
      }

      /* Weeks grid */
      .ui-heatmap-calendar__grid {
        display: flex;
        gap: 2px;
      }

      .ui-heatmap-calendar__week {
        display: flex;
        flex-direction: column;
        gap: 2px;
        position: relative;
      }

      /* Month labels */
      .ui-heatmap-calendar__month-label {
        position: absolute;
        inset-block-start: 0;
        font-size: 0.5625rem;
        color: var(--text-tertiary, oklch(55% 0 0));
        white-space: nowrap;
        user-select: none;
        transform: translateY(-100%);
        padding-block-end: 2px;
      }

      /* Cells */
      .ui-heatmap-calendar__cell {
        inline-size: var(--cell-size, 0.75rem);
        block-size: var(--cell-size, 0.75rem);
        border-radius: 2px;
        cursor: default;
        position: relative;
      }

      .ui-heatmap-calendar__cell:hover {
        outline: 1px solid oklch(100% 0 0 / 0.3);
        outline-offset: -1px;
      }

      .ui-heatmap-calendar__cell[data-clickable] {
        cursor: pointer;
      }

      .ui-heatmap-calendar__cell--empty {
        background: var(--bg-muted, oklch(100% 0 0 / 0.03));
      }

      /* Tooltip */
      .ui-heatmap-calendar__tooltip {
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
        .ui-heatmap-calendar__cell {
          forced-color-adjust: none;
          border: 1px solid CanvasText;
        }
      }
    }
  }
`

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function interpolateColor(ratio: number, low: string, high: string): string {
  // Use OKLCH interpolation via CSS-friendly approach
  // For simplicity, we'll use opacity-based intensity with the high color
  const clamped = Math.max(0, Math.min(1, ratio))
  if (clamped === 0) return low
  // Return high color with interpolated lightness via opacity
  return `color-mix(in oklch, ${high} ${Math.round(clamped * 100)}%, ${low})`
}

interface WeekData {
  days: { date: string; value: number | null; dayOfWeek: number }[]
  firstDay: Date
}

// ─── Component ──────────────────────────────────────────────────────────────

function HeatmapCalendarInner({
  data,
  colorScale,
  startDate: startDateProp,
  endDate: endDateProp,
  showTooltip = false,
  onDateClick,
  motion: motionProp,
  className,
  ...rest
}: HeatmapCalendarProps) {
  useStyles('heatmap-calendar', heatmapStyles)
  const motionLevel = useMotionLevel(motionProp)
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)

  const [lowColor, highColor] = colorScale || ['oklch(22% 0.02 270)', 'oklch(65% 0.2 155)']

  // Build data map
  const dataMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const d of data) {
      map.set(d.date, d.value)
    }
    return map
  }, [data])

  // Determine date range
  const { weeks, maxValue } = useMemo(() => {
    if (data.length === 0) {
      return { weeks: [] as WeekData[], maxValue: 0 }
    }

    const dates = data.map(d => d.date).sort()
    const start = startDateProp ? parseDate(startDateProp) : parseDate(dates[0])
    const end = endDateProp ? parseDate(endDateProp) : parseDate(dates[dates.length - 1])

    // Align start to Sunday
    const alignedStart = new Date(start)
    alignedStart.setDate(alignedStart.getDate() - alignedStart.getDay())

    const mx = Math.max(...data.map(d => d.value), 1)

    const weeksArr: WeekData[] = []
    let current = new Date(alignedStart)

    while (current <= end) {
      const week: WeekData = { days: [], firstDay: new Date(current) }

      for (let dow = 0; dow < 7; dow++) {
        const dateStr = formatDate(current)
        const inRange = current >= start && current <= end
        week.days.push({
          date: dateStr,
          value: inRange ? (dataMap.get(dateStr) ?? null) : null,
          dayOfWeek: dow,
        })
        current.setDate(current.getDate() + 1)
      }

      weeksArr.push(week)
    }

    return { weeks: weeksArr, maxValue: mx }
  }, [data, dataMap, startDateProp, endDateProp])

  // Determine which weeks start a new month for labels
  const monthLabels = useMemo(() => {
    const labels: { weekIdx: number; label: string }[] = []
    let lastMonth = -1

    for (let i = 0; i < weeks.length; i++) {
      // Use first non-null day in the week, or the first day
      const firstDay = weeks[i].firstDay
      const month = firstDay.getMonth()
      if (month !== lastMonth) {
        labels.push({ weekIdx: i, label: MONTH_NAMES[month] })
        lastMonth = month
      }
    }

    return labels
  }, [weeks])

  return (
    <div
      className={cn('ui-heatmap-calendar', className)}
      data-motion={motionLevel}
      role="group"
      aria-label="Activity heatmap"
      {...rest}
    >
      <div className="ui-heatmap-calendar__wrapper">
        {/* Day-of-week labels */}
        <div className="ui-heatmap-calendar__day-labels">
          {[0, 1, 2, 3, 4, 5, 6].map(dow => (
            <div key={dow} className="ui-heatmap-calendar__day-label">
              {dow % 2 === 1 ? DAY_NAMES[dow].charAt(0) : ''}
            </div>
          ))}
        </div>

        {/* Weeks grid */}
        <div className="ui-heatmap-calendar__grid">
          {weeks.map((week, wi) => {
            const monthLabel = monthLabels.find(m => m.weekIdx === wi)

            return (
              <div key={wi} className="ui-heatmap-calendar__week">
                {monthLabel && (
                  <div className="ui-heatmap-calendar__month-label">
                    {monthLabel.label}
                  </div>
                )}

                {week.days.map((day, di) => {
                  if (day.value === null) {
                    return (
                      <div
                        key={di}
                        className="ui-heatmap-calendar__cell ui-heatmap-calendar__cell--empty"
                      />
                    )
                  }

                  const ratio = maxValue > 0 ? day.value / maxValue : 0
                  const bg = day.value === 0
                    ? lowColor
                    : interpolateColor(ratio, lowColor, highColor)

                  return (
                    <div
                      key={di}
                      className="ui-heatmap-calendar__cell"
                      style={{ background: bg }}
                      role="img"
                      aria-label={`${day.date}: ${day.value}`}
                      {...(onDateClick && { 'data-clickable': '' })}
                      onClick={onDateClick ? () => onDateClick(day.date) : undefined}
                      onMouseEnter={showTooltip ? () => setHoveredDate(day.date) : undefined}
                      onMouseLeave={showTooltip ? () => setHoveredDate(null) : undefined}
                    >
                      {showTooltip && hoveredDate === day.date && (
                        <div className="ui-heatmap-calendar__tooltip">
                          {day.date}: {day.value}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function HeatmapCalendar(props: HeatmapCalendarProps) {
  return (
    <ComponentErrorBoundary>
      <HeatmapCalendarInner {...props} />
    </ComponentErrorBoundary>
  )
}

HeatmapCalendar.displayName = 'HeatmapCalendar'
