'use client'

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { cn } from '../core/utils/cn'

export interface ToolbarProps extends HTMLAttributes<HTMLDivElement> {
  /** Toolbar content: search inputs, filter buttons, action buttons, etc. */
  children: ReactNode
  /** Gap between items (default: 'md') */
  gap?: 'sm' | 'md' | 'lg'
  /** Horizontal alignment (default: 'start') */
  justify?: 'start' | 'end' | 'between' | 'center'
  /** Allow items to wrap on narrow containers (default: false) */
  wrap?: boolean
  /** Stick to top of scroll container with backdrop blur (default: false) */
  sticky?: boolean
}

const toolbarStyles = css`
  @layer components {
    @scope (.ui-toolbar) {
      :scope {
        display: flex;
        align-items: center;
        padding-block: var(--space-sm, 0.75rem);
        margin-block-end: var(--space-md, 1rem);
      }

      /* Gap variants */
      :scope[data-gap="sm"] { gap: var(--space-sm, 0.5rem); }
      :scope[data-gap="md"] { gap: var(--space-md, 1rem); }
      :scope[data-gap="lg"] { gap: var(--space-lg, 1.5rem); }

      /* Justify variants */
      :scope[data-justify="start"] { justify-content: flex-start; }
      :scope[data-justify="end"] { justify-content: flex-end; }
      :scope[data-justify="between"] { justify-content: space-between; }
      :scope[data-justify="center"] { justify-content: center; }

      /* Wrap */
      :scope[data-wrap="true"] {
        flex-wrap: wrap;
      }

      /* Sticky */
      :scope[data-sticky="true"] {
        position: sticky;
        inset-block-start: 0;
        z-index: 10;
        background: oklch(from var(--bg-surface, oklch(22% 0.02 270)) l c h / 0.85);
        backdrop-filter: blur(12px) saturate(1.5);
        padding-inline: var(--space-md, 1rem);
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.06));
      }

      /* Mobile: always wrap */
      @container (max-width: 480px) {
        :scope {
          flex-wrap: wrap;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        :scope[data-sticky="true"] {
          background: Canvas;
          border-block-end-color: ButtonText;
        }
      }

      /* Reduced motion — disable backdrop blur */
      @media (prefers-reduced-motion: reduce) {
        :scope[data-sticky="true"] {
          backdrop-filter: none;
          background: var(--bg-surface, oklch(22% 0.02 270));
        }
      }

      /* Print */
      @media print {
        :scope[data-sticky="true"] {
          position: static;
          backdrop-filter: none;
          background: transparent;
          border-block-end: none;
        }
      }
    }
  }
`

/**
 * Toolbar — horizontal bar for search inputs, filters, and action buttons.
 * Supports sticky mode with backdrop blur, configurable gap, alignment, and wrapping.
 */
export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(
  (
    {
      children,
      gap = 'md',
      justify = 'start',
      wrap = false,
      sticky = false,
      className,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('toolbar', toolbarStyles)

    return (
      <div
        ref={ref}
        role="toolbar"
        className={cn(cls('root'), className)}
        data-gap={gap}
        data-justify={justify}
        data-wrap={wrap || undefined}
        data-sticky={sticky || undefined}
        {...rest}
      >
        {children}
      </div>
    )
  }
)
Toolbar.displayName = 'Toolbar'
