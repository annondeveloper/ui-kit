import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

export interface LiteColorInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: ReactNode
  /** Controlled color value (hex string) */
  value?: string
  /** Uncontrolled initial value */
  defaultValue?: string
  /** Called with the new hex value */
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  /** Preset color swatches (hex strings) */
  swatches?: string[]
  /** Show text hex input alongside the color picker */
  showInput?: boolean
}

export const ColorInput = forwardRef<HTMLInputElement, LiteColorInputProps>(
  ({ label, value, defaultValue, onChange, disabled, size, swatches, showInput, className, ...rest }, ref) => (
    <div className={`ui-lite-color-input${className ? ` ${className}` : ''}`} data-size={size} data-disabled={disabled ? '' : undefined}>
      {label && <label>{label}</label>}
      <div className="ui-lite-color-input__row">
        <input
          ref={ref}
          type="color"
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          onChange={onChange}
          {...rest}
        />
        {showInput && (
          <input
            type="text"
            className="ui-lite-color-input__text"
            value={value ?? defaultValue ?? ''}
            disabled={disabled}
            readOnly={!onChange}
            onChange={onChange}
            aria-label="Hex color value"
          />
        )}
      </div>
      {swatches && swatches.length > 0 && (
        <div className="ui-lite-color-input__swatches" aria-label="Color swatches">
          {swatches.map(swatch => (
            <button
              key={swatch}
              type="button"
              className="ui-lite-color-input__swatch"
              style={{ background: swatch }}
              aria-label={swatch}
              disabled={disabled}
              onClick={() => {
                if (onChange) {
                  const syntheticEvent = { target: { value: swatch } } as React.ChangeEvent<HTMLInputElement>
                  onChange(syntheticEvent)
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
)
ColorInput.displayName = 'ColorInput'
