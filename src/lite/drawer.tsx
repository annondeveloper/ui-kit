import { forwardRef, useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteDrawerProps extends Omit<HTMLAttributes<HTMLDialogElement>, 'title'> {
  open: boolean
  onClose: () => void
  side?: 'left' | 'right' | 'top' | 'bottom'
  /** Render a backdrop overlay (default true) */
  overlay?: boolean
  /** Size of the drawer panel (data-size) */
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export const Drawer = forwardRef<HTMLDialogElement, LiteDrawerProps>(
  ({ open, onClose, side = 'right', overlay = true, size = 'md', className, children, ...rest }, ref) => {
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
        {overlay && (
          <div className="ui-lite-sheet__overlay" aria-hidden="true" onClick={onClose} />
        )}
        <div className="ui-lite-sheet__body">{children}</div>
      </dialog>
    )
  },
)
Drawer.displayName = 'Drawer'
