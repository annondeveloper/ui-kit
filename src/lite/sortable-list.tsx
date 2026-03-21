import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteSortableItem {
  id: string
  content: ReactNode
}

export interface LiteSortableListProps extends HTMLAttributes<HTMLOListElement> {
  items: LiteSortableItem[]
}

export const SortableList = forwardRef<HTMLOListElement, LiteSortableListProps>(
  ({ items, className, ...rest }, ref) => (
    <ol ref={ref} className={`ui-lite-sortable-list${className ? ` ${className}` : ''}`} {...rest}>
      {items.map(item => (
        <li key={item.id} className="ui-lite-sortable-list__item">{item.content}</li>
      ))}
    </ol>
  )
)
SortableList.displayName = 'SortableList'
