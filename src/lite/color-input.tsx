import { forwardRef } from 'react'
import { ColorInput as StandardColorInput, type ColorInputProps } from '../components/color-input'

export type LiteColorInputProps = Omit<ColorInputProps, 'motion'>

export const ColorInput = forwardRef<HTMLDivElement, LiteColorInputProps>(
  (props, ref) => <StandardColorInput ref={ref} motion={0} {...props} />
)
ColorInput.displayName = 'ColorInput'
