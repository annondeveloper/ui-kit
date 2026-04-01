import { forwardRef } from 'react'
import { ToggleSwitch as StandardToggleSwitch, type ToggleSwitchProps } from '../components/toggle-switch'

export type LiteToggleSwitchProps = Omit<ToggleSwitchProps, 'motion'>

export const ToggleSwitch = forwardRef<HTMLInputElement, LiteToggleSwitchProps>(
  (props, ref) => <StandardToggleSwitch ref={ref} motion={0} {...props} />
)
ToggleSwitch.displayName = 'ToggleSwitch'
