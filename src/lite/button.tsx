import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

export interface ButtonShortcuts {
  activate?: string
}

export interface LiteButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'link'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  loadingText?: string
  icon?: ReactNode
  iconEnd?: ReactNode
  fullWidth?: boolean
  iconOnly?: boolean
  /** Accepted for API parity but ignored in Lite */
  haptics?: boolean | string
  /** Accepted for API parity but ignored in Lite */
  shortcuts?: ButtonShortcuts
  /** Accepted for API parity but ignored in Lite */
  classNames?: Partial<Record<'root' | 'icon' | 'iconEnd', string>>
}

export const Button = forwardRef<HTMLButtonElement, LiteButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      loadingText,
      icon,
      iconEnd,
      fullWidth,
      iconOnly,
      haptics: _haptics,
      shortcuts: _shortcuts,
      classNames: _classNames,
      disabled,
      children,
      className,
      ...rest
    },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`ui-lite-button${className ? ` ${className}` : ''}`}
      data-variant={variant}
      data-size={size}
      data-loading={loading || undefined}
      data-full-width={fullWidth || undefined}
      data-icon-only={iconOnly || undefined}
      aria-busy={loading || undefined}
      {...rest}
    >
      {icon && <span className="ui-lite-button__icon">{icon}</span>}
      {loading && loadingText ? loadingText : children}
      {iconEnd && <span className="ui-lite-button__icon-end">{iconEnd}</span>}
    </button>
  )
)
Button.displayName = 'Button'
