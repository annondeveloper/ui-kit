import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

export interface LiteFilterPillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  removable?: boolean
  onRemove?: () => void
  /** Badge count shown after label */
  count?: number
  /** Icon rendered before label */
  icon?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export const FilterPill = forwardRef<HTMLButtonElement, LiteFilterPillProps>(
  ({ active, removable, onRemove, count, icon, size, className, children, ...rest }, ref) => (
    <button
      ref={ref}
      className={`ui-lite-filter-pill${className ? ` ${className}` : ''}`}
      data-active={active ? '' : undefined}
      data-size={size}
      {...rest}
    >
      {icon && <span className="ui-lite-filter-pill__icon" aria-hidden="true">{icon}</span>}
      {children}
      {count != null && <span className="ui-lite-filter-pill__count" aria-label={`${count} items`}>{count}</span>}
      {removable && (
        <span
          role="button"
          tabIndex={0}
          aria-label="Remove"
          className="ui-lite-filter-pill__remove"
          onClick={e => { e.stopPropagation(); onRemove?.() }}
          onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); onRemove?.() } }}
        >&times;</span>
      )}
    </button>
  )
)
FilterPill.displayName = 'FilterPill'
