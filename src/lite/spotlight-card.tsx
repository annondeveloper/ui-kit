import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const spotlightCardStyles = css`
  @layer components {
    @scope (.ui-lite-spotlight-card) {
      :scope {
        --spotlight-color: var(--spotlight-card-color, oklch(75% 0.15 270 / 0.15));
        position: relative;
        min-inline-size: 200px;
        overflow: hidden;
        border-radius: var(--radius-lg, 0.75rem);
        background: var(--bg-surface, oklch(22% 0.02 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        padding: var(--space-md, 1rem);
        isolation: isolate;
      }

      /* Static spotlight glow (no cursor tracking in Lite) */
      :scope::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: radial-gradient(
          circle 400px at 50% 0%,
          var(--spotlight-color),
          transparent 70%
        );
        pointer-events: none;
        z-index: 0;
      }

      .ui-lite-spotlight-card__content {
        position: relative;
        z-index: 1;
      }

      @media (forced-colors: active) {
        :scope {
          border: 2px solid CanvasText;
        }
        :scope::before {
          display: none;
        }
      }

      @media print {
        :scope::before {
          display: none;
        }
      }
    }
  }
`

export interface LiteSpotlightCardProps extends HTMLAttributes<HTMLDivElement> {
  spotlightColor?: string
  children: ReactNode
}

export const SpotlightCard = forwardRef<HTMLDivElement, LiteSpotlightCardProps>(
  ({ spotlightColor, children, className, style, ...rest }, ref) => {
    useStyles('lite-spotlight-card', spotlightCardStyles)
    return (
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
  }
)
SpotlightCard.displayName = 'SpotlightCard'
