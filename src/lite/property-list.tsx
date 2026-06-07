import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const propertyListStyles = css`
  @layer components {
    @scope (.ui-lite-property-list) {
      :scope {
        display: grid;
        gap: 0;
        border-radius: var(--radius-lg, 0.75rem);
        background: var(--bg-surface, oklch(22% 0.02 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        overflow: hidden;
      }
      :scope[data-columns="2"] { grid-template-columns: 1fr 1fr; }

      .ui-lite-property-list__row {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: var(--space-md, 1rem);
        min-block-size: 2rem;
        line-height: 1.5;
        padding: var(--space-xs, 0.25rem) var(--space-md, 1rem);
        font-size: var(--text-sm, 0.875rem);
      }
      :scope[data-size="sm"] .ui-lite-property-list__row { padding: var(--space-2xs, 0.125rem) var(--space-sm, 0.5rem); font-size: var(--text-xs, 0.75rem); }
      :scope[data-size="lg"] .ui-lite-property-list__row { padding: var(--space-sm, 0.5rem) var(--space-md, 1rem); font-size: var(--text-base, 1rem); }

      .ui-lite-property-list__row + .ui-lite-property-list__row {
        border-block-start: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.06));
      }
      :scope[data-columns="2"] .ui-lite-property-list__row {
        border-inline-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
      }
      :scope[data-columns="2"] .ui-lite-property-list__row:nth-child(2n) { border-inline-end: none; }
      :scope[data-columns="2"] .ui-lite-property-list__row:nth-child(1),
      :scope[data-columns="2"] .ui-lite-property-list__row:nth-child(2) { border-block-start: none; }

      :scope[data-striped] .ui-lite-property-list__row:nth-child(odd) {
        background: var(--bg-hover, oklch(100% 0 0 / 0.04));
      }

      .ui-lite-property-list__label {
        color: var(--text-tertiary, oklch(55% 0 0));
        font-weight: 500;
        flex-shrink: 0;
        white-space: nowrap;
      }
      .ui-lite-property-list__value {
        color: var(--text-primary, oklch(90% 0 0));
        text-align: end;
        overflow-wrap: anywhere;
        min-inline-size: 0;
      }
      .ui-lite-property-list__value[data-mono] {
        font-family: var(--font-mono, ui-monospace, Menlo, Consolas, monospace);
        font-variant-numeric: tabular-nums;
      }
      .ui-lite-property-list__value a {
        color: oklch(72% 0.15 250);
        text-decoration: none;
      }
      .ui-lite-property-list__value a:hover { text-decoration: underline; }
    }
  }
`

export interface LitePropertyItem {
  label: string
  value: ReactNode
  mono?: boolean
  href?: string
}

export interface LitePropertyListProps extends HTMLAttributes<HTMLDivElement> {
  items: LitePropertyItem[]
  columns?: 1 | 2
  size?: 'sm' | 'md' | 'lg'
  striped?: boolean
}

export const PropertyList = forwardRef<HTMLDivElement, LitePropertyListProps>(
  ({ items, columns = 1, size = 'md', striped, className, ...rest }, ref) => {
    useStyles('lite-property-list', propertyListStyles)
    return (
    <div
      ref={ref}
      className={`ui-lite-property-list${className ? ` ${className}` : ''}`}
      data-columns={columns}
      data-size={size}
      {...(striped && { 'data-striped': '' })}
      role="list"
      {...rest}
    >
      {items.map((item, i) => (
        <div key={`${item.label}-${i}`} className="ui-lite-property-list__row" role="listitem">
          <span className="ui-lite-property-list__label">{item.label}</span>
          <span className="ui-lite-property-list__value" {...(item.mono && { 'data-mono': '' })}>
            {item.href ? <a href={item.href}>{item.value}</a> : item.value}
          </span>
        </div>
      ))}
    </div>
    )
  }
)
PropertyList.displayName = 'PropertyList'
