import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteResponsiveCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  image?: ReactNode
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  badge?: ReactNode
}

export const ResponsiveCard = forwardRef<HTMLDivElement, LiteResponsiveCardProps>(
  ({ image, title, description, actions, badge, className, ...rest }, ref) => (
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
)
ResponsiveCard.displayName = 'ResponsiveCard'
