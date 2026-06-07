import { forwardRef, useCallback, useRef, useState, type InputHTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const searchInputStyles = css`
  @layer components {
    @scope (.ui-lite-search-input) {
      :scope {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.5rem 0.75rem;
        background: var(--bg-surface, oklch(12% 0.015 270));
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-md, 10px);
      }
      :scope:focus-within {
        border-color: var(--brand, oklch(65% 0.2 270));
      }
      .ui-lite-search-input__icon {
        font-size: 0.875rem;
        opacity: 0.5;
        flex-shrink: 0;
      }
      :scope input {
        flex: 1;
        min-inline-size: 0;
        background: transparent;
        border: none;
        outline: none;
        color: var(--text-primary, oklch(97% 0 0));
        font-family: inherit;
        font-size: 0.875rem;
      }
      :scope input::-webkit-search-cancel-button { display: none; }
      .ui-lite-search-input__clear {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: none;
        border: none;
        cursor: pointer;
        color: var(--text-secondary, oklch(70% 0 0));
        font-size: 1rem;
        line-height: 1;
        padding: 0;
      }
      .ui-lite-search-input__clear:hover {
        color: var(--text-primary, oklch(97% 0 0));
      }
      .ui-lite-search-input__spinner {
        inline-size: 0.875rem;
        block-size: 0.875rem;
        flex-shrink: 0;
        border-radius: 50%;
        border: 2px solid var(--border-default, oklch(100% 0 0 / 0.12));
        border-block-start-color: var(--brand, oklch(65% 0.2 270));
      }
      :scope[data-size="sm"] { padding: 0.375rem 0.5rem; }
      :scope[data-size="sm"] input { font-size: 0.75rem; }
      :scope[data-size="lg"] { padding: 0.625rem 1rem; }
      :scope[data-size="lg"] input { font-size: 1rem; }
    }
  }
`

export interface LiteSearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'onChange'> {
  size?: 'sm' | 'md' | 'lg'
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  /** Called with the search string; fired on Enter or after debounce */
  onSearch?: (value: string) => void
  /** Called when the clear button is clicked */
  onClear?: () => void
  /** Debounce delay in ms for onSearch (interface; implemented via setTimeout) */
  debounce?: number
  /** Show a loading indicator */
  loading?: boolean
  /** Show a clear (×) button when input has a value */
  clearable?: boolean
}

export const SearchInput = forwardRef<HTMLInputElement, LiteSearchInputProps>(
  ({ size = 'md', value: controlledValue, defaultValue, onChange, onSearch, onClear, debounce: debounceMs, loading, clearable, className, ...rest }, ref) => {
    useStyles('lite-search-input', searchInputStyles)
    const [internalValue, setInternalValue] = useState(defaultValue ?? '')
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const currentValue = controlledValue !== undefined ? controlledValue : internalValue
    const showClear = clearable && currentValue.length > 0

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      if (controlledValue === undefined) setInternalValue(val)
      onChange?.(val)

      if (onSearch) {
        if (debounceMs) {
          if (debounceTimer.current) clearTimeout(debounceTimer.current)
          debounceTimer.current = setTimeout(() => onSearch(val), debounceMs)
        } else {
          onSearch(val)
        }
      }
    }, [controlledValue, onChange, onSearch, debounceMs])

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') onSearch?.(currentValue)
      rest.onKeyDown?.(e)
    }, [currentValue, onSearch, rest.onKeyDown])

    const handleClear = useCallback(() => {
      if (controlledValue === undefined) setInternalValue('')
      onChange?.('')
      onClear?.()
    }, [controlledValue, onChange, onClear])

    return (
      <div className={`ui-lite-search-input${className ? ` ${className}` : ''}`} data-size={size} data-loading={loading ? '' : undefined}>
        <span className="ui-lite-search-input__icon" aria-hidden="true">&#x1F50D;</span>
        <input
          ref={ref}
          type="search"
          value={currentValue}
          aria-label="Search"
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          {...rest}
        />
        {loading && <span className="ui-lite-search-input__spinner" aria-hidden="true" />}
        {showClear && !loading && (
          <button
            type="button"
            className="ui-lite-search-input__clear"
            aria-label="Clear search"
            onClick={handleClear}
          >
            &times;
          </button>
        )}
      </div>
    )
  }
)
SearchInput.displayName = 'SearchInput'
