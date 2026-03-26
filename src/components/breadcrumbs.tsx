'use client'

import {
  forwardRef,
  useCallback,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  label: ReactNode
  href?: string
  icon?: ReactNode
}

export interface BreadcrumbsProps extends HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[]
  separator?: ReactNode
  maxVisible?: number
  onNavigate?: (href: string) => void
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const breadcrumbsStyles = css`
  @layer components {
    @scope (.ui-breadcrumbs) {
      :scope {
        display: block;
      }

      ol {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--space-xs, 0.25rem);
        list-style: none;
        margin: 0;
        padding: 0;
      }

      li {
        display: flex;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
        min-inline-size: 0;
      }

      a {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.5;
        color: var(--text-secondary, oklch(70% 0 0));
        text-decoration: none;
        border-radius: var(--radius-sm, 0.25rem);
        padding-block: 0.125rem;
        padding-inline: 0.25rem;
        margin-inline: -0.25rem;
        transition: color 0.15s, background 0.15s;
        white-space: nowrap;
      }
      a:hover {
        color: var(--text-primary, oklch(90% 0 0));
        background: var(--bg-hover);
      }
      a:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      /* Current page */
      .ui-breadcrumbs__current {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.5;
        color: var(--text-primary, oklch(90% 0 0));
        font-weight: 500;
        white-space: nowrap;
      }

      /* Separator */
      .ui-breadcrumbs__separator {
        display: inline-flex;
        align-items: center;
        color: var(--text-tertiary, oklch(50% 0 0));
        flex-shrink: 0;
      }

      /* Ellipsis */
      .ui-breadcrumbs__ellipsis {
        display: inline-flex;
        align-items: center;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary, oklch(70% 0 0));
        padding-inline: 0.25rem;
      }

      /* Touch targets */
      @media (pointer: coarse) {
        a {
          min-block-size: 44px;
          min-inline-size: 44px;
          display: inline-flex;
          align-items: center;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        a {
          color: LinkText;
        }
        a:hover {
          color: LinkText;
          text-decoration: underline;
        }
        .ui-breadcrumbs__current {
          color: CanvasText;
        }
        .ui-breadcrumbs__separator {
          color: CanvasText;
        }
      }

      /* Print */
      @media print {
        a {
          color: #000;
          text-decoration: underline;
        }
      }

      /* Reduced data */
      @media (prefers-reduced-data: reduce) {
        a {
          transition: none;
        }
      }
    }
  }
`

// ─── Default Separator Icon ─────────────────────────────────────────────────

function ChevronRight() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M4.5 2.5L7.5 6L4.5 9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

export const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(
  function Breadcrumbs(
    {
      items,
      separator,
      maxVisible,
      onNavigate,
      className,
      ...rest
    },
    ref
  ) {
    useStyles('breadcrumbs', breadcrumbsStyles)

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (onNavigate) {
          e.preventDefault()
          onNavigate(href)
        }
      },
      [onNavigate]
    )

    // Collapse logic
    let visibleItems = items
    let hasEllipsis = false
    if (maxVisible != null && items.length > maxVisible) {
      // Show first item, ellipsis, then last (maxVisible - 2) items
      const tail = maxVisible - 1 // leave room for first + ellipsis
      const first = items[0]
      const lastItems = items.slice(items.length - tail)
      visibleItems = [first, ...lastItems]
      hasEllipsis = true
    }

    const separatorNode = separator ?? <ChevronRight />

    return (
      <nav
        ref={ref}
        className={cn('ui-breadcrumbs', className)}
        aria-label="Breadcrumb"
        {...rest}
      >
        <ol>
          {visibleItems.map((item, index) => {
            const isLast = index === visibleItems.length - 1
            const showEllipsis = hasEllipsis && index === 1

            return (
              <li key={index}>
                {/* Ellipsis before this item */}
                {showEllipsis && (
                  <>
                    <span className="ui-breadcrumbs__separator" aria-hidden="true">
                      {separatorNode}
                    </span>
                    <span className="ui-breadcrumbs__ellipsis">…</span>
                  </>
                )}

                {/* Separator (not before first item) */}
                {index > 0 && (
                  <span className="ui-breadcrumbs__separator" aria-hidden="true">
                    {separatorNode}
                  </span>
                )}

                {/* Item */}
                {isLast ? (
                  <span className="ui-breadcrumbs__current" aria-current="page">
                    {item.icon}
                    {item.label}
                  </span>
                ) : (
                  <a
                    href={item.href ?? '#'}
                    onClick={(e) => item.href ? handleClick(e, item.href) : undefined}
                  >
                    {item.icon}
                    {item.label}
                  </a>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    )
  }
)

Breadcrumbs.displayName = 'Breadcrumbs'
