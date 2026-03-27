import { forwardRef } from 'react'
import { Calendar as StandardCalendar, type CalendarProps } from '../components/calendar'

export type LiteCalendarProps = Omit<CalendarProps, 'motion'>

export const Calendar = forwardRef<HTMLDivElement, LiteCalendarProps>(
  (props, ref) => <StandardCalendar ref={ref} motion={0} {...props} />
)
Calendar.displayName = 'Calendar'
