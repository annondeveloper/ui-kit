import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

export interface LiteGlowCardProps extends HTMLAttributes<HTMLDivElement> {
  glowColor?: string
  children: ReactNode
}

const glowCardStyles = css`
  @layer components {
    @scope (.ui-lite-glow-card) {
      :scope {
        --glow-color: var(--glow-card-color, oklch(75% 0.15 270 / 0.25));
        position: relative;
        min-inline-size: 200px;
        overflow: hidden;
        border-radius: var(--radius-lg, 0.75rem);
        background: var(--bg-surface, oklch(22% 0.02 270));
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.08));
        padding: var(--space-md, 1rem);
        box-shadow: var(--shadow-sm, none);
      }

      :scope:hover {
        border-color: var(--border-strong, oklch(100% 0 0 / 0.16));
      }

      /* Static glow wash */
      :scope::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: radial-gradient(
          circle 250px at 50% 0%,
          var(--glow-color),
          transparent 70%
        );
        opacity: 0.6;
        pointer-events: none;
        z-index: 0;
      }

      :scope > * {
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

export const GlowCard = forwardRef<HTMLDivElement, LiteGlowCardProps>(
  ({ glowColor, children, className, style, ...rest }, ref) => {
    useStyles('lite-glow-card', glowCardStyles)
    return (
    <div
      ref={ref}
      className={`ui-lite-glow-card${className ? ` ${className}` : ''}`}
      style={{ ...style, ...(glowColor ? { '--glow-card-color': glowColor } as React.CSSProperties : {}) }}
      {...rest}
    >
      {children}
    </div>
  )
  }
)
GlowCard.displayName = 'GlowCard'
