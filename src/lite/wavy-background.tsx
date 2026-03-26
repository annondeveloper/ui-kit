import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteWavyBackgroundProps extends HTMLAttributes<HTMLDivElement> {
  color?: string
  children?: ReactNode
}

export const WavyBackground = forwardRef<HTMLDivElement, LiteWavyBackgroundProps>(
  ({ color, children, className, style, ...rest }, ref) => (
    <div
      ref={ref}
      className={`ui-lite-wavy-background${className ? ` ${className}` : ''}`}
      data-motion="0"
      style={color ? { ...style, '--wavy-bg-color': color } as React.CSSProperties : style}
      {...rest}
    >
      {children && <div className="ui-lite-wavy-background__content">{children}</div>}
    </div>
  )
)
WavyBackground.displayName = 'WavyBackground'
