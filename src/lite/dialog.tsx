import { forwardRef, useEffect, useRef, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const dialogStyles = css`
  @layer components {
    @scope (.ui-lite-dialog) {
      :scope {
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.06));
        border-radius: var(--radius-lg, 14px);
        background: var(--bg-elevated, oklch(16% 0.02 275));
        color: var(--text-primary, oklch(97% 0 0));
        padding: 0;
        max-inline-size: 90vw;
        max-block-size: calc(100dvh - 4rem);
        box-shadow: 0 24px 80px oklch(0% 0 0 / 0.4), 0 8px 32px oklch(0% 0 0 / 0.2), inset 0 1px 0 oklch(100% 0 0 / 0.05);
      }
      :scope:not([open]) { display: none; }
      :scope[open] {
        display: flex;
        flex-direction: column;
        position: fixed;
        inset: 0;
        margin: auto;
        padding-block-end: env(safe-area-inset-bottom, 0);
      }
      :scope::backdrop {
        background: oklch(0% 0 0 / 0.55);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }
      :scope[data-size="sm"] { inline-size: 24rem; }
      :scope:not([data-size]),
      :scope[data-size="md"] { inline-size: 32rem; }
      :scope[data-size="lg"] { inline-size: 48rem; }

      .ui-lite-dialog__header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 0.5rem;
        padding: 1rem 1.25rem;
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.06));
        flex-shrink: 0;
      }
      .ui-lite-dialog__header h2 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        text-wrap: balance;
      }
      .ui-lite-dialog__description {
        margin: 0.25rem 0 0;
        font-size: 0.875rem;
        color: var(--text-secondary, oklch(70% 0 0));
        text-wrap: pretty;
      }
      .ui-lite-dialog__close {
        background: none;
        border: none;
        font-size: 1.25rem;
        line-height: 1;
        cursor: pointer;
        color: var(--text-secondary, oklch(70% 0 0));
        padding: 0.25rem;
        border-radius: 9999px;
        flex-shrink: 0;
      }
      .ui-lite-dialog__close:hover {
        background: oklch(100% 0 0 / 0.08);
        color: var(--text-primary, oklch(97% 0 0));
      }
      .ui-lite-dialog__close:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }
      .ui-lite-dialog__body {
        padding: 1.25rem;
        overflow-y: auto;
        flex: 1;
        min-block-size: 0;
      }
      .ui-lite-dialog__footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
        padding: 0.75rem 1.25rem;
        border-block-start: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.06));
        flex-shrink: 0;
      }
      @media (max-width: 640px) {
        :scope[open] {
          max-inline-size: calc(100% - 1.5rem);
          max-block-size: calc(100dvh - 3rem);
        }
      }
      @media (forced-colors: active) {
        :scope { border: 2px solid ButtonText; }
      }
    }
  }
`

export interface LiteDialogClassNames {
  root?: string
  header?: string
  body?: string
  footer?: string
  close?: string
}

export interface LiteDialogProps extends Omit<HTMLAttributes<HTMLDialogElement>, 'title'> {
  open: boolean
  onClose: () => void
  title?: ReactNode
  /** Rendered below the title in the header */
  description?: ReactNode
  /** Rendered after the body */
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  /** Show the X close button (default true) */
  showClose?: boolean
  /** Close when Escape is pressed (default true) */
  closeOnEscape?: boolean
  /** Interface only — close when clicking the backdrop */
  closeOnOverlay?: boolean
  /** Interface only — prevent any programmatic close */
  preventClose?: boolean
  /** Interface only — per-slot class name overrides */
  classNames?: LiteDialogClassNames
  children: ReactNode
}

export const Dialog = forwardRef<HTMLDialogElement, LiteDialogProps>(
  (
    {
      open,
      onClose,
      title,
      description,
      footer,
      size = 'md',
      showClose = true,
      closeOnEscape = true,
      // interface-only — destructure so they don't spread onto <dialog>
      closeOnOverlay: _closeOnOverlay,
      preventClose: _preventClose,
      classNames: _classNames,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    useStyles('lite-dialog', dialogStyles)
    const internalRef = useRef<HTMLDialogElement>(null)
    const dialogRef = (ref as React.RefObject<HTMLDialogElement>) ?? internalRef

    useEffect(() => {
      const el = dialogRef.current
      if (!el) return
      if (open && !el.open) el.showModal()
      if (!open && el.open) el.close()
    }, [open, dialogRef])

    function handleKeyDown(e: KeyboardEvent<HTMLDialogElement>) {
      if (closeOnEscape && e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
      rest.onKeyDown?.(e)
    }

    return (
      <dialog
        ref={dialogRef}
        className={`ui-lite-dialog${className ? ` ${className}` : ''}`}
        data-size={size}
        onClose={onClose}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {(title || showClose) && (
          <div className="ui-lite-dialog__header">
            {title && <h2>{title}</h2>}
            {description && <p className="ui-lite-dialog__description">{description}</p>}
            {showClose && (
              <button type="button" className="ui-lite-dialog__close" onClick={onClose} aria-label="Close">
                &times;
              </button>
            )}
          </div>
        )}
        <div className="ui-lite-dialog__body">{children}</div>
        {footer && <div className="ui-lite-dialog__footer">{footer}</div>}
      </dialog>
    )
  },
)
Dialog.displayName = 'Dialog'
