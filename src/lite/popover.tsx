import { forwardRef, useState, type HTMLAttributes, type ReactNode } from 'react'

export interface LitePopoverProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
  open?: boolean
  defaultOpen?: boolean
  content: ReactNode
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'
  offset?: number
  modal?: boolean
  arrow?: boolean
  onOpenChange?: (open: boolean) => void
}

export const Popover = forwardRef<HTMLDivElement, LitePopoverProps>(
  ({ open: controlledOpen, defaultOpen = false, content, placement = 'bottom', offset, modal, arrow, onOpenChange, className, children, ...rest }, ref) => {
    const [internalOpen, setInternalOpen] = useState(defaultOpen)
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen

    const setOpen = (val: boolean) => {
      if (controlledOpen === undefined) setInternalOpen(val)
      onOpenChange?.(val)
    }

    return (
      <div
        ref={ref}
        className={`ui-lite-popover${className ? ` ${className}` : ''}`}
        data-placement={placement}
        data-open={isOpen ? '' : undefined}
        {...rest}
      >
        {children}
        {isOpen && (
          <div
            className="ui-lite-popover__content"
            role={modal ? 'dialog' : undefined}
            data-placement={placement}
          >
            {arrow && <span className="ui-lite-popover__arrow" aria-hidden="true" />}
            {content}
          </div>
        )}
      </div>
    )
  }
)
Popover.displayName = 'Popover'
