import { forwardRef } from 'react'
import { Select as StandardSelect, type SelectProps, type SelectOption } from '../components/select'

export type LiteSelectOption = SelectOption

export type LiteSelectProps = Omit<SelectProps, 'motion'>

export const Select = forwardRef<HTMLDivElement, LiteSelectProps>(
  (props, ref) => <StandardSelect ref={ref} motion={0} {...props} />
)
Select.displayName = 'Select'
