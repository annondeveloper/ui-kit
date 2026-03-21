import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

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

export const KanbanColumn = forwardRef<HTMLDivElement, LiteKanbanColumnProps>(
  ({ title, cards, count, className, ...rest }, ref) => (
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
                {card.tags.map(tag => <span key={tag} className="ui-lite-badge" data-variant="default">{tag}</span>)}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
)
KanbanColumn.displayName = 'KanbanColumn'
