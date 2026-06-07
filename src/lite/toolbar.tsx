import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const toolbarStyles = css`
  @layer components {
    @scope (.ui-lite-toolbar) {
      :scope {
        display: flex;
        align-items: center;
        padding-block: var(--space-sm, 0.75rem);
        margin-block-end: var(--space-md, 1rem);
      }
      :scope[data-gap="sm"] { gap: var(--space-sm, 0.5rem); }
      :scope[data-gap="md"] { gap: var(--space-md, 1rem); }
      :scope[data-gap="lg"] { gap: var(--space-lg, 1.5rem); }
      :scope[data-justify="start"] { justify-content: flex-start; }
      :scope[data-justify="end"] { justify-content: flex-end; }
      :scope[data-justify="between"] { justify-content: space-between; }
      :scope[data-justify="center"] { justify-content: center; }
      :scope[data-wrap="true"] { flex-wrap: wrap; }
      :scope[data-sticky="true"] {
        position: sticky;
        inset-block-start: 0;
        z-index: 10;
        background: var(--bg-surface, oklch(22% 0.02 270));
        padding-inline: var(--space-md, 1rem);
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.06));
      }
      @media (forced-colors: active) {
        :scope[data-sticky="true"] {
          background: Canvas;
          border-block-end-color: ButtonText;
        }
      }
    }
  }
`

export interface LiteToolbarProps extends HTMLAttributes<HTMLDivElement> {
  /** Toolbar content: search inputs, filter buttons, action buttons, etc. */
  children: ReactNode
  /** Gap between items (default: 'md') */
  gap?: 'sm' | 'md' | 'lg'
  /** Horizontal alignment (default: 'start') */
  justify?: 'start' | 'end' | 'between' | 'center'
  /** Allow items to wrap on narrow containers (default: false) */
  wrap?: boolean
  /** Stick to top of scroll container (default: false) */
  sticky?: boolean
}

export const Toolbar = forwardRef<HTMLDivElement, LiteToolbarProps>(
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
    useStyles('lite-toolbar', toolbarStyles)
    return (
      <div
        ref={ref}
        role="toolbar"
        className={`ui-lite-toolbar${className ? ` ${className}` : ''}`}
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
