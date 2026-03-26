import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteBorderBeamProps extends HTMLAttributes<HTMLDivElement> {
  duration?: number
  color?: string
  size?: number
  children: ReactNode
}

export const BorderBeam = forwardRef<HTMLDivElement, LiteBorderBeamProps>(
  ({ duration = 5, color, size = 80, children, className, style, ...rest }, ref) => (
    <div
      ref={ref}
      className={`ui-lite-border-beam${className ? ` ${className}` : ''}`}
      data-duration={duration}
      data-size={size}
      style={{
        ...style,
        ...(color ? { '--border-beam-color': color } as any : {}),
      }}
      {...rest}
    >
      {children}
    </div>
  )
)
BorderBeam.displayName = 'BorderBeam'
