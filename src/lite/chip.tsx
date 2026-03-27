import { forwardRef } from 'react'
import { Chip as StandardChip, type ChipProps } from '../components/chip'

export type LiteChipProps = Omit<ChipProps, 'motion'>

export const Chip = forwardRef<HTMLLabelElement, LiteChipProps>(
  (props, ref) => <StandardChip ref={ref} motion={0} {...props} />
)
Chip.displayName = 'Chip'
