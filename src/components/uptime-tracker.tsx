'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '../utils'

export interface DayStatus {
  /** Date in YYYY-MM-DD format. */
  date: string
  /** Operational status for that day. */
  status: 'ok' | 'degraded' | 'outage' | 'no-data'
  /** Uptime percentage for that day (0-100). */
  uptime?: number
}

export interface UptimeTrackerProps {
  /** Array of day-status entries (oldest first). */
  days: DayStatus[]
  /** Show overall uptime percentage. */
  showPercentage?: boolean
  /** Optional label displayed above the bar. */
  label?: string
  /** Callback when a day bar is clicked. */
  onDayClick?: (day: DayStatus) => void
  className?: string
}

const dayColor: Record<string, string> = {
  ok: 'bg-[hsl(var(--status-ok))]',
  degraded: 'bg-[hsl(var(--status-warning))]',
  outage: 'bg-[hsl(var(--status-critical))]',
  'no-data': 'bg-[hsl(var(--text-disabled))]',
}

const dayHover: Record<string, string> = {
  ok: 'hover:bg-[hsl(var(--status-ok))]/80',
  degraded: 'hover:bg-[hsl(var(--status-warning))]/80',
  outage: 'hover:bg-[hsl(var(--status-critical))]/80',
  'no-data': 'hover:bg-[hsl(var(--text-disabled))]/80',
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

/**
 * @description A row of thin vertical bars representing daily uptime status,
 * inspired by GitHub/Statuspage uptime indicators. Each bar is colored by
 * operational status (ok/degraded/outage/no-data). Hover shows date and uptime
 * percentage. Designed for SLA and availability tracking displays.
 */
export function UptimeTracker({
  days,
  showPercentage = true,
  label,
  onDayClick,
  className,
}: UptimeTrackerProps) {
  const reduced = useReducedMotion()

  // Calculate overall uptime
  const daysWithUptime = days.filter(d => d.uptime != null)
  const overallUptime = daysWithUptime.length > 0
    ? daysWithUptime.reduce((sum, d) => sum + (d.uptime ?? 0), 0) / daysWithUptime.length
    : null

  return (
    <div className={cn('space-y-2', className)}>
      {/* Header */}
      {(label || showPercentage) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-[0.8125rem] font-medium text-[hsl(var(--text-primary))]">
              {label}
            </span>
          )}
          {showPercentage && overallUptime != null && (
            <span className={cn(
              'text-[0.8125rem] font-semibold tabular-nums',
              overallUptime >= 99.9
                ? 'text-[hsl(var(--status-ok))]'
                : overallUptime >= 99
                  ? 'text-[hsl(var(--status-warning))]'
                  : 'text-[hsl(var(--status-critical))]',
            )}>
              {overallUptime.toFixed(2)}% uptime
            </span>
          )}
        </div>
      )}

      {/* Day bars */}
      <div className="flex items-end gap-px h-8">
        {days.map((day, i) => {
          const tooltip = [
            formatDate(day.date),
            day.uptime != null ? `${day.uptime.toFixed(1)}%` : day.status,
          ].join(' \u2014 ')

          return (
            <motion.button
              key={day.date}
              type="button"
              initial={reduced ? false : { scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.15, delay: reduced ? 0 : Math.min(i * 0.005, 0.3) }}
              style={{ originY: '100%' }}
              onClick={() => onDayClick?.(day)}
              title={tooltip}
              aria-label={tooltip}
              className={cn(
                'flex-1 min-w-[2px] h-full rounded-[1px] transition-opacity cursor-pointer',
                dayColor[day.status] ?? dayColor['no-data'],
                dayHover[day.status] ?? dayHover['no-data'],
              )}
            />
          )
        })}
      </div>

      {/* Date range labels */}
      {days.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-[0.625rem] text-[hsl(var(--text-tertiary))]">
            {formatDate(days[0].date)}
          </span>
          <span className="text-[0.625rem] text-[hsl(var(--text-tertiary))]">
            {formatDate(days[days.length - 1].date)}
          </span>
        </div>
      )}
    </div>
  )
}
