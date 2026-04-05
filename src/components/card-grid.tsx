'use client'

import { forwardRef, type HTMLAttributes, type ReactNode, type CSSProperties } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { cn } from '../core/utils/cn'

export interface CardGridProps extends HTMLAttributes<HTMLDivElement> {
  /** Grid children (typically Card components) */
  children: ReactNode
  /** Number of columns when minChildWidth is not set (default: 3) */
  columns?: 1 | 2 | 3 | 4 | 5 | 6
  /** Gap between grid items (default: 'md') */
  gap?: 'sm' | 'md' | 'lg'
  /** Minimum child width — overrides column count with auto-fill (e.g. '280px') */
  minChildWidth?: string
}

const cardGridStyles = css`
  @layer components {
    @scope (.ui-card-grid) {
      :scope {
        display: grid;
        inline-size: 100%;
      }

      /* Gap sizes */
      :scope[data-gap="sm"] { gap: var(--space-sm, 0.75rem); }
      :scope[data-gap="md"] { gap: var(--space-md, 1.25rem); }
      :scope[data-gap="lg"] { gap: var(--space-lg, 1.5rem); }

      /* Fixed column counts (when no --card-grid-min-child-width) */
      :scope:not([style*="--card-grid-min-child-width"])[data-columns="1"] {
        grid-template-columns: 1fr;
      }
      :scope:not([style*="--card-grid-min-child-width"])[data-columns="2"] {
        grid-template-columns: repeat(2, 1fr);
      }
      :scope:not([style*="--card-grid-min-child-width"])[data-columns="3"] {
        grid-template-columns: repeat(3, 1fr);
      }
      :scope:not([style*="--card-grid-min-child-width"])[data-columns="4"] {
        grid-template-columns: repeat(4, 1fr);
      }
      :scope:not([style*="--card-grid-min-child-width"])[data-columns="5"] {
        grid-template-columns: repeat(5, 1fr);
      }
      :scope:not([style*="--card-grid-min-child-width"])[data-columns="6"] {
        grid-template-columns: repeat(6, 1fr);
      }

      /* Auto-fill mode when minChildWidth is set via CSS custom property */
      :scope[style*="--card-grid-min-child-width"] {
        grid-template-columns: repeat(auto-fill, minmax(var(--card-grid-min-child-width), 1fr));
      }

      /* Forced colors */
      @media (forced-colors: active) {
        :scope {
          gap: 2px;
        }
      }

      /* Print — single column */
      @media print {
        :scope {
          grid-template-columns: 1fr !important;
          gap: 0.5rem;
        }
      }
    }
  }
`

/**
 * CardGrid — responsive card grid layout.
 * Supports fixed column counts or auto-fill with a minimum child width.
 */
export const CardGrid = forwardRef<HTMLDivElement, CardGridProps>(
  ({ columns = 3, gap = 'md', minChildWidth, children, className, style, ...rest }, ref) => {
    const cls = useStyles('card-grid', cardGridStyles)

    const mergedStyle: CSSProperties | undefined = minChildWidth
      ? { ...style, '--card-grid-min-child-width': minChildWidth } as CSSProperties
      : style

    return (
      <div
        ref={ref}
        className={cn(cls('root'), className)}
        data-columns={columns}
        data-gap={gap}
        style={mergedStyle}
        {...rest}
      >
        {children}
      </div>
    )
  }
)
CardGrid.displayName = 'CardGrid'
