'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useStableId } from '../core/a11y/stable-id'
import { useAnchorPosition } from '../core/a11y/anchor-position'
import { useFormContextOptional } from '../core/forms/form-context'
import { cn } from '../core/utils/cn'
import { Icon } from '../core/icons'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  icon?: ReactNode
  group?: string
}

export interface SelectProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  name: string
  options: SelectOption[]
  value?: string | string[]
  defaultValue?: string | string[]
  onChange?: (value: string | string[]) => void
  placeholder?: string
  label?: ReactNode
  error?: string
  disabled?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  searchable?: boolean
  clearable?: boolean
  multiple?: boolean
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const selectStyles = css`
  @layer components {
    @scope (.ui-select) {
      :scope {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs, 0.25rem);
        position: relative;
        font-family: inherit;
      }

      .ui-select__label {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 500;
        color: var(--text-primary, oklch(90% 0 0));
        line-height: 1.4;
        user-select: none;
      }

      .ui-select__trigger {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        inline-size: 100%;
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.12));
        border-radius: var(--radius-md, 0.375rem);
        background: transparent;
        color: var(--text-primary, oklch(90% 0 0));
        font-family: inherit;
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.5;
        outline: none;
        cursor: pointer;
        transition: border-color 0.15s var(--ease-out, ease-out),
                    box-shadow 0.15s var(--ease-out, ease-out);
      }

      /* Sizes */
      :scope[data-size="xs"] .ui-select__trigger {
        min-block-size: 28px;
        padding-block: 0.125rem;
        padding-inline: 0.375rem;
        font-size: var(--text-xs, 0.6875rem);
      }
      :scope[data-size="sm"] .ui-select__trigger {
        min-block-size: 32px;
        padding-block: 0.25rem;
        padding-inline: 0.5rem;
        font-size: var(--text-xs, 0.75rem);
      }
      :scope[data-size="md"] .ui-select__trigger {
        min-block-size: 36px;
        padding-block: 0.375rem;
        padding-inline: 0.75rem;
        font-size: var(--text-sm, 0.875rem);
      }
      :scope[data-size="lg"] .ui-select__trigger {
        min-block-size: 44px;
        padding-block: 0.5rem;
        padding-inline: 1rem;
        font-size: var(--text-base, 1rem);
      }
      :scope[data-size="xl"] .ui-select__trigger {
        min-block-size: 48px;
        padding-block: 0.625rem;
        padding-inline: 1.25rem;
        font-size: var(--text-lg, 1.125rem);
      }

      /* Focus glow */
      .ui-select__trigger:focus-visible {
        border-color: var(--brand, oklch(65% 0.2 270));
        box-shadow: 0 0 0 3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15);
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 1px;
      }

      /* Hover */
      .ui-select__trigger:hover:not(:focus-visible):not(:disabled) {
        border-color: var(--border-strong, oklch(100% 0 0 / 0.2));
      }

      /* Disabled */
      :scope[data-disabled] {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      .ui-select__trigger:disabled {
        cursor: not-allowed;
      }

      /* Value display */
      .ui-select__value {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        flex: 1;
        min-inline-size: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-align: start;
      }

      .ui-select__placeholder {
        color: var(--text-tertiary, oklch(60% 0 0));
      }

      /* Chevron */
      .ui-select__chevron {
        flex-shrink: 0;
        color: var(--text-tertiary, oklch(60% 0 0));
        transition: transform 0.2s var(--ease-out, ease-out);
      }

      :scope[data-open] .ui-select__chevron {
        transform: rotate(180deg);
      }

      :scope[data-motion="0"] .ui-select__chevron {
        transition: none;
      }

      /* Clear button */
      .ui-select__clear {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        cursor: pointer;
        color: var(--text-tertiary, oklch(60% 0 0));
        border-radius: var(--radius-sm, 0.25rem);
        padding: 0.125rem;
      }

      .ui-select__clear:hover {
        color: var(--text-primary, oklch(90% 0 0));
      }

      /* Dropdown */
      .ui-select__dropdown {
        z-index: 50;
        min-inline-size: 100%;
        max-block-size: 15rem;
        overflow: auto;
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-lg, 0.5rem);
        background: var(--surface-elevated, oklch(22% 0.01 270));
        box-shadow: var(--shadow-lg, 0 8px 24px oklch(0% 0 0 / 0.3));
        padding-block: 0.25rem;
        outline: none;
      }

      /* Entry animation — motion level 1+ */
      :scope:not([data-motion="0"]) .ui-select__dropdown {
        animation: ui-select-dropdown-in 0.15s var(--ease-out, ease-out);
      }

      /* Search input */
      .ui-select__search {
        display: block;
        inline-size: 100%;
        border: none;
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        background: transparent;
        color: var(--text-primary, oklch(90% 0 0));
        font-family: inherit;
        font-size: var(--text-sm, 0.875rem);
        padding-block: 0.375rem;
        padding-inline: 0.75rem;
        outline: none;
      }

      .ui-select__search::placeholder {
        color: var(--text-tertiary, oklch(60% 0 0));
      }

      /* Options container */
      .ui-select__options {
        display: flex;
        flex-direction: column;
      }

      /* Option */
      .ui-select__option {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        padding-block: 0.375rem;
        padding-inline: 0.75rem;
        cursor: pointer;
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.5;
        color: var(--text-primary, oklch(90% 0 0));
        transition: background 0.1s var(--ease-out, ease-out);
        user-select: none;
        min-block-size: 2rem;
      }

      .ui-select__option[data-active] {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.12);
      }

      .ui-select__option[data-selected] {
        font-weight: 500;
      }

      .ui-select__option[data-disabled] {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .ui-select__option:not([data-disabled]):hover {
        background: oklch(100% 0 0 / 0.04);
      }

      .ui-select__option[data-active]:not([data-disabled]):hover {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.12);
      }

      /* Option icon */
      .ui-select__option-icon {
        display: flex;
        align-items: center;
        flex-shrink: 0;
      }

      .ui-select__option-icon svg {
        inline-size: 1em;
        block-size: 1em;
      }

      /* Check icon for selected */
      .ui-select__check {
        margin-inline-start: auto;
        flex-shrink: 0;
        color: var(--brand, oklch(65% 0.2 270));
      }

      /* Multi-select tag display */
      .ui-select__multi-value {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.25rem;
        flex: 1;
        min-inline-size: 0;
        text-align: start;
      }

      .ui-select__tag {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding-block: 0.0625rem;
        padding-inline: 0.375rem;
        background: oklch(100% 0 0 / 0.08);
        border-radius: var(--radius-sm, 0.25rem);
        font-size: var(--text-xs, 0.75rem);
        line-height: 1.5;
        white-space: nowrap;
      }

      .ui-select__multi-count {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary, oklch(60% 0 0));
      }

      /* Empty state */
      .ui-select__empty {
        padding-block: 0.75rem;
        padding-inline: 0.75rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-tertiary, oklch(60% 0 0));
        text-align: center;
      }

      /* Error state */
      :scope[data-invalid] .ui-select__trigger {
        border-color: var(--status-critical, oklch(65% 0.25 25));
        box-shadow: 0 0 0 1px oklch(from var(--status-critical, oklch(65% 0.25 25)) l c h / 0.2);
      }
      :scope[data-invalid] .ui-select__trigger:focus-visible {
        border-color: var(--status-critical, oklch(65% 0.25 25));
        box-shadow: 0 0 0 3px oklch(from var(--status-critical, oklch(65% 0.25 25)) l c h / 0.25);
      }

      .ui-select__error {
        font-size: var(--text-xs, 0.75rem);
        color: var(--status-critical, oklch(65% 0.25 25));
        line-height: 1.4;
      }

      :scope:not([data-motion="0"]) .ui-select__error {
        animation: ui-select-error-in 0.2s var(--ease-out, ease-out);
      }

      /* Touch targets */
      @media (pointer: coarse) {
        .ui-select__trigger {
          min-block-size: 44px;
        }
        .ui-select__option {
          min-block-size: 44px;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-select__trigger {
          border: 2px solid ButtonText;
        }
        .ui-select__trigger:focus-visible {
          outline: 2px solid Highlight;
        }
        :scope[data-invalid] .ui-select__trigger {
          border-color: LinkText;
        }
        .ui-select__dropdown {
          border: 2px solid ButtonText;
        }
        .ui-select__option[data-active] {
          outline: 2px solid Highlight;
        }
      }

      /* Print */
      @media print {
        .ui-select__trigger {
          box-shadow: none;
          border: 1px solid;
        }
        .ui-select__dropdown {
          box-shadow: none;
          border: 1px solid;
        }
      }

      /* Reduced data — skip decorative animations */
      @media (prefers-reduced-data: reduce) {
        .ui-select__chevron,
        .ui-select__dropdown,
        .ui-select__error {
          animation: none;
          transition: none;
        }
      }
    }

    @keyframes ui-select-dropdown-in {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes ui-select-error-in {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      name,
      options,
      value: controlledValue,
      defaultValue,
      onChange,
      placeholder = 'Select...',
      label,
      error: errorProp,
      disabled,
      size = 'md',
      searchable,
      clearable,
      multiple,
      motion: motionProp,
      className,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('select', selectStyles)
    const motionLevel = useMotionLevel(motionProp)
    const id = useStableId('select')
    const listboxId = `${id}-listbox`
    const labelId = `${id}-label`
    const errorId = `${id}-error`

    // ── Form context integration ──────────────────────────────────────
    const formCtx = useFormContextOptional()
    const fieldProps = formCtx ? formCtx.getFieldProps(name) : null

    // ── State ─────────────────────────────────────────────────────────
    const [isOpen, setIsOpen] = useState(false)
    const [internalValue, setInternalValue] = useState<string | string[]>(
      defaultValue ?? (multiple ? [] : '')
    )
    const [activeIndex, setActiveIndex] = useState(-1)
    const [searchQuery, setSearchQuery] = useState('')

    // ── Resolved values ───────────────────────────────────────────────
    const resolvedValue =
      controlledValue !== undefined
        ? controlledValue
        : fieldProps
          ? (fieldProps.value as string | string[]) ?? (multiple ? [] : '')
          : internalValue

    // Helper: is a given option value currently selected?
    const isValueSelected = (optionValue: string): boolean => {
      if (multiple) {
        return Array.isArray(resolvedValue) && resolvedValue.includes(optionValue)
      }
      return resolvedValue === optionValue
    }

    const touched = fieldProps?.touched ?? false
    const contextError = fieldProps && touched ? fieldProps.error : undefined
    const resolvedError = errorProp !== undefined ? errorProp : contextError

    // ── Refs ──────────────────────────────────────────────────────────
    const triggerRef = useRef<HTMLButtonElement>(null)
    const listboxRef = useRef<HTMLDivElement>(null)
    const popoverRef = useRef<HTMLDivElement>(null)
    const rootRef = useRef<HTMLDivElement>(null)

    // ── Filtered options ──────────────────────────────────────────────
    const filteredOptions =
      searchable && searchQuery
        ? options.filter((o) =>
            o.label.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : options

    const enabledOptions = filteredOptions.filter((o) => !o.disabled)

    // ── Position (JS fallback) ────────────────────────────────────────
    const position = useAnchorPosition(triggerRef, popoverRef, {
      placement: 'bottom',
      offset: 4,
      enabled: isOpen,
    })

    // ── Imperative ref merge ──────────────────────────────────────────
    const setRootRef = useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
      },
      [ref]
    )

    // ── Open / Close ──────────────────────────────────────────────────
    const open = useCallback(() => {
      if (disabled) return
      setIsOpen(true)
      setSearchQuery('')
      // Set active index to currently selected value, or 0
      const selectedIdx = multiple
        ? 0
        : enabledOptions.findIndex(
            (o) => o.value === resolvedValue
          )
      setActiveIndex(selectedIdx >= 0 ? selectedIdx : 0)
    }, [disabled, enabledOptions, resolvedValue])

    const close = useCallback(() => {
      setIsOpen(false)
      triggerRef.current?.focus()
      // Mark touched in form context
      fieldProps?.onBlur?.()
    }, [fieldProps])

    // ── Select an option ──────────────────────────────────────────────
    const selectOption = useCallback(
      (option: SelectOption) => {
        if (option.disabled) return

        if (multiple) {
          // Toggle the option in the array
          const currentArr = Array.isArray(resolvedValue) ? resolvedValue : []
          const newValue = currentArr.includes(option.value)
            ? currentArr.filter((v) => v !== option.value)
            : [...currentArr, option.value]
          setInternalValue(newValue)
          onChange?.(newValue)
          if (fieldProps) {
            fieldProps.onChange(newValue)
          }
          // Don't close — stay open for multi-picking
        } else {
          const newValue = option.value
          setInternalValue(newValue)
          onChange?.(newValue)
          if (fieldProps) {
            fieldProps.onChange(newValue)
          }
          close()
        }
      },
      [onChange, fieldProps, close, multiple, resolvedValue]
    )

    // ── Clear ─────────────────────────────────────────────────────────
    const handleClear = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation()
        const emptyValue = multiple ? [] : ''
        setInternalValue(emptyValue)
        onChange?.(emptyValue)
        if (fieldProps) {
          fieldProps.onChange(emptyValue)
        }
      },
      [onChange, fieldProps, multiple]
    )

    // ── Click outside ─────────────────────────────────────────────────
    useEffect(() => {
      if (!isOpen) return

      const handleClickOutside = (e: MouseEvent) => {
        const root = rootRef.current
        if (root && !root.contains(e.target as Node)) {
          close()
        }
      }

      // Use timeout to avoid catching the opening click
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 0)

      return () => {
        clearTimeout(timer)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [isOpen, close])

    // ── Keyboard on listbox ───────────────────────────────────────────
    const handleListboxKeyDown = useCallback(
      (e: KeyboardEvent) => {
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault()
            setActiveIndex((i) => Math.min(i + 1, enabledOptions.length - 1))
            break
          case 'ArrowUp':
            e.preventDefault()
            setActiveIndex((i) => Math.max(i - 1, 0))
            break
          case 'Home':
            e.preventDefault()
            setActiveIndex(0)
            break
          case 'End':
            e.preventDefault()
            setActiveIndex(enabledOptions.length - 1)
            break
          case 'Enter':
            e.preventDefault()
            if (activeIndex >= 0 && activeIndex < enabledOptions.length) {
              selectOption(enabledOptions[activeIndex])
            }
            break
          case ' ':
            // In searchable mode, space should type in the search box
            if (!searchable) {
              e.preventDefault()
              if (activeIndex >= 0 && activeIndex < enabledOptions.length) {
                selectOption(enabledOptions[activeIndex])
              }
            }
            break
          case 'Escape':
            e.preventDefault()
            close()
            break
          default:
            // Typeahead: match first character (only when not searchable)
            if (e.key.length === 1 && !searchable) {
              const match = enabledOptions.findIndex((o) =>
                o.label.toLowerCase().startsWith(e.key.toLowerCase())
              )
              if (match >= 0) setActiveIndex(match)
            }
        }
      },
      [enabledOptions, activeIndex, selectOption, close, searchable]
    )

    // ── Scroll active option into view ────────────────────────────────
    useEffect(() => {
      if (!isOpen || activeIndex < 0) return
      const optionsContainer = listboxRef.current
      if (!optionsContainer) return
      const items = optionsContainer.querySelectorAll('[role="option"]:not([data-disabled])')
      const item = items[activeIndex] as HTMLElement | undefined
      item?.scrollIntoView?.({ block: 'nearest' })
    }, [activeIndex, isOpen])

    // ── Focus the dropdown when opened ────────────────────────────────
    useEffect(() => {
      if (isOpen) {
        // Focus search input if searchable, else the dropdown container
        if (searchable) {
          const searchInput = popoverRef.current?.querySelector<HTMLInputElement>(
            '.ui-select__search'
          )
          searchInput?.focus()
        } else {
          popoverRef.current?.focus()
        }
      }
    }, [isOpen, searchable])

    // ── Derived ───────────────────────────────────────────────────────
    const selectedOption = multiple ? undefined : options.find((o) => o.value === resolvedValue)
    const selectedOptions = multiple
      ? options.filter((o) => Array.isArray(resolvedValue) && resolvedValue.includes(o.value))
      : []
    const hasValue = multiple
      ? Array.isArray(resolvedValue) && resolvedValue.length > 0
      : !!resolvedValue

    return (
      <div
        ref={setRootRef}
        className={cn(cls('root'), className)}
        data-size={size}
        data-motion={motionLevel}
        {...(isOpen ? { 'data-open': '' } : {})}
        {...(resolvedError ? { 'data-invalid': '' } : {})}
        {...(disabled ? { 'data-disabled': '' } : {})}
        {...(multiple ? { 'data-multiple': '' } : {})}
        {...rest}
      >
        {label && (
          <label className="ui-select__label" id={labelId}>
            {label}
          </label>
        )}

        {/* Hidden input(s) for native form submission */}
        {multiple && Array.isArray(resolvedValue) ? (
          resolvedValue.map((v) => (
            <input key={v} type="hidden" name={name} value={v} />
          ))
        ) : (
          <input type="hidden" name={name} value={resolvedValue as string} />
        )}

        {/* Trigger */}
        <button
          ref={triggerRef}
          type="button"
          className="ui-select__trigger"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={isOpen ? listboxId : undefined}
          aria-labelledby={label ? labelId : undefined}
          aria-invalid={resolvedError ? true : undefined}
          aria-describedby={resolvedError ? errorId : undefined}
          disabled={disabled}
          onClick={() => (isOpen ? close() : open())}
          onKeyDown={(e) => {
            if (
              e.key === 'ArrowDown' ||
              e.key === 'ArrowUp' ||
              e.key === 'Enter' ||
              e.key === ' '
            ) {
              if (!isOpen) {
                e.preventDefault()
                open()
              }
            }
          }}
        >
          <span className="ui-select__value">
            {multiple ? (
              selectedOptions.length > 0 ? (
                <span className="ui-select__multi-value">
                  {selectedOptions.length <= 3 ? (
                    selectedOptions.map((o) => (
                      <span key={o.value} className="ui-select__tag">{o.label}</span>
                    ))
                  ) : (
                    <>
                      <span className="ui-select__tag">{selectedOptions[0].label}</span>
                      <span className="ui-select__tag">{selectedOptions[1].label}</span>
                      <span className="ui-select__multi-count">+{selectedOptions.length - 2} more</span>
                    </>
                  )}
                </span>
              ) : (
                <span className="ui-select__placeholder">{placeholder}</span>
              )
            ) : (
              <>
                {selectedOption?.icon}
                {selectedOption ? (
                  selectedOption.label
                ) : (
                  <span className="ui-select__placeholder">{placeholder}</span>
                )}
              </>
            )}
          </span>
          {clearable && hasValue && (
            <span
              className="ui-select__clear"
              role="button"
              tabIndex={-1}
              aria-label="Clear selection"
              onClick={handleClear}
            >
              <Icon name="x" size="sm" />
            </span>
          )}
          <Icon name="chevron-down" size="sm" className="ui-select__chevron" />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div
            ref={popoverRef}
            className="ui-select__dropdown"
            role="listbox"
            id={listboxId}
            aria-labelledby={label ? labelId : undefined}
            aria-multiselectable={multiple || undefined}
            tabIndex={-1}
            onKeyDown={handleListboxKeyDown}
            style={{
              position: 'fixed',
              left: `${position.x}px`,
              top: `${position.y}px`,
            }}
          >
            {searchable && (
              <input
                className="ui-select__search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setActiveIndex(0)
                }}
                onKeyDown={handleListboxKeyDown}
              />
            )}
            <div ref={listboxRef} className="ui-select__options">
              {filteredOptions.map((option) => {
                const enabledIdx = enabledOptions.indexOf(option)
                const isActive = enabledIdx === activeIndex
                const isSelected = isValueSelected(option.value)
                return (
                  <div
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={option.disabled || undefined}
                    className="ui-select__option"
                    {...(isActive ? { 'data-active': '' } : {})}
                    {...(isSelected ? { 'data-selected': '' } : {})}
                    {...(option.disabled ? { 'data-disabled': '' } : {})}
                    onClick={() => selectOption(option)}
                    onMouseEnter={() => {
                      if (!option.disabled && enabledIdx >= 0) {
                        setActiveIndex(enabledIdx)
                      }
                    }}
                  >
                    {option.icon && (
                      <span className="ui-select__option-icon">
                        {option.icon}
                      </span>
                    )}
                    {option.label}
                    {isSelected && (
                      <Icon
                        name="check"
                        size="sm"
                        className="ui-select__check"
                      />
                    )}
                  </div>
                )
              })}
              {filteredOptions.length === 0 && (
                <div className="ui-select__empty">No options found</div>
              )}
            </div>
          </div>
        )}

        {resolvedError && (
          <div className="ui-select__error" id={errorId} role="alert">
            {resolvedError}
          </div>
        )}
      </div>
    )
  }
)
Select.displayName = 'Select'
