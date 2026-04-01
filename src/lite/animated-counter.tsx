import { forwardRef } from 'react'
import { AnimatedCounter as StandardAnimatedCounter, type AnimatedCounterProps } from '../components/animated-counter'

export type LiteAnimatedCounterProps = Omit<AnimatedCounterProps, 'motion'>

export const AnimatedCounter = forwardRef<HTMLSpanElement, LiteAnimatedCounterProps>(
  (props, ref) => <StandardAnimatedCounter ref={ref} motion={0} {...props} />
)
AnimatedCounter.displayName = 'AnimatedCounter'
