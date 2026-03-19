'use client'

import type React from 'react'
import { type ElementType } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '../utils'
import { AnimatedCounter } from './animated-counter'
import { Sparkline } from './sparkline'

export interface MetricCardProps {
  /** Metric display label. */
  label: string
  /** Current numeric value. */
  value: number
  /** Custom formatter for the displayed value (e.g. fmtBytes, fmtBps). */
  format?: (n: number) => string
  /** Previous value for trend calculation. */
  previousValue?: number
  /** Interpret trend direction for coloring. */
  trendDirection?: 'up-good' | 'up-bad' | 'down-good' | 'down-bad'
  /** Lucide icon component to display. */
  icon?: ElementType
  /** Status determines left border accent color. */
  status?: 'ok' | 'warning' | 'critical'
  /** Recent values to render an inline sparkline. */
  sparklineData?: number[]
  className?: string
}

const statusBorder: Record<string, string> = {
  ok: 'border-l-[hsl(var(--status-ok))]',
  warning: 'border-l-[hsl(var(--status-warning))]',
  critical: 'border-l-[hsl(var(--status-critical))]',
}

const trendColors: Record<string, string> = {
  good: 'text-[hsl(var(--status-ok))]',
  bad: 'text-[hsl(var(--status-critical))]',
}

/**
 * @description A dashboard stat tile showing a metric value with animated counter,
 * trend indicator, optional sparkline, and status-colored left border.
 * Designed for monitoring dashboards and overview panels.
 */
export function MetricCard({
  label,
  value,
  format,
  previousValue,
  trendDirection,
  icon: Icon,
  status,
  sparklineData,
  className,
}: MetricCardProps): React.JSX.Element {
  const reduced = useReducedMotion()

  // Trend calculation
  let trendPct: number | null = null
  let trendUp = false
  let trendColorKey: 'good' | 'bad' | null = null

  if (previousValue != null && previousValue !== 0) {
    trendPct = ((value - previousValue) / Math.abs(previousValue)) * 100
    trendUp = trendPct >= 0

    if (trendDirection) {
      const isUp = trendPct >= 0
      if (trendDirection === 'up-good') trendColorKey = isUp ? 'good' : 'bad'
      else if (trendDirection === 'up-bad') trendColorKey = isUp ? 'bad' : 'good'
      else if (trendDirection === 'down-good') trendColorKey = isUp ? 'bad' : 'good'
      else if (trendDirection === 'down-bad') trendColorKey = isUp ? 'good' : 'bad'
    }
  }

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{ containerType: 'inline-size' }}
      className={cn(
        '@container',
        'relative rounded-2xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-surface))]',
        'p-3 @[250px]:p-5 shadow-sm border-l-[3px]',
        status ? statusBorder[status] : 'border-l-[hsl(var(--border-subtle))]',
        className,
      )}
    >
      {/* Narrow (<250px): stacked vertical. Default (250-400px): current. Wide (>400px): horizontal with sparkline on right. */}
      <div className="flex flex-col @[250px]:flex-row @[250px]:items-start @[250px]:justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            {Icon && (
              <Icon className="size-4 shrink-0 text-[hsl(var(--text-tertiary))]" />
            )}
            <span className="text-[0.6875rem] @[250px]:text-[0.75rem] font-medium text-[hsl(var(--text-secondary))] truncate">
              {label}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-xl @[250px]:text-2xl @[400px]:text-3xl font-semibold text-[hsl(var(--text-primary))] tabular-nums">
              <AnimatedCounter value={value} format={format} />
            </span>

            {trendPct != null && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 text-[0.6875rem] font-medium tabular-nums',
                  trendColorKey ? trendColors[trendColorKey] : 'text-[hsl(var(--text-tertiary))]',
                )}
              >
                {trendUp ? (
                  <TrendingUp className="size-3" />
                ) : (
                  <TrendingDown className="size-3" />
                )}
                {Math.abs(trendPct).toFixed(1)}%
              </span>
            )}
          </div>
        </div>

        {/* Sparkline: hidden in narrow containers, shown at 250px+, larger at 400px+ */}
        {sparklineData && sparklineData.length >= 2 && (
          <div className="hidden @[250px]:block">
            <Sparkline
              data={sparklineData}
              width={60}
              height={28}
              color={
                status === 'critical'
                  ? 'hsl(var(--status-critical))'
                  : status === 'warning'
                    ? 'hsl(var(--status-warning))'
                    : 'hsl(var(--brand-primary))'
              }
              fillOpacity={0.15}
            />
          </div>
        )}
      </div>
    </motion.div>
  )
}
