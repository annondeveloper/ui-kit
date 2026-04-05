import { forwardRef, type HTMLAttributes, type ReactNode, type CSSProperties } from 'react'

export interface LiteCardGridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  columns?: 1 | 2 | 3 | 4 | 5 | 6
  gap?: 'sm' | 'md' | 'lg'
  minChildWidth?: string
}

export const CardGrid = forwardRef<HTMLDivElement, LiteCardGridProps>(
  ({ columns = 3, gap = 'md', minChildWidth, children, className, style, ...rest }, ref) => {
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
