'use client'

import { forwardRef, useRef, useCallback, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: ReactNode
  iconEnd?: ReactNode
  motion?: 0 | 1 | 2 | 3
}

const buttonStyles = css`
  @layer components {
    @scope (.ui-button) {
      :scope {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-xs);
        border: 1px solid transparent;
        border-radius: var(--radius-md);
        font-weight: 600;
        font-size: var(--text-sm);
        line-height: 1;
        cursor: pointer;
        user-select: none;
        white-space: nowrap;
        transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        outline: none;
        text-decoration: none;
        font-family: inherit;
      }

      /* Sizes */
      :scope[data-size="sm"] {
        padding-block: 0.375rem;
        padding-inline: 0.75rem;
        font-size: var(--text-xs);
        border-radius: var(--radius-sm);
        min-block-size: 32px;
      }
      :scope[data-size="md"] {
        padding-block: 0.5rem;
        padding-inline: 1rem;
        font-size: var(--text-sm);
        min-block-size: 36px;
      }
      :scope[data-size="lg"] {
        padding-block: 0.625rem;
        padding-inline: 1.25rem;
        font-size: var(--text-base);
        min-block-size: 44px;
      }

      /* Variants */
      :scope[data-variant="primary"] {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: transparent;
        box-shadow: var(--shadow-sm);
      }
      :scope[data-variant="primary"]:hover:not(:disabled) {
        background: var(--brand-light);
        box-shadow: var(--shadow-md);
      }

      :scope[data-variant="secondary"] {
        background: oklch(100% 0 0 / 0.06);
        color: var(--text-primary);
        border-color: var(--border-default);
      }
      :scope[data-variant="secondary"]:hover:not(:disabled) {
        background: oklch(100% 0 0 / 0.1);
        border-color: var(--border-strong);
      }

      :scope[data-variant="ghost"] {
        background: transparent;
        color: var(--text-secondary);
        border-color: transparent;
      }
      :scope[data-variant="ghost"]:hover:not(:disabled) {
        background: oklch(100% 0 0 / 0.06);
        color: var(--text-primary);
      }

      :scope[data-variant="danger"] {
        background: var(--status-critical);
        color: oklch(100% 0 0);
        border-color: transparent;
      }
      :scope[data-variant="danger"]:hover:not(:disabled) {
        background: oklch(from var(--status-critical) calc(l + 0.05) c h);
      }

      /* Focus visible */
      :scope:focus-visible {
        outline: 2px solid var(--brand);
        outline-offset: 2px;
        box-shadow: var(--shadow-glow);
      }

      /* Disabled */
      :scope:disabled,
      :scope[aria-disabled="true"] {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      /* Loading */
      :scope[data-loading="true"] {
        color: transparent;
        pointer-events: none;
      }
      :scope[data-loading="true"]::after {
        content: '';
        position: absolute;
        inline-size: 1em;
        block-size: 1em;
        inset-block-start: 50%;
        inset-inline-start: 50%;
        translate: -50% -50%;
        border: 2px solid currentColor;
        border-inline-start-color: transparent;
        border-radius: var(--radius-full);
        opacity: 0.8;
        animation: ui-button-spin 0.6s linear infinite;
      }

      /* Active press — motion level 1+ */
      :scope:active:not(:disabled):not([data-motion="0"]) {
        transform: scale(0.97);
        transition-duration: 0.05s;
      }

      /* Hover lift — motion level 1+ */
      @media (hover: hover) {
        :scope:hover:not(:disabled):not(:active):not([data-motion="0"]) {
          transform: translateY(-1px);
        }
      }

      /* Touch targets */
      @media (pointer: coarse) {
        :scope {
          min-block-size: 44px;
          min-inline-size: 44px;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        :scope {
          border: 2px solid ButtonText;
        }
        :scope:focus-visible {
          outline: 2px solid Highlight;
        }
      }

      /* Print */
      @media print {
        :scope {
          box-shadow: none;
          border: 1px solid;
        }
      }

      /* Reduced data */
      @media (prefers-reduced-data: reduce) {
        :scope {
          box-shadow: none;
        }
      }

      /* Icon sizing within button */
      :scope svg {
        inline-size: 1em;
        block-size: 1em;
        flex-shrink: 0;
      }
    }

    @keyframes ui-button-spin {
      to { transform: rotate(360deg); }
    }
  }
`

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconEnd,
      motion: motionProp,
      disabled,
      children,
      className,
      onClick,
      type = 'button',
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('button', buttonStyles)
    const motionLevel = useMotionLevel(motionProp)
    const lastClickRef = useRef(0)

    // Debounce rapid clicks (150ms)
    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (loading || disabled) return
        const now = Date.now()
        if (now - lastClickRef.current < 150) return
        lastClickRef.current = now
        onClick?.(e)
      },
      [onClick, loading, disabled]
    )

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(cls('root'), className)}
        data-variant={variant}
        data-size={size}
        data-loading={loading}
        data-motion={motionLevel}
        onClick={handleClick}
        aria-busy={loading || undefined}
        aria-disabled={disabled || undefined}
        {...rest}
      >
        {icon && <span className="ui-button__icon">{icon}</span>}
        {children}
        {iconEnd && <span className="ui-button__icon-end">{iconEnd}</span>}
      </button>
    )
  }
)
Button.displayName = 'Button'
