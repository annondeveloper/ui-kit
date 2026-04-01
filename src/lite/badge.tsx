import { forwardRef } from 'react'
import { Badge as StandardBadge, type BadgeProps } from '../components/badge'

export type LiteBadgeProps = Omit<BadgeProps, 'motion'>

export const Badge = forwardRef<HTMLSpanElement, LiteBadgeProps>(
  (props, ref) => <StandardBadge ref={ref} motion={0} {...props} />
)
Badge.displayName = 'Badge'
