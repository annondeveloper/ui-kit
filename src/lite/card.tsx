import { forwardRef, type HTMLAttributes } from 'react'

export interface LiteCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated'
  padding?: 'sm' | 'md' | 'lg'
}

export const Card = forwardRef<HTMLDivElement, LiteCardProps>(
  ({ variant = 'default', padding = 'md', className, ...rest }, ref) => (
    <div
      ref={ref}
      className={`ui-lite-card${className ? ` ${className}` : ''}`}
      data-variant={variant}
      data-padding={padding}
      {...rest}
    />
  )
)
Card.displayName = 'Card'
