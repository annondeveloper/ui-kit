import { forwardRef, type HTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const timeRangeSelectorStyles = css`
  @layer components {
    @scope (.ui-lite-time-range-selector) {
      :scope {
        display: flex;
        gap: 0.25rem;
      }
      .ui-lite-time-range-selector__btn {
        padding-block: 0.25rem;
        padding-inline: 0.625rem;
        background: none;
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-sm, 6px);
        font-family: inherit;
        font-size: 0.75rem;
        cursor: pointer;
        color: var(--text-secondary, oklch(70% 0 0));
      }
      .ui-lite-time-range-selector__btn:hover {
        background: oklch(100% 0 0 / 0.04);
      }
      .ui-lite-time-range-selector__btn[data-active] {
        background: var(--brand, oklch(65% 0.2 270));
        color: oklch(100% 0 0);
        border-color: transparent;
      }
      .ui-lite-time-range-selector__btn:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }
    }
  }
`

export interface LiteTimeRangePreset {
  label: string
  value: string
}

export interface LiteTimeRangeSelectorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  presets?: LiteTimeRangePreset[]
  value?: string
  onChange?: (value: string) => void
}

export const TimeRangeSelector = forwardRef<HTMLDivElement, LiteTimeRangeSelectorProps>(
  ({ presets = [], value, onChange, className, ...rest }, ref) => {
    useStyles('lite-time-range-selector', timeRangeSelectorStyles)
    return (
      <div ref={ref} className={`ui-lite-time-range-selector${className ? ` ${className}` : ''}`} role="radiogroup" {...rest}>
        {presets.map(preset => (
          <button
            key={preset.value}
            type="button"
            className="ui-lite-time-range-selector__btn"
            data-active={value === preset.value ? '' : undefined}
            onClick={() => onChange?.(preset.value)}
          >
            {preset.label}
          </button>
        ))}
      </div>
    )
  }
)
TimeRangeSelector.displayName = 'TimeRangeSelector'
