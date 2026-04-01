import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteBreadcrumbItem {
  label: ReactNode
  href?: string
  icon?: ReactNode
}

export interface LiteBreadcrumbsProps extends HTMLAttributes<HTMLElement> {
  items: LiteBreadcrumbItem[]
  separator?: ReactNode
  /** Max visible items; middle items collapse to ellipsis */
  maxVisible?: number
  /** Called instead of default link navigation; receives href */
  onNavigate?: (href: string, item: LiteBreadcrumbItem) => void
}

export const Breadcrumbs = forwardRef<HTMLElement, LiteBreadcrumbsProps>(
  ({ items, separator = '/', maxVisible, onNavigate, className, ...rest }, ref) => {
    let visible = items
    if (maxVisible != null && items.length > maxVisible) {
      const keep = Math.max(1, maxVisible - 1)
      // Always show first + last (keep - 1) items, collapse middle
      const head = items.slice(0, 1)
      const tail = items.slice(items.length - (keep - 1))
      const ellipsisItem: LiteBreadcrumbItem = { label: '…' }
      visible = [...head, ellipsisItem, ...tail]
    }

    return (
      <nav ref={ref} className={`ui-lite-breadcrumbs${className ? ` ${className}` : ''}`} aria-label="Breadcrumb" {...rest}>
        <ol>
          {visible.map((item, i) => (
            <li key={i}>
              {i > 0 && <span className="ui-lite-breadcrumbs__sep" aria-hidden="true">{separator}</span>}
              {item.href ? (
                <a
                  href={item.href}
                  onClick={onNavigate ? e => { e.preventDefault(); onNavigate(item.href!, item) } : undefined}
                >
                  {item.icon && <span className="ui-lite-breadcrumbs__icon" aria-hidden="true">{item.icon}</span>}
                  {item.label}
                </a>
              ) : (
                <span aria-current={i === visible.length - 1 ? 'page' : undefined}>
                  {item.icon && <span className="ui-lite-breadcrumbs__icon" aria-hidden="true">{item.icon}</span>}
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    )
  }
)
Breadcrumbs.displayName = 'Breadcrumbs'
