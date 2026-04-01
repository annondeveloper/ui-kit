import { forwardRef, useState, type HTMLAttributes } from 'react'

export interface LiteRatingProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: number
  defaultValue?: number
  onChange?: (value: number) => void
  max?: number
  readOnly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const Rating = forwardRef<HTMLDivElement, LiteRatingProps>(
  ({ value: controlledValue, defaultValue = 0, onChange, max = 5, readOnly, size = 'md', className, ...rest }, ref) => {
    const [internal, setInternal] = useState(defaultValue)
    const value = controlledValue ?? internal
    return (
      <div
        ref={ref}
        className={`ui-lite-rating${className ? ` ${className}` : ''}`}
        data-size={size}
        role="radiogroup"
        aria-label="Rating"
        {...rest}
      >
        {Array.from({ length: max }, (_, i) => (
          <button
            key={i}
            type="button"
            className="ui-lite-rating__star"
            data-filled={i < value ? '' : undefined}
            disabled={readOnly}
            aria-label={`${i + 1} star${i === 0 ? '' : 's'}`}
            onClick={() => { const v = i + 1; setInternal(v); onChange?.(v) }}
          >
            {i < value ? '\u2605' : '\u2606'}
          </button>
        ))}
      </div>
    )
  }
)
Rating.displayName = 'Rating'
