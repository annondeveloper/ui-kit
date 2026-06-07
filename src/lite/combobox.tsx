import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const comboboxStyles = css`
  @layer components {
    @scope (.ui-lite-select) {
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
      select {
        padding: 0.5rem 0.75rem;
        background: var(--bg-surface, oklch(12% 0.015 270));
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-md, 0.5rem);
        color: var(--text-primary, oklch(97% 0 0));
        font-family: inherit;
        font-size: var(--text-sm, 0.875rem);
        cursor: pointer;
      }
      select:focus {
        outline: none;
        border-color: var(--brand, oklch(65% 0.2 270));
      }
      select:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      select[aria-invalid="true"] {
        border-color: var(--status-critical, oklch(62% 0.22 25));
      }
      :scope[data-size="sm"] select { padding: 0.375rem 0.5rem; font-size: var(--text-xs, 0.75rem); }
      :scope[data-size="lg"] select { padding: 0.625rem 1rem; font-size: var(--text-base, 1rem); }
      .ui-lite-select__error {
        font-size: var(--text-xs, 0.75rem);
        color: var(--status-critical, oklch(62% 0.22 25));
      }
      @media (forced-colors: active) {
        select { border: 1px solid ButtonText; }
      }
    }
  }
`

export interface LiteComboboxOption {
  value: string
  label: string
  disabled?: boolean
}

export interface LiteComboboxProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'onChange'> {
  label?: ReactNode
  options: LiteComboboxOption[]
  error?: string
  placeholder?: string
  /** Controlled value */
  value?: string
  /** Uncontrolled default value */
  defaultValue?: string
  disabled?: boolean
  /** data-size attribute on wrapper */
  size?: 'sm' | 'md' | 'lg'
  /** Called with the selected value string */
  onChange?: (value: string) => void
  /** Interface only — not possible with native select */
  onSearch?: (query: string) => void
  /** Interface only — not possible with native select */
  allowCreate?: boolean
  /** Interface only — called when a new option is created */
  onCreate?: (value: string) => void
  /** Interface only — show loading state */
  loading?: boolean
  /** Interface only — message shown when no options match */
  emptyMessage?: ReactNode
}

/** Lite combobox — falls back to a native select (no search/filter) */
export const Combobox = forwardRef<HTMLSelectElement, LiteComboboxProps>(
  (
    {
      label,
      options,
      error,
      placeholder,
      className,
      id,
      name,
      value,
      defaultValue,
      disabled,
      size = 'md',
      onChange,
      // destructure interface-only props so they don't land on <select>
      onSearch: _onSearch,
      allowCreate: _allowCreate,
      onCreate: _onCreate,
      loading: _loading,
      emptyMessage: _emptyMessage,
      ...rest
    },
    ref,
  ) => {
    useStyles('lite-select', comboboxStyles)
    const selectId = id ?? (name ? `lite-combobox-${name}` : undefined)
    return (
      <div className={`ui-lite-select${className ? ` ${className}` : ''}`} data-size={size}>
        {label && <label htmlFor={selectId}>{label}</label>}
        <select
          ref={ref}
          id={selectId}
          name={name}
          aria-invalid={!!error}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          onChange={onChange ? e => onChange(e.target.value) : undefined}
          {...rest}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map(o => (
            <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>
          ))}
        </select>
        {error && <span className="ui-lite-select__error">{error}</span>}
      </div>
    )
  },
)
Combobox.displayName = 'Combobox'
