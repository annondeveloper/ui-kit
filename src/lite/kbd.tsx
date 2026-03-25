import { forwardRef, type HTMLAttributes } from 'react'

export interface LiteKbdProps extends HTMLAttributes<HTMLElement> {
  size?: 'xs' | 'sm' | 'md'
  variant?: 'default' | 'ghost'
}

export const Kbd = forwardRef<HTMLElement, LiteKbdProps>(
  ({ size = 'sm', variant = 'default', className, ...rest }, ref) => (
    <kbd
      ref={ref}
      className={`ui-lite-kbd${className ? ` ${className}` : ''}`}
      data-size={size}
      data-variant={variant}
      {...rest}
    />
  )
)
Kbd.displayName = 'Kbd'
