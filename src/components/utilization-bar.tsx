'use client'

import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { cn, clamp } from '../utils'

export interface UtilizationBarProps {
  /** Utilization value from 0 to 100. */
  value: number
  /** Warning and critical thresholds. */
  thresholds?: { warning: number; critical: number }
  /** Optional label displayed to the left. */
  label?: string
  /** Show percentage value text to the right. */
  showValue?: boolean
  /** Bar height size. */
  size?: 'sm' | 'md' | 'lg'
  /** Animate the fill width on mount. */
  animated?: boolean
  className?: string
}

const sizeMap = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
}

function getBarColor(value: number, warning: number, critical: number): string {
  if (value >= critical) return 'hsl(var(--util-high))'
  if (value >= warning) return 'hsl(var(--util-medium))'
  return 'hsl(var(--util-low))'
}

function getTextClass(value: number, warning: number, critical: number): string {
  if (value >= critical) return 'text-[hsl(var(--status-critical))]'
  if (value >= warning) return 'text-[hsl(var(--status-warning))]'
  return 'text-[hsl(var(--text-secondary))]'
}

/**
 * @description A segmented horizontal bar showing resource utilization with
 * color-coded thresholds (green/yellow/red). Supports animated fill on mount.
 */
export function UtilizationBar({
  value: rawValue,
  thresholds,
  label,
  showValue = true,
  size = 'md',
  animated = true,
  className,
}: UtilizationBarProps) {
  const reduced = useReducedMotion()
  const value = clamp(rawValue, 0, 100)
  const warning = thresholds?.warning ?? 70
  const critical = thresholds?.critical ?? 90

  const [displayWidth, setDisplayWidth] = useState(animated && !reduced ? 0 : value)

  useEffect(() => {
    if (!animated || reduced) {
      setDisplayWidth(value)
      return
    }
    // Trigger the animated width after mount
    const raf = requestAnimationFrame(() => setDisplayWidth(value))
    return () => cancelAnimationFrame(raf)
  }, [value, animated, reduced])

  const barColor = getBarColor(value, warning, critical)
  const textClass = getTextClass(value, warning, critical)

  return (
    <div className={cn('flex items-center gap-2', className)} title={`${value.toFixed(1)}%`}>
      {label && (
        <span className="text-[0.75rem] font-medium text-[hsl(var(--text-secondary))] shrink-0 min-w-[3rem]">
          {label}
        </span>
      )}
      <div
        className={cn(
          'flex-1 rounded-full bg-[hsl(var(--bg-elevated))] overflow-hidden',
          sizeMap[size],
        )}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${displayWidth}%`,
            backgroundColor: barColor,
            transition: animated && !reduced ? 'width 600ms cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          }}
        />
      </div>
      {showValue && (
        <span className={cn('text-[0.75rem] font-medium tabular-nums shrink-0 min-w-[2.5rem] text-right', textClass)}>
          {value.toFixed(0)}%
        </span>
      )}
    </div>
  )
}
