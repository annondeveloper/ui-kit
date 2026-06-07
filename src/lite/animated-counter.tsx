import { forwardRef, type HTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const animatedCounterStyles = css`
  @layer components {
    @scope (.ui-lite-animated-counter) {
      :scope {
        font-variant-numeric: tabular-nums;
        color: var(--text-primary, oklch(97% 0 0));
      }
    }
  }
`

export interface LiteAnimatedCounterProps extends HTMLAttributes<HTMLSpanElement> {
  value: number
  format?: (value: number) => string
  /** Animation duration in ms (accepted for API parity; no animation in Lite tier) */
  duration?: number
}

/** Lite animated counter — static display, no animation */
export const AnimatedCounter = forwardRef<HTMLSpanElement, LiteAnimatedCounterProps>(
  ({ value, format, duration: _duration, className, ...rest }, ref) => {
    useStyles('lite-animated-counter', animatedCounterStyles)
    return (
      <span ref={ref} className={`ui-lite-animated-counter${className ? ` ${className}` : ''}`} {...rest}>
        {format ? format(value) : value}
      </span>
    )
  }
)
AnimatedCounter.displayName = 'AnimatedCounter'
