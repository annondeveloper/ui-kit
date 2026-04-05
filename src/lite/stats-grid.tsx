import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteStatsGridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  columns?: 2 | 3 | 4 | 5 | 6
  gap?: 'sm' | 'md' | 'lg'
}

export const StatsGrid = forwardRef<HTMLDivElement, LiteStatsGridProps>(
  ({ columns = 4, gap = 'md', children, className, ...rest }, ref) => (
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
)
StatsGrid.displayName = 'StatsGrid'
