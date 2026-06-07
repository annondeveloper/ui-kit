import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const evervaultCardStyles = css`
  @layer components {
    @scope (.ui-lite-evervault-card) {
      :scope {
        position: relative;
        min-inline-size: 200px;
        overflow: hidden;
        padding: var(--space-md, 1rem);
        border-radius: var(--radius-lg, 0.75rem);
        background: var(--bg-surface, oklch(22% 0.02 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        color: var(--text-primary, oklch(90% 0 0));
        font-family: inherit;
      }
      @media (forced-colors: active) {
        :scope { border: 1px solid ButtonText; }
      }
    }
  }
`

export interface LiteEvervaultCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export const EvervaultCard = forwardRef<HTMLDivElement, LiteEvervaultCardProps>(
  ({ className, children, ...rest }, ref) => {
    useStyles('lite-evervault-card', evervaultCardStyles)
    return (
    <div
      ref={ref}
      className={`ui-lite-evervault-card${className ? ` ${className}` : ''}`}
      {...rest}
    >
      {children}
    </div>
    )
  }
)
EvervaultCard.displayName = 'EvervaultCard'
