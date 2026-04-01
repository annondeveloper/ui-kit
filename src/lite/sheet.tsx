import { forwardRef, useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteSheetProps extends Omit<HTMLAttributes<HTMLDialogElement>, 'title'> {
  open: boolean
  onClose: () => void
  title?: ReactNode
  side?: 'left' | 'right'
  children: ReactNode
}

export const Sheet = forwardRef<HTMLDialogElement, LiteSheetProps>(
  ({ open, onClose, title, side = 'right', className, children, ...rest }, ref) => {
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
        className={`ui-lite-sheet${className ? ` ${className}` : ''}`}
        data-side={side}
        onClose={onClose}
        {...rest}
      >
        {title && (
          <div className="ui-lite-sheet__header">
            <h2>{title}</h2>
            <button type="button" className="ui-lite-sheet__close" onClick={onClose} aria-label="Close">&times;</button>
          </div>
        )}
        <div className="ui-lite-sheet__body">{children}</div>
      </dialog>
    )
  }
)
Sheet.displayName = 'Sheet'
