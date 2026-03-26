import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteCard3DProps extends HTMLAttributes<HTMLDivElement> {
  perspective?: number
  maxTilt?: number
  glare?: boolean
  children: ReactNode
}

export const Card3D = forwardRef<HTMLDivElement, LiteCard3DProps>(
  ({ perspective = 1000, maxTilt = 10, glare = true, children, className, style, ...rest }, ref) => (
    <div
      ref={ref}
      className={`ui-lite-card-3d${className ? ` ${className}` : ''}`}
      data-perspective={perspective}
      data-max-tilt={maxTilt}
      data-glare={glare || undefined}
      style={{ ...style, '--card-3d-perspective': `${perspective}px` } as any}
      {...rest}
    >
      {children}
    </div>
  )
)
Card3D.displayName = 'Card3D'
