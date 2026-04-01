import { forwardRef } from 'react'
import { RadioGroup as StandardRadioGroup, type RadioGroupProps, type RadioOption } from '../components/radio-group'

export type LiteRadioOption = RadioOption

export type LiteRadioGroupProps = Omit<RadioGroupProps, 'motion'>

export const RadioGroup = forwardRef<HTMLFieldSetElement, LiteRadioGroupProps>(
  (props, ref) => <StandardRadioGroup ref={ref} motion={0} {...props} />
)
RadioGroup.displayName = 'RadioGroup'
