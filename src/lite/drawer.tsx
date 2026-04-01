import { forwardRef, useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteDrawerProps extends Omit<HTMLAttributes<HTMLDialogElement>, 'title'> {
  open: boolean
  onClose: () => void
  side?: 'left' | 'right' | 'top' | 'bottom'
  children: ReactNode
}

export const Drawer = forwardRef<HTMLDialogElement, LiteDrawerProps>(
  ({ open, onClose, side = 'right', className, children, ...rest }, ref) => {
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
        <div className="ui-lite-sheet__body">{children}</div>
      </dialog>
    )
  }
)
Drawer.displayName = 'Drawer'
