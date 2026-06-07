import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const rippleStyles = css`
  @layer components {
    @scope (.ui-lite-ripple) {
      :scope {
        --ripple-color: var(--ripple-color, oklch(100% 0 0 / 0.2));
        position: relative;
        display: inline-block;
        overflow: hidden;
      }
    }
  }
`

export interface LiteRippleProps extends HTMLAttributes<HTMLDivElement> {
  color?: string
  children: ReactNode
}

export const Ripple = forwardRef<HTMLDivElement, LiteRippleProps>(
  ({ color, children, className, style, ...rest }, ref) => {
    useStyles('lite-ripple', rippleStyles)
    return (
      <div
        ref={ref}
        className={`ui-lite-ripple${className ? ` ${className}` : ''}`}
        {...(color ? { 'data-color': color, style: { ...style, '--ripple-color': color } as React.CSSProperties } : { style })}
        {...rest}
      >
        {children}
      </div>
    )
  }
)
Ripple.displayName = 'Ripple'
