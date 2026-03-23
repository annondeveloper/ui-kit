import { forwardRef, useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteDialogProps extends Omit<HTMLAttributes<HTMLDialogElement>, 'title'> {
  open: boolean
  onClose: () => void
  title?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export const Dialog = forwardRef<HTMLDialogElement, LiteDialogProps>(
  ({ open, onClose, title, size = 'md', className, children, ...rest }, ref) => {
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
        className={`ui-lite-dialog${className ? ` ${className}` : ''}`}
        style={{ margin: 'auto' }}
        data-size={size}
        onClose={onClose}
        {...rest}
      >
        {title && (
          <div className="ui-lite-dialog__header">
            <h2>{title}</h2>
            <button type="button" className="ui-lite-dialog__close" onClick={onClose} aria-label="Close">&times;</button>
          </div>
        )}
        <div className="ui-lite-dialog__body">{children}</div>
      </dialog>
    )
  }
)
Dialog.displayName = 'Dialog'
