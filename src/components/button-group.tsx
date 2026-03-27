'use client'

import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Layout direction of grouped buttons */
  orientation?: 'horizontal' | 'vertical'
  /** Size propagated to child buttons via CSS custom properties */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Variant propagated to child buttons via CSS custom properties */
  variant?: 'primary' | 'secondary' | 'ghost'
  /** Buttons visually connected (no gap, shared border-radius) */
  attached?: boolean
  /** Motion intensity level */
  motion?: 0 | 1 | 2 | 3
  children: ReactNode
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const buttonGroupStyles = css`
  @layer components {
    @scope (.ui-button-group) {
      :scope {
        display: inline-flex;
        align-items: stretch;
        gap: var(--space-xs, 0.25rem);
        flex-wrap: nowrap;
      }

      /* Orientation */
      :scope[data-orientation="horizontal"] {
        flex-direction: row;
      }
      :scope[data-orientation="vertical"] {
        flex-direction: column;
      }

      /* ── Attached mode (horizontal) ─────────────────── */

      :scope[data-attached="true"] {
        gap: 0;
      }

      :scope[data-attached="true"][data-orientation="horizontal"] > .ui-button {
        border-radius: 0;
        margin-inline-start: -1px;
      }
      :scope[data-attached="true"][data-orientation="horizontal"] > .ui-button:first-child {
        border-start-start-radius: var(--radius-md, 0.5rem);
        border-end-start-radius: var(--radius-md, 0.5rem);
        margin-inline-start: 0;
      }
      :scope[data-attached="true"][data-orientation="horizontal"] > .ui-button:last-child {
        border-start-end-radius: var(--radius-md, 0.5rem);
        border-end-end-radius: var(--radius-md, 0.5rem);
      }

      /* ── Attached mode (vertical) ───────────────────── */

      :scope[data-attached="true"][data-orientation="vertical"] > .ui-button {
        border-radius: 0;
        margin-block-start: -1px;
      }
      :scope[data-attached="true"][data-orientation="vertical"] > .ui-button:first-child {
        border-start-start-radius: var(--radius-md, 0.5rem);
        border-start-end-radius: var(--radius-md, 0.5rem);
        margin-block-start: 0;
      }
      :scope[data-attached="true"][data-orientation="vertical"] > .ui-button:last-child {
        border-end-start-radius: var(--radius-md, 0.5rem);
        border-end-end-radius: var(--radius-md, 0.5rem);
      }

      /* Attached hover — lift above siblings for border visibility */
      :scope[data-attached="true"] > .ui-button:hover,
      :scope[data-attached="true"] > .ui-button:focus-visible {
        z-index: 1;
        position: relative;
      }

      /* ── Size propagation via CSS custom properties ── */

      :scope[data-size="xs"] {
        --button-group-size: xs;
      }
      :scope[data-size="sm"] {
        --button-group-size: sm;
      }
      :scope[data-size="md"] {
        --button-group-size: md;
      }
      :scope[data-size="lg"] {
        --button-group-size: lg;
      }
      :scope[data-size="xl"] {
        --button-group-size: xl;
      }

      /* ── Variant propagation ────────────────────────── */

      :scope[data-variant="primary"] {
        --button-group-variant: primary;
      }
      :scope[data-variant="secondary"] {
        --button-group-variant: secondary;
      }
      :scope[data-variant="ghost"] {
        --button-group-variant: ghost;
      }

      /* Attached secondary variant — shared border */
      :scope[data-attached="true"][data-variant="secondary"] > .ui-button {
        border-color: var(--border-default, oklch(100% 0 0 / 0.12));
      }

      /* ── Touch targets ──────────────────────────────── */

      @media (pointer: coarse) {
        :scope > .ui-button {
          min-block-size: 44px;
          min-inline-size: 44px;
        }
      }

      /* ── Forced colors ──────────────────────────────── */

      @media (forced-colors: active) {
        :scope[data-attached="true"] > .ui-button {
          border: 1px solid ButtonText;
        }
        :scope > .ui-button:focus-visible {
          outline: 2px solid Highlight;
        }
      }

      /* ── Print ──────────────────────────────────────── */

      @media print {
        :scope > .ui-button {
          box-shadow: none;
          border: 1px solid;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  (
    {
      orientation = 'horizontal',
      size = 'md',
      variant = 'primary',
      attached = false,
      motion: motionProp,
      children,
      className,
      role = 'group',
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('button-group', buttonGroupStyles)
    const motionLevel = useMotionLevel(motionProp)

    return (
      <div
        ref={ref}
        role={role}
        className={cn(cls('root'), className)}
        data-orientation={orientation}
        data-size={size}
        data-variant={variant}
        data-attached={attached || undefined}
        data-motion={motionLevel}
        {...rest}
      >
        {children}
      </div>
    )
  }
)
ButtonGroup.displayName = 'ButtonGroup'
