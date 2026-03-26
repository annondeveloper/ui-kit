import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteGlowCardProps extends HTMLAttributes<HTMLDivElement> {
  glowColor?: string
  children: ReactNode
}

export const GlowCard = forwardRef<HTMLDivElement, LiteGlowCardProps>(
  ({ glowColor, children, className, style, ...rest }, ref) => (
    <div
      ref={ref}
      className={`ui-lite-glow-card${className ? ` ${className}` : ''}`}
      style={{ ...style, ...(glowColor ? { '--glow-card-color': glowColor } as React.CSSProperties : {}) }}
      {...rest}
    >
      {children}
    </div>
  )
)
GlowCard.displayName = 'GlowCard'
