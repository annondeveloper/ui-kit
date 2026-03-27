import { forwardRef } from 'react'
import { ActionIcon as StandardActionIcon, type ActionIconProps } from '../components/action-icon'

export type LiteActionIconProps = Omit<ActionIconProps, 'motion'>

export const ActionIcon = forwardRef<HTMLButtonElement, LiteActionIconProps>(
  (props, ref) => <StandardActionIcon ref={ref} motion={0} {...props} />
)
ActionIcon.displayName = 'ActionIcon'
