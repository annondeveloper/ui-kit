'use client'

import { ToggleLeft, ToggleRight } from 'lucide-react'
import { cn } from '../utils'

export interface ToggleSwitchProps {
  /** Whether the toggle is on. */
  enabled: boolean
  /** Callback when toggled. */
  onChange: (enabled: boolean) => void
  /** Size variant. */
  size?: 'sm' | 'md'
  /** Disable the toggle. */
  disabled?: boolean
  /** Accessible label. */
  label?: string
  className?: string
}

/**
 * @description A themed toggle switch using lucide icons for on/off states.
 * Supports dark/light mode via CSS custom property tokens.
 */
export function ToggleSwitch({
  enabled, onChange, size = 'md', disabled, label, className,
}: ToggleSwitchProps) {
  const iconSize = size === 'sm' ? 'size-5' : 'size-6'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      className={cn(
        'inline-flex items-center transition-colors',
        'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      )}
    >
      {enabled ? (
        <ToggleRight className={cn(iconSize, 'text-[hsl(var(--status-ok))]')} />
      ) : (
        <ToggleLeft className={cn(iconSize, 'text-[hsl(var(--text-tertiary))]')} />
      )}
    </button>
  )
}
