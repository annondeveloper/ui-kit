import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const dashboardGridStyles = css`
  @layer components {
    @scope (.ui-lite-dashboard-grid) {
      :scope {
        display: grid;
        gap: var(--space-md, 1rem);
        grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
      }
      :scope[data-columns="auto"] {
        grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
      }
      :scope[data-columns="1"] { grid-template-columns: 1fr; }
      :scope[data-columns="2"] { grid-template-columns: repeat(2, 1fr); }
      :scope[data-columns="3"] { grid-template-columns: repeat(3, 1fr); }
      :scope[data-columns="4"] { grid-template-columns: repeat(4, 1fr); }
      :scope[data-columns="5"] { grid-template-columns: repeat(5, 1fr); }
      :scope[data-columns="6"] { grid-template-columns: repeat(6, 1fr); }
      :scope[data-gap="sm"] { gap: var(--space-sm, 0.5rem); }
      :scope[data-gap="md"] { gap: var(--space-md, 1rem); }
      :scope[data-gap="lg"] { gap: var(--space-lg, 1.5rem); }
      @media (max-width: 640px) {
        :scope {
          grid-template-columns: 1fr;
        }
        :scope[data-columns="auto"] {
          grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
        }
      }
    }
  }
`

export interface LiteDashboardGridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: number | 'auto'
  gap?: 'sm' | 'md' | 'lg'
  children?: ReactNode
}

export const DashboardGrid = forwardRef<HTMLDivElement, LiteDashboardGridProps>(
  ({ columns = 'auto', gap = 'md', children, className, ...rest }, ref) => {
    useStyles('lite-dashboard-grid', dashboardGridStyles)
    return (
    <div
      ref={ref}
      className={`ui-lite-dashboard-grid${className ? ` ${className}` : ''}`}
      data-columns={columns}
      data-gap={gap}
      {...rest}
    >
      {children}
    </div>
    )
  }
)
DashboardGrid.displayName = 'DashboardGrid'
