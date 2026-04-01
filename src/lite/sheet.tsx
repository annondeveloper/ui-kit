import { forwardRef, useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteSheetProps extends Omit<HTMLAttributes<HTMLDialogElement>, 'title'> {
  open: boolean
  onClose: () => void
  title?: ReactNode
  /** Rendered below the title in the header */
  description?: ReactNode
  side?: 'left' | 'right'
  /** Show the X close button (default true) */
  showClose?: boolean
  /** Size of the sheet panel (data-size) */
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export const Sheet = forwardRef<HTMLDialogElement, LiteSheetProps>(
  (
    { open, onClose, title, description, side = 'right', showClose = true, size = 'md', className, children, ...rest },
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
        className={`ui-lite-sheet${className ? ` ${className}` : ''}`}
        data-side={side}
        data-size={size}
        onClose={onClose}
        {...rest}
      >
        {(title || showClose) && (
          <div className="ui-lite-sheet__header">
            <div className="ui-lite-sheet__header-text">
              {title && <h2>{title}</h2>}
              {description && <p className="ui-lite-sheet__description">{description}</p>}
            </div>
            {showClose && (
              <button type="button" className="ui-lite-sheet__close" onClick={onClose} aria-label="Close">
                &times;
              </button>
            )}
          </div>
        )}
        <div className="ui-lite-sheet__body">{children}</div>
      </dialog>
    )
  },
)
Sheet.displayName = 'Sheet'
