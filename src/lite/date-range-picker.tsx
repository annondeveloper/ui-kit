import { forwardRef } from 'react'
import { DateRangePicker as StandardDateRangePicker, type DateRangePickerProps, type DateRangePreset } from '../components/date-range-picker'

export type { DateRangePreset as LiteDateRangePreset }
export type LiteDateRangePickerProps = Omit<DateRangePickerProps, 'motion'>

export const DateRangePicker = forwardRef<HTMLDivElement, LiteDateRangePickerProps>(
  (props, ref) => <StandardDateRangePicker ref={ref} motion={0} {...props} />
)
DateRangePicker.displayName = 'DateRangePicker'
