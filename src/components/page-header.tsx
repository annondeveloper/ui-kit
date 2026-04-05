'use client'

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { cn } from '../core/utils/cn'

export interface PageHeaderProps extends HTMLAttributes<HTMLElement> {
  /** Page title text */
  title: string
  /** Optional description below the title */
  description?: string
  /** Action buttons rendered on the right side */
  actions?: ReactNode
  /** Title sizing: sm, md, or lg */
  size?: 'sm' | 'md' | 'lg'
  /** Breadcrumb navigation rendered above the title */
  breadcrumbs?: ReactNode
}

const pageHeaderStyles = css`
  @layer components {
    @scope (.ui-page-header) {
      :scope {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm, 0.5rem);
        margin-block-end: var(--space-lg, 1.5rem);
      }

      .ui-page-header__breadcrumbs {
        margin-block-end: var(--space-xs, 0.25rem);
      }

      .ui-page-header__row {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--space-md, 1rem);
        flex-wrap: wrap;
      }

      .ui-page-header__content {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs, 0.25rem);
        min-inline-size: 0;
        flex: 1 1 0%;
      }

      .ui-page-header__title {
        margin: 0;
        color: var(--text-primary, oklch(95% 0 0));
        font-weight: 700;
        text-wrap: balance;
        line-height: 1.2;
      }

      /* Title sizes */
      :scope[data-size="sm"] .ui-page-header__title {
        font-size: clamp(1.125rem, 1rem + 0.5vw, 1.375rem);
      }
      :scope[data-size="md"] .ui-page-header__title {
        font-size: clamp(1.5rem, 1.25rem + 1vw, 2rem);
      }
      :scope[data-size="lg"] .ui-page-header__title {
        font-size: clamp(2rem, 1.5rem + 1.5vw, 2.75rem);
      }

      .ui-page-header__description {
        margin: 0;
        color: var(--text-secondary, oklch(70% 0 0));
        font-size: clamp(0.875rem, 0.8rem + 0.25vw, 1rem);
        text-wrap: pretty;
        line-height: 1.5;
        max-inline-size: 60ch;
      }

      .ui-page-header__actions {
        display: flex;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
        flex-shrink: 0;
        padding-block-start: var(--space-xs, 0.25rem);
      }

      /* Stack on narrow containers */
      @container (max-width: 480px) {
        .ui-page-header__row {
          flex-direction: column;
        }
        .ui-page-header__actions {
          padding-block-start: 0;
          inline-size: 100%;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        :scope {
          transition: none !important;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-page-header__title {
          color: CanvasText;
        }
        .ui-page-header__description {
          color: GrayText;
        }
      }

      /* Print */
      @media print {
        .ui-page-header__actions {
          display: none;
        }
      }
    }
  }
`

/**
 * PageHeader -- title, description, and optional action buttons area.
 * Responsive: stacks vertically on narrow containers.
 */
export const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(
  (
    {
      title,
      description,
      actions,
      size = 'md',
      breadcrumbs,
      className,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('page-header', pageHeaderStyles)

    return (
      <header
        ref={ref}
        className={cn(cls('root'), className)}
        data-size={size}
        {...rest}
      >
        {breadcrumbs && (
          <nav className="ui-page-header__breadcrumbs" aria-label="Breadcrumb">
            {breadcrumbs}
          </nav>
        )}
        <div className="ui-page-header__row">
          <div className="ui-page-header__content">
            <h1 className="ui-page-header__title">{title}</h1>
            {description && (
              <p className="ui-page-header__description">{description}</p>
            )}
          </div>
          {actions && (
            <div className="ui-page-header__actions">{actions}</div>
          )}
        </div>
      </header>
    )
  }
)
PageHeader.displayName = 'PageHeader'
