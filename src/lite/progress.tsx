import { forwardRef } from 'react'
import { Progress as StandardProgress, type ProgressProps } from '../components/progress'

export type LiteProgressProps = Omit<ProgressProps, 'motion'>

export const Progress = forwardRef<HTMLDivElement, LiteProgressProps>(
  (props, ref) => <StandardProgress ref={ref} motion={0} {...props} />
)
Progress.displayName = 'Progress'
