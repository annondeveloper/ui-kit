'use client'

import type React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '../utils'

export interface ProgressProps {
  /** Current progress value (0-100 by default). */
  value: number
  /** Maximum value. */
  max?: number
  /** Optional label displayed above the bar. */
  label?: string
  /** Show the current percentage value. */
  showValue?: boolean
  /** Color variant. */
  variant?: 'default' | 'success' | 'warning' | 'danger'
  /** Height preset. */
  size?: 'sm' | 'md' | 'lg'
  /** Animate the fill width on value changes. */
  animated?: boolean
  /** Show an indeterminate shimmer animation (ignores value). */
  indeterminate?: boolean
  /** Additional class name for the root element. */
  className?: string
}

const variantColors: Record<NonNullable<ProgressProps['variant']>, string> = {
  default: 'bg-[hsl(var(--brand-primary))]',
  success: 'bg-[hsl(var(--status-ok))]',
  warning: 'bg-[hsl(var(--status-warning))]',
  danger: 'bg-[hsl(var(--status-critical))]',
}

const sizeClasses: Record<NonNullable<ProgressProps['size']>, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
}

/**
 * @description A progress bar with optional label, animated fill, and indeterminate mode.
 * Supports multiple color variants and size presets.
 */
export function Progress({
  value,
  max = 100,
  label,
  showValue = false,
  variant = 'default',
  size = 'md',
  animated = true,
  indeterminate = false,
  className,
}: ProgressProps): React.JSX.Element {
  const prefersReducedMotion = useReducedMotion()
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={cn('w-full', className)}>
      {/* Label + value row */}
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-xs font-medium text-[hsl(var(--text-secondary))]">{label}</span>
          )}
          {showValue && !indeterminate && (
            <span className="text-xs font-medium tabular-nums text-[hsl(var(--text-secondary))]">
              {Math.round(pct)}%
            </span>
          )}
        </div>
      )}

      {/* Track */}
      <div
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className={cn(
          'w-full overflow-hidden rounded-full bg-[hsl(var(--bg-overlay))]',
          sizeClasses[size],
        )}
      >
        {indeterminate ? (
          <div
            className={cn(
              'h-full w-1/3 rounded-full',
              variantColors[variant],
              prefersReducedMotion ? '' : 'animate-shimmer',
            )}
            style={
              prefersReducedMotion
                ? { width: '33%' }
                : {
                    animation: 'indeterminate-slide 1.5s ease-in-out infinite',
                  }
            }
          />
        ) : animated && !prefersReducedMotion ? (
          <motion.div
            className={cn('h-full rounded-full', variantColors[variant])}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          />
        ) : (
          <div
            className={cn('h-full rounded-full transition-[width] duration-300', variantColors[variant])}
            style={{ width: `${pct}%` }}
          />
        )}
      </div>

      {/* Indeterminate keyframes injected as inline style */}
      {indeterminate && !prefersReducedMotion && (
        <style>{`
          @keyframes indeterminate-slide {
            0%   { transform: translateX(-100%); }
            50%  { transform: translateX(200%); }
            100% { transform: translateX(-100%); }
          }
        `}</style>
      )}
    </div>
  )
}
