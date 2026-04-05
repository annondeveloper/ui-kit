'use client'

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { cn } from '../core/utils/cn'

export interface ListLayoutProps extends HTMLAttributes<HTMLDivElement> {
  /** List children */
  children: ReactNode
  /** Gap between items (default: 'md') */
  gap?: 'sm' | 'md' | 'lg'
  /** Show dividers between items (default: false) */
  dividers?: boolean
  /** Internal padding (default: 'none') */
  padding?: 'none' | 'sm' | 'md'
}

const listLayoutStyles = css`
  @layer components {
    @scope (.ui-list-layout) {
      :scope {
        display: flex;
        flex-direction: column;
        inline-size: 100%;
      }

      /* Gap sizes */
      :scope[data-gap="sm"] { gap: var(--space-sm, 0.5rem); }
      :scope[data-gap="md"] { gap: var(--space-md, 1rem); }
      :scope[data-gap="lg"] { gap: var(--space-lg, 1.5rem); }

      /* Padding */
      :scope[data-padding="none"] { padding: 0; }
      :scope[data-padding="sm"] { padding: var(--space-sm, 0.5rem); }
      :scope[data-padding="md"] { padding: var(--space-md, 1rem); }

      /* Dividers — border-top on all siblings after the first child */
      :scope[data-dividers="true"] > * + * {
        padding-block-start: var(--list-layout-gap, var(--space-md, 1rem));
        border-block-start: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
      }

      /* When dividers are on, remove gap and let padding handle spacing */
      :scope[data-dividers="true"] {
        gap: 0;
      }

      :scope[data-dividers="true"][data-gap="sm"] > * + * {
        padding-block-start: var(--space-sm, 0.5rem);
      }
      :scope[data-dividers="true"][data-gap="md"] > * + * {
        padding-block-start: var(--space-md, 1rem);
      }
      :scope[data-dividers="true"][data-gap="lg"] > * + * {
        padding-block-start: var(--space-lg, 1.5rem);
      }

      /* Forced colors */
      @media (forced-colors: active) {
        :scope[data-dividers="true"] > * + * {
          border-block-start-color: ButtonText;
        }
      }

      /* Print */
      @media print {
        :scope {
          gap: 0.5rem;
        }
        :scope[data-dividers="true"] > * + * {
          border-block-start-color: GrayText;
        }
      }
    }
  }
`

/**
 * ListLayout — vertical list with consistent spacing and optional dividers.
 */
export const ListLayout = forwardRef<HTMLDivElement, ListLayoutProps>(
  ({ gap = 'md', dividers = false, padding = 'none', children, className, ...rest }, ref) => {
    const cls = useStyles('list-layout', listLayoutStyles)

    return (
      <div
        ref={ref}
        className={cn(cls('root'), className)}
        data-gap={gap}
        data-dividers={dividers || undefined}
        data-padding={padding}
        {...rest}
      >
        {children}
      </div>
    )
  }
)
ListLayout.displayName = 'ListLayout'
