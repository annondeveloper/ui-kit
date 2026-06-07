import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const buttonStyles = css`
  @layer components {
    @scope (.ui-lite-button) {
      :scope {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.375rem;
        border: 1px solid transparent;
        border-radius: var(--radius-md, 10px);
        font-weight: 600;
        font-family: inherit;
        font-size: var(--text-sm, 0.875rem);
        cursor: pointer;
        line-height: 1;
        text-decoration: none;
        white-space: nowrap;
        user-select: none;
        outline: none;
        -webkit-tap-highlight-color: transparent;
      }

      /* Sizes */
      :scope[data-size="xs"] { padding-block: 0.25rem; padding-inline: 0.5rem; font-size: 0.6875rem; min-block-size: 24px; border-radius: var(--radius-sm, 6px); }
      :scope[data-size="sm"] { padding-block: 0.375rem; padding-inline: 0.75rem; font-size: 0.75rem; min-block-size: 32px; border-radius: var(--radius-sm, 6px); }
      :scope[data-size="md"] { padding-block: 0.5rem; padding-inline: 1rem; font-size: 0.875rem; min-block-size: 36px; }
      :scope[data-size="lg"] { padding-block: 0.625rem; padding-inline: 1.25rem; font-size: 1rem; min-block-size: 44px; }
      :scope[data-size="xl"] { padding-block: 0.75rem; padding-inline: 1.5rem; font-size: 1.125rem; min-block-size: 52px; }

      /* Variants */
      :scope[data-variant="primary"] {
        background: var(--brand, oklch(65% 0.2 270));
        color: oklch(100% 0 0);
        box-shadow: 0 1px 2px oklch(0% 0 0 / 0.3), 0 0 1px oklch(0% 0 0 / 0.15);
      }
      :scope[data-variant="primary"]:hover:not(:disabled) {
        background: var(--brand-light, oklch(75% 0.18 270));
      }
      :scope[data-variant="secondary"] {
        background: oklch(100% 0 0 / 0.06);
        color: var(--text-primary, oklch(97% 0 0));
        border-color: var(--border-default, oklch(100% 0 0 / 0.08));
      }
      :scope[data-variant="secondary"]:hover:not(:disabled) {
        background: oklch(100% 0 0 / 0.1);
        border-color: var(--border-strong, oklch(100% 0 0 / 0.14));
      }
      :scope[data-variant="ghost"] {
        background: transparent;
        color: var(--text-secondary, oklch(70% 0 0));
      }
      :scope[data-variant="ghost"]:hover:not(:disabled) {
        background: oklch(100% 0 0 / 0.06);
        color: var(--text-primary, oklch(97% 0 0));
      }
      :scope[data-variant="danger"] {
        background: var(--status-critical, oklch(62% 0.22 25));
        color: oklch(100% 0 0);
        box-shadow: 0 1px 2px oklch(0% 0 0 / 0.3);
      }
      :scope[data-variant="danger"]:hover:not(:disabled) {
        filter: brightness(1.1);
      }
      :scope[data-variant="link"] {
        background: transparent;
        color: var(--brand, oklch(65% 0.2 270));
        padding-inline: 0;
        padding-block: 0;
        min-block-size: auto;
        border-radius: 0;
        font-weight: 500;
        text-decoration: underline;
        text-underline-offset: 0.15em;
        box-shadow: none;
      }
      :scope[data-variant="link"]:hover:not(:disabled) {
        color: var(--brand-light, oklch(75% 0.18 270));
      }

      /* Disabled */
      :scope:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      /* Focus */
      :scope:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      /* Loading */
      :scope[data-loading] {
        pointer-events: none;
      }

      /* Full width */
      :scope[data-full-width] {
        inline-size: 100%;
      }

      /* Icon-only — compact square */
      :scope[data-icon-only] {
        padding-inline: 0;
        aspect-ratio: 1;
      }
      :scope[data-icon-only][data-size="xs"] { inline-size: 24px; padding: 0; }
      :scope[data-icon-only][data-size="sm"] { inline-size: 32px; padding: 0; }
      :scope[data-icon-only][data-size="md"] { inline-size: 36px; padding: 0; }
      :scope[data-icon-only][data-size="lg"] { inline-size: 44px; padding: 0; }
      :scope[data-icon-only][data-size="xl"] { inline-size: 52px; padding: 0; }

      /* Icon parts */
      .ui-lite-button__icon,
      .ui-lite-button__icon-end {
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
      }
      :scope svg {
        inline-size: 1em;
        block-size: 1em;
        flex-shrink: 0;
      }

      /* Touch targets */
      @media (pointer: coarse) {
        :scope { min-block-size: 44px; min-inline-size: 44px; }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        :scope { border: 2px solid ButtonText; }
        :scope:focus-visible { outline: 2px solid Highlight; }
      }

      /* Print */
      @media print {
        :scope { box-shadow: none; border: 1px solid; }
      }
    }
  }
`

export interface ButtonShortcuts {
  activate?: string
}

export interface LiteButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'link'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  loadingText?: string
  icon?: ReactNode
  iconEnd?: ReactNode
  fullWidth?: boolean
  iconOnly?: boolean
  /** Accepted for API parity but ignored in Lite */
  haptics?: boolean | string
  /** Accepted for API parity but ignored in Lite */
  shortcuts?: ButtonShortcuts
  /** Accepted for API parity but ignored in Lite */
  classNames?: Partial<Record<'root' | 'icon' | 'iconEnd', string>>
}

export const Button = forwardRef<HTMLButtonElement, LiteButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      loadingText,
      icon,
      iconEnd,
      fullWidth,
      iconOnly,
      haptics: _haptics,
      shortcuts: _shortcuts,
      classNames: _classNames,
      disabled,
      children,
      className,
      ...rest
    },
    ref
  ) => {
    useStyles('lite-button', buttonStyles)
    return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`ui-lite-button${className ? ` ${className}` : ''}`}
      data-variant={variant}
      data-size={size}
      data-loading={loading || undefined}
      data-full-width={fullWidth || undefined}
      data-icon-only={iconOnly || undefined}
      aria-busy={loading || undefined}
      {...rest}
    >
      {icon && <span className="ui-lite-button__icon">{icon}</span>}
      {loading && loadingText ? loadingText : children}
      {iconEnd && <span className="ui-lite-button__icon-end">{iconEnd}</span>}
    </button>
    )
  }
)
Button.displayName = 'Button'
