import { forwardRef, type HTMLAttributes } from 'react'

export interface LiteProgressProps extends HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
}

export const Progress = forwardRef<HTMLDivElement, LiteProgressProps>(
  ({ value = 0, max = 100, className, ...rest }, ref) => {
    const percent = Math.min(100, Math.max(0, (value / max) * 100))
    return (
      <div
        ref={ref}
        className={`ui-lite-progress${className ? ` ${className}` : ''}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        {...rest}
      >
        <div className="ui-lite-progress__fill" style={{ width: `${percent}%` }} />
      </div>
    )
  }
)
Progress.displayName = 'Progress'
