import { forwardRef, useEffect, useRef, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react'

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
