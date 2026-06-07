import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const backgroundBeamsStyles = css`
  @layer components {
    @scope (.ui-lite-background-beams) {
      :scope {
        position: relative;
        overflow: hidden;
        isolation: isolate;
      }
      /* Lite: static ambient wash instead of animated beams */
      :scope::before {
        content: '';
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        background:
          radial-gradient(ellipse at 20% 0%, var(--beam-color, oklch(75% 0.15 270 / 0.08)) 0%, transparent 55%),
          radial-gradient(ellipse at 80% 100%, var(--beam-color, oklch(75% 0.15 270 / 0.06)) 0%, transparent 50%);
      }
      :scope > * {
        position: relative;
        z-index: 1;
      }
      @media (forced-colors: active) {
        :scope::before { display: none; }
      }
      @media print {
        :scope::before { display: none; }
      }
    }
  }
`

export interface LiteBackgroundBeamsProps extends HTMLAttributes<HTMLDivElement> {
  count?: number
  color?: string
  children?: ReactNode
}

export const BackgroundBeams = forwardRef<HTMLDivElement, LiteBackgroundBeamsProps>(
  ({ count = 6, color, children, className, style, ...rest }, ref) => {
    useStyles('lite-background-beams', backgroundBeamsStyles)
    return (
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
  }
)
BackgroundBeams.displayName = 'BackgroundBeams'
