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
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface DialogProps extends Omit<HTMLAttributes<HTMLDialogElement>, 'title'> {
  open: boolean
  onClose: () => void
  title?: ReactNode
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'full'
  closeOnOverlay?: boolean
  closeOnEscape?: boolean
  showClose?: boolean
  children: ReactNode
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const dialogStyles = css`
  @layer components {
    @scope (.ui-dialog) {
      :scope {
        display: contents;
      }

      dialog {
        position: fixed;
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-lg, 0.75rem);
        background: var(--bg-elevated, oklch(22% 0.01 270));
        box-shadow: var(--shadow-lg, 0 8px 24px oklch(0% 0 0 / 0.3));
        padding: 0;
        color: var(--text-primary, oklch(90% 0 0));
        overflow: hidden;
        outline: none;
      }

      /* Sizes */
      dialog[data-size="sm"] {
        max-inline-size: 400px;
        inline-size: calc(100% - 2rem);
      }
      dialog[data-size="md"] {
        max-inline-size: 560px;
        inline-size: calc(100% - 2rem);
      }
      dialog[data-size="lg"] {
        max-inline-size: 720px;
        inline-size: calc(100% - 2rem);
      }
      dialog[data-size="full"] {
        max-inline-size: 100vw;
        inline-size: 100vw;
        max-block-size: 100dvh;
        block-size: 100dvh;
        border-radius: 0;
      }

      dialog:not([data-size="full"]) {
        max-block-size: calc(100dvh - 4rem);
      }

      /* Backdrop */
      dialog::backdrop {
        background: oklch(0% 0 0 / 0.6);
        backdrop-filter: blur(4px);
      }

      /* Entry animation — motion 1+ */
      dialog:not([data-motion="0"]) {
        opacity: 1;
        transform: translateY(0) scale(1);
        transition:
          opacity 0.2s var(--ease-out, ease-out),
          transform 0.2s var(--ease-out, ease-out),
          display 0.2s allow-discrete,
          overlay 0.2s allow-discrete;
      }

      @starting-style {
        dialog[open]:not([data-motion="0"]) {
          opacity: 0;
          transform: translateY(8px) scale(0.98);
        }
      }

      /* Motion 0: instant */
      dialog[data-motion="0"] {
        transition: none;
      }

      /* Header */
      .ui-dialog__header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--space-sm, 0.5rem);
        padding-block: var(--space-lg, 1.25rem);
        padding-inline: var(--space-lg, 1.25rem);
        padding-block-end: 0;
      }

      .ui-dialog__header-text {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs, 0.25rem);
        min-inline-size: 0;
        flex: 1;
      }

      .ui-dialog__title {
        margin: 0;
        font-size: var(--text-lg, 1.125rem);
        font-weight: 600;
        line-height: 1.4;
        color: var(--text-primary, oklch(90% 0 0));
        text-wrap: balance;
      }

      .ui-dialog__description {
        margin: 0;
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.5;
        color: var(--text-secondary, oklch(70% 0 0));
        text-wrap: pretty;
      }

      /* Close button */
      .ui-dialog__close {
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
      .ui-dialog__close:hover {
        background: oklch(100% 0 0 / 0.08);
        color: var(--text-primary, oklch(90% 0 0));
      }
      .ui-dialog__close:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      /* Body */
      .ui-dialog__body {
        padding: var(--space-lg, 1.25rem);
        overflow-y: auto;
        flex: 1;
      }

      /* Aurora glow on border */
      dialog[open] {
        box-shadow:
          var(--shadow-lg, 0 8px 24px oklch(0% 0 0 / 0.3)),
          0 0 0 1px oklch(65% 0.15 270 / 0.1);
      }

      /* Touch targets */
      @media (pointer: coarse) {
        .ui-dialog__close {
          min-block-size: 44px;
          min-inline-size: 44px;
        }

        /* Mobile: sm/md become full-width bottom sheet */
        dialog[data-size="sm"],
        dialog[data-size="md"] {
          max-inline-size: 100%;
          inline-size: 100%;
          inset-block-end: 0;
          border-end-start-radius: 0;
          border-end-end-radius: 0;
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
        .ui-dialog__close {
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

      /* Reduced data */
      @media (prefers-reduced-data: reduce) {
        dialog {
          box-shadow: none;
          backdrop-filter: none;
        }
      }
    }
  }
`

// ─── Close Icon (inline SVG, no dependency) ─────────────────────────────────

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

export function Dialog({
  open,
  onClose,
  title,
  description,
  size = 'md',
  closeOnOverlay = true,
  closeOnEscape = true,
  showClose = true,
  children,
  motion: motionProp,
  className,
  ...rest
}: DialogProps) {
  useStyles('dialog', dialogStyles)
  const motionLevel = useMotionLevel(motionProp)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useStableId('dialog-title')
  const descId = useStableId('dialog-desc')

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
        // Always prevent default native close so we control it
        e.preventDefault()
        if (closeOnEscape) {
          onClose()
        }
      }
    },
    [closeOnEscape, onClose]
  )

  // ── Backdrop click (click on dialog element itself) ─────────────────
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (!closeOnOverlay) return
      // Only close if click target is the dialog element itself (backdrop area)
      if (e.target === e.currentTarget) {
        onClose()
      }
    },
    [closeOnOverlay, onClose]
  )

  return (
    <div className={cn('ui-dialog', className)}>
      <dialog
        ref={dialogRef}
        data-size={size}
        data-motion={motionLevel}
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        {...rest}
      >
        {(title || showClose) && (
          <div className="ui-dialog__header">
            <div className="ui-dialog__header-text">
              {title && (
                <h2 className="ui-dialog__title" id={titleId}>
                  {title}
                </h2>
              )}
              {description && (
                <p className="ui-dialog__description" id={descId}>
                  {description}
                </p>
              )}
            </div>
            {showClose && (
              <button
                type="button"
                className="ui-dialog__close"
                onClick={onClose}
                aria-label="Close"
              >
                <CloseIcon />
              </button>
            )}
          </div>
        )}
        <div className="ui-dialog__body">
          {children}
        </div>
      </dialog>
    </div>
  )
}

Dialog.displayName = 'Dialog'
