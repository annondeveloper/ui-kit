'use client'

import {
  forwardRef,
  useEffect,
  useCallback,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface DrawerProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean
  onClose: () => void
  side?: 'left' | 'right' | 'top' | 'bottom'
  size?: 'sm' | 'md' | 'lg' | 'full'
  overlay?: boolean
  children: ReactNode
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const drawerStyles = css`
  @layer components {
    @scope (.ui-drawer) {
      :scope {
        position: fixed;
        inset: 0;
        z-index: 50;
        pointer-events: none;
      }

      /* Overlay */
      .ui-drawer__overlay {
        position: absolute;
        inset: 0;
        background: oklch(0% 0 0 / 0.5);
        pointer-events: auto;
      }

      /* Panel */
      .ui-drawer__panel {
        position: absolute;
        background: var(--bg-elevated, oklch(22% 0.01 270));
        color: var(--text-primary, oklch(90% 0 0));
        overflow-y: auto;
        pointer-events: auto;
        display: flex;
        flex-direction: column;
      }

      /* Left */
      .ui-drawer__panel[data-side="left"] {
        inset-block: 0;
        inset-inline-start: 0;
        border-inline-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        box-shadow: 4px 0 16px oklch(0% 0 0 / 0.2);
      }
      /* Right */
      .ui-drawer__panel[data-side="right"] {
        inset-block: 0;
        inset-inline-end: 0;
        border-inline-start: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        box-shadow: -4px 0 16px oklch(0% 0 0 / 0.2);
      }
      /* Top */
      .ui-drawer__panel[data-side="top"] {
        inset-inline: 0;
        inset-block-start: 0;
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }
      /* Bottom */
      .ui-drawer__panel[data-side="bottom"] {
        inset-inline: 0;
        inset-block-end: 0;
        border-block-start: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        box-shadow: 0 -4px 16px oklch(0% 0 0 / 0.2);
      }

      /* Left/Right sizes */
      .ui-drawer__panel[data-side="left"][data-size="sm"],
      .ui-drawer__panel[data-side="right"][data-size="sm"] {
        inline-size: 280px;
        max-inline-size: 90vw;
      }
      .ui-drawer__panel[data-side="left"][data-size="md"],
      .ui-drawer__panel[data-side="right"][data-size="md"] {
        inline-size: 360px;
        max-inline-size: 90vw;
      }
      .ui-drawer__panel[data-side="left"][data-size="lg"],
      .ui-drawer__panel[data-side="right"][data-size="lg"] {
        inline-size: 480px;
        max-inline-size: 90vw;
      }
      .ui-drawer__panel[data-side="left"][data-size="full"],
      .ui-drawer__panel[data-side="right"][data-size="full"] {
        inline-size: 100vw;
      }

      /* Top/Bottom sizes */
      .ui-drawer__panel[data-side="top"][data-size="sm"],
      .ui-drawer__panel[data-side="bottom"][data-size="sm"] {
        block-size: 280px;
        max-block-size: 90dvh;
      }
      .ui-drawer__panel[data-side="top"][data-size="md"],
      .ui-drawer__panel[data-side="bottom"][data-size="md"] {
        block-size: 360px;
        max-block-size: 90dvh;
      }
      .ui-drawer__panel[data-side="top"][data-size="lg"],
      .ui-drawer__panel[data-side="bottom"][data-size="lg"] {
        block-size: 480px;
        max-block-size: 90dvh;
      }
      .ui-drawer__panel[data-side="top"][data-size="full"],
      .ui-drawer__panel[data-side="bottom"][data-size="full"] {
        block-size: 100dvh;
      }

      /* Top/Bottom: full width */
      .ui-drawer__panel[data-side="top"],
      .ui-drawer__panel[data-side="bottom"] {
        inline-size: 100%;
      }

      /* Slide animations — motion 1+ */
      .ui-drawer__panel:not([data-motion="0"]) {
        transition:
          transform 0.25s var(--ease-out, ease-out),
          opacity 0.2s var(--ease-out, ease-out);
      }

      .ui-drawer__overlay:not([data-motion="0"]) {
        transition: opacity 0.2s var(--ease-out, ease-out);
      }

      /* Motion 0: instant */
      .ui-drawer__panel[data-motion="0"] {
        transition: none;
      }

      /* Content padding */
      .ui-drawer__body {
        padding: var(--space-lg, 1.25rem);
        flex: 1;
        overflow-y: auto;
      }

      /* Touch targets */
      @media (pointer: coarse) {
        .ui-drawer__panel {
          /* Ensure scrollable on touch */
          -webkit-overflow-scrolling: touch;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-drawer__panel {
          border: 2px solid ButtonText;
          background: Canvas;
          color: CanvasText;
        }
        .ui-drawer__overlay {
          background: Canvas;
          opacity: 0.8;
        }
      }

      /* Print */
      @media print {
        :scope {
          position: static;
        }
        .ui-drawer__overlay {
          display: none;
        }
        .ui-drawer__panel {
          position: static;
          box-shadow: none;
          border: 1px solid #000;
        }
      }

      /* Reduced data */
      @media (prefers-reduced-data: reduce) {
        .ui-drawer__panel {
          box-shadow: none;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(
  function Drawer(
    {
      open,
      onClose,
      side = 'left',
      size = 'md',
      overlay = true,
      children,
      motion: motionProp,
      className,
      ...rest
    },
    ref
  ) {
    useStyles('drawer', drawerStyles)
    const motionLevel = useMotionLevel(motionProp)

    // ── Escape key ──────────────────────────────────────────────────
    const handleEscape = useCallback(
      (e: KeyboardEvent) => {
        if (e.key === 'Escape' && open) {
          onClose()
        }
      },
      [open, onClose]
    )

    useEffect(() => {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }, [handleEscape])

    if (!open) return null

    return (
      <div
        ref={ref}
        className={cn('ui-drawer', className)}
        {...rest}
      >
        {overlay && (
          <div
            className="ui-drawer__overlay"
            data-motion={motionLevel}
            onClick={onClose}
            aria-hidden="true"
          />
        )}
        <div
          className="ui-drawer__panel"
          data-side={side}
          data-size={size}
          data-motion={motionLevel}
        >
          <div className="ui-drawer__body">
            {children}
          </div>
        </div>
      </div>
    )
  }
)

Drawer.displayName = 'Drawer'
