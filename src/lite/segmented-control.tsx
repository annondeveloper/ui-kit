import { forwardRef } from 'react'
import { SegmentedControl as StandardSegmentedControl, type SegmentedControlProps, type SegmentedControlOption } from '../components/segmented-control'

export type { SegmentedControlOption as LiteSegmentedControlOption }
export type LiteSegmentedControlProps = Omit<SegmentedControlProps, 'motion'>

export const SegmentedControl = forwardRef<HTMLDivElement, LiteSegmentedControlProps>(
  (props, ref) => <StandardSegmentedControl ref={ref} motion={0} {...props} />
)
SegmentedControl.displayName = 'SegmentedControl'
