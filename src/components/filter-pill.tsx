'use client'

import { cn } from '../utils'

export interface FilterPillProps {
  /** Label text for the pill. */
  label: string
  /** Optional count displayed after the label. */
  count?: number
  /** Whether this pill is currently active/selected. */
  active: boolean
  /** Click handler. */
  onClick: () => void
  className?: string
}

/**
 * @description A rounded pill-style filter toggle with active state and optional count.
 * Uses CSS custom property tokens for dark/light mode compatibility.
 */
export function FilterPill({ label, count, active, onClick, className }: FilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-3 py-1 text-xs transition-colors whitespace-nowrap',
        active
          ? 'bg-[hsl(var(--brand-primary))]/10 text-[hsl(var(--brand-primary))] font-medium'
          : 'bg-[hsl(var(--bg-elevated))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-overlay))]',
        className,
      )}
    >
      {label}
      {count != null && (
        <span className={cn(
          'ml-1.5 tabular-nums',
          active ? 'text-[hsl(var(--brand-primary))]/70' : 'text-[hsl(var(--text-tertiary))]',
        )}>
          {count}
        </span>
      )}
    </button>
  )
}
