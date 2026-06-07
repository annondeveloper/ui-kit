import { forwardRef, useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const confirmDialogStyles = css`
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
        inline-size: 28rem;
      }
      :scope::backdrop {
        background: oklch(0% 0 0 / 0.55);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }
      .ui-lite-dialog__header {
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
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.5;
        color: var(--text-secondary, oklch(70% 0 0));
        text-wrap: pretty;
      }
      .ui-lite-dialog__body {
        padding: 1.25rem;
        overflow-y: auto;
        flex: 1;
        min-block-size: 0;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary, oklch(70% 0 0));
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

const confirmDialogButtonStyles = css`
  @layer components {
    @scope (.ui-lite-button) {
      :scope {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.375rem;
        border: 1px solid transparent;
        border-radius: var(--radius-md, 0.5rem);
        padding-block: 0.5rem;
        padding-inline: 1rem;
        font-size: var(--text-sm, 0.875rem);
        font-weight: 600;
        font-family: inherit;
        line-height: 1;
        min-block-size: 36px;
        cursor: pointer;
        white-space: nowrap;
        user-select: none;
        outline: none;
      }
      :scope[data-variant="primary"] {
        background: var(--brand, oklch(65% 0.2 270));
        color: oklch(100% 0 0);
      }
      :scope[data-variant="secondary"] {
        background: oklch(100% 0 0 / 0.06);
        color: var(--text-primary, oklch(97% 0 0));
        border-color: var(--border-default, oklch(100% 0 0 / 0.08));
      }
      :scope[data-variant="danger"] {
        background: var(--status-critical, oklch(62% 0.22 25));
        color: oklch(100% 0 0);
      }
      :scope:hover:not(:disabled) { filter: brightness(1.1); }
      :scope:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }
      :scope:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }
      @media (forced-colors: active) {
        :scope { border: 2px solid ButtonText; }
      }
    }
  }
`

export interface LiteConfirmDialogProps extends Omit<HTMLAttributes<HTMLDialogElement>, 'title'> {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: ReactNode
  /** Rendered below the title */
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger'
  /** Disable confirm button and show loading indicator */
  loading?: boolean
  children: ReactNode
}

export const ConfirmDialog = forwardRef<HTMLDialogElement, LiteConfirmDialogProps>(
  (
    {
      open,
      onClose,
      onConfirm,
      title,
      description,
      confirmLabel = 'Confirm',
      cancelLabel = 'Cancel',
      variant = 'default',
      loading = false,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    useStyles('lite-dialog', confirmDialogStyles)
    useStyles('lite-button', confirmDialogButtonStyles)
    const internalRef = useRef<HTMLDialogElement>(null)
    const dialogRef = (ref as React.RefObject<HTMLDialogElement>) ?? internalRef

    useEffect(() => {
      const el = dialogRef.current
      if (!el) return
      if (open && !el.open) el.showModal()
      if (!open && el.open) el.close()
    }, [open, dialogRef])

    return (
      <dialog
        ref={dialogRef}
        className={`ui-lite-dialog ui-lite-confirm-dialog${className ? ` ${className}` : ''}`}
        data-variant={variant}
        onClose={onClose}
        {...rest}
      >
        {title && (
          <div className="ui-lite-dialog__header">
            <h2>{title}</h2>
            {description && <p className="ui-lite-dialog__description">{description}</p>}
          </div>
        )}
        <div className="ui-lite-dialog__body">{children}</div>
        <div className="ui-lite-dialog__footer">
          <button
            type="button"
            className="ui-lite-button"
            data-variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="ui-lite-button"
            data-variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? '…' : confirmLabel}
          </button>
        </div>
      </dialog>
    )
  },
)
ConfirmDialog.displayName = 'ConfirmDialog'
