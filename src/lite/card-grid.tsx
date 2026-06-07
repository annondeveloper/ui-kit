import { forwardRef, type HTMLAttributes, type ReactNode, type CSSProperties } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const cardGridStyles = css`
  @layer components {
    @scope (.ui-lite-card-grid) {
      :scope {
        display: grid;
        inline-size: 100%;
      }

      /* Gap sizes */
      :scope[data-gap="sm"] { gap: var(--space-sm, 0.75rem); }
      :scope[data-gap="md"] { gap: var(--space-md, 1.25rem); }
      :scope[data-gap="lg"] { gap: var(--space-lg, 1.5rem); }

      /* Fixed column counts (when no --card-grid-min-child-width) */
      :scope:not([style*="--card-grid-min-child-width"])[data-columns="1"] { grid-template-columns: 1fr; }
      :scope:not([style*="--card-grid-min-child-width"])[data-columns="2"] { grid-template-columns: repeat(2, 1fr); }
      :scope:not([style*="--card-grid-min-child-width"])[data-columns="3"] { grid-template-columns: repeat(3, 1fr); }
      :scope:not([style*="--card-grid-min-child-width"])[data-columns="4"] { grid-template-columns: repeat(4, 1fr); }
      :scope:not([style*="--card-grid-min-child-width"])[data-columns="5"] { grid-template-columns: repeat(5, 1fr); }
      :scope:not([style*="--card-grid-min-child-width"])[data-columns="6"] { grid-template-columns: repeat(6, 1fr); }

      /* Auto-fill mode when minChildWidth is set */
      :scope[style*="--card-grid-min-child-width"] {
        grid-template-columns: repeat(auto-fill, minmax(var(--card-grid-min-child-width), 1fr));
      }

      /* Print — single column */
      @media print {
        :scope { grid-template-columns: 1fr !important; gap: 0.5rem; }
      }
    }
  }
`

export interface LiteCardGridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  columns?: 1 | 2 | 3 | 4 | 5 | 6
  gap?: 'sm' | 'md' | 'lg'
  minChildWidth?: string
}

export const CardGrid = forwardRef<HTMLDivElement, LiteCardGridProps>(
  ({ columns = 3, gap = 'md', minChildWidth, children, className, style, ...rest }, ref) => {
    useStyles('lite-card-grid', cardGridStyles)
    const mergedStyle: CSSProperties | undefined = minChildWidth
      ? { ...style, '--card-grid-min-child-width': minChildWidth } as CSSProperties
      : style

    return (
      <div
        ref={ref}
        className={`ui-lite-card-grid${className ? ` ${className}` : ''}`}
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
