import { forwardRef, type HTMLAttributes } from 'react'

export interface LiteTooltipProps extends HTMLAttributes<HTMLSpanElement> {
  content: string
}

export const Tooltip = forwardRef<HTMLSpanElement, LiteTooltipProps>(
  ({ content, className, children, ...rest }, ref) => (
    <span
      ref={ref}
      className={`ui-lite-tooltip${className ? ` ${className}` : ''}`}
      title={content}
      {...rest}
    >
      {children}
    </span>
  )
)
Tooltip.displayName = 'Tooltip'
