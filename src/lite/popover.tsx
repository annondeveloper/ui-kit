import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LitePopoverProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
  open?: boolean
  content: ReactNode
}

export const Popover = forwardRef<HTMLDivElement, LitePopoverProps>(
  ({ open, content, className, children, ...rest }, ref) => (
    <div ref={ref} className={`ui-lite-popover${className ? ` ${className}` : ''}`} {...rest}>
      {children}
      {open && <div className="ui-lite-popover__content">{content}</div>}
    </div>
  )
)
Popover.displayName = 'Popover'
