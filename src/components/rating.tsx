'use client'

import {
  forwardRef,
  useState,
  useCallback,
  type HTMLAttributes,
  type ReactNode,
  type KeyboardEvent,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

export interface RatingProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: number
  defaultValue?: number
  onChange?: (value: number) => void
  max?: number
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  readOnly?: boolean
  allowHalf?: boolean
  icon?: ReactNode
  emptyIcon?: ReactNode
  color?: string
  motion?: 0 | 1 | 2 | 3
}

// ─── Star SVGs ──────────────────────────────────────────────────────────────

const StarFull = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" aria-hidden="true">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

const StarEmpty = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

const StarHalf = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <defs>
      <clipPath id="star-half-clip">
        <rect x="0" y="0" width="12" height="24" />
      </clipPath>
    </defs>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor" clipPath="url(#star-half-clip)" />
  </svg>
)

// ─── Styles ─────────────────────────────────────────────────────────────────

const ratingStyles = css`
  @layer components {
    @scope (.ui-rating) {
      :scope {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2xs, 0.125rem);
        font-family: inherit;
        outline: none;
      }

      :scope:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 4px;
        border-radius: var(--radius-sm, 0.25rem);
      }

      /* Star sizing */
      .ui-rating__star {
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.15s var(--ease-out, ease-out);
        color: var(--text-tertiary, oklch(50% 0 0));
      }

      .ui-rating__star svg {
        inline-size: 1.5rem;
        block-size: 1.5rem;
      }

      /* Sizes */
      :scope[data-size="xs"] .ui-rating__star svg {
        inline-size: 0.75rem;
        block-size: 0.75rem;
      }
      :scope[data-size="sm"] .ui-rating__star svg {
        inline-size: 1rem;
        block-size: 1rem;
      }
      :scope[data-size="lg"] .ui-rating__star svg {
        inline-size: 2rem;
        block-size: 2rem;
      }
      :scope[data-size="xl"] .ui-rating__star svg {
        inline-size: 2.5rem;
        block-size: 2.5rem;
      }

      /* Filled state */
      .ui-rating__star[data-state="full"],
      .ui-rating__star[data-state="half"] {
        color: var(--status-warning, oklch(75% 0.15 80));
      }

      /* Hover state */
      .ui-rating__star[data-hover="true"] {
        color: var(--status-warning, oklch(75% 0.15 80));
        opacity: 0.8;
      }

      /* ReadOnly */
      :scope[data-readonly="true"] .ui-rating__star {
        cursor: default;
      }

      /* Scale on click — motion 2+ */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-rating__star:active:not(:scope[data-readonly="true"] *) {
        transform: scale(1.2);
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-rating__star {
          color: ButtonText;
        }
        .ui-rating__star[data-state="full"],
        .ui-rating__star[data-state="half"] {
          color: Highlight;
        }
        :scope:focus-visible {
          outline: 2px solid Highlight;
        }
      }

      /* Print */
      @media print {
        .ui-rating__star[data-state="full"] svg,
        .ui-rating__star[data-state="half"] svg {
          fill: currentColor;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export const Rating = forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      value: valueProp,
      defaultValue = 0,
      onChange,
      max = 5,
      size = 'md',
      readOnly = false,
      allowHalf = false,
      icon,
      emptyIcon,
      color,
      motion: motionProp,
      className,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('rating', ratingStyles)
    const motionLevel = useMotionLevel(motionProp)

    const isControlled = valueProp !== undefined
    const [internalValue, setInternalValue] = useState(defaultValue)
    const currentValue = isControlled ? valueProp : internalValue
    const [hoverIndex, setHoverIndex] = useState<number | null>(null)

    const step = allowHalf ? 0.5 : 1

    const setValue = useCallback(
      (newValue: number) => {
        if (readOnly) return
        if (!isControlled) {
          setInternalValue(newValue)
        }
        onChange?.(newValue)
      },
      [readOnly, isControlled, onChange]
    )

    const handleStarClick = useCallback(
      (index: number) => {
        if (readOnly) return
        setValue(index + 1)
      },
      [readOnly, setValue]
    )

    const handleMouseEnter = useCallback(
      (index: number) => {
        if (readOnly) return
        setHoverIndex(index)
      },
      [readOnly]
    )

    const handleMouseLeave = useCallback(() => {
      setHoverIndex(null)
    }, [])

    const handleKeyDown = useCallback(
      (e: KeyboardEvent) => {
        if (readOnly) return
        let newValue = currentValue

        switch (e.key) {
          case 'ArrowRight':
          case 'ArrowUp':
            newValue = currentValue + step
            break
          case 'ArrowLeft':
          case 'ArrowDown':
            newValue = currentValue - step
            break
          case 'Home':
            newValue = 0
            break
          case 'End':
            newValue = max
            break
          default:
            return
        }

        e.preventDefault()
        if (newValue < 0 || newValue > max) return
        setValue(newValue)
      },
      [readOnly, currentValue, step, max, setValue]
    )

    const getStarState = (index: number): 'full' | 'half' | 'empty' => {
      const val = currentValue
      if (index + 1 <= val) return 'full'
      if (allowHalf && index + 0.5 <= val && index + 1 > val) return 'half'
      return 'empty'
    }

    const renderStar = (state: 'full' | 'half' | 'empty') => {
      if (state === 'full') return icon || <StarFull />
      if (state === 'half') return <StarHalf />
      return emptyIcon || <StarEmpty />
    }

    return (
      <div
        ref={ref}
        className={cn(cls('root'), className)}
        data-size={size}
        data-motion={motionLevel}
        data-readonly={readOnly || undefined}
        role="slider"
        tabIndex={readOnly ? -1 : 0}
        aria-valuenow={currentValue}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-readonly={readOnly || undefined}
        onKeyDown={handleKeyDown}
        onMouseLeave={handleMouseLeave}
        {...(color ? { style: { '--rating-color': color, ...((rest as any).style || {}) } as any } : {})}
        {...rest}
      >
        {Array.from({ length: max }, (_, i) => {
          const state = getStarState(i)
          const isHovered = hoverIndex !== null && i <= hoverIndex
          return (
            <span
              key={i}
              className="ui-rating__star"
              data-state={state}
              {...(isHovered && !readOnly ? { 'data-hover': 'true' } : {})}
              onClick={() => handleStarClick(i)}
              onMouseEnter={() => handleMouseEnter(i)}
              role="presentation"
            >
              {renderStar(state)}
            </span>
          )
        })}
      </div>
    )
  }
)
Rating.displayName = 'Rating'
