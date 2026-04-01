import { forwardRef } from 'react'
import { SuccessCheckmark as StandardSuccessCheckmark, type SuccessCheckmarkProps } from '../components/success-checkmark'

export type LiteSuccessCheckmarkProps = Omit<SuccessCheckmarkProps, 'motion'>

export const SuccessCheckmark = forwardRef<HTMLDivElement, LiteSuccessCheckmarkProps>(
  (props, ref) => <StandardSuccessCheckmark ref={ref} motion={0} {...props} />
)
SuccessCheckmark.displayName = 'SuccessCheckmark'
