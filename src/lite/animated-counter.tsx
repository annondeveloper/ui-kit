import { forwardRef, type HTMLAttributes } from 'react'

export interface LiteAnimatedCounterProps extends HTMLAttributes<HTMLSpanElement> {
  value: number
  format?: (value: number) => string
  /** Animation duration in ms (accepted for API parity; no animation in Lite tier) */
  duration?: number
}

/** Lite animated counter — static display, no animation */
export const AnimatedCounter = forwardRef<HTMLSpanElement, LiteAnimatedCounterProps>(
  ({ value, format, duration: _duration, className, ...rest }, ref) => (
    <span ref={ref} className={`ui-lite-animated-counter${className ? ` ${className}` : ''}`} {...rest}>
      {format ? format(value) : value}
    </span>
  )
)
AnimatedCounter.displayName = 'AnimatedCounter'
