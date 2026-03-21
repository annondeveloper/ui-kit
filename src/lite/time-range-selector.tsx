import { forwardRef, type HTMLAttributes } from 'react'

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
  ({ presets = [], value, onChange, className, ...rest }, ref) => (
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
)
TimeRangeSelector.displayName = 'TimeRangeSelector'
