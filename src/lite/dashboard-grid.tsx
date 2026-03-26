import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteDashboardGridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: number | 'auto'
  gap?: 'sm' | 'md' | 'lg'
  children?: ReactNode
}

export const DashboardGrid = forwardRef<HTMLDivElement, LiteDashboardGridProps>(
  ({ columns = 'auto', gap = 'md', children, className, ...rest }, ref) => (
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
)
DashboardGrid.displayName = 'DashboardGrid'
