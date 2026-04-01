import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

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
  ) => (
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
)
Slider.displayName = 'Slider'
