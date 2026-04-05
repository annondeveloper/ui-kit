'use client'

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { cn } from '../core/utils/cn'

export interface PageShellProps extends HTMLAttributes<HTMLDivElement> {
  /** Maximum width of the content area */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  /** Internal padding scale */
  padding?: 'none' | 'sm' | 'md' | 'lg'
  children: ReactNode
}

const pageShellStyles = css`
  @layer components {
    @scope (.ui-page-shell) {
      :scope {
        inline-size: 100%;
        margin-inline: auto;
        display: flex;
        flex-direction: column;
        gap: var(--space-lg, 1.5rem);
      }

      /* Max widths */
      :scope[data-max-width="sm"] { max-inline-size: 40rem; }
      :scope[data-max-width="md"] { max-inline-size: 48rem; }
      :scope[data-max-width="lg"] { max-inline-size: 64rem; }
      :scope[data-max-width="xl"] { max-inline-size: 80rem; }
      :scope[data-max-width="full"] { max-inline-size: 100%; }

      /* Padding */
      :scope[data-padding="none"] { padding: 0; }
      :scope[data-padding="sm"] {
        padding-inline: clamp(0.5rem, 2vw, 1rem);
        padding-block: clamp(0.5rem, 2vh, 1rem);
      }
      :scope[data-padding="md"] {
        padding-inline: clamp(1rem, 4vw, 2rem);
        padding-block: clamp(1rem, 3vh, 1.5rem);
      }
      :scope[data-padding="lg"] {
        padding-inline: clamp(1.5rem, 6vw, 3rem);
        padding-block: clamp(1.5rem, 4vh, 2.5rem);
      }

      /* Print */
      @media print {
        :scope {
          max-inline-size: 100%;
          padding: 0;
        }
      }
    }
  }
`

/**
 * PageShell -- a container that wraps page content with consistent padding,
 * max-width, and vertical spacing between children.
 */
export const PageShell = forwardRef<HTMLDivElement, PageShellProps>(
  (
    {
      maxWidth = 'lg',
      padding = 'md',
      children,
      className,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('page-shell', pageShellStyles)

    return (
      <div
        ref={ref}
        className={cn(cls('root'), className)}
        data-max-width={maxWidth}
        data-padding={padding}
        {...rest}
      >
        {children}
      </div>
    )
  }
)
PageShell.displayName = 'PageShell'
