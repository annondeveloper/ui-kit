import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const sliderStyles = css`
  @layer components {
    @scope (.ui-lite-slider) {
      :scope {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs, 0.25rem);
        inline-size: 100%;
        font-family: inherit;
      }

      :scope[data-disabled] {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      .ui-lite-slider__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
      }

      label {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 500;
        color: var(--text-secondary, oklch(70% 0 0));
        line-height: 1.4;
        white-space: nowrap;
        user-select: none;
      }

      output {
        font-size: var(--text-sm, 0.875rem);
        font-variant-numeric: tabular-nums;
        min-inline-size: 2.5em;
        text-align: end;
        color: var(--text-secondary, oklch(70% 0 0));
        line-height: 1;
        user-select: none;
      }

      input[type="range"] {
        inline-size: 100%;
        accent-color: var(--brand, oklch(65% 0.2 270));
        cursor: pointer;
        margin: 0;
      }

      :scope[data-size="xs"] input[type="range"] { block-size: 1rem; }
      :scope[data-size="sm"] input[type="range"] { block-size: 1.125rem; }
      :scope[data-size="lg"] input[type="range"] { block-size: 1.5rem; }
      :scope[data-size="xl"] input[type="range"] { block-size: 1.75rem; }

      input[type="range"]:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
        border-radius: var(--radius-sm, 0.25rem);
      }

      @media (forced-colors: active) {
        input[type="range"] {
          accent-color: Highlight;
        }
      }
    }
  }
`

export interface LiteSliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: ReactNode
  showValue?: boolean
  showTicks?: boolean
  min?: number
  max?: number
  step?: number
  value?: number | string
  defaultValue?: number | string
  disabled?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

export const Slider = forwardRef<HTMLInputElement, LiteSliderProps>(
  (
    {
      label,
      showValue,
      showTicks,
      min = 0,
      max = 100,
      step = 1,
      value,
      defaultValue,
      disabled,
      size = 'md',
      className,
      onChange,
      ...rest
    },
    ref
  ) => {
    useStyles('lite-slider', sliderStyles)
    return (
      <div
        className={`ui-lite-slider${className ? ` ${className}` : ''}`}
        data-size={size}
        {...(disabled ? { 'data-disabled': '' } : {})}
      >
        {(label || showValue) && (
          <div className="ui-lite-slider__header" style={{ display: 'flex', justifyContent: 'space-between' }}>
            {label && <label>{label}</label>}
            {showValue && <output>{value ?? defaultValue ?? min}</output>}
          </div>
        )}
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          onChange={onChange}
          aria-label={typeof label === 'string' ? label : undefined}
          aria-valuemin={min}
          aria-valuemax={max}
          {...rest}
        />
      </div>
    )
  }
)
Slider.displayName = 'Slider'
