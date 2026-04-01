import { forwardRef } from 'react'
import { OtpInput as StandardOtpInput, type OtpInputProps } from '../components/otp-input'

export type LiteOtpInputProps = Omit<OtpInputProps, 'motion'>

export const OtpInput = forwardRef<HTMLDivElement, LiteOtpInputProps>(
  (props, ref) => <StandardOtpInput ref={ref} motion={0} {...props} />
)
OtpInput.displayName = 'OtpInput'
