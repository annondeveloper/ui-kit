import { forwardRef } from 'react'
import { ButtonGroup as StandardButtonGroup, type ButtonGroupProps } from '../components/button-group'

export type LiteButtonGroupProps = Omit<ButtonGroupProps, 'motion'>

export const ButtonGroup = forwardRef<HTMLDivElement, LiteButtonGroupProps>(
  (props, ref) => <StandardButtonGroup ref={ref} motion={0} {...props} />
)
ButtonGroup.displayName = 'ButtonGroup'
