import { forwardRef } from 'react'
import { Timeline as StandardTimeline, type TimelineProps, type TimelineItem } from '../components/timeline'

export type { TimelineItem as LiteTimelineItem }
export type LiteTimelineProps = Omit<TimelineProps, 'motion'>

export const Timeline = forwardRef<HTMLDivElement, LiteTimelineProps>(
  (props, ref) => <StandardTimeline ref={ref} motion={0} {...props} />
)
Timeline.displayName = 'Timeline'
