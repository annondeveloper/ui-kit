import { forwardRef, type HTMLAttributes } from 'react'

export interface LiteSuccessCheckmarkProps extends HTMLAttributes<HTMLSpanElement> {
  size?: 'sm' | 'md' | 'lg'
}

/** Lite success checkmark — static checkmark, no animation */
export const SuccessCheckmark = forwardRef<HTMLSpanElement, LiteSuccessCheckmarkProps>(
  ({ size = 'md', className, ...rest }, ref) => (
    <span
      ref={ref}
      className={`ui-lite-success-checkmark${className ? ` ${className}` : ''}`}
      data-size={size}
      role="img"
      aria-label="Success"
      {...rest}
    >
      &#x2713;
    </span>
  )
)
SuccessCheckmark.displayName = 'SuccessCheckmark'
