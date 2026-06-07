import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const colorInputStyles = css`
  @layer components {
    @scope (.ui-lite-color-input) {
      :scope {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs, 0.25rem);
      }
      label {
        font-size: var(--text-sm, 0.8125rem);
        font-weight: 500;
        color: var(--text-secondary, oklch(70% 0 0));
      }
      .ui-lite-color-input__row {
        display: flex;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
      }
      input[type="color"] {
        inline-size: 36px;
        block-size: 36px;
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-md, 0.5rem);
        cursor: pointer;
        padding: 2px;
        background: var(--bg-surface, oklch(12% 0.015 270));
      }
      .ui-lite-color-input__text {
        flex: 1;
        min-inline-size: 0;
        padding: 0.375rem 0.5rem;
        background: var(--bg-surface, oklch(12% 0.015 270));
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-md, 0.5rem);
        color: var(--text-primary, oklch(97% 0 0));
        font-family: inherit;
        font-size: var(--text-sm, 0.875rem);
      }
      .ui-lite-color-input__text:focus {
        outline: none;
        border-color: var(--brand, oklch(65% 0.2 270));
      }
      .ui-lite-color-input__swatches {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-xs, 0.25rem);
      }
      .ui-lite-color-input__swatch {
        appearance: none;
        border: 2px solid var(--border-default, oklch(100% 0 0 / 0.12));
        border-radius: var(--radius-sm, 0.25rem);
        inline-size: 24px;
        block-size: 24px;
        cursor: pointer;
        padding: 0;
        outline: none;
      }
      .ui-lite-color-input__swatch:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }
      .ui-lite-color-input__swatch:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      :scope[data-size="sm"] input[type="color"] { inline-size: 28px; block-size: 28px; }
      :scope[data-size="lg"] input[type="color"] { inline-size: 44px; block-size: 44px; }
      :scope[data-disabled] {
        opacity: 0.5;
        pointer-events: none;
      }
      @media (forced-colors: active) {
        input[type="color"],
        .ui-lite-color-input__swatch { border: 1px solid ButtonText; }
      }
    }
  }
`

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
  ({ label, value, defaultValue, onChange, disabled, size, swatches, showInput, className, ...rest }, ref) => {
    useStyles('lite-color-input', colorInputStyles)
    return (
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
  }
)
ColorInput.displayName = 'ColorInput'
