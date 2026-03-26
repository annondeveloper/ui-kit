import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteBackgroundBeamsProps extends HTMLAttributes<HTMLDivElement> {
  count?: number
  color?: string
  children?: ReactNode
}

export const BackgroundBeams = forwardRef<HTMLDivElement, LiteBackgroundBeamsProps>(
  ({ count = 6, color, children, className, style, ...rest }, ref) => (
    <div
      ref={ref}
      className={`ui-lite-background-beams${className ? ` ${className}` : ''}`}
      data-count={count}
      style={{ ...style, ...(color ? { '--beam-color': color } as any : {}) }}
      {...rest}
    >
      {children}
    </div>
  )
)
BackgroundBeams.displayName = 'BackgroundBeams'
