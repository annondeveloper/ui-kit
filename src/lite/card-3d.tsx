import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const card3DStyles = css`
  @layer components {
    @scope (.ui-lite-card-3d) {
      :scope {
        /* Lite: flat card, no tilt or glare */
        display: inline-block;
        min-inline-size: 200px;
        border-radius: var(--radius-lg, 14px);
        background: var(--bg-surface, oklch(12% 0.015 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.04));
        padding: var(--space-md, 1rem);
        color: var(--text-primary, oklch(97% 0 0));
      }
      @media (forced-colors: active) {
        :scope { border: 2px solid CanvasText; }
      }
    }
  }
`

export interface LiteCard3DProps extends HTMLAttributes<HTMLDivElement> {
  perspective?: number
  maxTilt?: number
  glare?: boolean
  children: ReactNode
}

export const Card3D = forwardRef<HTMLDivElement, LiteCard3DProps>(
  ({ perspective = 1000, maxTilt = 10, glare = true, children, className, style, ...rest }, ref) => {
    useStyles('lite-card-3d', card3DStyles)
    return (
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
  }
)
Card3D.displayName = 'Card3D'
