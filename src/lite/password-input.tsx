import { forwardRef } from 'react'
import { PasswordInput as StandardPasswordInput, type PasswordInputProps } from '../components/password-input'

export type LitePasswordInputProps = Omit<PasswordInputProps, 'motion'>

export const PasswordInput = forwardRef<HTMLInputElement, LitePasswordInputProps>(
  (props, ref) => <StandardPasswordInput ref={ref} motion={0} {...props} />
)
PasswordInput.displayName = 'PasswordInput'
