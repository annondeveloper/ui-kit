import { forwardRef } from 'react'
import { PinInput as StandardPinInput, type PinInputProps } from '../components/pin-input'

export type LitePinInputProps = Omit<PinInputProps, 'motion'>

export const PinInput = forwardRef<HTMLDivElement, LitePinInputProps>(
  (props, ref) => <StandardPinInput ref={ref} motion={0} {...props} />
)
PinInput.displayName = 'PinInput'
