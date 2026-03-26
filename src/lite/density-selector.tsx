import { forwardRef, useState, type HTMLAttributes } from 'react'

type DensityValue = 'compact' | 'comfortable' | 'spacious'

export interface LiteDensitySelectorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  value?: DensityValue
  defaultValue?: DensityValue
  onChange?: (value: DensityValue) => void
  size?: 'sm' | 'md'
}

const OPTIONS: DensityValue[] = ['compact', 'comfortable', 'spacious']

export const DensitySelector = forwardRef<HTMLDivElement, LiteDensitySelectorProps>(
  ({ value, defaultValue = 'comfortable', onChange, size = 'md', className, ...rest }, ref) => {
    const [internal, setInternal] = useState<DensityValue>(defaultValue)
    const current = value ?? internal
    return (
      <div ref={ref} role="radiogroup" aria-label="UI density"
        className={`ui-lite-density-selector${className ? ` ${className}` : ''}`} data-size={size} {...rest}>
        {OPTIONS.map((opt) => (
          <button key={opt} type="button" role="radio" aria-checked={opt === current}
            data-active={opt === current || undefined}
            className="ui-lite-density-selector__option"
            onClick={() => { if (value === undefined) setInternal(opt); onChange?.(opt) }}>
            {opt}
          </button>
        ))}
      </div>
    )
  }
)
DensitySelector.displayName = 'DensitySelector'
