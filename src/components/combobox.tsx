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

export interface ComboboxOption {
  value: string
  label: string
  disabled?: boolean
  icon?: ReactNode
  group?: string
  description?: string
}

export interface ComboboxProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  name: string
  options: ComboboxOption[]
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onSearch?: (query: string) => void
  placeholder?: string
  label?: ReactNode
  error?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  allowCreate?: boolean
  onCreate?: (value: string) => void
  loading?: boolean
  emptyMessage?: string
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const comboboxStyles = css`
  @layer components {
    @scope (.ui-combobox) {
      :scope {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs, 0.25rem);
        position: relative;
        font-family: inherit;
      }

      .ui-combobox__label {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 500;
        color: var(--text-primary, oklch(90% 0 0));
        line-height: 1.4;
        user-select: none;
      }

      .ui-combobox__input-wrapper {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        inline-size: 100%;
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.12));
        border-radius: var(--radius-md, 0.375rem);
        background: transparent;
        transition: border-color 0.15s var(--ease-out, ease-out),
                    box-shadow 0.15s var(--ease-out, ease-out);
      }

      .ui-combobox__input {
        display: flex;
        align-items: center;
        flex: 1;
        min-inline-size: 0;
        border: none;
        background: transparent;
        color: var(--text-primary, oklch(90% 0 0));
        font-family: inherit;
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.5;
        outline: none;
        cursor: text;
      }

      .ui-combobox__input::placeholder {
        color: var(--text-tertiary, oklch(60% 0 0));
      }

      /* Sizes */
      :scope[data-size="sm"] .ui-combobox__input-wrapper {
        min-block-size: 32px;
        padding-block: 0.25rem;
        padding-inline: 0.5rem;
      }
      :scope[data-size="sm"] .ui-combobox__input {
        font-size: var(--text-xs, 0.75rem);
      }
      :scope[data-size="md"] .ui-combobox__input-wrapper {
        min-block-size: 36px;
        padding-block: 0.375rem;
        padding-inline: 0.75rem;
      }
      :scope[data-size="md"] .ui-combobox__input {
        font-size: var(--text-sm, 0.875rem);
      }
      :scope[data-size="lg"] .ui-combobox__input-wrapper {
        min-block-size: 44px;
        padding-block: 0.5rem;
        padding-inline: 1rem;
      }
      :scope[data-size="lg"] .ui-combobox__input {
        font-size: var(--text-base, 1rem);
      }

      /* Focus glow on wrapper when input is focused */
      .ui-combobox__input-wrapper:focus-within {
        border-color: var(--brand, oklch(65% 0.2 270));
        box-shadow: 0 0 0 3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15);
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 1px;
      }

      /* Hover */
      .ui-combobox__input-wrapper:hover:not(:focus-within) {
        border-color: var(--border-strong, oklch(100% 0 0 / 0.2));
      }

      /* Disabled */
      :scope[data-disabled] {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      :scope[data-disabled] .ui-combobox__input {
        cursor: not-allowed;
      }

      /* Chevron */
      .ui-combobox__chevron {
        flex-shrink: 0;
        color: var(--text-tertiary, oklch(60% 0 0));
        transition: transform 0.2s var(--ease-out, ease-out);
        cursor: pointer;
      }

      :scope[data-open] .ui-combobox__chevron {
        transform: rotate(180deg);
      }

      :scope[data-motion="0"] .ui-combobox__chevron {
        transition: none;
      }

      /* Dropdown */
      .ui-combobox__dropdown {
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
      :scope:not([data-motion="0"]) .ui-combobox__dropdown {
        animation: ui-combobox-dropdown-in 0.15s var(--ease-out, ease-out);
      }

      /* Options container */
      .ui-combobox__options {
        display: flex;
        flex-direction: column;
      }

      /* Group header */
      .ui-combobox__group-header {
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

      .ui-combobox__group-header:first-child {
        margin-block-start: 0;
      }

      /* Option */
      .ui-combobox__option {
        display: flex;
        align-items: flex-start;
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

      .ui-combobox__option[data-active] {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.12);
      }

      .ui-combobox__option[data-selected] {
        font-weight: 500;
      }

      .ui-combobox__option[data-disabled] {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .ui-combobox__option:not([data-disabled]):hover {
        background: var(--bg-hover);
      }

      .ui-combobox__option[data-active]:not([data-disabled]):hover {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.12);
      }

      /* Option content */
      .ui-combobox__option-content {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-inline-size: 0;
      }

      .ui-combobox__option-label {
        display: inline;
      }

      .ui-combobox__option-description {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary, oklch(60% 0 0));
        line-height: 1.4;
      }

      /* Option icon */
      .ui-combobox__option-icon {
        display: flex;
        align-items: center;
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .ui-combobox__option-icon svg {
        inline-size: 1em;
        block-size: 1em;
      }

      /* Check icon for selected */
      .ui-combobox__check {
        margin-inline-start: auto;
        flex-shrink: 0;
        color: var(--brand, oklch(65% 0.2 270));
        margin-block-start: 0.125rem;
      }

      /* Match highlight */
      .ui-combobox__match {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15);
        border-radius: 1px;
        color: inherit;
      }

      /* Create option */
      .ui-combobox__create {
        font-style: italic;
      }

      /* Loading state */
      .ui-combobox__loading {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding-block: 0.75rem;
        padding-inline: 0.75rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-tertiary, oklch(60% 0 0));
      }

      .ui-combobox__spinner {
        inline-size: 1rem;
        block-size: 1rem;
        border: 2px solid var(--border-default);
        border-block-start-color: var(--brand, oklch(65% 0.2 270));
        border-radius: 50%;
        animation: ui-combobox-spin 0.6s linear infinite;
      }

      /* Empty state */
      .ui-combobox__empty {
        padding-block: 0.75rem;
        padding-inline: 0.75rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-tertiary, oklch(60% 0 0));
        text-align: center;
      }

      /* Error state */
      :scope[data-invalid] .ui-combobox__input-wrapper {
        border-color: var(--status-critical, oklch(65% 0.25 25));
        box-shadow: 0 0 0 1px oklch(from var(--status-critical, oklch(65% 0.25 25)) l c h / 0.2);
      }
      :scope[data-invalid] .ui-combobox__input-wrapper:focus-within {
        border-color: var(--status-critical, oklch(65% 0.25 25));
        box-shadow: 0 0 0 3px oklch(from var(--status-critical, oklch(65% 0.25 25)) l c h / 0.25);
      }

      .ui-combobox__error {
        font-size: var(--text-xs, 0.75rem);
        color: var(--status-critical, oklch(65% 0.25 25));
        line-height: 1.4;
      }

      :scope:not([data-motion="0"]) .ui-combobox__error {
        animation: ui-combobox-error-in 0.2s var(--ease-out, ease-out);
      }

      /* Touch targets */
      @media (pointer: coarse) {
        .ui-combobox__input-wrapper {
          min-block-size: 44px;
        }
        .ui-combobox__option {
          min-block-size: 44px;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-combobox__input-wrapper {
          border: 2px solid ButtonText;
        }
        .ui-combobox__input-wrapper:focus-within {
          outline: 2px solid Highlight;
        }
        :scope[data-invalid] .ui-combobox__input-wrapper {
          border-color: LinkText;
        }
        .ui-combobox__dropdown {
          border: 2px solid ButtonText;
        }
        .ui-combobox__option[data-active] {
          outline: 2px solid Highlight;
        }
        .ui-combobox__match {
          background: Mark;
          color: MarkText;
        }
      }

      /* Print */
      @media print {
        .ui-combobox__input-wrapper {
          box-shadow: none;
          border: 1px solid;
        }
        .ui-combobox__dropdown {
          box-shadow: none;
          border: 1px solid;
        }
      }

      /* Reduced data */
      @media (prefers-reduced-data: reduce) {
        .ui-combobox__chevron,
        .ui-combobox__dropdown,
        .ui-combobox__error,
        .ui-combobox__spinner {
          animation: none;
          transition: none;
        }
      }
    }

    @keyframes ui-combobox-dropdown-in {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes ui-combobox-error-in {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes ui-combobox-spin {
      to {
        transform: rotate(360deg);
      }
    }
  }
`

// ─── Helpers ────────────────────────────────────────────────────────────────

function highlightMatch(text: string, query: string): ReactNode {
  if (!query) return text
  const lower = text.toLowerCase()
  const idx = lower.indexOf(query.toLowerCase())
  if (idx < 0) return text
  const before = text.slice(0, idx)
  const match = text.slice(idx, idx + query.length)
  const after = text.slice(idx + query.length)
  return (
    <>
      {before}
      <mark className="ui-combobox__match">{match}</mark>
      {after}
    </>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

export const Combobox = forwardRef<HTMLDivElement, ComboboxProps>(
  (
    {
      name,
      options,
      value: controlledValue,
      defaultValue,
      onChange,
      onSearch,
      placeholder = 'Search...',
      label,
      error: errorProp,
      disabled,
      size = 'md',
      allowCreate,
      onCreate,
      loading,
      emptyMessage = 'No results found',
      motion: motionProp,
      className,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('combobox', comboboxStyles)
    const motionLevel = useMotionLevel(motionProp)
    const id = useStableId('combobox')
    const listboxId = `${id}-listbox`
    const labelId = `${id}-label`
    const errorId = `${id}-error`

    // ── Form context integration ──────────────────────────────────────
    const formCtx = useFormContextOptional()
    const fieldProps = formCtx ? formCtx.getFieldProps(name) : null

    // ── State ─────────────────────────────────────────────────────────
    const [isOpen, setIsOpen] = useState(false)
    const [internalValue, setInternalValue] = useState(defaultValue ?? '')
    const [activeIndex, setActiveIndex] = useState(-1)
    const [query, setQuery] = useState('')

    // ── Resolved values ───────────────────────────────────────────────
    const resolvedValue =
      controlledValue !== undefined
        ? controlledValue
        : fieldProps
          ? (fieldProps.value as string) ?? ''
          : internalValue

    const touched = fieldProps?.touched ?? false
    const contextError = fieldProps && touched ? fieldProps.error : undefined
    const resolvedError = errorProp !== undefined ? errorProp : contextError

    // ── Refs ──────────────────────────────────────────────────────────
    const inputRef = useRef<HTMLInputElement>(null)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const listboxRef = useRef<HTMLDivElement>(null)
    const popoverRef = useRef<HTMLDivElement>(null)
    const rootRef = useRef<HTMLDivElement>(null)

    // ── Filtered options ──────────────────────────────────────────────
    // If onSearch is provided, consumer controls filtering via options prop.
    // Otherwise, do local filtering.
    const filteredOptions =
      onSearch || !query
        ? options
        : options.filter((o) =>
            o.label.toLowerCase().includes(query.toLowerCase())
          )

    const enabledOptions = filteredOptions.filter((o) => !o.disabled)

    // Should we show the "Create" option?
    const showCreate =
      allowCreate &&
      query.trim() !== '' &&
      !filteredOptions.some(
        (o) => o.label.toLowerCase() === query.toLowerCase()
      )

    // Total navigable items (enabled options + create option if shown)
    const totalNavigable = enabledOptions.length + (showCreate ? 1 : 0)

    // ── Position (JS fallback) ────────────────────────────────────────
    const position = useAnchorPosition(wrapperRef, popoverRef, {
      placement: 'bottom',
      offset: 4,
      enabled: isOpen,
    })

    // ── Imperative ref merge ──────────────────────────────────────────
    const setRootRef = useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref)
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
      },
      [ref]
    )

    // ── Open / Close ──────────────────────────────────────────────────
    const open = useCallback(() => {
      if (disabled) return
      setIsOpen(true)
      setActiveIndex(0)
    }, [disabled])

    const close = useCallback(() => {
      setIsOpen(false)
      // Restore input to selected option's label
      const selected = options.find((o) => o.value === resolvedValue)
      setQuery(selected ? selected.label : '')
      // Mark touched in form context
      fieldProps?.onBlur?.()
    }, [fieldProps, options, resolvedValue])

    // ── Select an option ──────────────────────────────────────────────
    const selectOption = useCallback(
      (option: ComboboxOption) => {
        if (option.disabled) return
        const newValue = option.value
        setInternalValue(newValue)
        setQuery(option.label)
        onChange?.(newValue)
        if (fieldProps) {
          fieldProps.onChange(newValue)
        }
        setIsOpen(false)
        inputRef.current?.focus()
      },
      [onChange, fieldProps]
    )

    // ── Handle create ─────────────────────────────────────────────────
    const handleCreate = useCallback(() => {
      const trimmed = query.trim()
      if (!trimmed) return
      onCreate?.(trimmed)
      setIsOpen(false)
      inputRef.current?.focus()
    }, [query, onCreate])

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

    // ── Sync input text with selected value ───────────────────────────
    useEffect(() => {
      const selected = options.find((o) => o.value === resolvedValue)
      if (selected && !isOpen) {
        setQuery(selected.label)
      } else if (!resolvedValue && !isOpen) {
        setQuery('')
      }
    }, [resolvedValue, options, isOpen])

    // ── Keyboard on input ─────────────────────────────────────────────
    const handleKeyDown = useCallback(
      (e: KeyboardEvent) => {
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault()
            if (!isOpen) {
              open()
            } else {
              setActiveIndex((i) => Math.min(i + 1, totalNavigable - 1))
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
              setActiveIndex(totalNavigable - 1)
            }
            break
          case 'Enter':
            e.preventDefault()
            if (isOpen && activeIndex >= 0) {
              if (activeIndex < enabledOptions.length) {
                selectOption(enabledOptions[activeIndex])
              } else if (showCreate) {
                handleCreate()
              }
            }
            break
          case 'Escape':
            if (isOpen) {
              e.preventDefault()
              close()
            }
            break
        }
      },
      [
        isOpen,
        activeIndex,
        enabledOptions,
        totalNavigable,
        selectOption,
        close,
        open,
        showCreate,
        handleCreate,
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
        onSearch?.(newQuery)
      },
      [isOpen, onSearch]
    )

    // ── Group rendering ───────────────────────────────────────────────
    const groupedEntries: Array<
      | { type: 'header'; group: string }
      | { type: 'option'; option: ComboboxOption }
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
        : isOpen && showCreate && activeIndex === enabledOptions.length
          ? `${id}-option-create`
          : undefined

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
          <label className="ui-combobox__label" id={labelId}>
            {label}
          </label>
        )}

        {/* Hidden input for native form submission */}
        <input type="hidden" name={name} value={resolvedValue} />

        {/* Input wrapper */}
        <div ref={wrapperRef} className="ui-combobox__input-wrapper">
          <input
            ref={inputRef}
            className="ui-combobox__input"
            type="text"
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-controls={isOpen ? listboxId : undefined}
            aria-activedescendant={activeDescendantId}
            aria-autocomplete="list"
            aria-labelledby={label ? labelId : undefined}
            aria-invalid={resolvedError ? true : undefined}
            aria-describedby={resolvedError ? errorId : undefined}
            disabled={disabled}
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onFocus={() => {
              if (!isOpen && !disabled) {
                open()
              }
            }}
            onKeyDown={handleKeyDown}
          />
          <Icon
            name="chevron-down"
            size="sm"
            className="ui-combobox__chevron"
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
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div
            ref={popoverRef}
            className="ui-combobox__dropdown"
            role="listbox"
            id={listboxId}
            aria-labelledby={label ? labelId : undefined}
            style={{
              position: 'fixed',
              left: `${position.x}px`,
              top: `${position.y}px`,
            }}
          >
            <div ref={listboxRef} className="ui-combobox__options">
              {loading ? (
                <div className="ui-combobox__loading" role="status">
                  <div className="ui-combobox__spinner" />
                  <span>Loading...</span>
                </div>
              ) : (
                <>
                  {groupedEntries.map((entry, i) => {
                    if (entry.type === 'header') {
                      return (
                        <div
                          key={`group-${entry.group}`}
                          className="ui-combobox__group-header"
                          role="presentation"
                        >
                          {entry.group}
                        </div>
                      )
                    }

                    const option = entry.option
                    const enabledIdx = enabledOptions.indexOf(option)
                    const isActive = enabledIdx === activeIndex
                    const isSelected = option.value === resolvedValue
                    return (
                      <div
                        key={option.value}
                        role="option"
                        id={getOptionId(option.value)}
                        aria-selected={isSelected}
                        aria-disabled={option.disabled || undefined}
                        className="ui-combobox__option"
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
                          <span className="ui-combobox__option-icon">
                            {option.icon}
                          </span>
                        )}
                        <span className="ui-combobox__option-content">
                          <span className="ui-combobox__option-label">
                            {highlightMatch(option.label, query)}
                          </span>
                          {option.description && (
                            <span className="ui-combobox__option-description">
                              {option.description}
                            </span>
                          )}
                        </span>
                        {isSelected && (
                          <Icon
                            name="check"
                            size="sm"
                            className="ui-combobox__check"
                          />
                        )}
                      </div>
                    )
                  })}

                  {showCreate && (
                    <div
                      role="option"
                      id={`${id}-option-create`}
                      aria-selected={false}
                      className="ui-combobox__option ui-combobox__create"
                      {...(activeIndex === enabledOptions.length
                        ? { 'data-active': '' }
                        : {})}
                      onClick={handleCreate}
                      onMouseEnter={() =>
                        setActiveIndex(enabledOptions.length)
                      }
                    >
                      Create &ldquo;{query}&rdquo;
                    </div>
                  )}

                  {filteredOptions.length === 0 && !showCreate && (
                    <div className="ui-combobox__empty">{emptyMessage}</div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {resolvedError && (
          <div className="ui-combobox__error" id={errorId} role="alert">
            {resolvedError}
          </div>
        )}
      </div>
    )
  }
)
Combobox.displayName = 'Combobox'
