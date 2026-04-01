import { forwardRef } from 'react'
import { Skeleton as StandardSkeleton, type SkeletonProps } from '../components/skeleton'

export type LiteSkeletonProps = Omit<SkeletonProps, 'motion'>

export const Skeleton = forwardRef<HTMLDivElement, LiteSkeletonProps>(
  (props, ref) => <StandardSkeleton ref={ref} motion={0} {...props} />
)
Skeleton.displayName = 'Skeleton'
