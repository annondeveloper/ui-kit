import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { Badge } from './badge'

export interface LiteKanbanCard {
  id: string
  title: ReactNode
  description?: ReactNode
  tags?: string[]
}

export interface LiteKanbanColumnProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode
  cards: LiteKanbanCard[]
  count?: number
}

const kanbanColumnStyles = css`
  @layer components {
    @scope (.ui-lite-kanban-column) {
      :scope {
        inline-size: 280px;
        min-inline-size: 280px;
        background: var(--bg-surface, oklch(12% 0.015 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.04));
        border-radius: var(--radius-lg, 14px);
        display: flex;
        flex-direction: column;
      }

      .ui-lite-kanban-column__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem 1rem;
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.04));
      }
      .ui-lite-kanban-column__header h3 {
        margin: 0;
        font-size: 0.8125rem;
        font-weight: 600;
      }
      .ui-lite-kanban-column__count {
        font-size: 0.6875rem;
        padding: 0.0625rem 0.375rem;
        background: oklch(100% 0 0 / 0.06);
        border-radius: 9999px;
      }
      .ui-lite-kanban-column__cards {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
        padding: 0.5rem;
        flex: 1;
      }
      .ui-lite-kanban-column__card {
        padding: 0.625rem 0.75rem;
        background: var(--bg-elevated, oklch(16% 0.02 275));
        border-radius: var(--radius-md, 10px);
      }
      .ui-lite-kanban-column__card strong {
        display: block;
        font-size: 0.8125rem;
        margin-block-end: 0.25rem;
      }
      .ui-lite-kanban-column__card p {
        margin: 0;
        font-size: 0.75rem;
        color: var(--text-secondary, oklch(70% 0 0));
      }
      .ui-lite-kanban-column__tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
        margin-block-start: 0.375rem;
      }
    }
  }
`

export const KanbanColumn = forwardRef<HTMLDivElement, LiteKanbanColumnProps>(
  ({ title, cards, count, className, ...rest }, ref) => {
    useStyles('lite-kanban-column', kanbanColumnStyles)
    return (
    <div ref={ref} className={`ui-lite-kanban-column${className ? ` ${className}` : ''}`} {...rest}>
      <div className="ui-lite-kanban-column__header">
        <h3>{title}</h3>
        {count != null && <span className="ui-lite-kanban-column__count">{count}</span>}
      </div>
      <div className="ui-lite-kanban-column__cards">
        {cards.map(card => (
          <div key={card.id} className="ui-lite-kanban-column__card">
            <strong>{card.title}</strong>
            {card.description && <p>{card.description}</p>}
            {card.tags?.length ? (
              <div className="ui-lite-kanban-column__tags">
                {card.tags.map(tag => <Badge key={tag} variant="default">{tag}</Badge>)}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
  }
)
KanbanColumn.displayName = 'KanbanColumn'
