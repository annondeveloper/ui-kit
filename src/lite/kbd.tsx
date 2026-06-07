import { forwardRef, type HTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

export interface LiteKbdProps extends HTMLAttributes<HTMLElement> {
  size?: 'xs' | 'sm' | 'md'
  variant?: 'default' | 'ghost'
}

const kbdStyles = css`
  @layer components {
    @scope (.ui-lite-kbd) {
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
      }

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

      :scope[data-variant="default"] {
        background: var(--surface-elevated, oklch(25% 0.01 270 / 0.5));
        color: var(--text-secondary, oklch(70% 0 0));
        border: 1px solid var(--border-default, oklch(50% 0 0 / 0.2));
        box-shadow:
          0 1px 0 0 oklch(0% 0 0 / 0.15),
          inset 0 1px 0 0 var(--border-subtle, oklch(100% 0 0 / 0.04));
      }
      :scope[data-variant="ghost"] {
        background: transparent;
        color: var(--text-tertiary, oklch(60% 0 0));
        border: 1px solid transparent;
        box-shadow: none;
      }

      @media (forced-colors: active) {
        :scope {
          border: 1px solid ButtonText;
        }
      }

      @media print {
        :scope {
          box-shadow: none;
          border: 1px solid;
        }
      }
    }
  }
`

export const Kbd = forwardRef<HTMLElement, LiteKbdProps>(
  ({ size = 'sm', variant = 'default', className, ...rest }, ref) => {
    useStyles('lite-kbd', kbdStyles)
    return (
    <kbd
      ref={ref}
      className={`ui-lite-kbd${className ? ` ${className}` : ''}`}
      data-size={size}
      data-variant={variant}
      {...rest}
    />
  )
  }
)
Kbd.displayName = 'Kbd'
