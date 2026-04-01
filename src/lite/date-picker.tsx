import { forwardRef } from 'react'
import { DatePicker as StandardDatePicker, type DatePickerProps } from '../components/date-picker'

export type LiteDatePickerProps = Omit<DatePickerProps, 'motion'>

export const DatePicker = forwardRef<HTMLDivElement, LiteDatePickerProps>(
  (props, ref) => <StandardDatePicker ref={ref} motion={0} {...props} />
)
DatePicker.displayName = 'DatePicker'
