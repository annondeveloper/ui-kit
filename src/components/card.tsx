'use client'

import { forwardRef, type HTMLAttributes, type ElementType } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  interactive?: boolean
  motion?: 0 | 1 | 2 | 3
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

      /* Interactive hover lift — motion level 1+ */
      @media (hover: hover) {
        :scope[data-interactive="true"]:hover:not([data-motion="0"]) {
          transform: translateY(-2px);
          transition: transform 0.2s var(--ease-out, ease-out),
                      box-shadow 0.2s var(--ease-out, ease-out);
        }
        :scope[data-interactive="true"][data-variant="elevated"]:hover:not([data-motion="0"]) {
          box-shadow: var(--shadow-lg, 0 8px 24px oklch(0% 0 0 / 0.25));
        }
        :scope[data-interactive="true"][data-variant="default"]:hover:not([data-motion="0"]) {
          border-color: var(--border-default, oklch(100% 0 0 / 0.12));
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
      children,
      className,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('card', cardStyles)
    const motionLevel = useMotionLevel(motionProp)

    return (
      <Component
        ref={ref}
        className={cn(cls('root'), className)}
        data-variant={variant}
        data-padding={padding}
        data-motion={motionLevel}
        data-interactive={interactive || undefined}
        {...rest}
      >
        {children}
      </Component>
    )
  }
)
Card.displayName = 'Card'
