'use client'

import {
  useCallback,
  useEffect,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useStableId } from '../core/a11y/stable-id'
import { useGesture } from '../core/input/gestures'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SheetProps extends Omit<HTMLAttributes<HTMLDialogElement>, 'title'> {
  open: boolean
  onClose: () => void
  side?: 'left' | 'right' | 'bottom'
  title?: ReactNode
  description?: string
  size?: 'sm' | 'md' | 'lg'
  showClose?: boolean
  children: ReactNode
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const sheetStyles = css`
  @layer components {
    @scope (.ui-sheet) {
      :scope {
        display: contents;
      }

      dialog {
        position: fixed;
        margin: 0;
        border: none;
        padding: 0;
        background: var(--bg-elevated, oklch(22% 0.01 270));
        color: var(--text-primary, oklch(90% 0 0));
        overflow: hidden;
        outline: none;
        display: flex;
        flex-direction: column;
      }

      /* Backdrop */
      dialog::backdrop {
        background: oklch(0% 0 0 / 0.6);
        backdrop-filter: blur(4px);
      }

      /* Left/Right sides: full height */
      dialog[data-side="left"],
      dialog[data-side="right"] {
        inset-block: 0;
        block-size: 100dvh;
      }
      dialog[data-side="right"] {
        inset-inline-end: 0;
        border-inline-start: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
      }
      dialog[data-side="left"] {
        inset-inline-start: 0;
        border-inline-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
      }

      /* Bottom side: full width */
      dialog[data-side="bottom"] {
        inset-block-end: 0;
        inset-inline: 0;
        inline-size: 100%;
        border-block-start: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        border-start-start-radius: var(--radius-lg, 0.75rem);
        border-start-end-radius: var(--radius-lg, 0.75rem);
      }

      /* Left/Right sizes */
      dialog[data-side="left"][data-size="sm"],
      dialog[data-side="right"][data-size="sm"] {
        inline-size: 320px;
        max-inline-size: 90vw;
      }
      dialog[data-side="left"][data-size="md"],
      dialog[data-side="right"][data-size="md"] {
        inline-size: 400px;
        max-inline-size: 90vw;
      }
      dialog[data-side="left"][data-size="lg"],
      dialog[data-side="right"][data-size="lg"] {
        inline-size: 560px;
        max-inline-size: 90vw;
      }

      /* Bottom sizes */
      dialog[data-side="bottom"][data-size="sm"] {
        block-size: 33vh;
        max-block-size: 90dvh;
      }
      dialog[data-side="bottom"][data-size="md"] {
        block-size: 50vh;
        max-block-size: 90dvh;
      }
      dialog[data-side="bottom"][data-size="lg"] {
        block-size: 75vh;
        max-block-size: 90dvh;
      }

      /* Slide animations — motion 1+ */
      dialog:not([data-motion="0"]) {
        transition:
          transform 0.25s var(--ease-out, ease-out),
          opacity 0.25s var(--ease-out, ease-out),
          display 0.25s allow-discrete,
          overlay 0.25s allow-discrete;
      }

      dialog[open][data-side="right"]:not([data-motion="0"]) {
        transform: translateX(0);
      }
      dialog[open][data-side="left"]:not([data-motion="0"]) {
        transform: translateX(0);
      }
      dialog[open][data-side="bottom"]:not([data-motion="0"]) {
        transform: translateY(0);
      }

      @starting-style {
        dialog[open][data-side="right"]:not([data-motion="0"]) {
          transform: translateX(100%);
          opacity: 0;
        }
        dialog[open][data-side="left"]:not([data-motion="0"]) {
          transform: translateX(-100%);
          opacity: 0;
        }
        dialog[open][data-side="bottom"]:not([data-motion="0"]) {
          transform: translateY(100%);
          opacity: 0;
        }
      }

      /* Exit: slide out */
      dialog[data-side="right"]:not([open]):not([data-motion="0"]) {
        transform: translateX(100%);
      }
      dialog[data-side="left"]:not([open]):not([data-motion="0"]) {
        transform: translateX(-100%);
      }
      dialog[data-side="bottom"]:not([open]):not([data-motion="0"]) {
        transform: translateY(100%);
      }

      /* Motion 0: instant */
      dialog[data-motion="0"] {
        transition: none;
      }

      /* Header */
      .ui-sheet__header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--space-sm, 0.5rem);
        padding: var(--space-lg, 1.25rem);
        padding-block-end: 0;
        flex-shrink: 0;
      }

      .ui-sheet__header-text {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs, 0.25rem);
        min-inline-size: 0;
        flex: 1;
      }

      .ui-sheet__title {
        margin: 0;
        font-size: var(--text-lg, 1.125rem);
        font-weight: 600;
        line-height: 1.4;
        color: var(--text-primary, oklch(90% 0 0));
        text-wrap: balance;
      }

      .ui-sheet__description {
        margin: 0;
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.5;
        color: var(--text-secondary, oklch(70% 0 0));
        text-wrap: pretty;
      }

      /* Close button */
      .ui-sheet__close {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: 2rem;
        block-size: 2rem;
        padding: 0;
        border: none;
        border-radius: var(--radius-sm, 0.25rem);
        background: transparent;
        color: var(--text-secondary, oklch(70% 0 0));
        cursor: pointer;
        flex-shrink: 0;
        transition: background 0.15s, color 0.15s;
        font-size: 1.25rem;
        line-height: 1;
      }
      .ui-sheet__close:hover {
        background: oklch(100% 0 0 / 0.08);
        color: var(--text-primary, oklch(90% 0 0));
      }
      .ui-sheet__close:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      /* Body */
      .ui-sheet__body {
        padding: var(--space-lg, 1.25rem);
        overflow-y: auto;
        flex: 1;
      }

      /* Swipe dismiss area */
      .ui-sheet__swipe {
        position: absolute;
        z-index: 1;
        touch-action: none;
      }
      dialog[data-side="right"] .ui-sheet__swipe {
        inset-block: 0;
        inset-inline-start: 0;
        inline-size: 20px;
      }
      dialog[data-side="left"] .ui-sheet__swipe {
        inset-block: 0;
        inset-inline-end: 0;
        inline-size: 20px;
      }
      dialog[data-side="bottom"] .ui-sheet__swipe {
        inset-block-start: 0;
        inset-inline: 0;
        block-size: 20px;
      }

      /* Bottom sheet drag indicator */
      dialog[data-side="bottom"] .ui-sheet__swipe::after {
        content: '';
        position: absolute;
        inset-block-start: 8px;
        inset-inline-start: 50%;
        translate: -50% 0;
        inline-size: 32px;
        block-size: 4px;
        border-radius: var(--radius-full, 9999px);
        background: oklch(100% 0 0 / 0.2);
      }

      /* Shadow for depth */
      dialog[data-side="right"] {
        box-shadow: -4px 0 16px oklch(0% 0 0 / 0.2);
      }
      dialog[data-side="left"] {
        box-shadow: 4px 0 16px oklch(0% 0 0 / 0.2);
      }
      dialog[data-side="bottom"] {
        box-shadow: 0 -4px 16px oklch(0% 0 0 / 0.2);
      }

      /* Touch targets */
      @media (pointer: coarse) {
        .ui-sheet__close {
          min-block-size: 44px;
          min-inline-size: 44px;
        }

        /* On mobile: bottom sheet is the default for any side */
        dialog[data-side="left"],
        dialog[data-side="right"] {
          /* Keep as side panels on mobile — override if needed via media query */
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        dialog {
          border: 2px solid ButtonText;
          background: Canvas;
          color: CanvasText;
        }
        dialog::backdrop {
          background: Canvas;
          opacity: 0.8;
        }
        .ui-sheet__close {
          border: 1px solid ButtonText;
        }
      }

      /* Print */
      @media print {
        dialog {
          position: static;
          box-shadow: none;
          border: 1px solid;
        }
        dialog::backdrop {
          display: none;
        }
      }
    }
  }
`

// ─── Close Icon ─────────────────────────────────────────────────────────────

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4 4L12 12M12 4L4 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

export function Sheet({
  open,
  onClose,
  side = 'right',
  title,
  description,
  size = 'md',
  showClose = true,
  children,
  motion: motionProp,
  className,
  ...rest
}: SheetProps) {
  useStyles('sheet', sheetStyles)
  const motionLevel = useMotionLevel(motionProp)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const swipeRef = useRef<HTMLDivElement>(null)
  const titleId = useStableId('sheet-title')
  const descId = useStableId('sheet-desc')

  // ── Show/hide dialog ────────────────────────────────────────────────
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      if (!dialog.hasAttribute('open')) {
        dialog.showModal()
      }
    } else {
      if (dialog.hasAttribute('open')) {
        dialog.close()
      }
    }
  }, [open])

  // ── Escape key handling ─────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDialogElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    },
    [onClose]
  )

  // ── Backdrop click ──────────────────────────────────────────────────
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === e.currentTarget) {
        onClose()
      }
    },
    [onClose]
  )

  // ── Swipe-to-dismiss ────────────────────────────────────────────────
  useGesture(swipeRef, {
    onSwipe: useCallback(
      (direction: 'left' | 'right' | 'up' | 'down') => {
        // Dismiss when swiping towards the edge
        if (side === 'right' && direction === 'right') onClose()
        else if (side === 'left' && direction === 'left') onClose()
        else if (side === 'bottom' && direction === 'down') onClose()
      },
      [side, onClose]
    ),
  })

  return (
    <div className={cn('ui-sheet', className)}>
      <dialog
        ref={dialogRef}
        data-side={side}
        data-size={size}
        data-motion={motionLevel}
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        {...rest}
      >
        <div className="ui-sheet__swipe" ref={swipeRef} />
        {(title || showClose) && (
          <div className="ui-sheet__header">
            <div className="ui-sheet__header-text">
              {title && (
                <h2 className="ui-sheet__title" id={titleId}>
                  {title}
                </h2>
              )}
              {description && (
                <p className="ui-sheet__description" id={descId}>
                  {description}
                </p>
              )}
            </div>
            {showClose && (
              <button
                type="button"
                className="ui-sheet__close"
                onClick={onClose}
                aria-label="Close"
              >
                <CloseIcon />
              </button>
            )}
          </div>
        )}
        <div className="ui-sheet__body">
          {children}
        </div>
      </dialog>
    </div>
  )
}

Sheet.displayName = 'Sheet'
