import { forwardRef } from 'react'
import { FilterPill as StandardFilterPill, type FilterPillProps } from '../components/filter-pill'

export type LiteFilterPillProps = Omit<FilterPillProps, 'motion'>

export const FilterPill = forwardRef<HTMLButtonElement, LiteFilterPillProps>(
  (props, ref) => <StandardFilterPill ref={ref} motion={0} {...props} />
)
FilterPill.displayName = 'FilterPill'
