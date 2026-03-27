import { forwardRef } from 'react'
import { NumberInput as StandardNumberInput, type NumberInputProps } from '../components/number-input'

export type LiteNumberInputProps = Omit<NumberInputProps, 'motion'>

export const NumberInput = forwardRef<HTMLInputElement, LiteNumberInputProps>(
  (props, ref) => <StandardNumberInput ref={ref} motion={0} {...props} />
)
NumberInput.displayName = 'NumberInput'
