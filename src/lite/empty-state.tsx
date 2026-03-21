import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteEmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
}

export const EmptyState = forwardRef<HTMLDivElement, LiteEmptyStateProps>(
  ({ icon, title, description, action, className, ...rest }, ref) => (
    <div ref={ref} className={`ui-lite-empty-state${className ? ` ${className}` : ''}`} {...rest}>
      {icon && <div className="ui-lite-empty-state__icon">{icon}</div>}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && <div className="ui-lite-empty-state__action">{action}</div>}
    </div>
  )
)
EmptyState.displayName = 'EmptyState'
