import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const responsiveCardStyles = css`
  @layer components {
    @scope (.ui-lite-responsive-card) {
      :scope {
        background: var(--bg-surface, oklch(12% 0.015 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.04));
        border-radius: var(--radius-lg, 14px);
        overflow: hidden;
      }
      .ui-lite-responsive-card__image { overflow: hidden; }
      .ui-lite-responsive-card__image img { inline-size: 100%; display: block; }
      .ui-lite-responsive-card__body { padding: 1rem; }
      .ui-lite-responsive-card__body h3 {
        margin: 0 0 0.25rem;
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-primary, oklch(97% 0 0));
        text-wrap: balance;
      }
      .ui-lite-responsive-card__body p {
        margin: 0 0 0.75rem;
        font-size: 0.875rem;
        color: var(--text-secondary, oklch(70% 0 0));
        text-wrap: pretty;
      }
      .ui-lite-responsive-card__badge { margin-block-end: 0.5rem; }
      .ui-lite-responsive-card__actions {
        display: flex;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }
    }
  }
`

export interface LiteResponsiveCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  image?: ReactNode
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  badge?: ReactNode
}

export const ResponsiveCard = forwardRef<HTMLDivElement, LiteResponsiveCardProps>(
  ({ image, title, description, actions, badge, className, ...rest }, ref) => {
    useStyles('lite-responsive-card', responsiveCardStyles)
    return (
      <div ref={ref} className={`ui-lite-responsive-card${className ? ` ${className}` : ''}`} {...rest}>
        {image && <div className="ui-lite-responsive-card__image">{image}</div>}
        <div className="ui-lite-responsive-card__body">
          {badge && <div className="ui-lite-responsive-card__badge">{badge}</div>}
          <h3>{title}</h3>
          {description && <p>{description}</p>}
          {actions && <div className="ui-lite-responsive-card__actions">{actions}</div>}
        </div>
      </div>
    )
  }
)
ResponsiveCard.displayName = 'ResponsiveCard'
