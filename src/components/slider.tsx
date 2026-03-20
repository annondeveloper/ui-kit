'use client'

import {
  forwardRef,
  useState,
  useCallback,
  useMemo,
  type HTMLAttributes,
  type ChangeEvent,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

export interface SliderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  min?: number
  max?: number
  step?: number
  value?: number
  defaultValue?: number
  onChange?: (value: number) => void
  label?: string
  showValue?: boolean
  showTicks?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  motion?: 0 | 1 | 2 | 3
}

const sliderStyles = css`
  @layer components {
    @scope (.ui-slider) {
      :scope {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs, 0.25rem);
        position: relative;
        font-family: inherit;
        inline-size: 100%;
      }

      :scope[data-disabled] {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      /* Header row: label + value */
      .ui-slider__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
      }

      .ui-slider__label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-primary, oklch(90% 0 0));
        line-height: 1.4;
        user-select: none;
      }

      .ui-slider__value {
        font-size: var(--text-sm, 0.875rem);
        font-variant-numeric: tabular-nums;
        color: var(--text-secondary, oklch(70% 0 0));
        line-height: 1;
        user-select: none;
      }

      /* Track container */
      .ui-slider__track-container {
        position: relative;
        display: flex;
        align-items: center;
      }

      /* Native range input — styled with appearance: none */
      .ui-slider__input {
        appearance: none;
        -webkit-appearance: none;
        inline-size: 100%;
        background: transparent;
        cursor: pointer;
        margin: 0;
        outline: none;
        position: relative;
        z-index: 1;
      }

      /* Track styling — sm (2px), md (4px), lg (6px) */
      :scope[data-size="sm"] .ui-slider__input {
        block-size: 2px;
      }
      :scope[data-size="md"] .ui-slider__input {
        block-size: 4px;
      }
      :scope[data-size="lg"] .ui-slider__input {
        block-size: 6px;
      }

      /* WebKit track */
      .ui-slider__input::-webkit-slider-runnable-track {
        border-radius: var(--radius-full, 9999px);
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.12));
      }
      :scope[data-size="sm"] .ui-slider__input::-webkit-slider-runnable-track {
        block-size: 2px;
      }
      :scope[data-size="md"] .ui-slider__input::-webkit-slider-runnable-track {
        block-size: 4px;
      }
      :scope[data-size="lg"] .ui-slider__input::-webkit-slider-runnable-track {
        block-size: 6px;
      }

      /* Firefox track */
      .ui-slider__input::-moz-range-track {
        border-radius: var(--radius-full, 9999px);
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.12));
        background: transparent;
      }
      :scope[data-size="sm"] .ui-slider__input::-moz-range-track {
        block-size: 2px;
      }
      :scope[data-size="md"] .ui-slider__input::-moz-range-track {
        block-size: 4px;
      }
      :scope[data-size="lg"] .ui-slider__input::-moz-range-track {
        block-size: 6px;
      }

      /* WebKit thumb */
      .ui-slider__input::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        inline-size: 18px;
        block-size: 18px;
        border-radius: var(--radius-full, 9999px);
        background: oklch(100% 0 0);
        border: 2px solid var(--brand, oklch(65% 0.2 270));
        box-shadow: var(--shadow-sm, 0 1px 2px oklch(0% 0 0 / 0.1));
        cursor: pointer;
        margin-block-start: -8px;
        transition: box-shadow 0.15s var(--ease-out, ease-out), transform 0.15s var(--ease-out, ease-out);
      }

      .ui-slider__input::-webkit-slider-thumb:hover {
        box-shadow: var(--shadow-md, 0 2px 4px oklch(0% 0 0 / 0.15));
        transform: scale(1.1);
      }

      /* Firefox thumb */
      .ui-slider__input::-moz-range-thumb {
        inline-size: 18px;
        block-size: 18px;
        border-radius: var(--radius-full, 9999px);
        background: oklch(100% 0 0);
        border: 2px solid var(--brand, oklch(65% 0.2 270));
        box-shadow: var(--shadow-sm, 0 1px 2px oklch(0% 0 0 / 0.1));
        cursor: pointer;
        transition: box-shadow 0.15s var(--ease-out, ease-out), transform 0.15s var(--ease-out, ease-out);
      }

      .ui-slider__input::-moz-range-thumb:hover {
        box-shadow: var(--shadow-md, 0 2px 4px oklch(0% 0 0 / 0.15));
        transform: scale(1.1);
      }

      /* Focus visible — glow on thumb */
      .ui-slider__input:focus-visible {
        outline: none;
      }
      .ui-slider__input:focus-visible::-webkit-slider-thumb {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
        box-shadow: var(--shadow-glow, 0 0 0 4px oklch(65% 0.2 270 / 0.15));
      }
      .ui-slider__input:focus-visible::-moz-range-thumb {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
        box-shadow: var(--shadow-glow, 0 0 0 4px oklch(65% 0.2 270 / 0.15));
      }

      /* Disabled thumb */
      .ui-slider__input:disabled::-webkit-slider-thumb {
        cursor: not-allowed;
      }
      .ui-slider__input:disabled::-moz-range-thumb {
        cursor: not-allowed;
      }

      /* Coarse pointer — larger thumb (28px) */
      @media (pointer: coarse) {
        .ui-slider__input::-webkit-slider-thumb {
          inline-size: 28px;
          block-size: 28px;
          margin-block-start: -13px;
        }
        .ui-slider__input::-moz-range-thumb {
          inline-size: 28px;
          block-size: 28px;
        }
        .ui-slider__input {
          min-block-size: 44px;
        }
      }

      /* Tick marks */
      .ui-slider__ticks {
        display: flex;
        justify-content: space-between;
        padding-inline: 9px;
        pointer-events: none;
      }

      .ui-slider__tick {
        inline-size: 1px;
        block-size: 6px;
        background: var(--border-default, oklch(100% 0 0 / 0.2));
        border-radius: 1px;
      }

      /* Motion level 0: no transitions on thumb */
      :scope[data-motion="0"] .ui-slider__input::-webkit-slider-thumb {
        transition: none;
      }
      :scope[data-motion="0"] .ui-slider__input::-moz-range-thumb {
        transition: none;
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-slider__input::-webkit-slider-runnable-track {
          border: 1px solid ButtonText;
          background: ButtonFace;
        }
        .ui-slider__input::-webkit-slider-thumb {
          background: ButtonText;
          border-color: ButtonText;
        }
        .ui-slider__input::-moz-range-track {
          border: 1px solid ButtonText;
          background: ButtonFace;
        }
        .ui-slider__input::-moz-range-thumb {
          background: ButtonText;
          border-color: ButtonText;
        }
        .ui-slider__input:focus-visible::-webkit-slider-thumb {
          outline: 2px solid Highlight;
        }
        .ui-slider__input:focus-visible::-moz-range-thumb {
          outline: 2px solid Highlight;
        }
      }

      /* Print */
      @media print {
        .ui-slider__input::-webkit-slider-thumb {
          box-shadow: none;
          border: 2px solid;
        }
        .ui-slider__input::-moz-range-thumb {
          box-shadow: none;
          border: 2px solid;
        }
      }

      /* Reduced data */
      @media (prefers-reduced-data: reduce) {
        .ui-slider__input::-webkit-slider-thumb {
          box-shadow: none;
        }
        .ui-slider__input::-moz-range-thumb {
          box-shadow: none;
        }
      }
    }
  }
`

export const Slider = forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      min = 0,
      max = 100,
      step = 1,
      value: controlledValue,
      defaultValue,
      onChange,
      label,
      showValue = false,
      showTicks = false,
      disabled = false,
      size = 'md',
      motion: motionProp,
      className,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('slider', sliderStyles)
    const motionLevel = useMotionLevel(motionProp)

    // Internal state for uncontrolled mode
    const [internalValue, setInternalValue] = useState(defaultValue ?? min)
    const isControlled = controlledValue !== undefined
    const currentValue = isControlled ? controlledValue : internalValue

    // Calculate fill percentage for track background
    const fillPct = ((currentValue - min) / (max - min)) * 100

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = Number(e.target.value)
        if (!isControlled) {
          setInternalValue(newValue)
        }
        onChange?.(newValue)
      },
      [isControlled, onChange]
    )

    // Generate tick marks
    const ticks = useMemo(() => {
      if (!showTicks) return null
      const tickCount = Math.floor((max - min) / step) + 1
      // Cap at 101 ticks to prevent rendering thousands
      const count = Math.min(tickCount, 101)
      return Array.from({ length: count }, (_, i) => i)
    }, [showTicks, min, max, step])

    return (
      <div
        ref={ref}
        className={cn(cls('root'), className)}
        data-size={size}
        data-motion={motionLevel}
        {...(disabled ? { 'data-disabled': '' } : {})}
        {...rest}
      >
        {(label || showValue) && (
          <div className="ui-slider__header">
            {label && <span className="ui-slider__label">{label}</span>}
            {showValue && <span className="ui-slider__value">{currentValue}</span>}
          </div>
        )}
        <div className="ui-slider__track-container">
          <input
            type="range"
            className="ui-slider__input"
            min={min}
            max={max}
            step={step}
            value={currentValue}
            disabled={disabled}
            onChange={handleChange}
            aria-label={label || undefined}
            aria-valuenow={currentValue}
            aria-valuemin={min}
            aria-valuemax={max}
            style={{
              background: `linear-gradient(to right, var(--brand, oklch(65% 0.2 270)) 0%, var(--brand, oklch(65% 0.2 270)) ${fillPct}%, var(--bg-surface, oklch(20% 0 0 / 0.3)) ${fillPct}%, var(--bg-surface, oklch(20% 0 0 / 0.3)) 100%)`,
            }}
          />
        </div>
        {ticks && (
          <div className="ui-slider__ticks" aria-hidden="true">
            {ticks.map((_, i) => (
              <span key={i} className="ui-slider__tick" />
            ))}
          </div>
        )}
      </div>
    )
  }
)
Slider.displayName = 'Slider'
