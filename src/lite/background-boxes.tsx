import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const backgroundBoxesStyles = css`
  @layer components {
    @scope (.ui-lite-background-boxes) {
      :scope {
        position: relative;
        overflow: hidden;
        isolation: isolate;
      }
      /* Lite: static grid texture instead of animated boxes */
      :scope::before {
        content: '';
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        background-image:
          linear-gradient(oklch(75% 0.15 270 / 0.04) 1px, transparent 1px),
          linear-gradient(90deg, oklch(75% 0.15 270 / 0.04) 1px, transparent 1px);
        background-size: 2rem 2rem;
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

export interface LiteBackgroundBoxesProps extends HTMLAttributes<HTMLDivElement> {
  rows?: number
  cols?: number
  children?: ReactNode
}

export const BackgroundBoxes = forwardRef<HTMLDivElement, LiteBackgroundBoxesProps>(
  ({ rows = 15, cols = 15, children, className, ...rest }, ref) => {
    useStyles('lite-background-boxes', backgroundBoxesStyles)
    return (
    <div
      ref={ref}
      className={`ui-lite-background-boxes${className ? ` ${className}` : ''}`}
      data-rows={rows}
      data-cols={cols}
      {...rest}
    >
      {children}
    </div>
    )
  }
)
BackgroundBoxes.displayName = 'BackgroundBoxes'
