'use client'

import type React from 'react'
import { cn } from '../utils'

export interface ResponsiveCardProps {
  /** Card content. */
  children: React.ReactNode
  /** Additional class names. */
  className?: string
}

/**
 * @description A card that adapts layout to container width via CSS container queries.
 * Uses `containerType: inline-size` so child elements can use Tailwind `@[breakpoint]:` variants
 * to respond to the card's own width rather than the viewport.
 */
export function ResponsiveCard({ children, className }: ResponsiveCardProps): React.JSX.Element {
  return (
    <div
      className={cn(
        '@container',
        'rounded-2xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-surface))] overflow-hidden',
        className,
      )}
      style={{ containerType: 'inline-size' }}
    >
      {children}
    </div>
  )
}

export interface ResponsiveGridProps {
  /** Grid items. */
  children: React.ReactNode
  /** Minimum width for each child before wrapping. Default `'250px'`. */
  minChildWidth?: string
  /** Gap between grid items. Default `'1rem'`. */
  gap?: string
  /** Additional class names on the outer container element. */
  className?: string
}

/**
 * @description A grid that auto-adjusts column count based on its container width (not the viewport).
 * Wraps children in a CSS Grid with `auto-fill` and `minmax()` inside a container-query context
 * so parent layout changes automatically reflow the grid.
 */
export function ResponsiveGrid({
  children,
  minChildWidth = '250px',
  gap = '1rem',
  className,
}: ResponsiveGridProps): React.JSX.Element {
  return (
    <div
      className={cn('@container', className)}
      style={{ containerType: 'inline-size' }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, minmax(min(${minChildWidth}, 100%), 1fr))`,
          gap,
        }}
      >
        {children}
      </div>
    </div>
  )
}
