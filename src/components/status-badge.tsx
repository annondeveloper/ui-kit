'use client'

import { cn } from '../utils'

/** Configuration for a single status entry in a StatusBadge. */
export interface StatusConfig {
  /** Display label. */
  label: string
  /** CSS class for the status dot. */
  dot: string
  /** CSS class for the text color. */
  text: string
  /** CSS class for the background color. */
  bg: string
}

/** A sensible default status map covering common statuses. */
export const defaultStatusMap: Record<string, StatusConfig> = {
  ok:             { label: 'OK',             dot: 'bg-[hsl(var(--status-ok))]',          text: 'text-[hsl(var(--status-ok))]',          bg: 'bg-[hsl(var(--status-ok))]/10' },
  active:         { label: 'Active',         dot: 'bg-[hsl(var(--status-ok))]',          text: 'text-[hsl(var(--status-ok))]',          bg: 'bg-[hsl(var(--status-ok))]/10' },
  warning:        { label: 'Warning',        dot: 'bg-[hsl(var(--status-warning))]',     text: 'text-[hsl(var(--status-warning))]',     bg: 'bg-[hsl(var(--status-warning))]/10' },
  critical:       { label: 'Critical',       dot: 'bg-[hsl(var(--status-critical))]',    text: 'text-[hsl(var(--status-critical))]',    bg: 'bg-[hsl(var(--status-critical))]/10' },
  unknown:        { label: 'Unknown',        dot: 'bg-[hsl(var(--status-unknown))]',     text: 'text-[hsl(var(--status-unknown))]',     bg: 'bg-[hsl(var(--status-unknown))]/10' },
  maintenance:    { label: 'Maintenance',    dot: 'bg-[hsl(var(--status-maintenance))]', text: 'text-[hsl(var(--status-maintenance))]', bg: 'bg-[hsl(var(--status-maintenance))]/10' },
  stale:          { label: 'Stale',          dot: 'bg-[hsl(var(--status-warning))]',     text: 'text-[hsl(var(--status-warning))]',     bg: 'bg-[hsl(var(--status-warning))]/10' },
  inactive:       { label: 'Inactive',       dot: 'bg-[hsl(var(--text-tertiary))]',      text: 'text-[hsl(var(--text-tertiary))]',      bg: 'bg-[hsl(var(--text-tertiary))]/10' },
  decommissioned: { label: 'Decommissioned', dot: 'bg-[hsl(var(--text-disabled))]',      text: 'text-[hsl(var(--text-disabled))]',      bg: 'bg-[hsl(var(--text-disabled))]/10' },
  pending:        { label: 'Pending',        dot: 'bg-[hsl(var(--status-warning))]',     text: 'text-[hsl(var(--status-warning))]',     bg: 'bg-[hsl(var(--status-warning))]/10' },
}

export interface StatusBadgeProps {
  /** Status key to look up in the status map. */
  status: string
  /** Override display label. */
  label?: string
  /** Size variant. */
  size?: 'sm' | 'md'
  /** Show a CSS pulse animation on the dot. */
  pulse?: boolean
  /** Custom status map. Falls back to defaultStatusMap. */
  statusMap?: Record<string, StatusConfig>
  className?: string
}

/**
 * @description A status badge with colored dot indicator and label.
 * Accepts a configurable statusMap to define custom status values and their appearance.
 * Falls back to a built-in default map if none is provided.
 */
export function StatusBadge({
  status, label, size = 'md', pulse = false, statusMap, className,
}: StatusBadgeProps) {
  const map = statusMap ?? defaultStatusMap
  const fallback = map['unknown'] ?? defaultStatusMap['unknown']!
  const config = map[status] ?? fallback

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        size === 'sm' ? 'px-1.5 py-0.5 text-[0.6875rem]' : 'px-2 py-1 text-[0.75rem]',
        config.text,
        config.bg,
        className,
      )}
    >
      <span className={cn('rounded-full shrink-0', size === 'sm' ? 'size-1.5' : 'size-2', config.dot, pulse && 'animate-pulse')} />
      {label ?? config.label}
    </span>
  )
}
