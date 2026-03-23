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
        border: 1px solid oklch(100% 0 0 / 0.08);
        border-radius: var(--radius-xl, 1rem);
        padding: 0;
        color: var(--text-primary, oklch(90% 0 0));
        outline: none;
      }

      /* Closed dialog must be hidden — protect the UA default */
      dialog:not([open]) {
        display: none;
      }

      /* Open dialog — centered via showModal() + flex layout for scroll */
      dialog[open] {
        display: flex;
        flex-direction: column;
        margin: auto;

        /* Glass morphism surface */
        background:
          linear-gradient(
            180deg,
            oklch(from var(--bg-elevated, oklch(22% 0.01 270)) calc(l + 0.04) c h) 0%,
            var(--bg-elevated, oklch(22% 0.01 270)) 100%
          );
        box-shadow:
          0 24px 80px oklch(0% 0 0 / 0.4),
          0 8px 32px oklch(0% 0 0 / 0.2),
          inset 0 1px 0 oklch(100% 0 0 / 0.06);
      }

      /* ── Sizes ── */
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
        margin: 0;
      }

      dialog:not([data-size="full"]) {
        max-block-size: calc(100dvh - 4rem);
      }

      /* ── Backdrop — deep atmospheric blur ── */
      dialog::backdrop {
        background: oklch(0% 0 0 / 0.55);
        backdrop-filter: blur(12px) saturate(1.2);
        -webkit-backdrop-filter: blur(12px) saturate(1.2);
      }

      /* Backdrop fade-in */
      dialog:not([data-motion="0"])::backdrop {
        transition: background 0.3s ease-out, backdrop-filter 0.3s ease-out;
      }

      @starting-style {
        dialog[open]:not([data-motion="0"])::backdrop {
          background: oklch(0% 0 0 / 0);
          backdrop-filter: blur(0) saturate(1);
        }
      }

      /* ── Aurora glow ring — subtle colored border on open ── */
      dialog[open] {
        border-color: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15);
        box-shadow:
          0 24px 80px oklch(0% 0 0 / 0.4),
          0 8px 32px oklch(0% 0 0 / 0.2),
          0 0 0 1px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.08),
          0 0 60px -12px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.12),
          inset 0 1px 0 oklch(100% 0 0 / 0.06);
      }

      /* ── Entry animation — motion 1+ ── */
      dialog:not([data-motion="0"]) {
        opacity: 1;
        transform: translateY(0) scale(1);
        transition:
          opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1),
          transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
          display 0.25s allow-discrete,
          overlay 0.25s allow-discrete;
      }

      /* Motion 2+: more dramatic spring entrance */
      dialog[data-motion="2"],
      dialog[data-motion="3"] {
        transition:
          opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1),
          transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
          display 0.3s allow-discrete,
          overlay 0.3s allow-discrete;
      }

      @starting-style {
        dialog[open]:not([data-motion="0"]) {
          opacity: 0;
          transform: translateY(16px) scale(0.95);
        }
        dialog[open][data-motion="2"],
        dialog[open][data-motion="3"] {
          opacity: 0;
          transform: translateY(24px) scale(0.92);
        }
      }

      /* Motion 0: instant */
      dialog[data-motion="0"] {
        transition: none;
      }

      /* ── Top shimmer line — aurora accent at top of dialog ── */
      dialog[open]::before {
        content: '';
        position: absolute;
        inset-block-start: 0;
        inset-inline: 0;
        block-size: 1px;
        background: linear-gradient(
          90deg,
          transparent 0%,
          oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.15) c h / 0.5) 20%,
          oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.2) c h / 0.8) 50%,
          oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.15) c h / 0.5) 80%,
          transparent 100%
        );
        pointer-events: none;
        z-index: 1;
      }

      /* ── Header ── */
      .ui-dialog__header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--space-sm, 0.5rem);
        padding: var(--space-lg, 1.25rem) var(--space-lg, 1.25rem) var(--space-md, 0.75rem);
        flex-shrink: 0;
        border-block-end: 1px solid oklch(100% 0 0 / 0.06);
        position: relative;
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
        font-weight: 700;
        line-height: 1.3;
        color: var(--text-primary, oklch(93% 0 0));
        text-wrap: balance;
        letter-spacing: -0.01em;
      }

      .ui-dialog__description {
        margin: 0;
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.5;
        color: var(--text-secondary, oklch(65% 0 0));
        text-wrap: pretty;
      }

      /* ── Close button — pill-shaped with hover glow ── */
      .ui-dialog__close {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: 2rem;
        block-size: 2rem;
        padding: 0;
        border: 1px solid oklch(100% 0 0 / 0.06);
        border-radius: var(--radius-full, 9999px);
        background: oklch(100% 0 0 / 0.04);
        color: var(--text-tertiary, oklch(55% 0 0));
        cursor: pointer;
        flex-shrink: 0;
        transition: background 0.15s, color 0.15s, border-color 0.15s, box-shadow 0.15s;
        font-size: 1rem;
        line-height: 1;
      }
      .ui-dialog__close:hover {
        background: oklch(100% 0 0 / 0.1);
        color: var(--text-primary, oklch(90% 0 0));
        border-color: oklch(100% 0 0 / 0.12);
        box-shadow: 0 0 12px oklch(100% 0 0 / 0.06);
      }
      .ui-dialog__close:active {
        transform: scale(0.92);
      }
      .ui-dialog__close:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      /* ── Body — scrollable content area ── */
      .ui-dialog__body {
        padding: var(--space-lg, 1.25rem);
        overflow-y: auto;
        flex: 1;
        min-block-size: 0;

        /* Thin styled scrollbar */
        scrollbar-width: thin;
        scrollbar-color: oklch(100% 0 0 / 0.12) transparent;
      }
      .ui-dialog__body::-webkit-scrollbar {
        width: 6px;
      }
      .ui-dialog__body::-webkit-scrollbar-track {
        background: transparent;
      }
      .ui-dialog__body::-webkit-scrollbar-thumb {
        background: oklch(100% 0 0 / 0.12);
        border-radius: 3px;
      }
      .ui-dialog__body::-webkit-scrollbar-thumb:hover {
        background: oklch(100% 0 0 / 0.2);
      }

      /* ── Touch targets ── */
      @media (pointer: coarse) {
        .ui-dialog__close {
          min-block-size: 44px;
          min-inline-size: 44px;
        }
      }

      /* ── Forced colors ── */
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
        dialog[open]::before {
          display: none;
        }
        .ui-dialog__close {
          border: 1px solid ButtonText;
        }
      }

      /* ── Print ── */
      @media print {
        dialog {
          position: static;
          box-shadow: none;
          border: 1px solid;
        }
        dialog[open]::before {
          display: none;
        }
        dialog::backdrop {
          display: none;
        }
      }

      /* ── Reduced motion ── */
      @media (prefers-reduced-motion: reduce) {
        dialog,
        dialog::backdrop {
          transition: none !important;
        }
      }

      /* ── Reduced data ── */
      @media (prefers-reduced-data: reduce) {
        dialog {
          box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
        }
        dialog::backdrop {
          backdrop-filter: none;
          -webkit-backdrop-filter: none;
        }
      }
    }
  }

  /* ── Unlayered: centering + mobile bottom sheet ──
     Must be outside @layer to beat the UA stylesheet specificity */
  .ui-dialog dialog[open] {
    position: fixed;
    inset: 0;
    margin: auto;
  }

  /* Mobile: sm/md become bottom sheet */
  @media (pointer: coarse) {
    .ui-dialog dialog[open][data-size="sm"],
    .ui-dialog dialog[open][data-size="md"] {
      inset-block-start: auto;
      inset-block-end: 0;
      margin-block-end: 0;
      max-inline-size: 100%;
      inline-size: 100%;
      border-end-start-radius: 0;
      border-end-end-radius: 0;
      border-start-start-radius: var(--radius-xl, 1rem);
      border-start-end-radius: var(--radius-xl, 1rem);
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
