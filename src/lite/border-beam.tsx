import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const borderBeamStyles = css`
  @layer components {
    @scope (.ui-lite-border-beam) {
      :scope {
        position: relative;
        border-radius: var(--radius-lg, 14px);
        background: var(--bg-surface, oklch(12% 0.015 270));
        /* Lite: static accent border instead of animated beam */
        border: 1px solid var(--border-beam-color, oklch(75% 0.15 270 / 0.4));
        color: var(--text-primary, oklch(97% 0 0));
      }
      :scope > * {
        position: relative;
        z-index: 1;
      }
      @media (forced-colors: active) {
        :scope { border: 2px solid CanvasText; }
      }
    }
  }
`

export interface LiteBorderBeamProps extends HTMLAttributes<HTMLDivElement> {
  duration?: number
  color?: string
  size?: number
  children: ReactNode
}

export const BorderBeam = forwardRef<HTMLDivElement, LiteBorderBeamProps>(
  ({ duration = 5, color, size = 80, children, className, style, ...rest }, ref) => {
    useStyles('lite-border-beam', borderBeamStyles)
    return (
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
  }
)
BorderBeam.displayName = 'BorderBeam'
