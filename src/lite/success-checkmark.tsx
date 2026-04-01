import { forwardRef, type HTMLAttributes } from 'react'

export interface LiteSuccessCheckmarkProps extends HTMLAttributes<HTMLSpanElement> {
  size?: 'sm' | 'md' | 'lg'
  /** Trigger CSS animation (accepted for API parity; Lite uses CSS only) */
  animated?: boolean
  /** Overrides the default aria-label */
  label?: string
}

/** Lite success checkmark — static checkmark, no JS animation */
export const SuccessCheckmark = forwardRef<HTMLSpanElement, LiteSuccessCheckmarkProps>(
  ({ size = 'md', animated, label, className, ...rest }, ref) => (
    <span
      ref={ref}
      className={`ui-lite-success-checkmark${className ? ` ${className}` : ''}`}
      data-size={size}
      data-animated={animated ? '' : undefined}
      role="img"
      aria-label={label ?? 'Success'}
      {...rest}
    >
      &#x2713;
    </span>
  )
)
SuccessCheckmark.displayName = 'SuccessCheckmark'
