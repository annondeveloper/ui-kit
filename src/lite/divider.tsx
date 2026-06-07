import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const dividerStyles = css`
  @layer components {
    @scope (.ui-lite-divider) {
      :scope {
        margin: 0;
        padding: 0;
        border: none;
        flex-shrink: 0;
      }
      :scope[data-orientation="horizontal"] {
        inline-size: 100%;
        block-size: 1px;
        background: var(--border-subtle, oklch(100% 0 0 / 0.08));
      }
      :scope[data-orientation="vertical"] {
        display: inline-block;
        inline-size: 1px;
        block-size: 100%;
        min-block-size: 1rem;
        background: var(--border-subtle, oklch(100% 0 0 / 0.08));
      }
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
      :scope[data-orientation="horizontal"][data-spacing="sm"] { margin-block: var(--space-xs, 0.25rem); }
      :scope[data-orientation="horizontal"][data-spacing="md"] { margin-block: var(--space-md, 0.75rem); }
      :scope[data-orientation="horizontal"][data-spacing="lg"] { margin-block: var(--space-lg, 1.25rem); }
      :scope[data-orientation="vertical"][data-spacing="sm"] { margin-inline: var(--space-xs, 0.25rem); }
      :scope[data-orientation="vertical"][data-spacing="md"] { margin-inline: var(--space-md, 0.75rem); }
      :scope[data-orientation="vertical"][data-spacing="lg"] { margin-inline: var(--space-lg, 1.25rem); }
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
      .ui-lite-divider__label {
        font-size: var(--text-xs, 0.75rem);
        line-height: 1;
        color: var(--text-secondary, oklch(70% 0 0));
        white-space: nowrap;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 500;
      }
      @media (forced-colors: active) {
        :scope { background: ButtonText; }
        :scope[data-variant="dashed"],
        :scope[data-variant="dotted"] { border-color: ButtonText; }
        :scope[data-has-label="true"]::before,
        :scope[data-has-label="true"]::after { background: ButtonText; }
      }
    }
  }
`

export interface LiteDividerProps extends HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical'
  variant?: 'solid' | 'dashed' | 'dotted'
  label?: ReactNode
  spacing?: 'sm' | 'md' | 'lg'
}

export const Divider = forwardRef<HTMLHRElement, LiteDividerProps>(
  ({ orientation = 'horizontal', variant = 'solid', label, spacing = 'md', className, ...rest }, ref) => {
    useStyles('lite-divider', dividerStyles)
    const hasLabel = label != null
    const isVertical = orientation === 'vertical'

    if (hasLabel) {
      return (
        <div
          ref={ref as React.Ref<HTMLDivElement>}
          role="separator"
          className={`ui-lite-divider${className ? ` ${className}` : ''}`}
          data-orientation={orientation}
          data-variant={variant}
          data-spacing={spacing}
          data-has-label="true"
          aria-orientation={isVertical ? 'vertical' : undefined}
          {...(rest as HTMLAttributes<HTMLDivElement>)}
        >
          <span className="ui-lite-divider__label">{label}</span>
        </div>
      )
    }

    return (
      <hr
        ref={ref}
        role="separator"
        className={`ui-lite-divider${className ? ` ${className}` : ''}`}
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
