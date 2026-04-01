import { forwardRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteRatingProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: number
  defaultValue?: number
  onChange?: (value: number) => void
  max?: number
  readOnly?: boolean
  size?: 'sm' | 'md' | 'lg'
  /** Custom filled-star renderer */
  icon?: (index: number) => ReactNode
  /** Custom empty-star renderer */
  emptyIcon?: (index: number) => ReactNode
  /** Star color (CSS color value) */
  color?: string
  /** Allow selecting half-star values */
  allowHalf?: boolean
}

export const Rating = forwardRef<HTMLDivElement, LiteRatingProps>(
  ({ value: controlledValue, defaultValue = 0, onChange, max = 5, readOnly, size = 'md', icon, emptyIcon, color, allowHalf, className, style, ...rest }, ref) => {
    const [internal, setInternal] = useState(defaultValue)
    const value = controlledValue ?? internal

    const computedStyle: CSSProperties = color ? { ...style, color } : { ...style }

    return (
      <div
        ref={ref}
        className={`ui-lite-rating${className ? ` ${className}` : ''}`}
        data-size={size}
        data-allow-half={allowHalf ? '' : undefined}
        role="radiogroup"
        aria-label="Rating"
        style={computedStyle}
        {...rest}
      >
        {Array.from({ length: max }, (_, i) => {
          const filled = i < value
          return (
            <button
              key={i}
              type="button"
              className="ui-lite-rating__star"
              data-filled={filled ? '' : undefined}
              disabled={readOnly}
              aria-label={`${i + 1} star${i === 0 ? '' : 's'}`}
              onClick={() => {
                const v = i + 1
                setInternal(v)
                onChange?.(v)
              }}
            >
              {filled
                ? (icon ? icon(i) : '\u2605')
                : (emptyIcon ? emptyIcon(i) : '\u2606')}
            </button>
          )
        })}
      </div>
    )
  }
)
Rating.displayName = 'Rating'
