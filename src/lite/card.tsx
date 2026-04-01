import {
  forwardRef,
  useState,
  type HTMLAttributes,
  type ElementType,
  type ReactNode,
} from 'react'

export interface LiteCardProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost' | 'glass' | 'gradient'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  interactive?: boolean
  header?: ReactNode
  footer?: ReactNode
  expandable?: boolean
  defaultExpanded?: boolean
  loading?: boolean
  bordered?: boolean
  /** Accepted for API parity but ignored in Lite */
  classNames?: Partial<Record<'root' | 'header' | 'footer' | 'content', string>>
  href?: string
  target?: string
  rel?: string
}

export const Card = forwardRef<HTMLElement, LiteCardProps>(
  (
    {
      as: Component = 'div',
      variant = 'default',
      padding = 'md',
      interactive = false,
      header,
      footer,
      expandable = false,
      defaultExpanded = true,
      loading = false,
      bordered,
      classNames: _classNames,
      href,
      target,
      rel,
      children,
      className,
      ...rest
    },
    ref
  ) => {
    const [expanded, setExpanded] = useState(defaultExpanded)

    return (
      <Component
        ref={ref}
        className={`ui-lite-card${className ? ` ${className}` : ''}`}
        data-variant={variant}
        data-padding={padding}
        data-interactive={interactive || undefined}
        data-loading={loading || undefined}
        data-bordered={bordered || undefined}
        href={href}
        target={target}
        rel={rel}
        {...rest}
      >
        {header && (
          <div className="ui-lite-card__header">
            <span>{header}</span>
            {expandable && (
              <button
                type="button"
                className="ui-lite-card__expand-toggle"
                onClick={() => setExpanded(prev => !prev)}
                aria-label={expanded ? 'Collapse' : 'Expand'}
                aria-expanded={expanded}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M4 6l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
        {expandable ? (
          <div hidden={!expanded}>{children}</div>
        ) : (
          children
        )}
        {footer && <div className="ui-lite-card__footer">{footer}</div>}
        {loading && (
          <div
            className="ui-lite-card__skeleton"
            aria-hidden="true"
            style={{ position: 'absolute', inset: 0, zIndex: 2, borderRadius: 'inherit', background: 'var(--bg-surface, oklch(25% 0.02 270 / 0.8))' }}
          />
        )}
      </Component>
    )
  }
)
Card.displayName = 'Card'
