import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const sortableListStyles = css`
  @layer components {
    @scope (.ui-lite-sortable-list) {
      :scope {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .ui-lite-sortable-list__item {
        padding: 0.5rem 0.75rem;
        background: var(--bg-surface, oklch(12% 0.015 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.04));
        border-radius: var(--radius-md, 10px);
        font-size: 0.875rem;
        color: var(--text-primary, oklch(97% 0 0));
      }
    }
  }
`

export interface LiteSortableItem {
  id: string
  content: ReactNode
}

export interface LiteSortableListProps extends HTMLAttributes<HTMLOListElement> {
  items: LiteSortableItem[]
}

export const SortableList = forwardRef<HTMLOListElement, LiteSortableListProps>(
  ({ items, className, ...rest }, ref) => {
    useStyles('lite-sortable-list', sortableListStyles)
    return (
      <ol ref={ref} className={`ui-lite-sortable-list${className ? ` ${className}` : ''}`} {...rest}>
        {items.map(item => (
          <li key={item.id} className="ui-lite-sortable-list__item">{item.content}</li>
        ))}
      </ol>
    )
  }
)
SortableList.displayName = 'SortableList'
