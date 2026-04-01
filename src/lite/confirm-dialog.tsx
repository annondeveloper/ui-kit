import { forwardRef, useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react'

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
