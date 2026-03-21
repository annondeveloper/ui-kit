import { forwardRef, type HTMLAttributes } from 'react'

export interface LiteSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'text' | 'circular'
  width?: string | number
  height?: string | number
}

export const Skeleton = forwardRef<HTMLDivElement, LiteSkeletonProps>(
  ({ variant = 'rectangular', width, height, className, style, ...rest }, ref) => (
    <div
      ref={ref}
      className={`ui-lite-skeleton${className ? ` ${className}` : ''}`}
      data-variant={variant}
      aria-hidden="true"
      style={{ width, height, ...style }}
      {...rest}
    />
  )
)
Skeleton.displayName = 'Skeleton'
