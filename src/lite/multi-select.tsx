import { forwardRef } from 'react'
import { MultiSelect as StandardMultiSelect, type MultiSelectProps, type MultiSelectOption } from '../components/multi-select'

export type { MultiSelectOption as LiteMultiSelectOption }
export type LiteMultiSelectProps = Omit<MultiSelectProps, 'motion'>

export const MultiSelect = forwardRef<HTMLDivElement, LiteMultiSelectProps>(
  (props, ref) => <StandardMultiSelect ref={ref} motion={0} {...props} />
)
MultiSelect.displayName = 'MultiSelect'
