import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const emptyStateStyles = css`
  @layer components {
    @scope (.ui-lite-empty-state) {
      :scope {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 2rem 1rem;
        font-family: inherit;
      }
      .ui-lite-empty-state__icon {
        font-size: 2rem;
        margin-block-end: 0.75rem;
        opacity: 0.5;
        color: var(--text-secondary, oklch(70% 0 0));
      }
      h3 {
        margin: 0 0 0.25rem;
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-primary, oklch(90% 0 0));
        text-wrap: balance;
      }
      p {
        margin: 0;
        font-size: 0.875rem;
        color: var(--text-secondary, oklch(70% 0 0));
        max-inline-size: 28rem;
        text-wrap: pretty;
      }
      .ui-lite-empty-state__action {
        margin-block-start: 1rem;
      }
    }
  }
`

export interface LiteEmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
}

export const EmptyState = forwardRef<HTMLDivElement, LiteEmptyStateProps>(
  ({ icon, title, description, action, className, ...rest }, ref) => {
    useStyles('lite-empty-state', emptyStateStyles)
    return (
    <div ref={ref} className={`ui-lite-empty-state${className ? ` ${className}` : ''}`} {...rest}>
      {icon && <div className="ui-lite-empty-state__icon">{icon}</div>}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && <div className="ui-lite-empty-state__action">{action}</div>}
    </div>
    )
  }
)
EmptyState.displayName = 'EmptyState'
