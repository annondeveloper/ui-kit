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

export interface MultiSelectOption {
  value: string
  label: string
  disabled?: boolean
  group?: string
}

export interface MultiSelectProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  options: MultiSelectOption[]
  value?: string[]
  defaultValue?: string[]
  onChange?: (values: string[]) => void
  placeholder?: string
  searchable?: boolean
  clearable?: boolean
  disabled?: boolean
  maxSelected?: number
  size?: 'sm' | 'md' | 'lg'
  error?: string
  label?: string
  name?: string
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const multiSelectStyles = css`
  @layer components {
    @scope (.ui-multi-select) {
      :scope {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs, 0.25rem);
        position: relative;
        font-family: inherit;
      }

      .ui-multi-select__label {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 500;
        color: var(--text-primary, oklch(90% 0 0));
        line-height: 1.4;
        user-select: none;
      }

      /* ── Trigger ─────────────────────────────────────── */

      .ui-multi-select__trigger {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.25rem;
        inline-size: 100%;
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.12));
        border-radius: var(--radius-md, 0.375rem);
        background: transparent;
        cursor: pointer;
        transition: border-color 0.15s var(--ease-out, ease-out),
                    box-shadow 0.15s var(--ease-out, ease-out);
      }

      .ui-multi-select__trigger:focus-within {
        border-color: var(--brand, oklch(65% 0.2 270));
        box-shadow: 0 0 0 3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15);
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 1px;
      }

      .ui-multi-select__trigger:hover:not(:focus-within) {
        border-color: var(--border-strong, oklch(100% 0 0 / 0.2));
      }

      /* Sizes */
      :scope[data-size="sm"] .ui-multi-select__trigger {
        min-block-size: 32px;
        padding-block: 0.125rem;
        padding-inline: 0.5rem;
      }
      :scope[data-size="md"] .ui-multi-select__trigger {
        min-block-size: 36px;
        padding-block: 0.25rem;
        padding-inline: 0.75rem;
      }
      :scope[data-size="lg"] .ui-multi-select__trigger {
        min-block-size: 44px;
        padding-block: 0.375rem;
        padding-inline: 1rem;
      }

      /* ── Tags ────────────────────────────────────────── */

      .ui-multi-select__tag {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding-block: 0.125rem;
        padding-inline: 0.5rem;
        font-size: var(--text-xs, 0.75rem);
        font-weight: 500;
        line-height: 1.4;
        border-radius: var(--radius-sm, 0.25rem);
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.12);
        color: var(--text-primary, oklch(90% 0 0));
        white-space: nowrap;
        max-inline-size: 10rem;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .ui-multi-select__tag-remove {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: 1rem;
        block-size: 1rem;
        border: none;
        background: none;
        color: var(--text-tertiary, oklch(60% 0 0));
        cursor: pointer;
        border-radius: var(--radius-sm, 0.25rem);
        padding: 0;
        flex-shrink: 0;
        transition: color 0.1s, background 0.1s;
      }

      .ui-multi-select__tag-remove:hover {
        background: oklch(100% 0 0 / 0.08);
        color: var(--text-primary, oklch(90% 0 0));
      }

      .ui-multi-select__tag-remove svg {
        inline-size: 0.625em;
        block-size: 0.625em;
      }

      /* ── Search input ────────────────────────────────── */

      .ui-multi-select__input {
        flex: 1;
        min-inline-size: 4rem;
        border: none;
        background: transparent;
        color: var(--text-primary, oklch(90% 0 0));
        font-family: inherit;
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.5;
        outline: none;
        padding: 0;
      }

      .ui-multi-select__input::placeholder {
        color: var(--text-tertiary, oklch(60% 0 0));
      }

      :scope[data-size="sm"] .ui-multi-select__input {
        font-size: var(--text-xs, 0.75rem);
      }
      :scope[data-size="lg"] .ui-multi-select__input {
        font-size: var(--text-base, 1rem);
      }

      /* ── Actions (clear, chevron) ────────────────────── */

      .ui-multi-select__actions {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        margin-inline-start: auto;
        flex-shrink: 0;
      }

      .ui-multi-select__clear {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: 1.25rem;
        block-size: 1.25rem;
        border: none;
        background: none;
        color: var(--text-tertiary, oklch(60% 0 0));
        cursor: pointer;
        border-radius: var(--radius-sm, 0.25rem);
        padding: 0;
        transition: color 0.1s, background 0.1s;
      }

      .ui-multi-select__clear:hover {
        background: oklch(100% 0 0 / 0.08);
        color: var(--text-primary, oklch(90% 0 0));
      }

      .ui-multi-select__chevron {
        flex-shrink: 0;
        color: var(--text-tertiary, oklch(60% 0 0));
        transition: transform 0.2s var(--ease-out, ease-out);
        cursor: pointer;
      }

      :scope[data-open] .ui-multi-select__chevron {
        transform: rotate(180deg);
      }

      :scope[data-motion="0"] .ui-multi-select__chevron {
        transition: none;
      }

      /* ── Dropdown ────────────────────────────────────── */

      .ui-multi-select__dropdown {
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

      :scope:not([data-motion="0"]) .ui-multi-select__dropdown {
        animation: ui-multi-select-dropdown-in 0.15s var(--ease-out, ease-out);
      }

      .ui-multi-select__options {
        display: flex;
        flex-direction: column;
      }

      /* ── Group header ────────────────────────────────── */

      .ui-multi-select__group-header {
        padding-block: 0.25rem;
        padding-inline: 0.75rem;
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary, oklch(60% 0 0));
        text-transform: uppercase;
        letter-spacing: 0.05em;
        user-select: none;
        margin-block-start: 0.25rem;
      }

      .ui-multi-select__group-header:first-child {
        margin-block-start: 0;
      }

      /* ── Option ──────────────────────────────────────── */

      .ui-multi-select__option {
        display: flex;
        align-items: center;
        gap: 0.5rem;
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

      .ui-multi-select__option[data-active] {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.12);
      }

      .ui-multi-select__option[data-disabled] {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .ui-multi-select__option:not([data-disabled]):hover {
        background: var(--bg-hover);
      }

      .ui-multi-select__option[data-active]:not([data-disabled]):hover {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.12);
      }

      /* ── Checkbox ────────────────────────────────────── */

      .ui-multi-select__checkbox {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: 1rem;
        block-size: 1rem;
        border: 1.5px solid var(--border-default, oklch(100% 0 0 / 0.2));
        border-radius: var(--radius-sm, 0.25rem);
        background: transparent;
        flex-shrink: 0;
        transition: background 0.1s, border-color 0.1s;
      }

      .ui-multi-select__checkbox[data-checked] {
        background: var(--brand, oklch(65% 0.2 270));
        border-color: var(--brand, oklch(65% 0.2 270));
      }

      .ui-multi-select__checkbox svg {
        inline-size: 0.75em;
        block-size: 0.75em;
        color: var(--text-on-brand, oklch(100% 0 0));
        opacity: 0;
      }

      .ui-multi-select__checkbox[data-checked] svg {
        opacity: 1;
      }

      /* ── Option label ────────────────────────────────── */

      .ui-multi-select__option-label {
        flex: 1;
        min-inline-size: 0;
      }

      /* ── Empty ───────────────────────────────────────── */

      .ui-multi-select__empty {
        padding-block: 0.75rem;
        padding-inline: 0.75rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-tertiary, oklch(60% 0 0));
        text-align: center;
      }

      /* ── Disabled ────────────────────────────────────── */

      :scope[data-disabled] {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      :scope[data-disabled] .ui-multi-select__trigger {
        cursor: not-allowed;
      }

      /* ── Error ───────────────────────────────────────── */

      :scope[data-invalid] .ui-multi-select__trigger {
        border-color: var(--status-critical, oklch(65% 0.25 25));
        box-shadow: 0 0 0 1px oklch(from var(--status-critical, oklch(65% 0.25 25)) l c h / 0.2);
      }

      :scope[data-invalid] .ui-multi-select__trigger:focus-within {
        border-color: var(--status-critical, oklch(65% 0.25 25));
        box-shadow: 0 0 0 3px oklch(from var(--status-critical, oklch(65% 0.25 25)) l c h / 0.25);
      }

      .ui-multi-select__error {
        font-size: var(--text-xs, 0.75rem);
        color: var(--status-critical, oklch(65% 0.25 25));
        line-height: 1.4;
      }

      :scope:not([data-motion="0"]) .ui-multi-select__error {
        animation: ui-multi-select-error-in 0.2s var(--ease-out, ease-out);
      }

      /* ── Touch targets ─────────────────────────────────── */

      @media (pointer: coarse) {
        .ui-multi-select__trigger {
          min-block-size: 44px;
        }
        .ui-multi-select__option {
          min-block-size: 44px;
        }
      }

      /* ── Forced colors ─────────────────────────────────── */

      @media (forced-colors: active) {
        .ui-multi-select__trigger {
          border: 2px solid ButtonText;
        }
        .ui-multi-select__trigger:focus-within {
          outline: 2px solid Highlight;
        }
        :scope[data-invalid] .ui-multi-select__trigger {
          border-color: LinkText;
        }
        .ui-multi-select__dropdown {
          border: 2px solid ButtonText;
        }
        .ui-multi-select__option[data-active] {
          outline: 2px solid Highlight;
        }
        .ui-multi-select__checkbox {
          border-color: ButtonText;
        }
        .ui-multi-select__checkbox[data-checked] {
          background: Highlight;
          border-color: Highlight;
        }
        .ui-multi-select__tag {
          border: 1px solid ButtonText;
        }
      }

      /* ── Print ──────────────────────────────────────────── */

      @media print {
        .ui-multi-select__trigger {
          box-shadow: none;
          border: 1px solid;
        }
        .ui-multi-select__dropdown {
          box-shadow: none;
          border: 1px solid;
        }
      }
    }

    @keyframes ui-multi-select-dropdown-in {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes ui-multi-select-error-in {
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

export const MultiSelect = forwardRef<HTMLDivElement, MultiSelectProps>(
  (
    {
      options,
      value: controlledValue,
      defaultValue,
      onChange,
      placeholder = 'Select...',
      searchable = true,
      clearable = false,
      disabled,
      maxSelected,
      size = 'md',
      error: errorProp,
      label,
      name,
      motion: motionProp,
      className,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('multi-select', multiSelectStyles)
    const motionLevel = useMotionLevel(motionProp)
    const id = useStableId('multi-select')
    const listboxId = `${id}-listbox`
    const labelId = `${id}-label`
    const errorId = `${id}-error`

    // ── Form context integration ──────────────────────────────────────
    const formCtx = useFormContextOptional()
    const fieldProps = name && formCtx ? formCtx.getFieldProps(name) : null

    // ── State ─────────────────────────────────────────────────────────
    const [isOpen, setIsOpen] = useState(false)
    const [internalValue, setInternalValue] = useState<string[]>(defaultValue ?? [])
    const [activeIndex, setActiveIndex] = useState(-1)
    const [query, setQuery] = useState('')

    // ── Resolved values ───────────────────────────────────────────────
    const resolvedValue =
      controlledValue !== undefined
        ? controlledValue
        : fieldProps
          ? (fieldProps.value as string[]) ?? []
          : internalValue

    const touched = fieldProps?.touched ?? false
    const contextError = fieldProps && touched ? fieldProps.error : undefined
    const resolvedError = errorProp !== undefined ? errorProp : contextError

    // ── Refs ──────────────────────────────────────────────────────────
    const inputRef = useRef<HTMLInputElement>(null)
    const triggerRef = useRef<HTMLDivElement>(null)
    const listboxRef = useRef<HTMLDivElement>(null)
    const popoverRef = useRef<HTMLDivElement>(null)
    const rootRef = useRef<HTMLDivElement>(null)

    // ── Merge ref ─────────────────────────────────────────────────────
    const setRootRef = useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref)
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
      },
      [ref]
    )

    // ── Filtered options ──────────────────────────────────────────────
    const filteredOptions =
      !searchable || !query
        ? options
        : options.filter((o) =>
            o.label.toLowerCase().includes(query.toLowerCase())
          )

    const enabledOptions = filteredOptions.filter((o) => !o.disabled)

    // ── Position (JS fallback) ────────────────────────────────────────
    const position = useAnchorPosition(triggerRef, popoverRef, {
      placement: 'bottom',
      offset: 4,
      enabled: isOpen,
    })

    // ── Open / Close ──────────────────────────────────────────────────
    const open = useCallback(() => {
      if (disabled) return
      setIsOpen(true)
      setActiveIndex(0)
      setQuery('')
    }, [disabled])

    const close = useCallback(() => {
      setIsOpen(false)
      setQuery('')
      fieldProps?.onBlur?.()
    }, [fieldProps])

    // ── Toggle option ─────────────────────────────────────────────────
    const toggleOption = useCallback(
      (option: MultiSelectOption) => {
        if (option.disabled) return

        const isSelected = resolvedValue.includes(option.value)
        let newValues: string[]

        if (isSelected) {
          newValues = resolvedValue.filter((v) => v !== option.value)
        } else {
          if (maxSelected !== undefined && resolvedValue.length >= maxSelected) {
            return
          }
          newValues = [...resolvedValue, option.value]
        }

        setInternalValue(newValues)
        onChange?.(newValues)
        if (fieldProps) {
          fieldProps.onChange(newValues)
        }
        setQuery('')
        setActiveIndex(0)
      },
      [resolvedValue, onChange, fieldProps, maxSelected]
    )

    // ── Remove tag ────────────────────────────────────────────────────
    const removeValue = useCallback(
      (valueToRemove: string) => {
        const newValues = resolvedValue.filter((v) => v !== valueToRemove)
        setInternalValue(newValues)
        onChange?.(newValues)
        if (fieldProps) {
          fieldProps.onChange(newValues)
        }
      },
      [resolvedValue, onChange, fieldProps]
    )

    // ── Clear all ─────────────────────────────────────────────────────
    const clearAll = useCallback(() => {
      setInternalValue([])
      onChange?.([])
      if (fieldProps) {
        fieldProps.onChange([])
      }
    }, [onChange, fieldProps])

    // ── Click outside ─────────────────────────────────────────────────
    useEffect(() => {
      if (!isOpen) return

      const handleClickOutside = (e: MouseEvent) => {
        const root = rootRef.current
        if (root && !root.contains(e.target as Node)) {
          close()
        }
      }

      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 0)

      return () => {
        clearTimeout(timer)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [isOpen, close])

    // ── Keyboard ──────────────────────────────────────────────────────
    const handleKeyDown = useCallback(
      (e: KeyboardEvent) => {
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault()
            if (!isOpen) {
              open()
            } else {
              setActiveIndex((i) => Math.min(i + 1, enabledOptions.length - 1))
            }
            break
          case 'ArrowUp':
            e.preventDefault()
            if (!isOpen) {
              open()
            } else {
              setActiveIndex((i) => Math.max(i - 1, 0))
            }
            break
          case 'Home':
            if (isOpen) {
              e.preventDefault()
              setActiveIndex(0)
            }
            break
          case 'End':
            if (isOpen) {
              e.preventDefault()
              setActiveIndex(enabledOptions.length - 1)
            }
            break
          case 'Enter':
            e.preventDefault()
            if (isOpen && activeIndex >= 0 && activeIndex < enabledOptions.length) {
              toggleOption(enabledOptions[activeIndex])
            } else if (!isOpen) {
              open()
            }
            break
          case ' ':
            if (isOpen && activeIndex >= 0 && activeIndex < enabledOptions.length) {
              e.preventDefault()
              toggleOption(enabledOptions[activeIndex])
            }
            break
          case 'Escape':
            if (isOpen) {
              e.preventDefault()
              close()
              inputRef.current?.focus()
            }
            break
          case 'Backspace':
            if (searchable && query === '' && resolvedValue.length > 0) {
              removeValue(resolvedValue[resolvedValue.length - 1])
            }
            break
        }
      },
      [
        isOpen,
        activeIndex,
        enabledOptions,
        toggleOption,
        close,
        open,
        searchable,
        query,
        resolvedValue,
        removeValue,
      ]
    )

    // ── Scroll active option into view ────────────────────────────────
    useEffect(() => {
      if (!isOpen || activeIndex < 0) return
      const optionsContainer = listboxRef.current
      if (!optionsContainer) return
      const items = optionsContainer.querySelectorAll(
        '[role="option"]:not([data-disabled])'
      )
      const item = items[activeIndex] as HTMLElement | undefined
      item?.scrollIntoView?.({ block: 'nearest' })
    }, [activeIndex, isOpen])

    // ── Handle input changes ──────────────────────────────────────────
    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = e.target.value
        setQuery(newQuery)
        setActiveIndex(0)
        if (!isOpen) {
          setIsOpen(true)
        }
      },
      [isOpen]
    )

    // ── Group rendering ───────────────────────────────────────────────
    const groupedEntries: Array<
      | { type: 'header'; group: string }
      | { type: 'option'; option: MultiSelectOption }
    > = []

    const hasGroups = filteredOptions.some((o) => o.group)
    if (hasGroups) {
      const seen = new Set<string>()
      for (const option of filteredOptions) {
        const group = option.group ?? ''
        if (group && !seen.has(group)) {
          seen.add(group)
          groupedEntries.push({ type: 'header', group })
        }
        groupedEntries.push({ type: 'option', option })
      }
    } else {
      for (const option of filteredOptions) {
        groupedEntries.push({ type: 'option', option })
      }
    }

    // ── Active descendant ID ──────────────────────────────────────────
    const getOptionId = (value: string) => `${id}-option-${value}`
    const activeDescendantId =
      isOpen && activeIndex >= 0 && activeIndex < enabledOptions.length
        ? getOptionId(enabledOptions[activeIndex].value)
        : undefined

    // ── Get selected option labels ────────────────────────────────────
    const selectedOptions = resolvedValue
      .map((v) => options.find((o) => o.value === v))
      .filter(Boolean) as MultiSelectOption[]

    return (
      <div
        ref={setRootRef}
        className={cn(cls('root'), className)}
        data-size={size}
        data-motion={motionLevel}
        {...(isOpen ? { 'data-open': '' } : {})}
        {...(resolvedError ? { 'data-invalid': '' } : {})}
        {...(disabled ? { 'data-disabled': '' } : {})}
        {...rest}
      >
        {label && (
          <label className="ui-multi-select__label" id={labelId}>
            {label}
          </label>
        )}

        {/* Hidden inputs for native form submission */}
        {name &&
          resolvedValue.map((v) => (
            <input key={v} type="hidden" name={name} value={v} />
          ))}

        {/* Trigger */}
        <div
          ref={triggerRef}
          className="ui-multi-select__trigger"
          onClick={() => {
            if (!disabled) {
              if (!isOpen) {
                open()
                inputRef.current?.focus()
              }
            }
          }}
        >
          {/* Tags */}
          {selectedOptions.map((opt) => (
            <span key={opt.value} className="ui-multi-select__tag">
              <span>{opt.label}</span>
              {!disabled && (
                <button
                  type="button"
                  className="ui-multi-select__tag-remove"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeValue(opt.value)
                  }}
                  aria-label={`Remove ${opt.label}`}
                  tabIndex={-1}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 2l6 6m0-6l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </span>
          ))}

          {/* Search input */}
          <input
            ref={inputRef}
            className="ui-multi-select__input"
            type="text"
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-controls={isOpen ? listboxId : undefined}
            aria-activedescendant={activeDescendantId}
            aria-labelledby={label ? labelId : undefined}
            aria-invalid={resolvedError ? true : undefined}
            aria-describedby={resolvedError ? errorId : undefined}
            disabled={disabled}
            placeholder={selectedOptions.length === 0 ? placeholder : undefined}
            value={query}
            readOnly={!searchable}
            onChange={handleInputChange}
            onFocus={() => {
              if (!isOpen && !disabled) {
                open()
              }
            }}
            onKeyDown={handleKeyDown}
          />

          {/* Actions */}
          <span className="ui-multi-select__actions">
            {clearable && resolvedValue.length > 0 && !disabled && (
              <button
                type="button"
                className="ui-multi-select__clear"
                onClick={(e) => {
                  e.stopPropagation()
                  clearAll()
                  inputRef.current?.focus()
                }}
                aria-label="Clear all selections"
                tabIndex={-1}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M3 3l6 6m0-6l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
            <Icon
              name="chevron-down"
              size="sm"
              className="ui-multi-select__chevron"
              onClick={() => {
                if (!disabled) {
                  if (isOpen) {
                    close()
                  } else {
                    open()
                    inputRef.current?.focus()
                  }
                }
              }}
            />
          </span>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div
            ref={popoverRef}
            className="ui-multi-select__dropdown"
            role="listbox"
            id={listboxId}
            aria-labelledby={label ? labelId : undefined}
            aria-multiselectable="true"
            style={{
              position: 'fixed',
              left: `${position.x}px`,
              top: `${position.y}px`,
            }}
          >
            <div ref={listboxRef} className="ui-multi-select__options">
              {groupedEntries.map((entry, i) => {
                if (entry.type === 'header') {
                  return (
                    <div
                      key={`group-${entry.group}`}
                      className="ui-multi-select__group-header"
                      role="presentation"
                    >
                      {entry.group}
                    </div>
                  )
                }

                const option = entry.option
                const enabledIdx = enabledOptions.indexOf(option)
                const isActive = enabledIdx === activeIndex
                const isSelected = resolvedValue.includes(option.value)

                return (
                  <div
                    key={option.value}
                    role="option"
                    id={getOptionId(option.value)}
                    aria-selected={isSelected}
                    aria-disabled={option.disabled || undefined}
                    className="ui-multi-select__option"
                    {...(isActive ? { 'data-active': '' } : {})}
                    {...(option.disabled ? { 'data-disabled': '' } : {})}
                    onClick={() => toggleOption(option)}
                    onMouseEnter={() => {
                      if (!option.disabled && enabledIdx >= 0) {
                        setActiveIndex(enabledIdx)
                      }
                    }}
                  >
                    <span
                      className="ui-multi-select__checkbox"
                      aria-hidden="true"
                      {...(isSelected ? { 'data-checked': '' } : {})}
                    >
                      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2.5 6l2.5 2.5 4.5-4.5" />
                      </svg>
                    </span>
                    <span className="ui-multi-select__option-label">
                      {option.label}
                    </span>
                  </div>
                )
              })}

              {filteredOptions.length === 0 && (
                <div className="ui-multi-select__empty">No options found</div>
              )}
            </div>
          </div>
        )}

        {resolvedError && (
          <div className="ui-multi-select__error" id={errorId} role="alert">
            {resolvedError}
          </div>
        )}
      </div>
    )
  }
)
MultiSelect.displayName = 'MultiSelect'
