import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react'

export interface LiteTooltipProps extends HTMLAttributes<HTMLSpanElement> {
  content: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  /** Delay in ms before showing tooltip (interface only; CSS handles timing) */
  delay?: number
  /** Suppress the tooltip entirely */
  disabled?: boolean
  /** Allow pointer to move into the tooltip content */
  interactive?: boolean
  /** Max width of the tooltip bubble */
  maxWidth?: number | string
  /** Distance in px between trigger and tooltip (interface only; CSS var) */
  offset?: number
}

export const Tooltip = forwardRef<HTMLSpanElement, LiteTooltipProps>(
  ({ content, placement = 'top', delay, disabled, interactive, maxWidth, offset, className, children, style, ...rest }, ref) => {
    const tooltipStyle: CSSProperties = {
      ...style,
      ...(maxWidth != null ? { '--ui-tooltip-max-width': typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth } as CSSProperties : {}),
    }

    return (
      <span
        ref={ref}
        className={`ui-lite-tooltip${className ? ` ${className}` : ''}`}
        title={disabled ? undefined : content}
        data-placement={placement}
        data-disabled={disabled ? '' : undefined}
        data-interactive={interactive ? '' : undefined}
        style={tooltipStyle}
        {...rest}
      >
        {children}
      </span>
    )
  }
)
Tooltip.displayName = 'Tooltip'
