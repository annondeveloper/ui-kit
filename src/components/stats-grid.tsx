'use client'

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { cn } from '../core/utils/cn'

export interface StatsGridProps extends HTMLAttributes<HTMLDivElement> {
  /** Grid children (typically stat/metric cards) */
  children: ReactNode
  /** Maximum number of columns (default: 4) */
  columns?: 2 | 3 | 4 | 5 | 6
  /** Gap between grid items (default: 'md') */
  gap?: 'sm' | 'md' | 'lg'
}

const statsGridStyles = css`
  @layer components {
    @scope (.ui-stats-grid) {
      :scope {
        display: grid;
        inline-size: 100%;
        margin-block-end: var(--space-lg, 1.5rem);
      }

      /* Gap sizes */
      :scope[data-gap="sm"] { gap: var(--space-sm, 0.5rem); }
      :scope[data-gap="md"] { gap: var(--space-md, 1rem); }
      :scope[data-gap="lg"] { gap: var(--space-lg, 1.5rem); }

      /* Column counts — auto-fit with minimum child width */
      :scope[data-columns="2"] {
        grid-template-columns: repeat(auto-fit, minmax(max(200px, calc(100% / 2 - var(--space-md, 1rem))), 1fr));
      }
      :scope[data-columns="3"] {
        grid-template-columns: repeat(auto-fit, minmax(max(200px, calc(100% / 3 - var(--space-md, 1rem))), 1fr));
      }
      :scope[data-columns="4"] {
        grid-template-columns: repeat(auto-fit, minmax(max(200px, calc(100% / 4 - var(--space-md, 1rem))), 1fr));
      }
      :scope[data-columns="5"] {
        grid-template-columns: repeat(auto-fit, minmax(max(200px, calc(100% / 5 - var(--space-md, 1rem))), 1fr));
      }
      :scope[data-columns="6"] {
        grid-template-columns: repeat(auto-fit, minmax(max(200px, calc(100% / 6 - var(--space-md, 1rem))), 1fr));
      }

      /* Forced colors */
      @media (forced-colors: active) {
        :scope {
          gap: 2px;
        }
      }

      /* Print */
      @media print {
        :scope {
          gap: 0.5rem;
        }
      }
    }
  }
`

/**
 * StatsGrid — responsive grid layout for stat/metric cards.
 * Auto-fits items with a 200px minimum width, constrained by column count.
 */
export const StatsGrid = forwardRef<HTMLDivElement, StatsGridProps>(
  ({ columns = 4, gap = 'md', children, className, ...rest }, ref) => {
    const cls = useStyles('stats-grid', statsGridStyles)

    return (
      <div
        ref={ref}
        className={cn(cls('root'), className)}
        data-columns={columns}
        data-gap={gap}
        role="region"
        {...rest}
      >
        {children}
      </div>
    )
  }
)
StatsGrid.displayName = 'StatsGrid'
