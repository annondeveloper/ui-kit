import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const badgeStyles = css`
  @layer components {
    @scope (.ui-lite-badge) {
      :scope {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
        font-family: inherit;
        font-weight: 500;
        border: 1px solid transparent;
        border-radius: 9999px;
        line-height: 1;
        white-space: nowrap;
        user-select: none;
        vertical-align: middle;
      }

      /* Sizes */
      :scope[data-size="xs"] { padding: 0.0625rem 0.375rem; font-size: 0.625rem; }
      :scope[data-size="sm"] { padding: 0.125rem 0.5rem; font-size: 0.6875rem; }
      :scope[data-size="md"] { padding: 0.25rem 0.625rem; font-size: 0.75rem; }
      :scope[data-size="lg"] { padding: 0.375rem 0.75rem; font-size: 1rem; }
      :scope[data-size="xl"] { padding: 0.5rem 0.875rem; font-size: 1.125rem; }

      /* Variants */
      :scope[data-variant="default"] { background: oklch(100% 0 0 / 0.08); color: var(--text-secondary, oklch(70% 0 0)); border-color: oklch(70% 0 0 / 0.15); }
      :scope[data-variant="primary"] { background: oklch(65% 0.2 270 / 0.12); color: oklch(70% 0.18 270); border-color: oklch(65% 0.2 270 / 0.2); }
      :scope[data-variant="success"] { background: oklch(72% 0.19 145 / 0.12); color: oklch(72% 0.19 145); border-color: oklch(72% 0.19 145 / 0.2); }
      :scope[data-variant="warning"] { background: oklch(78% 0.17 85 / 0.12); color: oklch(78% 0.17 85); border-color: oklch(78% 0.17 85 / 0.2); }
      :scope[data-variant="danger"] { background: oklch(62% 0.22 25 / 0.12); color: oklch(62% 0.22 25); border-color: oklch(62% 0.22 25 / 0.2); }
      :scope[data-variant="info"] { background: oklch(70% 0.17 250 / 0.12); color: oklch(70% 0.17 250); border-color: oklch(70% 0.17 250 / 0.2); }

      /* Outline mode */
      :scope[data-outline] { background: transparent; }

      /* Dot indicator */
      .ui-lite-badge__dot {
        display: inline-block;
        inline-size: 0.5em;
        block-size: 0.5em;
        border-radius: 9999px;
        background: currentColor;
        flex-shrink: 0;
      }

      /* Icon wrapper */
      .ui-lite-badge__icon {
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
      }
      .ui-lite-badge__icon svg {
        inline-size: 1em;
        block-size: 1em;
      }

      /* Remove button */
      .ui-lite-badge__remove {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: 1em;
        block-size: 1em;
        padding: 0;
        margin-inline-start: 0.125em;
        border: none;
        background: none;
        color: currentColor;
        cursor: pointer;
        border-radius: 9999px;
        opacity: 0.6;
      }
      .ui-lite-badge__remove:hover {
        opacity: 1;
      }
      .ui-lite-badge__remove:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: 1px;
      }

      /* Forced colors */
      @media (forced-colors: active) {
        :scope { border: 1px solid ButtonText; }
      }
      @media print {
        :scope { border: 1px solid; }
      }
    }
  }
`

export interface LiteBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  dot?: boolean
  pulse?: boolean
  count?: number
  maxCount?: number
  icon?: ReactNode
  removable?: boolean
  onRemove?: () => void
  outline?: boolean
}

export const Badge = forwardRef<HTMLSpanElement, LiteBadgeProps>(
  (
    {
      variant = 'default',
      size = 'md',
      dot = false,
      pulse = false,
      count,
      maxCount = 99,
      icon,
      removable = false,
      onRemove,
      outline = false,
      children,
      className,
      ...rest
    },
    ref
  ) => {
    useStyles('lite-badge', badgeStyles)
    const displayCount =
      count !== undefined
        ? count > maxCount
          ? `${maxCount}+`
          : String(count)
        : null

    return (
      <span
        ref={ref}
        className={`ui-lite-badge${className ? ` ${className}` : ''}`}
        data-variant={variant}
        data-size={size}
        data-outline={outline || undefined}
        data-pulse={pulse || undefined}
        {...rest}
      >
        {icon && <span className="ui-lite-badge__icon">{icon}</span>}
        {dot && <span className="ui-lite-badge__dot" />}
        {displayCount ?? children}
        {removable && (
          <button
            type="button"
            className="ui-lite-badge__remove"
            onClick={onRemove}
            aria-label="Remove"
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path
                d="M1.5 1.5l5 5m0-5l-5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </span>
    )
  }
)
Badge.displayName = 'Badge'
