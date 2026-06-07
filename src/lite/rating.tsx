import { forwardRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const ratingStyles = css`
  @layer components {
    @scope (.ui-lite-rating) {
      :scope {
        display: inline-flex;
        gap: 0.125rem;
      }
      .ui-lite-rating__star {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.125rem;
        color: var(--text-secondary, oklch(70% 0 0));
        font-size: 1.25rem;
        line-height: 1;
      }
      .ui-lite-rating__star[data-filled] {
        color: oklch(78% 0.17 85);
      }
      .ui-lite-rating__star:disabled {
        cursor: default;
      }
      .ui-lite-rating__star:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 1px;
        border-radius: var(--radius-sm, 6px);
      }
      :scope[data-size="sm"] .ui-lite-rating__star { font-size: 1rem; }
      :scope[data-size="lg"] .ui-lite-rating__star { font-size: 1.75rem; }
    }
  }
`

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
    useStyles('lite-rating', ratingStyles)
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
