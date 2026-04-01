import { forwardRef } from 'react'
import { Divider as StandardDivider, type DividerProps } from '../components/divider'

export type LiteDividerProps = DividerProps

export const Divider = forwardRef<HTMLHRElement, LiteDividerProps>(
  (props, ref) => <StandardDivider ref={ref} {...props} />
)
Divider.displayName = 'Divider'
