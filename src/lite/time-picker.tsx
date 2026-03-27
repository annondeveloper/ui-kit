import { forwardRef } from 'react'
import { TimePicker as StandardTimePicker, type TimePickerProps } from '../components/time-picker'

export type LiteTimePickerProps = Omit<TimePickerProps, 'motion'>

export const TimePicker = forwardRef<HTMLDivElement, LiteTimePickerProps>(
  (props, ref) => <StandardTimePicker ref={ref} motion={0} {...props} />
)
TimePicker.displayName = 'TimePicker'
