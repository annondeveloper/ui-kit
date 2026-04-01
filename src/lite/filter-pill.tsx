import { forwardRef, type ButtonHTMLAttributes } from 'react'

export interface LiteFilterPillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  removable?: boolean
  onRemove?: () => void
}

export const FilterPill = forwardRef<HTMLButtonElement, LiteFilterPillProps>(
  ({ active, removable, onRemove, className, children, ...rest }, ref) => (
    <button
      ref={ref}
      className={`ui-lite-filter-pill${className ? ` ${className}` : ''}`}
      data-active={active ? '' : undefined}
      {...rest}
    >
      {children}
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
