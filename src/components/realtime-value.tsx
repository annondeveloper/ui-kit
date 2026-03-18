'use client'

import type React from 'react'
import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ArrowUp, ArrowDown, Minus, Wifi, WifiOff, Loader2 } from 'lucide-react'
import { cn } from '../utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Props for the RealtimeValue component. */
export interface RealtimeValueProps {
  /** The current value to display. */
  value: number | string
  /** Optional label displayed above or beside the value. */
  label?: string
  /** Custom formatter for numeric values. */
  format?: (v: number) => string
  /** ISO timestamp or Date of the last data update. */
  lastUpdated?: string | Date
  /** Milliseconds after which the value is considered stale. Default 30000. */
  staleAfterMs?: number
  /** Connection state to the data source. */
  connectionState?: 'connected' | 'reconnecting' | 'disconnected'
  /** Previous numeric value for delta/change display. */
  previousValue?: number
  /** Whether to animate value changes. Default true. */
  animate?: boolean
  /** Display size variant. */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Additional class name for the root element. */
  className?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function formatRelativeSeconds(ms: number): string {
  const secs = Math.floor(ms / 1000)
  if (secs < 1) return 'just now'
  if (secs < 60) return `${secs}s ago`
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  return `${Math.floor(secs / 3600)}h ago`
}

const SIZE_CLASSES = {
  sm: { value: 'text-lg', label: 'text-[11px]', delta: 'text-[10px]', dot: 'h-1.5 w-1.5', gap: 'gap-1' },
  md: { value: 'text-2xl', label: 'text-xs', delta: 'text-[11px]', dot: 'h-2 w-2', gap: 'gap-1.5' },
  lg: { value: 'text-3xl', label: 'text-sm', delta: 'text-xs', dot: 'h-2.5 w-2.5', gap: 'gap-2' },
  xl: { value: 'text-4xl', label: 'text-base', delta: 'text-sm', dot: 'h-3 w-3', gap: 'gap-2' },
} as const

// ---------------------------------------------------------------------------
// AnimatedNumber (internal)
// ---------------------------------------------------------------------------

function AnimatedNumber({
  value,
  format,
  duration = 400,
  animateEnabled,
  reduced,
  className,
}: {
  value: number
  format?: (v: number) => string
  duration?: number
  animateEnabled: boolean
  reduced: boolean | null
  className?: string
}): React.JSX.Element {
  const prevRef = useRef(value)
  const rafRef = useRef<number | null>(null)
  const [displayed, setDisplayed] = useState(value)

  useEffect(() => {
    const from = prevRef.current
    const to = value
    prevRef.current = value

    if (reduced || !animateEnabled || from === to) {
      setDisplayed(to)
      return
    }

    const start = performance.now()
    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutCubic(progress)
      setDisplayed(from + (to - from) * eased)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setDisplayed(to)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [value, duration, reduced, animateEnabled])

  const formatted = format
    ? format(displayed)
    : Number.isInteger(value)
      ? Math.round(displayed).toString()
      : displayed.toFixed(value.toString().split('.')[1]?.length ?? 1)

  return <span className={cn('tabular-nums', className)}>{formatted}</span>
}

// ---------------------------------------------------------------------------
// RealtimeValue
// ---------------------------------------------------------------------------

/**
 * @description A live data display component with built-in freshness tracking,
 * connection state indicators, animated value transitions, delta display,
 * and auto-updating relative timestamps. Designed for real-time monitoring dashboards.
 */
export function RealtimeValue({
  value,
  label,
  format,
  lastUpdated,
  staleAfterMs = 30000,
  connectionState = 'connected',
  previousValue,
  animate = true,
  size = 'md',
  className,
}: RealtimeValueProps): React.JSX.Element {
  const prefersReducedMotion = useReducedMotion()
  const sizeClasses = SIZE_CLASSES[size]

  // Auto-updating staleness
  const [staleness, setStaleness] = useState(0)
  useEffect(() => {
    if (!lastUpdated) return
    const getMs = () => Date.now() - new Date(lastUpdated).getTime()
    setStaleness(getMs())
    const interval = setInterval(() => setStaleness(getMs()), 1000)
    return () => clearInterval(interval)
  }, [lastUpdated])

  const isStale = lastUpdated ? staleness > staleAfterMs : false
  const isVeryStale = lastUpdated ? staleness > staleAfterMs * 2 : false

  // Freshness dot color
  const freshnessColor = useMemo(() => {
    if (connectionState === 'disconnected') return 'bg-[hsl(var(--status-critical))]'
    if (isVeryStale) return 'bg-[hsl(var(--status-critical))]'
    if (isStale) return 'bg-[hsl(var(--status-warning))]'
    return 'bg-[hsl(var(--status-ok))]'
  }, [connectionState, isStale, isVeryStale])

  // Delta calculation
  const delta = typeof value === 'number' && previousValue !== undefined ? value - previousValue : null
  const deltaSign = delta !== null ? (delta > 0 ? '+' : delta < 0 ? '' : '') : null

  const isNumeric = typeof value === 'number'

  return (
    <div
      className={cn(
        'relative inline-flex flex-col',
        sizeClasses.gap,
        isStale && 'opacity-60',
        className,
      )}
      title={
        lastUpdated
          ? `Last updated: ${new Date(lastUpdated).toLocaleString()} (${formatRelativeSeconds(staleness)})`
          : undefined
      }
    >
      {/* Label row */}
      {label && (
        <div className="flex items-center gap-1.5">
          <span className={cn('font-medium text-[hsl(var(--text-secondary))]', sizeClasses.label)}>
            {label}
          </span>
        </div>
      )}

      {/* Value row */}
      <div className="flex items-center gap-2">
        {/* Freshness indicator */}
        <div className="relative flex items-center justify-center">
          <span className={cn('rounded-full', sizeClasses.dot, freshnessColor)} />
          {connectionState === 'connected' && !isStale && (
            <span
              className={cn(
                'absolute rounded-full animate-ping',
                sizeClasses.dot,
                'bg-[hsl(var(--status-ok)/0.5)]',
              )}
              style={{ animationDuration: '2s' }}
            />
          )}
        </div>

        {/* Main value */}
        <div className="flex items-baseline gap-1.5">
          {isNumeric ? (
            <AnimatedNumber
              value={value}
              format={format}
              animateEnabled={animate}
              reduced={prefersReducedMotion}
              className={cn('font-semibold text-[hsl(var(--text-primary))]', sizeClasses.value)}
            />
          ) : (
            <span className={cn('font-semibold text-[hsl(var(--text-primary))] tabular-nums', sizeClasses.value)}>
              {value}
            </span>
          )}

          {/* Delta indicator */}
          <AnimatePresence>
            {delta !== null && delta !== 0 && (
              <motion.span
                initial={prefersReducedMotion ? undefined : { opacity: 0, x: -4 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, x: -4 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  'inline-flex items-center gap-0.5 font-medium tabular-nums',
                  sizeClasses.delta,
                  delta > 0 ? 'text-[hsl(var(--status-ok))]' : 'text-[hsl(var(--status-critical))]',
                )}
              >
                {delta > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {deltaSign}{format ? format(Math.abs(delta)) : Math.abs(delta).toLocaleString()}
              </motion.span>
            )}
            {delta === 0 && (
              <motion.span
                initial={prefersReducedMotion ? undefined : { opacity: 0 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1 }}
                className={cn(
                  'inline-flex items-center gap-0.5 font-medium text-[hsl(var(--text-tertiary))]',
                  sizeClasses.delta,
                )}
              >
                <Minus className="h-3 w-3" />
                0
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Connection state icon */}
        {connectionState !== 'connected' && (
          <span className="ml-1">
            {connectionState === 'reconnecting' && (
              <Loader2 className="h-4 w-4 text-[hsl(var(--status-warning))] animate-spin" />
            )}
            {connectionState === 'disconnected' && (
              <WifiOff className="h-4 w-4 text-[hsl(var(--status-critical))]" />
            )}
          </span>
        )}
      </div>

      {/* Relative timestamp */}
      {lastUpdated && (
        <span className={cn('text-[hsl(var(--text-tertiary))] tabular-nums', sizeClasses.delta)}>
          {formatRelativeSeconds(staleness)}
        </span>
      )}
    </div>
  )
}
