import { forwardRef } from 'react'
import { FormInput as StandardFormInput, type FormInputProps } from '../components/form-input'

export type LiteFormInputProps = Omit<FormInputProps, 'motion'>

export const FormInput = forwardRef<HTMLInputElement, LiteFormInputProps>(
  (props, ref) => <StandardFormInput ref={ref} motion={0} {...props} />
)
FormInput.displayName = 'FormInput'
