import { forwardRef } from 'react'
import { Indicator as StandardIndicator, type IndicatorProps } from '../components/indicator'

export type LiteIndicatorProps = Omit<IndicatorProps, 'motion'>

export const Indicator = forwardRef<HTMLDivElement, LiteIndicatorProps>(
  (props, ref) => <StandardIndicator ref={ref} motion={0} {...props} />
)
Indicator.displayName = 'Indicator'
