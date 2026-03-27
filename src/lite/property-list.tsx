import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

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
  ({ items, columns = 1, size = 'md', striped, className, ...rest }, ref) => (
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
)
PropertyList.displayName = 'PropertyList'
