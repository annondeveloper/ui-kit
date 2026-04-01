import { forwardRef } from 'react'
import { Checkbox as StandardCheckbox, type CheckboxProps } from '../components/checkbox'

export type LiteCheckboxProps = Omit<CheckboxProps, 'motion'>

export const Checkbox = forwardRef<HTMLInputElement, LiteCheckboxProps>(
  (props, ref) => <StandardCheckbox ref={ref} motion={0} {...props} />
)
Checkbox.displayName = 'Checkbox'
