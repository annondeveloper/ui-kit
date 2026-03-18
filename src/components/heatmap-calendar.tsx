'use client'

import type React from 'react'
import { useMemo, useState } from 'react'
import { cn } from '../utils'

export interface DayValue {
  /** Date in YYYY-MM-DD format. */
  date: string
  /** Numeric value for this day. */
  value: number
}

export interface HeatmapCalendarProps {
  /** Array of day values. */
  data: DayValue[]
  /** Start date (YYYY-MM-DD). Defaults to 365 days ago. */
  startDate?: string
  /** End date (YYYY-MM-DD). Defaults to today. */
  endDate?: string
  /** 5 colors from lightest to darkest. Defaults to green scale. */
  colorScale?: string[]
  /** Callback when a day cell is clicked. */
  onDayClick?: (day: DayValue) => void
  /** Show month labels at top. */
  showMonthLabels?: boolean
  /** Show day-of-week labels (Mon, Wed, Fri) on the left. */
  showDayLabels?: boolean
  /** Custom tooltip format function. */
  tooltipFormat?: (day: DayValue) => string
  className?: string
}

const DEFAULT_COLORS = [
  'bg-[hsl(var(--bg-overlay))]',
  'bg-[hsl(var(--status-ok))]/20',
  'bg-[hsl(var(--status-ok))]/40',
  'bg-[hsl(var(--status-ok))]/65',
  'bg-[hsl(var(--status-ok))]',
]

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function parseDate(s: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return new Date()
  }
  const [y, m, d] = s.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  if (isNaN(date.getTime())) return new Date()
  return date
}

/**
 * @description A GitHub-style contribution heatmap calendar with configurable color scale,
 * hover tooltips, month/day labels, and click handlers.
 */
export function HeatmapCalendar({
  data,
  startDate,
  endDate,
  colorScale = DEFAULT_COLORS,
  onDayClick,
  showMonthLabels = true,
  showDayLabels = true,
  tooltipFormat,
  className,
}: HeatmapCalendarProps): React.JSX.Element {
  const [hoveredDay, setHoveredDay] = useState<DayValue | null>(null)

  const { weeks, months, maxValue } = useMemo(() => {
    const end = endDate ? parseDate(endDate) : new Date()
    const start = startDate
      ? parseDate(startDate)
      : new Date(end.getFullYear() - 1, end.getMonth(), end.getDate() + 1)

    // Build value lookup
    const lookup = new Map<string, number>()
    let maxVal = 0
    for (const d of data) {
      lookup.set(d.date, d.value)
      if (d.value > maxVal) maxVal = d.value
    }

    // Generate weeks (columns) starting from the start date's week
    const weeks: (DayValue | null)[][] = []
    const monthChanges: { col: number; label: string }[] = []

    // Align start to the beginning of its week (Sunday)
    const cursor = new Date(start)
    cursor.setDate(cursor.getDate() - cursor.getDay())

    let prevMonth = -1

    while (cursor <= end || weeks.length === 0) {
      const week: (DayValue | null)[] = []
      for (let dow = 0; dow < 7; dow++) {
        const key = toDateKey(cursor)
        if (cursor >= start && cursor <= end) {
          week.push({ date: key, value: lookup.get(key) ?? 0 })
        } else {
          week.push(null)
        }

        // Track month boundaries
        if (cursor.getMonth() !== prevMonth && cursor >= start && cursor <= end) {
          if (dow === 0) {
            monthChanges.push({ col: weeks.length, label: MONTH_NAMES[cursor.getMonth()] })
          }
          prevMonth = cursor.getMonth()
        }

        cursor.setDate(cursor.getDate() + 1)
      }
      weeks.push(week)
    }

    return { weeks, months: monthChanges, maxValue: maxVal }
  }, [data, startDate, endDate])

  const getColorClass = (value: number): string => {
    if (value === 0 || maxValue === 0) return colorScale[0]
    const idx = Math.min(
      colorScale.length - 1,
      Math.ceil((value / maxValue) * (colorScale.length - 1))
    )
    return colorScale[idx]
  }

  const defaultTooltip = (day: DayValue): string =>
    `${day.date}: ${day.value}`

  const formatTooltip = tooltipFormat ?? defaultTooltip

  return (
    <div className={cn('overflow-x-auto', className)}>
      <div className="inline-flex flex-col gap-0.5">
        {/* Month labels */}
        {showMonthLabels && (
          <div className="flex" style={{ marginLeft: showDayLabels ? '2rem' : 0 }}>
            {weeks.map((_, col) => {
              const monthEntry = months.find((m) => m.col === col)
              return (
                <div
                  key={`m-${col}`}
                  className="text-[10px] text-[hsl(var(--text-tertiary))]"
                  style={{ width: 13, minWidth: 13 }}
                >
                  {monthEntry?.label ?? ''}
                </div>
              )
            })}
          </div>
        )}

        {/* Grid rows (7 days) */}
        <div className="flex gap-0">
          {/* Day labels column */}
          {showDayLabels && (
            <div className="flex flex-col gap-[2px] mr-1">
              {DAY_LABELS.map((label, i) => (
                <div
                  key={i}
                  className="text-[10px] text-[hsl(var(--text-tertiary))] h-[11px] flex items-center justify-end pr-1"
                  style={{ width: '1.75rem' }}
                >
                  {label}
                </div>
              ))}
            </div>
          )}

          {/* Week columns */}
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-[2px]">
              {week.map((day, dIdx) => (
                <div
                  key={dIdx}
                  className={cn(
                    'w-[11px] h-[11px] rounded-sm',
                    day ? getColorClass(day.value) : 'bg-transparent',
                    day && onDayClick && 'cursor-pointer',
                    day && 'hover:ring-1 hover:ring-[hsl(var(--text-tertiary))]',
                  )}
                  onClick={day && onDayClick ? () => onDayClick(day) : undefined}
                  onMouseEnter={day ? () => setHoveredDay(day) : undefined}
                  onMouseLeave={() => setHoveredDay(null)}
                  title={day ? formatTooltip(day) : undefined}
                  role={day && onDayClick ? 'button' : undefined}
                  tabIndex={day && onDayClick ? 0 : undefined}
                  onKeyDown={
                    day && onDayClick
                      ? (e) => { if (e.key === 'Enter' || e.key === ' ') onDayClick(day) }
                      : undefined
                  }
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1 mt-1" style={{ marginLeft: showDayLabels ? '2rem' : 0 }}>
          <span className="text-[10px] text-[hsl(var(--text-tertiary))] mr-1">Less</span>
          {colorScale.map((color, i) => (
            <div key={i} className={cn('w-[11px] h-[11px] rounded-sm', color)} />
          ))}
          <span className="text-[10px] text-[hsl(var(--text-tertiary))] ml-1">More</span>
        </div>
      </div>
    </div>
  )
}
