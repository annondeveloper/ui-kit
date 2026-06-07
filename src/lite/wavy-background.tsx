import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

export interface LiteWavyBackgroundProps extends HTMLAttributes<HTMLDivElement> {
  color?: string
  children?: ReactNode
}

const wavyBackgroundStyles = css`
  @layer components {
    @scope (.ui-lite-wavy-background) {
      :scope {
        position: relative;
        overflow: hidden;
        isolation: isolate;
        background: var(--wavy-bg-color, oklch(75% 0.15 270 / 0.12));
      }

      .ui-lite-wavy-background__content {
        position: relative;
        z-index: 1;
      }
    }
  }
`

export const WavyBackground = forwardRef<HTMLDivElement, LiteWavyBackgroundProps>(
  ({ color, children, className, style, ...rest }, ref) => {
    useStyles('lite-wavy-background', wavyBackgroundStyles)
    return (
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
  }
)
WavyBackground.displayName = 'WavyBackground'
