import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

export interface LiteSliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: ReactNode
  showValue?: boolean
}

export const Slider = forwardRef<HTMLInputElement, LiteSliderProps>(
  ({ label, showValue, className, value, defaultValue, ...rest }, ref) => (
    <div className={`ui-lite-slider${className ? ` ${className}` : ''}`}>
      {label && <label>{label}</label>}
      <input ref={ref} type="range" value={value} defaultValue={defaultValue} {...rest} />
      {showValue && <output>{value ?? defaultValue ?? 50}</output>}
    </div>
  )
)
Slider.displayName = 'Slider'
