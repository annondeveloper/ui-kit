import {
  forwardRef,
  useState,
  type HTMLAttributes,
  type ElementType,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const cardStyles = css`
  @layer components {
    @scope (.ui-lite-card) {
      :scope {
        position: relative;
        display: block;
        border-radius: var(--radius-lg, 14px);
        color: var(--text-primary, oklch(97% 0 0));
        font-family: inherit;
        --card-padding: var(--space-md, 1rem);
      }

      /* Padding */
      :scope[data-padding="none"] { padding: 0; --card-padding: 0; }
      :scope[data-padding="sm"] { padding: var(--space-sm, 0.5rem); --card-padding: var(--space-sm, 0.5rem); }
      :scope[data-padding="md"] { padding: var(--space-md, 1rem); --card-padding: var(--space-md, 1rem); }
      :scope[data-padding="lg"] { padding: var(--space-lg, 1.5rem); --card-padding: var(--space-lg, 1.5rem); }

      /* Variants */
      :scope[data-variant="default"] {
        background: var(--bg-surface, oklch(12% 0.015 270));
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.1));
      }
      :scope[data-variant="elevated"] {
        background: var(--bg-elevated, oklch(16% 0.02 275));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.06));
        box-shadow: var(--shadow-md, 0 4px 12px oklch(0% 0 0 / 0.2));
      }
      :scope[data-variant="outlined"] {
        background: transparent;
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.12));
      }
      :scope[data-variant="ghost"] {
        background: transparent;
        border: none;
      }
      :scope[data-variant="glass"] {
        background: oklch(100% 0 0 / 0.04);
        border: 1px solid var(--border-strong, oklch(100% 0 0 / 0.14));
        backdrop-filter: blur(20px) saturate(1.8);
      }
      :scope[data-variant="gradient"] {
        background: linear-gradient(135deg, var(--bg-elevated, oklch(16% 0.02 275)) 0%, oklch(20% 0.05 270) 100%);
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.06));
      }

      /* Bordered override */
      :scope[data-bordered] {
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.1));
      }

      /* Interactive */
      :scope[data-interactive] {
        cursor: pointer;
      }
      @media (hover: hover) {
        :scope[data-interactive]:hover {
          border-color: var(--border-strong, oklch(100% 0 0 / 0.14));
        }
      }

      /* Focus */
      :scope:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      /* Loading state */
      :scope[data-loading] {
        min-block-size: 120px;
      }

      /* Header */
      .ui-lite-card__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: calc(-1 * var(--card-padding));
        margin-block-end: var(--card-padding);
        padding: var(--card-padding);
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.04));
        font-weight: 600;
      }

      /* Footer */
      .ui-lite-card__footer {
        display: flex;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
        justify-content: flex-end;
        margin: calc(-1 * var(--card-padding));
        margin-block-start: var(--card-padding);
        padding: var(--card-padding);
        border-block-start: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.04));
      }

      /* Expand toggle */
      .ui-lite-card__expand-toggle {
        display: flex;
        align-items: center;
        padding: 0.25rem;
        border: none;
        background: none;
        cursor: pointer;
        color: var(--text-secondary, oklch(70% 0 0));
        border-radius: var(--radius-sm, 6px);
      }
      .ui-lite-card__expand-toggle:hover {
        color: var(--text-primary, oklch(97% 0 0));
      }
      .ui-lite-card__expand-toggle:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      /* Forced colors */
      @media (forced-colors: active) {
        :scope { border: 2px solid ButtonText; }
        :scope:focus-visible { outline: 2px solid Highlight; }
      }

      /* Print */
      @media print {
        :scope { box-shadow: none; border: 1px solid; }
      }
    }
  }
`

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
    useStyles('lite-card', cardStyles)
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
