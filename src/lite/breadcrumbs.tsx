import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const breadcrumbsStyles = css`
  @layer components {
    @scope (.ui-lite-breadcrumbs) {
      :scope {
        font-family: inherit;
      }
      ol {
        display: flex;
        align-items: center;
        gap: 0;
        list-style: none;
        padding: 0;
        margin: 0;
        flex-wrap: wrap;
      }
      li {
        display: inline-flex;
        align-items: center;
        font-size: var(--text-sm, 0.8125rem);
      }
      .ui-lite-breadcrumbs__sep {
        margin-inline: 0.375rem;
        color: var(--text-secondary, oklch(70% 0 0));
        opacity: 0.4;
      }
      .ui-lite-breadcrumbs__icon {
        display: inline-flex;
        align-items: center;
        margin-inline-end: 0.25rem;
      }
      .ui-lite-breadcrumbs__icon svg {
        inline-size: 1em;
        block-size: 1em;
      }
      a {
        display: inline-flex;
        align-items: center;
        color: var(--text-secondary, oklch(70% 0 0));
        text-decoration: none;
      }
      a:hover {
        color: var(--text-primary, oklch(97% 0 0));
        text-decoration: underline;
      }
      a:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
        border-radius: var(--radius-sm, 6px);
      }
      [aria-current="page"] {
        display: inline-flex;
        align-items: center;
        color: var(--text-primary, oklch(97% 0 0));
        font-weight: 500;
      }
    }
  }
`

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
    useStyles('lite-breadcrumbs', breadcrumbsStyles)
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
