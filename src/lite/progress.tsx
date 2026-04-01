import { forwardRef, type HTMLAttributes } from 'react'

export interface LiteProgressProps extends HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'success' | 'warning' | 'danger'
  label?: string
  showValue?: boolean
}

export const Progress = forwardRef<HTMLDivElement, LiteProgressProps>(
  ({ value, max = 100, size = 'md', variant = 'default', label, showValue = false, className, ...rest }, ref) => {
    const isIndeterminate = value === undefined
    const clampedValue = isIndeterminate ? undefined : Math.min(Math.max(0, value), max)
    const percent = isIndeterminate ? undefined : Math.round((clampedValue! / max) * 100)

    return (
      <div
        ref={ref}
        className={`ui-lite-progress${className ? ` ${className}` : ''}`}
        role="progressbar"
        aria-label={label}
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={max}
        data-size={size}
        data-variant={variant}
        {...(isIndeterminate ? { 'data-indeterminate': '' } : {})}
        {...rest}
      >
        <div className="ui-lite-progress__fill" style={!isIndeterminate ? { width: `${percent}%` } : undefined} />
        {showValue && !isIndeterminate && (
          <span className="ui-lite-progress__value">{percent}%</span>
        )}
      </div>
    )
  }
)
Progress.displayName = 'Progress'
