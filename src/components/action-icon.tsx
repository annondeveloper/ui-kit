'use client'

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

export interface ActionIconProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'light' | 'outline' | 'subtle' | 'transparent'
  color?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  radius?: 'sm' | 'md' | 'lg' | 'full'
  loading?: boolean
  disabled?: boolean
  'aria-label': string
  children: ReactNode
  motion?: 0 | 1 | 2 | 3
}

const actionIconStyles = css`
  @layer components {
    @scope (.ui-action-icon) {
      :scope {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid transparent;
        cursor: pointer;
        user-select: none;
        outline: none;
        font-family: inherit;
        padding: 0;
        aspect-ratio: 1;
        overflow: hidden;
        -webkit-tap-highlight-color: transparent;
        transition:
          background 0.15s cubic-bezier(0.16, 1, 0.3, 1),
          border-color 0.15s cubic-bezier(0.16, 1, 0.3, 1),
          box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1),
          transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
          color 0.15s cubic-bezier(0.16, 1, 0.3, 1),
          opacity 0.15s cubic-bezier(0.16, 1, 0.3, 1);
      }

      /* ─── Sizes ────────────────────────────────────────── */
      :scope[data-size="xs"] {
        inline-size: 24px;
        block-size: 24px;
        font-size: 0.75rem;
      }
      :scope[data-size="sm"] {
        inline-size: 32px;
        block-size: 32px;
        font-size: 0.875rem;
      }
      :scope[data-size="md"] {
        inline-size: 36px;
        block-size: 36px;
        font-size: 1rem;
      }
      :scope[data-size="lg"] {
        inline-size: 44px;
        block-size: 44px;
        font-size: 1.125rem;
      }
      :scope[data-size="xl"] {
        inline-size: 52px;
        block-size: 52px;
        font-size: 1.25rem;
      }

      /* ─── Radius ───────────────────────────────────────── */
      :scope[data-radius="sm"] { border-radius: var(--radius-sm, 0.25rem); }
      :scope[data-radius="md"] { border-radius: var(--radius-md, 0.375rem); }
      :scope[data-radius="lg"] { border-radius: var(--radius-lg, 0.5rem); }
      :scope[data-radius="full"] { border-radius: var(--radius-full, 9999px); }

      /* ─── Variant: filled ──────────────────────────────── */
      :scope[data-variant="filled"][data-color="default"] {
        background: var(--bg-elevated, oklch(25% 0 0));
        color: var(--text-primary, oklch(90% 0 0));
        border-color: var(--border-default, oklch(100% 0 0 / 0.12));
      }
      :scope[data-variant="filled"][data-color="primary"] {
        background: var(--brand, oklch(65% 0.2 270));
        color: var(--text-on-brand, oklch(100% 0 0));
      }
      :scope[data-variant="filled"][data-color="success"] {
        background: var(--status-ok, oklch(72% 0.19 155));
        color: oklch(20% 0 0);
      }
      :scope[data-variant="filled"][data-color="warning"] {
        background: var(--status-warning, oklch(80% 0.18 85));
        color: oklch(20% 0 0);
      }
      :scope[data-variant="filled"][data-color="danger"] {
        background: var(--status-critical, oklch(65% 0.25 25));
        color: oklch(100% 0 0);
      }

      /* ─── Variant: light ───────────────────────────────── */
      :scope[data-variant="light"][data-color="default"] {
        background: oklch(70% 0 0 / 0.1);
        color: var(--text-primary, oklch(90% 0 0));
      }
      :scope[data-variant="light"][data-color="primary"] {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.12);
        color: var(--brand, oklch(65% 0.2 270));
      }
      :scope[data-variant="light"][data-color="success"] {
        background: oklch(from var(--status-ok, oklch(72% 0.19 155)) l c h / 0.12);
        color: var(--status-ok, oklch(72% 0.19 155));
      }
      :scope[data-variant="light"][data-color="warning"] {
        background: oklch(from var(--status-warning, oklch(80% 0.18 85)) l c h / 0.12);
        color: var(--status-warning, oklch(80% 0.18 85));
      }
      :scope[data-variant="light"][data-color="danger"] {
        background: oklch(from var(--status-critical, oklch(65% 0.25 25)) l c h / 0.12);
        color: var(--status-critical, oklch(65% 0.25 25));
      }

      /* ─── Variant: outline ─────────────────────────────── */
      :scope[data-variant="outline"] {
        background: transparent;
      }
      :scope[data-variant="outline"][data-color="default"] {
        color: var(--text-primary, oklch(90% 0 0));
        border-color: var(--border-default, oklch(100% 0 0 / 0.12));
      }
      :scope[data-variant="outline"][data-color="primary"] {
        color: var(--brand, oklch(65% 0.2 270));
        border-color: var(--brand, oklch(65% 0.2 270));
      }
      :scope[data-variant="outline"][data-color="success"] {
        color: var(--status-ok, oklch(72% 0.19 155));
        border-color: var(--status-ok, oklch(72% 0.19 155));
      }
      :scope[data-variant="outline"][data-color="warning"] {
        color: var(--status-warning, oklch(80% 0.18 85));
        border-color: var(--status-warning, oklch(80% 0.18 85));
      }
      :scope[data-variant="outline"][data-color="danger"] {
        color: var(--status-critical, oklch(65% 0.25 25));
        border-color: var(--status-critical, oklch(65% 0.25 25));
      }

      /* ─── Variant: subtle ──────────────────────────────── */
      :scope[data-variant="subtle"] {
        background: transparent;
      }
      :scope[data-variant="subtle"][data-color="default"] {
        color: var(--text-secondary, oklch(70% 0 0));
      }
      :scope[data-variant="subtle"][data-color="primary"] {
        color: var(--brand, oklch(65% 0.2 270));
      }
      :scope[data-variant="subtle"][data-color="success"] {
        color: var(--status-ok, oklch(72% 0.19 155));
      }
      :scope[data-variant="subtle"][data-color="warning"] {
        color: var(--status-warning, oklch(80% 0.18 85));
      }
      :scope[data-variant="subtle"][data-color="danger"] {
        color: var(--status-critical, oklch(65% 0.25 25));
      }
      :scope[data-variant="subtle"]:hover:not(:disabled) {
        background: oklch(50% 0 0 / 0.08);
      }

      /* ─── Variant: transparent ─────────────────────────── */
      :scope[data-variant="transparent"] {
        background: transparent;
        border-color: transparent;
      }
      :scope[data-variant="transparent"][data-color="default"] {
        color: var(--text-secondary, oklch(70% 0 0));
      }
      :scope[data-variant="transparent"][data-color="primary"] {
        color: var(--brand, oklch(65% 0.2 270));
      }
      :scope[data-variant="transparent"][data-color="success"] {
        color: var(--status-ok, oklch(72% 0.19 155));
      }
      :scope[data-variant="transparent"][data-color="warning"] {
        color: var(--status-warning, oklch(80% 0.18 85));
      }
      :scope[data-variant="transparent"][data-color="danger"] {
        color: var(--status-critical, oklch(65% 0.25 25));
      }

      /* ─── Hover for filled/light/outline ───────────────── */
      :scope[data-variant="filled"]:hover:not(:disabled),
      :scope[data-variant="light"]:hover:not(:disabled),
      :scope[data-variant="outline"]:hover:not(:disabled) {
        filter: brightness(1.1);
      }

      /* ─── Focus visible ────────────────────────────────── */
      :scope:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
        box-shadow: var(--shadow-glow, 0 0 12px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2));
      }

      /* ─── Disabled ─────────────────────────────────────── */
      :scope:disabled,
      :scope[aria-disabled="true"] {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      /* ─── Loading ──────────────────────────────────────── */
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
        border: 2px solid oklch(50% 0 0 / 0.3);
        border-block-start-color: currentColor;
        border-radius: 50%;
        animation: ui-action-icon-spin 0.65s linear infinite;
      }
      /* Ensure spinner is visible despite transparent color */
      :scope[data-loading="true"]::after {
        border-block-start-color: var(--text-primary, oklch(90% 0 0));
      }

      /* ─── Active press ─────────────────────────────────── */
      :scope:active:not(:disabled):not([data-motion="0"]) {
        transform: scale(0.92);
        transition: transform 0.06s ease-out;
      }

      /* ─── Hover lift ───────────────────────────────────── */
      @media (hover: hover) {
        :scope:hover:not(:disabled):not(:active):not([data-motion="0"]) {
          transform: translateY(-1px);
        }
      }

      /* ─── Spring bounce back ───────────────────────────── */
      :scope:not(:hover):not(:active):not([data-motion="0"]):not([data-motion="1"]) {
        transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                    background 0.15s, border-color 0.15s,
                    box-shadow 0.25s;
      }

      /* Icon sizing */
      :scope svg {
        inline-size: 1.125em;
        block-size: 1.125em;
        flex-shrink: 0;
      }

      /* ─── Touch targets ────────────────────────────────── */
      @media (pointer: coarse) {
        :scope {
          min-inline-size: 44px;
          min-block-size: 44px;
        }
      }

      /* ─── Forced colors ────────────────────────────────── */
      @media (forced-colors: active) {
        :scope {
          border: 2px solid ButtonText;
        }
        :scope:focus-visible {
          outline: 2px solid Highlight;
        }
      }

      /* ─── Print ────────────────────────────────────────── */
      @media print {
        :scope {
          box-shadow: none;
          border: 1px solid;
        }
      }

      /* ─── Reduced data ─────────────────────────────────── */
      @media (prefers-reduced-data: reduce) {
        :scope {
          box-shadow: none;
        }
      }
    }

    @keyframes ui-action-icon-spin {
      to { transform: rotate(360deg); }
    }
  }
`

export const ActionIcon = forwardRef<HTMLButtonElement, ActionIconProps>(
  (
    {
      variant = 'subtle',
      color = 'default',
      size = 'md',
      radius = 'md',
      loading = false,
      disabled,
      children,
      motion: motionProp,
      className,
      type = 'button',
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('action-icon', actionIconStyles)
    const motionLevel = useMotionLevel(motionProp)

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(cls('root'), className)}
        data-variant={variant}
        data-color={color}
        data-size={size}
        data-radius={radius}
        data-loading={loading || undefined}
        data-motion={motionLevel}
        aria-busy={loading || undefined}
        aria-disabled={disabled || undefined}
        {...rest}
      >
        {children}
      </button>
    )
  }
)
ActionIcon.displayName = 'ActionIcon'
