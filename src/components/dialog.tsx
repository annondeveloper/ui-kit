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
  /* ─────────────────────────────────────────────────────────────────────────
     ALL structural styles are UNLAYERED so they beat the UA stylesheet.
     The UA sets background-color:Canvas, color:CanvasText, padding:1em,
     and position rules on <dialog> — @layer can never override those.
     ───────────────────────────────────────────────────────────────────────── */

  .ui-dialog { display: contents; }

  .ui-dialog dialog:not([open]) { display: none; }

  .ui-dialog dialog {
    border: 1px solid oklch(100% 0 0 / 0.08);
    border-radius: 1rem;
    padding: 0;
    outline: none;
    color: var(--text-primary, oklch(90% 0 0));
    background: var(--bg-elevated, oklch(22% 0.01 270));
    box-shadow:
      0 24px 80px oklch(0% 0 0 / 0.4),
      0 8px 32px oklch(0% 0 0 / 0.2),
      inset 0 1px 0 oklch(100% 0 0 / 0.06);
  }

  .ui-dialog dialog[open] {
    position: fixed;
    inset: 0;
    margin: auto;
    display: flex;
    flex-direction: column;
    padding-block-end: env(safe-area-inset-bottom, 0);
  }

  /* Sizes */
  .ui-dialog dialog[data-size="sm"] { max-inline-size: 400px; inline-size: calc(100% - 2rem); }
  .ui-dialog dialog[data-size="md"] { max-inline-size: 560px; inline-size: calc(100% - 2rem); }
  .ui-dialog dialog[data-size="lg"] { max-inline-size: 720px; inline-size: calc(100% - 2rem); }
  .ui-dialog dialog:not([data-size="full"]) { max-block-size: calc(100dvh - 4rem); }
  .ui-dialog dialog[data-size="full"] {
    max-inline-size: 100vw; inline-size: 100vw;
    max-block-size: 100dvh; block-size: 100dvh;
    border-radius: 0; margin: 0;
  }

  /* Backdrop */
  .ui-dialog dialog::backdrop {
    background: oklch(0% 0 0 / 0.55);
    backdrop-filter: blur(12px) saturate(1.2);
    -webkit-backdrop-filter: blur(12px) saturate(1.2);
  }

  /* Header */
  .ui-dialog .ui-dialog__header {
    display: flex; align-items: flex-start; justify-content: space-between;
    gap: 0.5rem; padding: 1.25rem 1.25rem 0.75rem; flex-shrink: 0;
    border-block-end: 1px solid oklch(100% 0 0 / 0.06); position: relative;
  }
  .ui-dialog .ui-dialog__header-text {
    display: flex; flex-direction: column; gap: 0.25rem; min-inline-size: 0; flex: 1;
  }
  .ui-dialog .ui-dialog__title {
    margin: 0; font-size: 1.125rem; font-weight: 700; line-height: 1.3;
    color: var(--text-primary, oklch(93% 0 0)); text-wrap: balance; letter-spacing: -0.01em;
  }
  .ui-dialog .ui-dialog__description {
    margin: 0; font-size: 0.875rem; line-height: 1.5;
    color: var(--text-secondary, oklch(65% 0 0)); text-wrap: pretty;
  }

  /* Close button */
  .ui-dialog .ui-dialog__close {
    display: inline-flex; align-items: center; justify-content: center;
    inline-size: 2rem; block-size: 2rem; padding: 0;
    border: 1px solid oklch(100% 0 0 / 0.06); border-radius: 9999px;
    background: oklch(100% 0 0 / 0.04); color: oklch(55% 0 0);
    cursor: pointer; flex-shrink: 0; font-size: 1rem; line-height: 1;
    transition: background 0.15s, color 0.15s, border-color 0.15s, box-shadow 0.15s;
  }
  .ui-dialog .ui-dialog__close:hover {
    background: oklch(100% 0 0 / 0.1); color: var(--text-primary, oklch(90% 0 0));
    border-color: oklch(100% 0 0 / 0.12); box-shadow: 0 0 12px oklch(100% 0 0 / 0.06);
  }
  .ui-dialog .ui-dialog__close:active { transform: scale(0.92); }
  .ui-dialog .ui-dialog__close:focus-visible {
    outline: 2px solid var(--brand, oklch(65% 0.2 270)); outline-offset: 2px;
  }

  /* Body — scrollable */
  .ui-dialog .ui-dialog__body {
    padding: 1.25rem; overflow-y: auto; flex: 1; min-block-size: 0;
    scrollbar-width: thin; scrollbar-color: oklch(100% 0 0 / 0.12) transparent;
  }

  /* Mobile */
  @media (max-width: 640px) {
    .ui-dialog dialog[open]:not([data-size="full"]) {
      max-inline-size: calc(100% - 1.5rem);
      max-block-size: calc(100dvh - 3rem);
    }
  }

  /* Touch targets */
  @media (pointer: coarse) {
    .ui-dialog .ui-dialog__close { min-block-size: 44px; min-inline-size: 44px; }
  }

  /* ─────────────────────────────────────────────────────────────────────────
     DECORATIVE enhancements in @layer — gracefully degrade if not applied.
     ───────────────────────────────────────────────────────────────────────── */
  @layer components {
    @scope (.ui-dialog) {
      /* Aurora glow ring on open */
      dialog[open] {
        border-color: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15);
        box-shadow:
          0 24px 80px oklch(0% 0 0 / 0.4),
          0 8px 32px oklch(0% 0 0 / 0.2),
          0 0 0 1px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.08),
          0 0 60px -12px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.12),
          inset 0 1px 0 oklch(100% 0 0 / 0.06);
      }

      /* Entry animation — motion 1+ */
      dialog:not([data-motion="0"]) {
        opacity: 1; transform: translateY(0) scale(1);
        transition:
          opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1),
          transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
          display 0.25s allow-discrete, overlay 0.25s allow-discrete;
      }
      dialog[data-motion="2"], dialog[data-motion="3"] {
        transition:
          opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1),
          transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
          display 0.3s allow-discrete, overlay 0.3s allow-discrete;
      }
      @starting-style {
        dialog[open]:not([data-motion="0"]) { opacity: 0; transform: translateY(16px) scale(0.95); }
        dialog[open][data-motion="2"], dialog[open][data-motion="3"] { opacity: 0; transform: translateY(24px) scale(0.92); }
      }
      dialog[data-motion="0"] { transition: none; }

      /* Backdrop fade-in */
      dialog:not([data-motion="0"])::backdrop { transition: background 0.3s ease-out; }
      @starting-style {
        dialog[open]:not([data-motion="0"])::backdrop { background: oklch(0% 0 0 / 0); }
      }

      /* Top shimmer line */
      dialog[open]::before {
        content: ''; position: absolute; inset-block-start: 0; inset-inline: 0;
        block-size: 1px; pointer-events: none; z-index: 1;
        background: linear-gradient(90deg,
          transparent 0%,
          oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.15) c h / 0.5) 20%,
          oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.2) c h / 0.8) 50%,
          oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.15) c h / 0.5) 80%,
          transparent 100%);
      }

      /* Forced colors */
      @media (forced-colors: active) {
        dialog { border: 2px solid ButtonText; background: Canvas; color: CanvasText; }
        dialog::backdrop { background: Canvas; opacity: 0.8; }
        dialog[open]::before { display: none; }
        .ui-dialog__close { border: 1px solid ButtonText; }
      }

      /* Print */
      @media print {
        dialog { position: static; box-shadow: none; border: 1px solid; }
        dialog[open]::before { display: none; }
        dialog::backdrop { display: none; }
      }

      @media (prefers-reduced-motion: reduce) {
        dialog, dialog::backdrop { transition: none !important; }
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
