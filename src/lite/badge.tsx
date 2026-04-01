import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'xs' | 'sm' | 'md'
  dot?: boolean
  pulse?: boolean
  count?: number
  maxCount?: number
  icon?: ReactNode
  removable?: boolean
  onRemove?: () => void
  outline?: boolean
}

export const Badge = forwardRef<HTMLSpanElement, LiteBadgeProps>(
  (
    {
      variant = 'default',
      size = 'sm',
      dot = false,
      pulse = false,
      count,
      maxCount = 99,
      icon,
      removable = false,
      onRemove,
      outline = false,
      children,
      className,
      ...rest
    },
    ref
  ) => {
    const displayCount =
      count !== undefined
        ? count > maxCount
          ? `${maxCount}+`
          : String(count)
        : null

    return (
      <span
        ref={ref}
        className={`ui-lite-badge${className ? ` ${className}` : ''}`}
        data-variant={variant}
        data-size={size}
        data-outline={outline || undefined}
        data-pulse={pulse || undefined}
        {...rest}
      >
        {icon && <span className="ui-lite-badge__icon">{icon}</span>}
        {dot && <span className="ui-lite-badge__dot" />}
        {displayCount ?? children}
        {removable && (
          <button
            type="button"
            className="ui-lite-badge__remove"
            onClick={onRemove}
            aria-label="Remove"
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path
                d="M1.5 1.5l5 5m0-5l-5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </span>
    )
  }
)
Badge.displayName = 'Badge'
