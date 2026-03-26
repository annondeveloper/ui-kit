import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteRippleProps extends HTMLAttributes<HTMLDivElement> {
  color?: string
  children: ReactNode
}

export const Ripple = forwardRef<HTMLDivElement, LiteRippleProps>(
  ({ color, children, className, style, ...rest }, ref) => (
    <div
      ref={ref}
      className={`ui-lite-ripple${className ? ` ${className}` : ''}`}
      {...(color ? { 'data-color': color, style: { ...style, '--ripple-color': color } as React.CSSProperties } : { style })}
      {...rest}
    >
      {children}
    </div>
  )
)
Ripple.displayName = 'Ripple'
