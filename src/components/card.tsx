'use client'

import { forwardRef, useState, useRef, type HTMLAttributes, type ElementType, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useEntrance } from '../core/motion/use-entrance'
import { cn } from '../core/utils/cn'

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost' | 'glass' | 'gradient'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  interactive?: boolean
  motion?: 0 | 1 | 2 | 3
  /** Card header area (image, title bar, etc.) */
  header?: ReactNode
  /** Card footer area (action buttons) */
  footer?: ReactNode
  /** Click to expand/collapse content */
  expandable?: boolean
  /** Initial expanded state (default: true) */
  defaultExpanded?: boolean
  /** Polymorphic pass-through: href, target, etc. */
  href?: string
  target?: string
  rel?: string
}

const cardStyles = css`
  @layer components {
    @scope (.ui-card) {
      :scope {
        position: relative;
        display: block;
        border-radius: var(--radius-lg, 0.75rem);
        container-type: inline-size;
        overflow: hidden;
      }

      /* Padding */
      :scope[data-padding="none"] { padding: 0; }
      :scope[data-padding="sm"] { padding: var(--space-sm, 0.5rem); }
      :scope[data-padding="md"] { padding: var(--space-md, 1rem); }
      :scope[data-padding="lg"] { padding: var(--space-lg, 1.5rem); }

      /* Variants */
      :scope[data-variant="default"] {
        background: var(--bg-surface, oklch(22% 0.02 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
      }
      :scope[data-variant="elevated"] {
        background: var(--bg-elevated, oklch(28% 0.02 270));
        border: none;
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
        background: oklch(from var(--bg-elevated) l c h / 0.6);
        backdrop-filter: blur(16px) saturate(1.5);
        border: 1px solid oklch(100% 0 0 / 0.08);
      }
      :scope[data-variant="gradient"] {
        background: linear-gradient(135deg, var(--bg-elevated) 0%, oklch(from var(--brand) calc(l - 0.3) 0.05 h) 100%);
        border: 1px solid oklch(100% 0 0 / 0.06);
      }

      /* ── Header area ── */
      .ui-card__header {
        margin: calc(-1 * var(--card-padding, 1rem));
        margin-block-end: var(--card-padding, 1rem);
        padding: var(--card-padding, 1rem);
        border-block-end: 1px solid var(--border-subtle);
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      /* ── Footer area ── */
      .ui-card__footer {
        margin: calc(-1 * var(--card-padding, 1rem));
        margin-block-start: var(--card-padding, 1rem);
        padding: var(--card-padding, 1rem);
        border-block-start: 1px solid var(--border-subtle);
        display: flex;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
        justify-content: flex-end;
      }

      /* ── Expandable content ── */
      .ui-card__content {
        display: grid;
        grid-template-rows: 1fr;
        transition: grid-template-rows 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .ui-card__content[data-collapsed="true"] {
        grid-template-rows: 0fr;
      }
      .ui-card__content-inner {
        overflow: hidden;
      }

      /* ── Expand toggle button ── */
      .ui-card__expand-toggle {
        background: none;
        border: none;
        padding: 0.25rem;
        cursor: pointer;
        color: var(--text-tertiary);
        display: flex;
        align-items: center;
        transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        border-radius: var(--radius-sm, 0.25rem);
      }
      .ui-card__expand-toggle:hover {
        color: var(--text-primary);
      }
      .ui-card__expand-toggle[data-expanded="true"] {
        transform: rotate(180deg);
      }

      /* Card padding CSS custom property mapping */
      :scope[data-padding="none"] { --card-padding: 0; }
      :scope[data-padding="sm"] { --card-padding: var(--space-sm, 0.5rem); }
      :scope[data-padding="md"] { --card-padding: var(--space-md, 1rem); }
      :scope[data-padding="lg"] { --card-padding: var(--space-lg, 1.5rem); }

      /* Aurora glow — default + elevated only */
      :scope[data-variant="default"]::before,
      :scope[data-variant="elevated"]::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: radial-gradient(
          ellipse at 20% 0%,
          oklch(from var(--aurora-1, oklch(70% 0.15 270)) l c h / 0.04) 0%,
          transparent 60%
        ),
        radial-gradient(
          ellipse at 80% 100%,
          oklch(from var(--aurora-2, oklch(70% 0.15 330)) l c h / 0.03) 0%,
          transparent 50%
        );
        pointer-events: none;
        z-index: 0;
      }

      :scope > * {
        position: relative;
        z-index: 1;
      }

      /* Interactive */
      :scope[data-interactive="true"] {
        cursor: pointer;
      }

      /* Interactive — base transition for smooth hover */
      :scope[data-interactive="true"]:not([data-motion="0"]) {
        transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
                    box-shadow 0.25s var(--ease-out, ease-out),
                    border-color 0.25s var(--ease-out, ease-out);
      }

      /* Interactive hover lift — motion level 1+ */
      @media (hover: hover) {
        :scope[data-interactive="true"]:hover:not([data-motion="0"]) {
          transform: translateY(-2px);
        }
        :scope[data-interactive="true"][data-variant="elevated"]:hover:not([data-motion="0"]) {
          box-shadow: var(--shadow-lg, 0 8px 24px oklch(0% 0 0 / 0.25));
        }
        :scope[data-interactive="true"][data-variant="default"]:hover:not([data-motion="0"]) {
          border-color: var(--border-default, oklch(100% 0 0 / 0.12));
          box-shadow: var(--shadow-md, 0 4px 12px oklch(0% 0 0 / 0.15));
        }

        /* Aurora glow intensifies on hover — motion level 2+ */
        :scope[data-interactive="true"][data-variant="default"]:hover:not([data-motion="0"]):not([data-motion="1"])::before,
        :scope[data-interactive="true"][data-variant="elevated"]:hover:not([data-motion="0"]):not([data-motion="1"])::before {
          background: radial-gradient(
            ellipse at 20% 0%,
            oklch(from var(--aurora-1, oklch(70% 0.15 270)) l c h / 0.08) 0%,
            transparent 60%
          ),
          radial-gradient(
            ellipse at 80% 100%,
            oklch(from var(--aurora-2, oklch(70% 0.15 330)) l c h / 0.06) 0%,
            transparent 50%
          );
        }
      }

      /* Focus visible */
      :scope:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      /* Touch targets */
      @media (pointer: coarse) {
        :scope[data-interactive="true"] {
          min-block-size: 44px;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        :scope {
          border: 2px solid ButtonText;
        }
        :scope::before {
          display: none;
        }
        :scope:focus-visible {
          outline: 2px solid Highlight;
        }
      }

      /* Print */
      @media print {
        :scope {
          box-shadow: none;
          border: 1px solid;
        }
        :scope::before {
          display: none;
        }
      }

      /* Reduced data */
      @media (prefers-reduced-data: reduce) {
        :scope {
          box-shadow: none;
        }
        :scope::before {
          display: none;
        }
      }
    }
  }
`

export const Card = forwardRef<HTMLElement, CardProps>(
  (
    {
      as: Component = 'div',
      variant = 'default',
      padding = 'md',
      interactive = false,
      motion: motionProp,
      header,
      footer,
      expandable = false,
      defaultExpanded = true,
      children,
      className,
      ...rest
    },
    forwardedRef
  ) => {
    const cls = useStyles('card', cardStyles)
    const motionLevel = useMotionLevel(motionProp)
    const internalRef = useRef<HTMLElement>(null)
    const [expanded, setExpanded] = useState(defaultExpanded)

    // Subtle fade-up entrance at motion level 2+
    useEntrance(
      internalRef,
      motionLevel >= 2 ? 'fade-up' : 'none',
      { duration: 250 }
    )

    // Merge refs
    const setRef = (node: HTMLElement | null) => {
      (internalRef as React.MutableRefObject<HTMLElement | null>).current = node
      if (typeof forwardedRef === 'function') forwardedRef(node)
      else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLElement | null>).current = node
    }

    const expandToggle = expandable ? (
      <button
        type="button"
        className="ui-card__expand-toggle"
        data-expanded={expanded}
        onClick={() => setExpanded(prev => !prev)}
        aria-label={expanded ? 'Collapse' : 'Expand'}
        aria-expanded={expanded}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    ) : null

    return (
      <Component
        ref={setRef}
        className={cn(cls('root'), className)}
        data-variant={variant}
        data-padding={padding}
        data-motion={motionLevel}
        data-interactive={interactive || undefined}
        {...rest}
      >
        {header && (
          <div className="ui-card__header">
            <span>{header}</span>
            {expandToggle}
          </div>
        )}
        {!header && expandToggle && (
          <div className="ui-card__header" style={{ borderBlockEnd: 'none', marginBlockEnd: 0 }}>
            <span />
            {expandToggle}
          </div>
        )}
        {expandable ? (
          <div className="ui-card__content" data-collapsed={!expanded}>
            <div className="ui-card__content-inner">{children}</div>
          </div>
        ) : children}
        {footer && <div className="ui-card__footer">{footer}</div>}
      </Component>
    )
  }
)
Card.displayName = 'Card'
