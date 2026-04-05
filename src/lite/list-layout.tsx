import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteListLayoutProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  gap?: 'sm' | 'md' | 'lg'
  dividers?: boolean
  padding?: 'none' | 'sm' | 'md'
}

export const ListLayout = forwardRef<HTMLDivElement, LiteListLayoutProps>(
  ({ gap = 'md', dividers = false, padding = 'none', children, className, ...rest }, ref) => (
    <div
      ref={ref}
      className={`ui-lite-list-layout${className ? ` ${className}` : ''}`}
      data-gap={gap}
      data-dividers={dividers || undefined}
      data-padding={padding}
      {...rest}
    >
      {children}
    </div>
  )
)
ListLayout.displayName = 'ListLayout'
