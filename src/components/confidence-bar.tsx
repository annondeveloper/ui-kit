'use client'

import type React from 'react'
import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '../utils'

export interface ConfidenceBarProps {
  /** Confidence value between 0 and 1 (probability). */
  value: number
  /** Optional label displayed before the bar. */
  label?: string
  /** Show percentage text beside the bar. */
  showPercentage?: boolean
  /** Thresholds for color zones. */
  thresholds?: { low: number; medium: number }
  /** Size preset. */
  size?: 'sm' | 'md'
  className?: string
}

const SIZE_CLASSES = {
  sm: 'h-1.5',
  md: 'h-2.5',
} as const

function getBarColor(value: number, thresholds: { low: number; medium: number }): string {
  if (value < thresholds.low) return 'bg-[hsl(var(--status-critical))]'
  if (value < thresholds.medium) return 'bg-[hsl(var(--status-warning))]'
  return 'bg-[hsl(var(--status-ok))]'
}

function getTextColor(value: number, thresholds: { low: number; medium: number }): string {
  if (value < thresholds.low) return 'text-[hsl(var(--status-critical))]'
  if (value < thresholds.medium) return 'text-[hsl(var(--status-warning))]'
  return 'text-[hsl(var(--status-ok))]'
}

/**
 * @description A horizontal confidence/probability bar colored by threshold zones:
 * red (<low), yellow (low-medium), green (>medium). Animates fill on mount.
 */
export function ConfidenceBar({
  value,
  label,
  showPercentage = true,
  thresholds = { low: 0.3, medium: 0.7 },
  size = 'md',
  className,
}: ConfidenceBarProps): React.JSX.Element {
  const reduced = useReducedMotion()
  const [hovered, setHovered] = useState(false)
  const clamped = Math.min(1, Math.max(0, value))
  const pct = clamped * 100
  const barColor = getBarColor(clamped, thresholds)
  const textColor = getTextColor(clamped, thresholds)

  return (
    <div
      className={cn('w-full', className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Label + percentage row */}
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-1">
          {label && (
            <span className="text-xs font-medium text-[hsl(var(--text-secondary))]">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className={cn('text-xs font-medium tabular-nums', textColor)}>
              {pct.toFixed(1)}%
            </span>
          )}
        </div>
      )}

      {/* Track */}
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-full bg-[hsl(var(--bg-overlay))]',
          SIZE_CLASSES[size],
        )}
        role="meter"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? `Confidence: ${pct.toFixed(1)}%`}
      >
        {reduced ? (
          <div
            className={cn('h-full rounded-full', barColor)}
            style={{ width: `${pct}%` }}
          />
        ) : (
          <motion.div
            className={cn('h-full rounded-full', barColor)}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 20 }}
          />
        )}
      </div>

      {/* Tooltip on hover showing exact value */}
      {hovered && (
        <div className="mt-1 text-[10px] text-[hsl(var(--text-tertiary))] tabular-nums">
          {clamped.toFixed(4)} ({pct.toFixed(2)}%)
        </div>
      )}
    </div>
  )
}
