import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const statsGridStyles = css`
  @layer components {
    @scope (.ui-lite-stats-grid) {
      :scope {
        display: grid;
        inline-size: 100%;
      }

      :scope[data-gap="sm"] { gap: var(--space-sm, 0.5rem); }
      :scope[data-gap="md"] { gap: var(--space-md, 1rem); }
      :scope[data-gap="lg"] { gap: var(--space-lg, 1.5rem); }

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

      @media (forced-colors: active) {
        :scope { gap: 2px; }
      }
      @media print {
        :scope { gap: 0.5rem; }
      }
    }
  }
`

export interface LiteStatsGridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  columns?: 2 | 3 | 4 | 5 | 6
  gap?: 'sm' | 'md' | 'lg'
}

export const StatsGrid = forwardRef<HTMLDivElement, LiteStatsGridProps>(
  ({ columns = 4, gap = 'md', children, className, ...rest }, ref) => {
    useStyles('lite-stats-grid', statsGridStyles)
    return (
      <div
        ref={ref}
        className={`ui-lite-stats-grid${className ? ` ${className}` : ''}`}
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
