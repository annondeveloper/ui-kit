import { forwardRef, type HTMLAttributes } from 'react'

export interface LiteBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'xs' | 'sm' | 'md'
}

export const Badge = forwardRef<HTMLSpanElement, LiteBadgeProps>(
  ({ variant = 'default', size = 'sm', className, ...rest }, ref) => (
    <span
      ref={ref}
      className={`ui-lite-badge${className ? ` ${className}` : ''}`}
      data-variant={variant}
      data-size={size}
      {...rest}
    />
  )
)
Badge.displayName = 'Badge'
