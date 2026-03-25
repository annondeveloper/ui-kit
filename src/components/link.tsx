'use client'

import { forwardRef, type AnchorHTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'default' | 'subtle' | 'brand'
  underline?: 'always' | 'hover' | 'none'
  external?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  motion?: 0 | 1 | 2 | 3
}

const linkStyles = css`
  @layer components {
    @scope (.ui-link) {
      :scope {
        display: inline;
        font-family: inherit;
        font-weight: 500;
        cursor: pointer;
        outline: none;
        border-radius: var(--radius-xs, 2px);
        text-decoration: none;
        text-underline-offset: 0.2em;
        transition:
          color 0.15s cubic-bezier(0.16, 1, 0.3, 1),
          text-decoration-color 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }

      /* Sizes */
      :scope[data-size="xs"] { font-size: 0.6875rem; }
      :scope[data-size="sm"] { font-size: 0.75rem; }
      :scope[data-size="md"] { font-size: 0.875rem; }
      :scope[data-size="lg"] { font-size: 1rem; }
      :scope[data-size="xl"] { font-size: 1.125rem; }

      /* Variants */
      :scope[data-variant="default"] {
        color: var(--brand, oklch(65% 0.2 270));
      }
      :scope[data-variant="default"]:hover {
        color: var(--brand-light, oklch(72% 0.2 270));
      }

      :scope[data-variant="subtle"] {
        color: var(--text-secondary, oklch(70% 0 0));
      }
      :scope[data-variant="subtle"]:hover {
        color: var(--text-primary);
      }

      :scope[data-variant="brand"] {
        color: var(--brand, oklch(65% 0.2 270));
      }
      :scope[data-variant="brand"]:hover {
        color: var(--brand-light, oklch(72% 0.2 270));
        text-shadow: 0 0 12px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.4);
      }

      /* Underline modes */
      :scope[data-underline="always"] {
        text-decoration: underline;
        text-decoration-color: currentColor;
      }
      :scope[data-underline="hover"] {
        text-decoration: none;
      }
      :scope[data-underline="hover"]:hover {
        text-decoration: underline;
      }
      :scope[data-underline="none"] {
        text-decoration: none;
      }
      :scope[data-underline="none"]:hover {
        text-decoration: none;
      }

      /* Slide-in underline for motion 2+ */
      :scope[data-underline="hover"]:not([data-motion="0"]):not([data-motion="1"]) {
        background-image: linear-gradient(currentColor, currentColor);
        background-size: 0% 1px;
        background-position: 0% 100%;
        background-repeat: no-repeat;
        transition:
          color 0.15s cubic-bezier(0.16, 1, 0.3, 1),
          background-size 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }
      :scope[data-underline="hover"]:not([data-motion="0"]):not([data-motion="1"]):hover {
        text-decoration: none;
        background-size: 100% 1px;
      }

      /* External link arrow */
      :scope[data-external="true"]::after {
        content: '\u2009\u2192';
        display: inline;
        font-size: 0.85em;
      }

      /* Focus visible */
      :scope:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
        box-shadow: 0 0 0 4px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15);
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        :scope {
          transition: none;
          background-image: none !important;
          background-size: unset !important;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        :scope {
          color: LinkText;
        }
        :scope:focus-visible {
          outline: 2px solid Highlight;
        }
      }

      /* Print */
      @media print {
        :scope {
          color: inherit;
          text-decoration: underline;
        }
        :scope[data-external="true"]::after {
          content: ' (' attr(href) ')';
          font-size: 0.8em;
        }
      }
    }
  }
`

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      variant = 'default',
      underline = 'hover',
      external = false,
      size = 'md',
      motion: motionProp,
      children,
      className,
      target,
      rel,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('link', linkStyles)
    const motionLevel = useMotionLevel(motionProp)

    const externalProps = external
      ? {
          target: target || '_blank',
          rel: rel || 'noopener noreferrer',
        }
      : { target, rel }

    return (
      <a
        ref={ref}
        className={cn(cls('root'), className)}
        data-variant={variant}
        data-underline={underline}
        data-size={size}
        data-motion={motionLevel}
        data-external={external || undefined}
        {...externalProps}
        {...rest}
      >
        {children}
      </a>
    )
  }
)
Link.displayName = 'Link'
