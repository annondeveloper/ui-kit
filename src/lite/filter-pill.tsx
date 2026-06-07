import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const filterPillStyles = css`
  @layer components {
    @scope (.ui-lite-filter-pill) {
      :scope {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.25rem 0.625rem;
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.08));
        border-radius: 9999px;
        background: transparent;
        font-family: inherit;
        font-size: 0.8125rem;
        font-weight: 500;
        cursor: pointer;
        white-space: nowrap;
        color: var(--text-secondary, oklch(70% 0 0));
      }
      :scope[data-size="sm"] {
        padding: 0.125rem 0.5rem;
        font-size: var(--text-xs, 0.75rem);
        gap: 0.125rem;
      }
      :scope[data-size="lg"] {
        padding: 0.375rem 0.875rem;
        font-size: var(--text-sm, 0.9375rem);
      }
      :scope:hover {
        background: oklch(100% 0 0 / 0.04);
        border-color: var(--border-strong, oklch(100% 0 0 / 0.2));
      }
      :scope:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }
      :scope[data-active] {
        background: var(--brand, oklch(65% 0.2 270));
        color: var(--text-on-brand, oklch(100% 0 0));
        border-color: transparent;
      }
      .ui-lite-filter-pill__icon {
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
      }
      .ui-lite-filter-pill__icon svg {
        inline-size: 1em;
        block-size: 1em;
      }
      .ui-lite-filter-pill__count {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-inline-size: 1.25em;
        block-size: 1.25em;
        padding-inline: 0.25em;
        border-radius: 9999px;
        background: oklch(100% 0 0 / 0.1);
        font-size: 0.8em;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        line-height: 1;
      }
      .ui-lite-filter-pill__remove {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 0.875rem;
        line-height: 1;
        opacity: 0.6;
        border-radius: 9999px;
        margin-inline-end: -0.125rem;
      }
      .ui-lite-filter-pill__remove:hover { opacity: 1; }
      .ui-lite-filter-pill__remove:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 1px;
        opacity: 1;
      }
    }
  }
`

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
  ({ active, removable, onRemove, count, icon, size, className, children, ...rest }, ref) => {
    useStyles('lite-filter-pill', filterPillStyles)
    return (
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
  }
)
FilterPill.displayName = 'FilterPill'
