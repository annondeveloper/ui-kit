import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

export interface LiteListLayoutProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  gap?: 'sm' | 'md' | 'lg'
  dividers?: boolean
  padding?: 'none' | 'sm' | 'md'
}

const listLayoutStyles = css`
  @layer components {
    @scope (.ui-lite-list-layout) {
      :scope {
        display: flex;
        flex-direction: column;
        inline-size: 100%;
      }

      :scope[data-gap="sm"] { gap: var(--space-sm, 0.5rem); }
      :scope[data-gap="md"] { gap: var(--space-md, 1rem); }
      :scope[data-gap="lg"] { gap: var(--space-lg, 1.5rem); }

      :scope[data-padding="none"] { padding: 0; }
      :scope[data-padding="sm"] { padding: var(--space-sm, 0.5rem); }
      :scope[data-padding="md"] { padding: var(--space-md, 1rem); }

      :scope[data-dividers="true"] {
        gap: 0;
      }
      :scope[data-dividers="true"] > * + * {
        padding-block-start: var(--space-md, 1rem);
        border-block-start: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
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

      @media (forced-colors: active) {
        :scope[data-dividers="true"] > * + * {
          border-block-start-color: ButtonText;
        }
      }
    }
  }
`

export const ListLayout = forwardRef<HTMLDivElement, LiteListLayoutProps>(
  ({ gap = 'md', dividers = false, padding = 'none', children, className, ...rest }, ref) => {
    useStyles('lite-list-layout', listLayoutStyles)
    return (
    <div
      ref={ref}
      className={`ui-lite-list-layout${className ? ` ${className}` : ''}`}
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
