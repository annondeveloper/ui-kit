'use client'

import {
  forwardRef,
  useState,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ChipProps extends Omit<HTMLAttributes<HTMLLabelElement>, 'onChange'> {
  checked?: boolean
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
  variant?: 'outline' | 'filled' | 'light'
  color?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  icon?: ReactNode
  name?: string
  disabled?: boolean
  children: ReactNode
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const chipStyles = css`
  @layer components {
    @scope (.ui-chip) {
      :scope {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
        border-radius: var(--radius-full, 9999px);
        cursor: pointer;
        user-select: none;
        font-family: inherit;
        font-weight: 500;
        line-height: 1.2;
        white-space: nowrap;
        vertical-align: middle;
        outline: none;
        transition: background 0.15s, border-color 0.15s, color 0.15s, box-shadow 0.15s;
      }

      :scope:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      :scope:active:not([data-disabled="true"]) {
        transform: scale(0.96);
      }
      :scope[data-motion="0"]:active:not([data-disabled="true"]) {
        transform: none;
      }

      :scope[data-disabled="true"] {
        opacity: 0.4;
        cursor: not-allowed;
        pointer-events: none;
      }

      /* ── Hidden checkbox ────────────────────────────── */

      .ui-chip__input {
        position: absolute;
        inline-size: 1px;
        block-size: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }

      /* ── Checkmark icon ─────────────────────────────── */

      .ui-chip__check {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: 0;
        block-size: 1em;
        overflow: hidden;
        transition: inline-size 0.2s ease-out, opacity 0.15s;
        opacity: 0;
      }
      :scope[data-motion="0"] .ui-chip__check {
        transition: none;
      }

      .ui-chip__check svg {
        inline-size: 0.875em;
        block-size: 0.875em;
        flex-shrink: 0;
      }

      .ui-chip__check svg path {
        stroke-dasharray: 16;
        stroke-dashoffset: 16;
        transition: stroke-dashoffset 0.25s ease-out 0.05s;
      }
      :scope[data-motion="0"] .ui-chip__check svg path {
        transition: none;
      }

      :scope[data-checked="true"] .ui-chip__check {
        inline-size: 1em;
        opacity: 1;
      }
      :scope[data-checked="true"] .ui-chip__check svg path {
        stroke-dashoffset: 0;
      }

      /* ── Icon ───────────────────────────────────────── */

      .ui-chip__icon {
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
      }
      .ui-chip__icon svg {
        inline-size: 1em;
        block-size: 1em;
      }

      /* ── Sizes ──────────────────────────────────────── */

      :scope[data-size="xs"] {
        padding-block: 0.125rem;
        padding-inline: 0.375rem;
        font-size: var(--text-xs, 0.6875rem);
      }
      :scope[data-size="sm"] {
        padding-block: 0.1875rem;
        padding-inline: 0.5rem;
        font-size: var(--text-xs, 0.75rem);
      }
      :scope[data-size="md"] {
        padding-block: 0.3125rem;
        padding-inline: 0.75rem;
        font-size: var(--text-sm, 0.875rem);
      }
      :scope[data-size="lg"] {
        padding-block: 0.4375rem;
        padding-inline: 1rem;
        font-size: var(--text-base, 1rem);
      }
      :scope[data-size="xl"] {
        padding-block: 0.5625rem;
        padding-inline: 1.25rem;
        font-size: var(--text-lg, 1.125rem);
      }

      /* ── Outline variant ────────────────────────────── */

      :scope[data-variant="outline"] {
        background: transparent;
        border: 1px solid oklch(70% 0 0 / 0.25);
        color: var(--text-secondary, oklch(70% 0 0));
      }
      :scope[data-variant="outline"]:hover:not([data-disabled="true"]) {
        border-color: oklch(70% 0 0 / 0.4);
        background: oklch(100% 0 0 / 0.03);
      }

      /* ── Filled variant ─────────────────────────────── */

      :scope[data-variant="filled"] {
        background: oklch(50% 0 0 / 0.12);
        border: 1px solid transparent;
        color: var(--text-secondary, oklch(70% 0 0));
      }
      :scope[data-variant="filled"]:hover:not([data-disabled="true"]) {
        background: oklch(50% 0 0 / 0.18);
      }

      /* ── Light variant ──────────────────────────────── */

      :scope[data-variant="light"] {
        background: oklch(50% 0 0 / 0.06);
        border: 1px solid transparent;
        color: var(--text-secondary, oklch(70% 0 0));
      }
      :scope[data-variant="light"]:hover:not([data-disabled="true"]) {
        background: oklch(50% 0 0 / 0.1);
      }

      /* ── Color: default checked ─────────────────────── */

      :scope[data-color="default"][data-checked="true"] {
        background: oklch(70% 0 0 / 0.15);
        border-color: oklch(70% 0 0 / 0.3);
        color: var(--text-primary, oklch(90% 0 0));
      }

      /* ── Color: primary checked ─────────────────────── */

      :scope[data-color="primary"][data-checked="true"] {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15);
        border-color: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.3);
        color: var(--brand, oklch(65% 0.2 270));
        box-shadow: 0 0 12px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.1);
      }

      /* ── Color: success checked ─────────────────────── */

      :scope[data-color="success"][data-checked="true"] {
        background: oklch(from var(--status-ok, oklch(72% 0.19 155)) l c h / 0.15);
        border-color: oklch(from var(--status-ok, oklch(72% 0.19 155)) l c h / 0.3);
        color: var(--status-ok, oklch(72% 0.19 155));
      }

      /* ── Color: warning checked ─────────────────────── */

      :scope[data-color="warning"][data-checked="true"] {
        background: oklch(from var(--status-warning, oklch(80% 0.18 85)) l c h / 0.15);
        border-color: oklch(from var(--status-warning, oklch(80% 0.18 85)) l c h / 0.3);
        color: var(--status-warning, oklch(80% 0.18 85));
      }

      /* ── Color: danger checked ──────────────────────── */

      :scope[data-color="danger"][data-checked="true"] {
        background: oklch(from var(--status-critical, oklch(65% 0.25 25)) l c h / 0.15);
        border-color: oklch(from var(--status-critical, oklch(65% 0.25 25)) l c h / 0.3);
        color: var(--status-critical, oklch(65% 0.25 25));
      }

      /* ── Filled variant checked overrides ───────────── */

      :scope[data-variant="filled"][data-color="primary"][data-checked="true"] {
        background: var(--brand, oklch(65% 0.2 270));
        color: var(--text-on-brand, oklch(100% 0 0));
        border-color: transparent;
      }
      :scope[data-variant="filled"][data-color="success"][data-checked="true"] {
        background: var(--status-ok, oklch(72% 0.19 155));
        color: oklch(20% 0 0);
        border-color: transparent;
      }
      :scope[data-variant="filled"][data-color="warning"][data-checked="true"] {
        background: var(--status-warning, oklch(80% 0.18 85));
        color: oklch(20% 0 0);
        border-color: transparent;
      }
      :scope[data-variant="filled"][data-color="danger"][data-checked="true"] {
        background: var(--status-critical, oklch(65% 0.25 25));
        color: oklch(100% 0 0);
        border-color: transparent;
      }

      /* ── Touch targets ──────────────────────────────── */

      @media (pointer: coarse) {
        :scope {
          min-block-size: 44px;
          min-inline-size: 44px;
        }
      }

      /* ── Forced colors ──────────────────────────────── */

      @media (forced-colors: active) {
        :scope {
          border: 1px solid ButtonText;
        }
        :scope[data-checked="true"] {
          border: 2px solid Highlight;
          background: Highlight;
          color: HighlightText;
        }
      }

      /* ── Print ──────────────────────────────────────── */

      @media print {
        :scope {
          border: 1px solid;
          box-shadow: none;
        }
        :scope[data-checked="true"] {
          font-weight: 700;
        }
        .ui-chip__check svg path {
          stroke-dashoffset: 0;
          transition: none;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export const Chip = forwardRef<HTMLLabelElement, ChipProps>(
  (
    {
      checked: controlledChecked,
      defaultChecked = false,
      onChange,
      variant = 'outline',
      color = 'default',
      size = 'md',
      icon,
      name,
      disabled = false,
      children,
      motion: motionProp,
      className,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('chip', chipStyles)
    const motionLevel = useMotionLevel(motionProp)
    const inputRef = useRef<HTMLInputElement>(null)

    const isControlled = controlledChecked !== undefined
    const [internalChecked, setInternalChecked] = useState(defaultChecked)
    const isChecked = isControlled ? controlledChecked : internalChecked

    return (
      <label
        ref={ref as React.Ref<HTMLLabelElement>}
        className={cn(cls('root'), className)}
        data-variant={variant}
        data-color={color}
        data-size={size}
        data-checked={isChecked || undefined}
        data-disabled={disabled || undefined}
        data-motion={motionLevel}
        {...(rest as React.HTMLAttributes<HTMLLabelElement>)}
      >
        <input
          ref={inputRef}
          type="checkbox"
          className="ui-chip__input"
          name={name}
          checked={isChecked}
          disabled={disabled}
          onChange={(e) => {
            if (disabled) return
            const next = e.target.checked
            if (!isControlled) setInternalChecked(next)
            onChange?.(next)
          }}
        />
        <span className="ui-chip__check" aria-hidden="true">
          <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M2.5 6.5L5 9L9.5 3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        {icon && !isChecked && <span className="ui-chip__icon">{icon}</span>}
        {children}
      </label>
    )
  }
)

Chip.displayName = 'Chip'
