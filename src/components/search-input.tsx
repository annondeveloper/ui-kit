'use client'

import {
  forwardRef,
  useState,
  useRef,
  useCallback,
  useEffect,
  type InputHTMLAttributes,
  type ReactNode,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'onChange'> {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onSearch?: (value: string) => void
  onClear?: () => void
  debounce?: number
  loading?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  clearable?: boolean
  motion?: 0 | 1 | 2 | 3
}

// ─── Icons ──────────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const ClearIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

// ─── Styles ─────────────────────────────────────────────────────────────────

const searchInputStyles = css`
  @layer components {
    @scope (.ui-search-input) {
      :scope {
        position: relative;
        display: flex;
        align-items: center;
        font-family: inherit;
      }

      .ui-search-input__field {
        display: block;
        inline-size: 100%;
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.12));
        border-radius: var(--radius-md, 0.375rem);
        background: transparent;
        color: var(--text-primary, oklch(90% 0 0));
        font-family: inherit;
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.5;
        outline: none;
        padding-inline-start: 2.25rem;
        padding-inline-end: 0.75rem;
        transition: border-color 0.15s var(--ease-out, ease-out),
                    box-shadow 0.15s var(--ease-out, ease-out);
      }

      /* Has clear button */
      :scope[data-has-value] .ui-search-input__field {
        padding-inline-end: 2.25rem;
      }

      /* Sizes */
      :scope[data-size="xs"] .ui-search-input__field {
        min-block-size: 28px;
        padding-block: 0.125rem;
        font-size: var(--text-xs, 0.6875rem);
      }
      :scope[data-size="sm"] .ui-search-input__field {
        min-block-size: 32px;
        padding-block: 0.25rem;
        font-size: var(--text-xs, 0.75rem);
      }
      :scope[data-size="md"] .ui-search-input__field {
        min-block-size: 36px;
        padding-block: 0.375rem;
        font-size: var(--text-sm, 0.875rem);
      }
      :scope[data-size="lg"] .ui-search-input__field {
        min-block-size: 44px;
        padding-block: 0.5rem;
        font-size: var(--text-base, 1rem);
      }
      :scope[data-size="xl"] .ui-search-input__field {
        min-block-size: 48px;
        padding-block: 0.625rem;
        font-size: var(--text-lg, 1.125rem);
      }

      /* Focus glow */
      .ui-search-input__field:focus {
        border-color: var(--brand, oklch(65% 0.2 270));
        box-shadow: 0 0 0 3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15);
      }

      /* Hover */
      .ui-search-input__field:hover:not(:focus):not(:disabled) {
        border-color: var(--border-strong, oklch(100% 0 0 / 0.2));
      }

      /* Disabled */
      .ui-search-input__field:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Placeholder */
      .ui-search-input__field::placeholder {
        color: var(--text-tertiary, oklch(60% 0 0));
      }

      /* Search/spinner icon (left) */
      .ui-search-input__icon,
      .ui-search-input__spinner {
        position: absolute;
        inset-inline-start: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        color: var(--text-tertiary, oklch(60% 0 0));
        block-size: 100%;
        inline-size: 2.25rem;
      }
      .ui-search-input__icon svg,
      .ui-search-input__spinner svg {
        inline-size: 1em;
        block-size: 1em;
      }

      /* Spinner */
      .ui-search-input__spinner svg {
        animation: ui-search-spin 0.8s linear infinite;
      }

      /* Clear button (right) */
      .ui-search-input__clear {
        position: absolute;
        inset-inline-end: 0.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.25rem;
        border: none;
        background: none;
        color: var(--text-tertiary, oklch(60% 0 0));
        cursor: pointer;
        border-radius: var(--radius-sm, 0.25rem);
        transition: color 0.15s var(--ease-out, ease-out);
      }
      .ui-search-input__clear:hover {
        color: var(--text-primary, oklch(90% 0 0));
      }
      .ui-search-input__clear:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 1px;
      }
      .ui-search-input__clear svg {
        inline-size: 0.875rem;
        block-size: 0.875rem;
      }

      /* Focus visible */
      .ui-search-input__field:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 1px;
      }

      /* Touch targets */
      @media (pointer: coarse) {
        .ui-search-input__field {
          min-block-size: 44px;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-search-input__field {
          border: 2px solid ButtonText;
        }
        .ui-search-input__field:focus {
          outline: 2px solid Highlight;
        }
      }

      /* Print */
      @media print {
        .ui-search-input__field {
          box-shadow: none;
          border: 1px solid;
        }
      }
    }

    @keyframes ui-search-spin {
      to { transform: rotate(360deg); }
    }
  }
`

// ─── Spinner icon ───────────────────────────────────────────────────────────

const SpinnerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
)

// ─── Component ──────────────────────────────────────────────────────────────

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value: valueProp,
      defaultValue,
      onChange,
      onSearch,
      onClear,
      debounce: debounceDuration = 300,
      loading = false,
      size = 'md',
      clearable = true,
      motion: motionProp,
      className,
      disabled,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('search-input', searchInputStyles)
    const motionLevel = useMotionLevel(motionProp)

    // Track internal value for uncontrolled mode
    const isControlled = valueProp !== undefined
    const [internalValue, setInternalValue] = useState(defaultValue || '')
    const currentValue = isControlled ? valueProp : internalValue
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Cleanup debounce on unmount
    useEffect(() => {
      return () => {
        if (debounceRef.current) clearTimeout(debounceRef.current)
      }
    }, [])

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        if (!isControlled) {
          setInternalValue(newValue)
        }

        // Debounced onChange
        if (onChange) {
          if (debounceRef.current) clearTimeout(debounceRef.current)
          debounceRef.current = setTimeout(() => {
            onChange(newValue)
          }, debounceDuration)
        }
      },
      [onChange, debounceDuration, isControlled]
    )

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && onSearch) {
          // Cancel any pending debounce
          if (debounceRef.current) clearTimeout(debounceRef.current)
          onSearch(currentValue)
        }
      },
      [onSearch, currentValue]
    )

    const handleClear = useCallback(() => {
      if (!isControlled) {
        setInternalValue('')
      }
      if (debounceRef.current) clearTimeout(debounceRef.current)
      onClear?.()
    }, [isControlled, onClear])

    const hasValue = currentValue.length > 0
    const showClear = clearable && hasValue && !disabled

    return (
      <div
        className={cn(cls('root'), className)}
        data-size={size}
        data-motion={motionLevel}
        data-loading={loading || undefined}
        {...(hasValue ? { 'data-has-value': '' } : {})}
      >
        {loading ? (
          <span className="ui-search-input__spinner" aria-hidden="true">
            <SpinnerIcon />
          </span>
        ) : (
          <span className="ui-search-input__icon" aria-hidden="true">
            <SearchIcon />
          </span>
        )}

        <input
          ref={ref}
          type="search"
          className="ui-search-input__field"
          value={currentValue}
          disabled={disabled}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          {...rest}
        />

        {showClear && (
          <button
            type="button"
            className="ui-search-input__clear"
            onClick={handleClear}
            aria-label="Clear search"
            tabIndex={-1}
          >
            <ClearIcon />
          </button>
        )}
      </div>
    )
  }
)
SearchInput.displayName = 'SearchInput'
