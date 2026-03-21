import { forwardRef, type HTMLAttributes } from 'react'

export interface LiteDividerProps extends HTMLAttributes<HTMLHRElement> {}

export const Divider = forwardRef<HTMLHRElement, LiteDividerProps>(
  ({ className, ...rest }, ref) => (
    <hr
      ref={ref}
      className={`ui-lite-divider${className ? ` ${className}` : ''}`}
      {...rest}
    />
  )
)
Divider.displayName = 'Divider'
