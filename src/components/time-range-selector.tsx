'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '../utils'

export interface TimeRange {
  /** Display label (e.g. "1h", "24h"). */
  label: string
  /** Unique value identifier. */
  value: string
  /** Duration in seconds represented by this range. */
  seconds: number
}

export interface TimeRangeSelectorProps {
  /** Currently selected range value. */
  value: string
  /** Callback when a range is selected. */
  onChange: (value: string, range: TimeRange) => void
  /** Custom range options. Defaults to 1h, 6h, 24h, 7d, 30d. */
  ranges?: TimeRange[]
  className?: string
}

const defaultRanges: TimeRange[] = [
  { label: '1h', value: '1h', seconds: 3600 },
  { label: '6h', value: '6h', seconds: 21600 },
  { label: '24h', value: '24h', seconds: 86400 },
  { label: '7d', value: '7d', seconds: 604800 },
  { label: '30d', value: '30d', seconds: 2592000 },
]

/**
 * @description A compact horizontal pill-group time range selector for dashboards.
 * Active selection is highlighted with a sliding indicator using the brand color.
 * Common in monitoring dashboards for controlling chart time windows.
 */
export function TimeRangeSelector({
  value,
  onChange,
  ranges = defaultRanges,
  className,
}: TimeRangeSelectorProps) {
  const reduced = useReducedMotion()

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg bg-[hsl(var(--bg-elevated))] p-0.5',
        'border border-[hsl(var(--border-subtle))]',
        className,
      )}
      role="radiogroup"
      aria-label="Time range"
    >
      {ranges.map(range => {
        const isActive = range.value === value
        return (
          <button
            key={range.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(range.value, range)}
            className={cn(
              'relative px-3 py-1 text-[0.75rem] font-medium rounded-md cursor-pointer',
              'transition-colors duration-150',
              isActive
                ? 'text-[hsl(var(--text-on-brand))]'
                : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]',
            )}
          >
            {isActive && (
              <motion.span
                layoutId="time-range-active"
                className="absolute inset-0 rounded-md bg-[hsl(var(--brand-primary))]"
                transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{range.label}</span>
          </button>
        )
      })}
    </div>
  )
}
