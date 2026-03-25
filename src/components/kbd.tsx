'use client'

import { forwardRef, type HTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  size?: 'xs' | 'sm' | 'md'
  variant?: 'default' | 'ghost'
  motion?: 0 | 1 | 2 | 3
}

const kbdStyles = css`
  @layer components {
    @scope (.ui-kbd) {
      :scope {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-family: var(--font-mono, ui-monospace, 'Cascadia Code', 'Fira Code', monospace);
        font-weight: 500;
        line-height: 1;
        white-space: nowrap;
        user-select: none;
        vertical-align: baseline;
        border-radius: var(--radius-sm, 4px);
        transition:
          transform 0.15s cubic-bezier(0.16, 1, 0.3, 1),
          box-shadow 0.15s cubic-bezier(0.16, 1, 0.3, 1);
      }

      /* Sizes */
      :scope[data-size="xs"] {
        font-size: 0.625rem;
        padding-block: 0.0625rem;
        padding-inline: 0.25rem;
        min-inline-size: 1.125rem;
        min-block-size: 1.125rem;
        border-radius: var(--radius-xs, 3px);
      }
      :scope[data-size="sm"] {
        font-size: 0.75rem;
        padding-block: 0.125rem;
        padding-inline: 0.3125rem;
        min-inline-size: 1.375rem;
        min-block-size: 1.375rem;
      }
      :scope[data-size="md"] {
        font-size: 0.875rem;
        padding-block: 0.1875rem;
        padding-inline: 0.375rem;
        min-inline-size: 1.625rem;
        min-block-size: 1.625rem;
      }

      /* Variants */
      :scope[data-variant="default"] {
        background: var(--surface-elevated, oklch(25% 0.01 270 / 0.5));
        color: var(--text-secondary, oklch(70% 0 0));
        border: 1px solid var(--border-default, oklch(50% 0 0 / 0.2));
        box-shadow:
          0 1px 0 0 oklch(0% 0 0 / 0.15),
          inset 0 1px 0 0 oklch(100% 0 0 / 0.04);
      }
      :scope[data-variant="ghost"] {
        background: transparent;
        color: var(--text-tertiary, oklch(60% 0 0));
        border: 1px solid transparent;
        box-shadow: none;
      }

      /* Hover lift — motion level 2+ */
      @media (hover: hover) {
        :scope:not([data-motion="0"]):not([data-motion="1"]):hover {
          transform: translateY(-1px);
          box-shadow:
            0 2px 2px 0 oklch(0% 0 0 / 0.12),
            inset 0 1px 0 0 oklch(100% 0 0 / 0.06);
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        :scope {
          transition: none;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        :scope {
          border: 1px solid ButtonText;
        }
      }

      /* Print */
      @media print {
        :scope {
          box-shadow: none;
          border: 1px solid;
        }
      }
    }
  }
`

export const Kbd = forwardRef<HTMLElement, KbdProps>(
  (
    {
      size = 'sm',
      variant = 'default',
      motion: motionProp,
      children,
      className,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('kbd', kbdStyles)
    const motionLevel = useMotionLevel(motionProp)

    return (
      <kbd
        ref={ref}
        className={cn(cls('root'), className)}
        data-size={size}
        data-variant={variant}
        data-motion={motionLevel}
        {...rest}
      >
        {children}
      </kbd>
    )
  }
)
Kbd.displayName = 'Kbd'
