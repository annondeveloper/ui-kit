'use client'

import type React from 'react'
import { cn } from '../utils'
import type { LucideIcon } from 'lucide-react'

// ── Theme-safe color presets ────────────────────────────────────────────────
// All colors use CSS custom properties for dark/light mode compliance.

export type BadgeColor =
  | 'brand' | 'blue' | 'green' | 'yellow' | 'red' | 'orange'
  | 'purple' | 'pink' | 'teal' | 'gray'

const COLOR_MAP: Record<BadgeColor, string> = {
  brand:  'bg-[hsl(var(--brand-primary))]/10 text-[hsl(var(--brand-primary))]',
  blue:   'bg-[hsl(var(--brand-secondary))]/10 text-[hsl(var(--brand-secondary))]',
  green:  'bg-[hsl(var(--status-ok))]/10 text-[hsl(var(--status-ok))]',
  yellow: 'bg-[hsl(var(--status-warning))]/10 text-[hsl(var(--status-warning))]',
  red:    'bg-[hsl(var(--status-critical))]/10 text-[hsl(var(--status-critical))]',
  orange: 'bg-[hsl(var(--status-warning))]/15 text-[hsl(var(--status-warning))]',
  purple: 'bg-[hsl(270,60%,60%)]/10 text-[hsl(270,60%,65%)]',
  pink:   'bg-[hsl(330,60%,60%)]/10 text-[hsl(330,60%,65%)]',
  teal:   'bg-[hsl(180,60%,40%)]/10 text-[hsl(180,60%,55%)]',
  gray:   'bg-[hsl(var(--bg-overlay))] text-[hsl(var(--text-secondary))]',
}

export interface BadgeProps {
  children: React.ReactNode
  /** Color preset for the badge. */
  color?: BadgeColor
  /** Optional icon displayed before the label. */
  icon?: LucideIcon
  /** Size variant. */
  size?: 'xs' | 'sm' | 'md'
  className?: string
}

/**
 * @description A themed pill badge with color presets and optional icon.
 * Supports xs, sm, and md sizes with dark/light mode via CSS tokens.
 */
export function Badge({
  children, color = 'gray', icon: Icon, size = 'sm', className,
}: BadgeProps): React.JSX.Element {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap',
      size === 'xs' && 'px-1.5 py-0.5 text-[10px]',
      size === 'sm' && 'px-2 py-0.5 text-xs',
      size === 'md' && 'px-2.5 py-1 text-xs',
      COLOR_MAP[color],
      className,
    )}>
      {Icon && <Icon className={cn(size === 'xs' ? 'size-2.5' : 'size-3')} />}
      {children}
    </span>
  )
}

// ── Badge variant factory ──────────────────────────────────────────────────

export interface BadgeVariantConfig<T extends string> {
  /** Map from value to BadgeColor. */
  colorMap: Partial<Record<T, BadgeColor>>
  /** Map from value to display label. Falls back to the value itself. */
  labelMap?: Partial<Record<T, string>>
  /** Default color when value is not found in colorMap. */
  defaultColor?: BadgeColor
  /** Default size for the badge. */
  defaultSize?: 'xs' | 'sm' | 'md'
}

/**
 * @description Factory function to create domain-specific badge components.
 * Accepts a color map and optional label map, returns a typed Badge component.
 *
 * @example
 * ```tsx
 * const SeverityBadge = createBadgeVariant({
 *   colorMap: { critical: 'red', warning: 'yellow', info: 'blue' },
 *   labelMap: { critical: 'Critical', warning: 'Warning', info: 'Info' },
 * })
 * // Usage: <SeverityBadge value="critical" />
 * ```
 */
export function createBadgeVariant<T extends string>(config: BadgeVariantConfig<T>): (props: { value: T; className?: string }) => React.JSX.Element {
  const { colorMap, labelMap, defaultColor = 'gray', defaultSize = 'xs' } = config

  return function VariantBadge({ value, className }: { value: T; className?: string }) {
    const color = colorMap[value] ?? defaultColor
    const label = labelMap?.[value] ?? value.replace(/_/g, ' ')
    return (
      <Badge color={color} size={defaultSize} className={className}>
        {label}
      </Badge>
    )
  }
}
