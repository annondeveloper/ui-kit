'use client'

import { forwardRef, useRef, useCallback, useEffect, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'
import { haptic, type HapticType } from '../core/input/haptics'

export interface ButtonShortcuts {
  /** Key combo to activate this button (default: Enter, Space handled natively) */
  activate?: string
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  icon?: ReactNode
  iconEnd?: ReactNode
  motion?: 0 | 1 | 2 | 3
  /** Enable haptic feedback on click. `true` uses 'light', or pass a specific pattern. */
  haptics?: boolean | HapticType
  /** Custom keyboard shortcuts for this button */
  shortcuts?: ButtonShortcuts
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
        outline: none;
        text-decoration: none;
        font-family: inherit;
        overflow: hidden;
        will-change: transform;
        -webkit-tap-highlight-color: transparent;
        /* Explicit transition — never 'all' to avoid corner artifacts */
        transition:
          background 0.15s cubic-bezier(0.16, 1, 0.3, 1),
          border-color 0.15s cubic-bezier(0.16, 1, 0.3, 1),
          box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1),
          transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
          color 0.15s cubic-bezier(0.16, 1, 0.3, 1),
          opacity 0.15s cubic-bezier(0.16, 1, 0.3, 1);
      }

      /* Sizes */
      :scope[data-size="xs"] {
        padding-block: 0.25rem;
        padding-inline: 0.5rem;
        font-size: var(--text-xs, 0.6875rem);
        border-radius: var(--radius-sm);
        min-block-size: 24px;
      }
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
      :scope[data-size="xl"] {
        padding-block: 0.75rem;
        padding-inline: 1.5rem;
        font-size: var(--text-lg, 1.125rem);
        min-block-size: 52px;
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
        inline-size: 1.125em;
        block-size: 1.125em;
        inset-block-start: 50%;
        inset-inline-start: 50%;
        translate: -50% -50%;
        border: 2px solid oklch(100% 0 0 / 0.3);
        border-block-start-color: oklch(100% 0 0 / 0.9);
        border-radius: 50%;
        animation: ui-button-spin 0.65s linear infinite;
      }
      /* Secondary/ghost spinner uses dark colors */
      :scope[data-variant="secondary"][data-loading="true"]::after,
      :scope[data-variant="ghost"][data-loading="true"]::after {
        border-color: oklch(50% 0 0 / 0.2);
        border-block-start-color: var(--text-primary, oklch(97% 0 0));
      }

      /* Active press — fast snap down, no overshoot */
      :scope:active:not(:disabled):not([data-motion="0"]) {
        transform: scale(0.97);
        transition: transform 0.06s ease-out;
      }

      /* Hover lift — smooth ease-out */
      @media (hover: hover) {
        :scope:hover:not(:disabled):not(:active):not([data-motion="0"]) {
          transform: translateY(-1px);
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
                      background 0.15s, border-color 0.15s,
                      box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
      }

      /* Return from hover/press — spring bounce back */
      :scope:not(:hover):not(:active):not([data-motion="0"]):not([data-motion="1"]) {
        transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                    background 0.15s, border-color 0.15s,
                    box-shadow 0.25s;
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
      haptics: hapticsProp,
      shortcuts,
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
    const internalRef = useRef<HTMLButtonElement>(null)

    // Merge refs
    const setRef = useCallback((el: HTMLButtonElement | null) => {
      internalRef.current = el
      if (typeof ref === 'function') ref(el)
      else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = el
    }, [ref])

    // Debounce rapid clicks (150ms) + haptic feedback
    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (loading || disabled) return
        const now = Date.now()
        if (now - lastClickRef.current < 150) return
        lastClickRef.current = now

        // Haptic feedback
        if (hapticsProp) {
          const pattern = hapticsProp === true ? 'light' : hapticsProp
          haptic(pattern)
        }

        onClick?.(e)
      },
      [onClick, loading, disabled, hapticsProp]
    )

    // Custom keyboard shortcuts
    useEffect(() => {
      if (!shortcuts?.activate) return

      const combo = shortcuts.activate.toLowerCase()
      const parts = combo.split('+').map(p => p.trim())
      const key = parts[parts.length - 1]
      const needsCtrl = parts.includes('ctrl') || parts.includes('control')
      const needsMeta = parts.includes('meta') || parts.includes('cmd')
      const needsShift = parts.includes('shift')
      const needsAlt = parts.includes('alt')

      const handler = (e: KeyboardEvent) => {
        if (e.key.toLowerCase() !== key) return
        if (needsCtrl && !e.ctrlKey) return
        if (needsMeta && !e.metaKey) return
        if (needsShift && !e.shiftKey) return
        if (needsAlt && !e.altKey) return

        e.preventDefault()
        internalRef.current?.click()
      }

      document.addEventListener('keydown', handler)
      return () => document.removeEventListener('keydown', handler)
    }, [shortcuts?.activate])

    return (
      <button
        ref={setRef}
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
        aria-keyshortcuts={shortcuts?.activate || undefined}
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
