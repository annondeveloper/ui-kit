import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const pageHeaderStyles = css`
  @layer components {
    @scope (.ui-lite-page-header) {
      :scope {
        inline-size: 100%;
        color: var(--text-primary, oklch(97% 0 0));
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.04));
        padding-block-end: var(--space-md, 1rem);
        margin-block-end: var(--space-md, 1rem);
      }
      :scope h1 { color: var(--text-primary, oklch(97% 0 0)); text-wrap: balance; }
      :scope nav { font-size: 0.8125rem; color: var(--text-secondary, oklch(70% 0 0)); }
    }
  }
`

export interface LitePageHeaderProps extends HTMLAttributes<HTMLElement> {
  title: string
  description?: string
  actions?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  breadcrumbs?: ReactNode
}

const TITLE_SIZES: Record<string, string> = {
  sm: '1.25rem',
  md: '1.75rem',
  lg: '2.25rem',
}

export const PageHeader = forwardRef<HTMLElement, LitePageHeaderProps>(
  ({ title, description, actions, size = 'md', breadcrumbs, className, ...rest }, ref) => {
    useStyles('lite-page-header', pageHeaderStyles)
    return (
    <header
      ref={ref}
      className={`ui-lite-page-header${className ? ` ${className}` : ''}`}
      data-size={size}
      style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      {...rest}
    >
      {breadcrumbs && (
        <nav aria-label="Breadcrumb" style={{ marginBlockEnd: '0.25rem' }}>
          {breadcrumbs}
        </nav>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: '1 1 0%', minInlineSize: 0 }}>
          <h1 style={{ margin: 0, fontSize: TITLE_SIZES[size] ?? '1.75rem', fontWeight: 700, lineHeight: 1.2 }}>
            {title}
          </h1>
          {description && (
            <p style={{ margin: 0, color: 'var(--text-secondary, oklch(70% 0 0))', fontSize: '0.9375rem', lineHeight: 1.5, maxInlineSize: '60ch' }}>
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            {actions}
          </div>
        )}
      </div>
    </header>
    )
  }
)
PageHeader.displayName = 'PageHeader'
