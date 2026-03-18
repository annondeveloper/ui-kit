'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '../utils'

/** Configuration for a single status in StatusPulse. */
export interface PulseConfig {
  /** CSS class for the solid dot. */
  dot: string
  /** CSS class for the pulse ring. */
  ring: string
  /** Whether to show the pulse ring animation. */
  pulse: boolean
  /** Use faster animation (e.g. for degraded states). */
  fast: boolean
}

/** Default pulse configuration map for common statuses. */
export const defaultPulseConfigMap: Record<string, PulseConfig> = {
  online:   { dot: 'bg-[hsl(var(--status-ok))]',       ring: 'bg-[hsl(var(--status-ok))]',       pulse: true,  fast: false },
  degraded: { dot: 'bg-[hsl(var(--status-warning))]',   ring: 'bg-[hsl(var(--status-warning))]',   pulse: true,  fast: true  },
  offline:  { dot: 'bg-[hsl(var(--status-critical))]',  ring: 'bg-[hsl(var(--status-critical))]',  pulse: false, fast: false },
  unknown:  { dot: 'bg-[hsl(var(--text-tertiary))]',    ring: 'bg-[hsl(var(--text-tertiary))]',    pulse: false, fast: false },
}

export interface StatusPulseProps {
  /** Status key to look up in the config map. */
  status: string
  /** Whether to show the status label text. */
  label?: boolean
  /** Custom pulse configuration map. Falls back to defaultPulseConfigMap. */
  configMap?: Record<string, PulseConfig>
  className?: string
}

/**
 * @description An animated status indicator dot with optional pulse ring and label.
 * Accepts a configurable map to define custom statuses. Respects prefers-reduced-motion.
 */
export function StatusPulse({ status, label = true, configMap, className }: StatusPulseProps) {
  const reduced = useReducedMotion()
  const map = configMap ?? defaultPulseConfigMap
  const cfg = map[status] ?? map['unknown'] ?? defaultPulseConfigMap['unknown']!

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative flex size-2.5 shrink-0">
        {/* Pulse ring -- CSS animation only */}
        {cfg.pulse && !reduced && (
          <span
            className={cn(
              'absolute inline-flex size-full rounded-full opacity-75 animate-pulse-ring',
              cfg.ring,
              cfg.fast && '[animation-duration:1s]',
            )}
          />
        )}
        {/* Solid dot */}
        <motion.span
          className={cn('relative inline-flex size-2.5 rounded-full', cfg.dot)}
          animate={{ scale: 1 }}
          whileHover={{ scale: reduced ? 1 : 1.3 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        />
      </div>
      {label && (
        <motion.span
          key={status}
          initial={reduced ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs font-medium capitalize text-[hsl(var(--text-secondary))]"
        >
          {status}
        </motion.span>
      )}
    </div>
  )
}
