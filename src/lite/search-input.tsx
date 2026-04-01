import { forwardRef, useCallback, useRef, useState, type InputHTMLAttributes, type ReactNode } from 'react'

export interface LiteSearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  size?: 'sm' | 'md' | 'lg'
  value?: string
  defaultValue?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
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
    const [internalValue, setInternalValue] = useState(defaultValue ?? '')
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const currentValue = controlledValue !== undefined ? controlledValue : internalValue
    const showClear = clearable && currentValue.length > 0

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      if (controlledValue === undefined) setInternalValue(val)
      onChange?.(e)

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
      onClear?.()
    }, [controlledValue, onClear])

    return (
      <div className={`ui-lite-search-input${className ? ` ${className}` : ''}`} data-size={size} data-loading={loading ? '' : undefined}>
        <span className="ui-lite-search-input__icon" aria-hidden="true">&#x1F50D;</span>
        <input
          ref={ref}
          type="search"
          value={currentValue}
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
