import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteBreadcrumbItem {
  label: ReactNode
  href?: string
}

export interface LiteBreadcrumbsProps extends HTMLAttributes<HTMLElement> {
  items: LiteBreadcrumbItem[]
  separator?: ReactNode
}

export const Breadcrumbs = forwardRef<HTMLElement, LiteBreadcrumbsProps>(
  ({ items, separator = '/', className, ...rest }, ref) => (
    <nav ref={ref} className={`ui-lite-breadcrumbs${className ? ` ${className}` : ''}`} aria-label="Breadcrumb" {...rest}>
      <ol>
        {items.map((item, i) => (
          <li key={i}>
            {i > 0 && <span className="ui-lite-breadcrumbs__sep" aria-hidden="true">{separator}</span>}
            {item.href ? (
              <a href={item.href}>{item.label}</a>
            ) : (
              <span aria-current={i === items.length - 1 ? 'page' : undefined}>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
)
Breadcrumbs.displayName = 'Breadcrumbs'
