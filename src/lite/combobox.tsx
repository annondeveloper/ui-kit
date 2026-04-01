import { forwardRef } from 'react'
import { Combobox as StandardCombobox, type ComboboxProps, type ComboboxOption } from '../components/combobox'

export type LiteComboboxOption = ComboboxOption

export type LiteComboboxProps = Omit<ComboboxProps, 'motion'>

export const Combobox = forwardRef<HTMLDivElement, LiteComboboxProps>(
  (props, ref) => <StandardCombobox ref={ref} motion={0} {...props} />
)
Combobox.displayName = 'Combobox'
