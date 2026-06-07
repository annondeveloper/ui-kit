import { forwardRef, useState, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const radioGroupStyles = css`
  @layer components {
    @scope (.ui-lite-radio-group) {
      :scope {
        border: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      :scope[data-orientation="horizontal"] {
        flex-direction: row;
        flex-wrap: wrap;
      }
      legend {
        font-size: 0.8125rem;
        font-weight: 500;
        color: var(--text-secondary, oklch(70% 0 0));
        margin-block-end: 0.25rem;
        padding: 0;
      }
      .ui-lite-radio-group__option {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        font-size: 0.875rem;
        color: var(--text-primary, oklch(97% 0 0));
      }
      .ui-lite-radio-group__option input[type="radio"] {
        inline-size: 18px;
        block-size: 18px;
        accent-color: var(--brand, oklch(65% 0.2 270));
        cursor: pointer;
      }
      .ui-lite-radio-group__option input[type="radio"]:disabled {
        cursor: not-allowed;
      }
      :scope[data-size="sm"] .ui-lite-radio-group__option { font-size: 0.75rem; }
      :scope[data-size="lg"] .ui-lite-radio-group__option { font-size: 1rem; }
      .ui-lite-radio-group__error {
        font-size: 0.75rem;
        color: oklch(62% 0.22 25);
      }
      @media (forced-colors: active) {
        .ui-lite-radio-group__option input[type="radio"] { forced-color-adjust: auto; }
      }
    }
  }
`

export interface LiteRadioOption {
  value: string
  label: ReactNode
  disabled?: boolean
}

export interface LiteRadioGroupProps extends Omit<HTMLAttributes<HTMLFieldSetElement>, 'onChange'> {
  name: string
  /** Legend rendered as <legend>; alias: label */
  legend?: ReactNode
  /** Alias for legend */
  label?: ReactNode
  options: LiteRadioOption[]
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  orientation?: 'horizontal' | 'vertical'
  error?: string
  size?: 'sm' | 'md' | 'lg'
}

export const RadioGroup = forwardRef<HTMLFieldSetElement, LiteRadioGroupProps>(
  ({ name, legend, label, options, value: controlledValue, defaultValue, onChange, orientation = 'vertical', error, size, className, ...rest }, ref) => {
    useStyles('lite-radio-group', radioGroupStyles)
    const [internal, setInternal] = useState(defaultValue ?? '')
    const value = controlledValue !== undefined ? controlledValue : internal

    const handleChange = (v: string) => {
      if (controlledValue === undefined) setInternal(v)
      onChange?.(v)
    }

    return (
      <fieldset
        ref={ref}
        className={`ui-lite-radio-group${className ? ` ${className}` : ''}`}
        data-orientation={orientation}
        data-size={size}
        aria-invalid={!!error}
        {...rest}
      >
        {(legend ?? label) && <legend>{legend ?? label}</legend>}
        {options.map(opt => (
          <label key={opt.value} className="ui-lite-radio-group__option">
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              disabled={opt.disabled}
              onChange={() => handleChange(opt.value)}
            />
            <span>{opt.label}</span>
          </label>
        ))}
        {error && <span className="ui-lite-radio-group__error">{error}</span>}
      </fieldset>
    )
  }
)
RadioGroup.displayName = 'RadioGroup'
