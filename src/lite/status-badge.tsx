import { forwardRef } from 'react'
import { StatusBadge as StandardStatusBadge, type StatusBadgeProps } from '../components/status-badge'

export type LiteStatusBadgeProps = Omit<StatusBadgeProps, 'motion'>

export const StatusBadge = forwardRef<HTMLSpanElement, LiteStatusBadgeProps>(
  (props, ref) => <StandardStatusBadge ref={ref} motion={0} {...props} />
)
StatusBadge.displayName = 'StatusBadge'
