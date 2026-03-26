import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteSpotlightCardProps extends HTMLAttributes<HTMLDivElement> {
  spotlightColor?: string
  children: ReactNode
}

export const SpotlightCard = forwardRef<HTMLDivElement, LiteSpotlightCardProps>(
  ({ spotlightColor, children, className, style, ...rest }, ref) => (
    <div
      ref={ref}
      className={`ui-lite-spotlight-card${className ? ` ${className}` : ''}`}
      data-motion="0"
      style={spotlightColor ? { ...style, '--spotlight-card-color': spotlightColor } as React.CSSProperties : style}
      {...rest}
    >
      <div className="ui-lite-spotlight-card__content">{children}</div>
    </div>
  )
)
SpotlightCard.displayName = 'SpotlightCard'
