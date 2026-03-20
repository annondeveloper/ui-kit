'use client'

import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical'
  variant?: 'solid' | 'dashed' | 'dotted'
  label?: ReactNode
  spacing?: 'sm' | 'md' | 'lg'
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const dividerStyles = css`
  @layer components {
    @scope (.ui-divider) {
      :scope {
        margin: 0;
        padding: 0;
        border: none;
        flex-shrink: 0;
      }

      /* Horizontal */
      :scope[data-orientation="horizontal"] {
        inline-size: 100%;
        block-size: 1px;
        background: var(--border-subtle, oklch(100% 0 0 / 0.08));
      }

      /* Vertical */
      :scope[data-orientation="vertical"] {
        inline-size: 1px;
        block-size: 100%;
        min-block-size: 1rem;
        background: var(--border-subtle, oklch(100% 0 0 / 0.08));
        display: inline-block;
      }

      /* Variants */
      :scope[data-variant="dashed"] {
        background: none;
        border-block-start: 1px dashed var(--border-subtle, oklch(100% 0 0 / 0.08));
      }
      :scope[data-variant="dotted"] {
        background: none;
        border-block-start: 1px dotted var(--border-subtle, oklch(100% 0 0 / 0.08));
      }
      :scope[data-orientation="vertical"][data-variant="dashed"] {
        border-block-start: none;
        border-inline-start: 1px dashed var(--border-subtle, oklch(100% 0 0 / 0.08));
        background: none;
      }
      :scope[data-orientation="vertical"][data-variant="dotted"] {
        border-block-start: none;
        border-inline-start: 1px dotted var(--border-subtle, oklch(100% 0 0 / 0.08));
        background: none;
      }

      /* Spacing */
      :scope[data-orientation="horizontal"][data-spacing="sm"] {
        margin-block: var(--space-xs, 0.25rem);
      }
      :scope[data-orientation="horizontal"][data-spacing="md"] {
        margin-block: var(--space-md, 0.75rem);
      }
      :scope[data-orientation="horizontal"][data-spacing="lg"] {
        margin-block: var(--space-lg, 1.25rem);
      }
      :scope[data-orientation="vertical"][data-spacing="sm"] {
        margin-inline: var(--space-xs, 0.25rem);
      }
      :scope[data-orientation="vertical"][data-spacing="md"] {
        margin-inline: var(--space-md, 0.75rem);
      }
      :scope[data-orientation="vertical"][data-spacing="lg"] {
        margin-inline: var(--space-lg, 1.25rem);
      }

      /* Label variant — uses div, not hr */
      :scope[data-has-label="true"] {
        display: flex;
        align-items: center;
        gap: var(--space-md, 0.75rem);
        block-size: auto;
        background: none;
      }

      :scope[data-has-label="true"]::before,
      :scope[data-has-label="true"]::after {
        content: '';
        flex: 1;
        block-size: 1px;
        background: var(--border-subtle, oklch(100% 0 0 / 0.08));
      }

      .ui-divider__label {
        font-size: var(--text-xs, 0.75rem);
        line-height: 1;
        color: var(--text-secondary, oklch(70% 0 0));
        white-space: nowrap;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 500;
      }

      /* Forced colors */
      @media (forced-colors: active) {
        :scope {
          background: ButtonText;
        }
        :scope[data-variant="dashed"],
        :scope[data-variant="dotted"] {
          border-color: ButtonText;
        }
        :scope[data-has-label="true"]::before,
        :scope[data-has-label="true"]::after {
          background: ButtonText;
        }
        .ui-divider__label {
          color: CanvasText;
        }
      }

      /* Print */
      @media print {
        :scope {
          background: #000;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export const Divider = forwardRef<HTMLHRElement, DividerProps>(
  function Divider(
    {
      orientation = 'horizontal',
      variant = 'solid',
      label,
      spacing = 'md',
      className,
      ...rest
    },
    ref
  ) {
    useStyles('divider', dividerStyles)

    const hasLabel = label != null
    const isVertical = orientation === 'vertical'

    // With a label, render a div. Otherwise, an hr.
    if (hasLabel) {
      return (
        <div
          ref={ref as React.Ref<HTMLDivElement>}
          role="separator"
          className={cn('ui-divider', className)}
          data-orientation={orientation}
          data-variant={variant}
          data-spacing={spacing}
          data-has-label="true"
          aria-orientation={isVertical ? 'vertical' : undefined}
          {...(rest as HTMLAttributes<HTMLDivElement>)}
        >
          <span className="ui-divider__label">{label}</span>
        </div>
      )
    }

    return (
      <hr
        ref={ref}
        role="separator"
        className={cn('ui-divider', className)}
        data-orientation={orientation}
        data-variant={variant}
        data-spacing={spacing}
        aria-orientation={isVertical ? 'vertical' : undefined}
        {...rest}
      />
    )
  }
)

Divider.displayName = 'Divider'
