import { forwardRef, type ButtonHTMLAttributes } from 'react'

export interface LiteButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

export const Button = forwardRef<HTMLButtonElement, LiteButtonProps>(
  ({ variant = 'primary', size = 'md', className, ...rest }, ref) => (
    <button
      ref={ref}
      className={`ui-lite-button${className ? ` ${className}` : ''}`}
      data-variant={variant}
      data-size={size}
      {...rest}
    />
  )
)
Button.displayName = 'Button'
