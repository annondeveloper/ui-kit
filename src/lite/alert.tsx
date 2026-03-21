import { forwardRef, type HTMLAttributes } from 'react'

export interface LiteAlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error'
}

export const Alert = forwardRef<HTMLDivElement, LiteAlertProps>(
  ({ variant = 'info', className, role = 'alert', ...rest }, ref) => (
    <div
      ref={ref}
      className={`ui-lite-alert${className ? ` ${className}` : ''}`}
      data-variant={variant}
      role={role}
      {...rest}
    />
  )
)
Alert.displayName = 'Alert'
