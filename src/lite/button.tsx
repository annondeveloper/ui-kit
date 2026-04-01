import { forwardRef } from 'react'
import { Button as StandardButton, type ButtonProps } from '../components/button'

export type LiteButtonProps = Omit<ButtonProps, 'motion'>

export const Button = forwardRef<HTMLButtonElement, LiteButtonProps>(
  (props, ref) => <StandardButton ref={ref} motion={0} {...props} />
)
Button.displayName = 'Button'
