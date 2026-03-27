'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useStableId } from '../core/a11y/stable-id'
import { useAnchorPosition } from '../core/a11y/anchor-position'
import { useFormContextOptional } from '../core/forms/form-context'
import { cn } from '../core/utils/cn'
import { Icon } from '../core/icons'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TimePickerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string
  onChange?: (time: string) => void
  format?: '12h' | '24h'
  minuteStep?: number
  minTime?: string
  maxTime?: string
  label?: string
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  error?: string
  disabled?: boolean
  clearable?: boolean
  motion?: 0 | 1 | 2 | 3
  name?: string
}

// ─── Time helpers ───────────────────────────────────────────────────────────

function parseTime(time: string): { hours: number; minutes: number } | null {
  // Handle "2:30 PM" format
  const amPmMatch = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (amPmMatch) {
    let hours = parseInt(amPmMatch[1], 10)
    const minutes = parseInt(amPmMatch[2], 10)
    const period = amPmMatch[3].toUpperCase()
    if (period === 'PM' && hours !== 12) hours += 12
    if (period === 'AM' && hours === 12) hours = 0
    return { hours, minutes }
  }
  // Handle "14:30" format
  const h24Match = time.match(/^(\d{1,2}):(\d{2})$/)
  if (h24Match) {
    return { hours: parseInt(h24Match[1], 10), minutes: parseInt(h24Match[2], 10) }
  }
  return null
}

function formatTime(hours: number, minutes: number, format: '12h' | '24h'): string {
  if (format === '24h') {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  }
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`
}

function timeToMinutes(hours: number, minutes: number): number {
  return hours * 60 + minutes
}

function generateHours(format: '12h' | '24h'): number[] {
  if (format === '24h') return Array.from({ length: 24 }, (_, i) => i)
  return Array.from({ length: 12 }, (_, i) => i === 0 ? 12 : i)
}

function generateMinutes(step: number): number[] {
  const mins: number[] = []
  for (let i = 0; i < 60; i += step) {
    mins.push(i)
  }
  return mins
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const timePickerStyles = css`
  @layer components {
    @scope (.ui-time-picker) {
      :scope {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs, 0.25rem);
        position: relative;
        font-family: inherit;
      }

      .ui-time-picker__label {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 500;
        color: var(--text-primary, oklch(90% 0 0));
        line-height: 1.4;
        user-select: none;
      }

      .ui-time-picker__trigger {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        inline-size: 100%;
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.12));
        border-radius: var(--radius-md, 0.375rem);
        background: var(--surface-default, oklch(18% 0.01 270));
        color: var(--text-primary, oklch(90% 0 0));
        font-family: inherit;
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.5;
        outline: none;
        cursor: pointer;
        transition: border-color 0.15s ease-out, box-shadow 0.15s ease-out;
      }

      /* Sizes */
      :scope[data-size="sm"] .ui-time-picker__trigger {
        min-block-size: 32px;
        padding-block: 0.25rem;
        padding-inline: 0.5rem;
        font-size: var(--text-xs, 0.75rem);
      }
      :scope[data-size="md"] .ui-time-picker__trigger {
        min-block-size: 36px;
        padding-block: 0.375rem;
        padding-inline: 0.75rem;
        font-size: var(--text-sm, 0.875rem);
      }
      :scope[data-size="lg"] .ui-time-picker__trigger {
        min-block-size: 44px;
        padding-block: 0.5rem;
        padding-inline: 1rem;
        font-size: var(--text-base, 1rem);
      }

      .ui-time-picker__trigger:focus-visible {
        border-color: var(--brand, oklch(65% 0.2 270));
        box-shadow: 0 0 0 3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15);
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 1px;
      }

      .ui-time-picker__trigger:hover:not(:focus-visible):not(:disabled) {
        border-color: var(--border-strong, oklch(100% 0 0 / 0.2));
      }

      /* Disabled */
      :scope[data-disabled] {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      .ui-time-picker__value {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        flex: 1;
        min-inline-size: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-align: start;
        font-variant-numeric: tabular-nums;
      }

      .ui-time-picker__placeholder {
        color: var(--text-tertiary, oklch(60% 0 0));
      }

      .ui-time-picker__icon {
        flex-shrink: 0;
        color: var(--text-tertiary, oklch(60% 0 0));
      }

      .ui-time-picker__clear {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        cursor: pointer;
        color: var(--text-tertiary, oklch(60% 0 0));
        border-radius: var(--radius-sm, 0.25rem);
        padding: 0.125rem;
      }

      .ui-time-picker__clear:hover {
        color: var(--text-primary, oklch(90% 0 0));
      }

      /* Dropdown */
      .ui-time-picker__dropdown {
        z-index: 50;
        display: flex;
        border: 1px solid oklch(100% 0 0 / 0.12);
        border-radius: var(--radius-lg, 0.5rem);
        background: oklch(from var(--surface-elevated, oklch(22% 0.01 270)) l c h / 0.95);
        backdrop-filter: blur(16px) saturate(1.5);
        box-shadow: 0 12px 40px oklch(0% 0 0 / 0.35), 0 4px 16px oklch(0% 0 0 / 0.2), inset 0 1px 0 oklch(100% 0 0 / 0.06);
        padding: 0.25rem;
        outline: none;
      }

      :scope:not([data-motion="0"]) .ui-time-picker__dropdown {
        animation: ui-time-picker-dropdown-in 0.15s ease-out;
      }

      .ui-time-picker__column {
        display: flex;
        flex-direction: column;
        max-block-size: 15rem;
        overflow-y: auto;
        min-inline-size: 3.5rem;
        padding: 0.125rem;
        scrollbar-width: thin;
      }

      .ui-time-picker__column + .ui-time-picker__column {
        border-inline-start: 1px solid oklch(100% 0 0 / 0.08);
      }

      .ui-time-picker__column-header {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary, oklch(60% 0 0));
        text-align: center;
        padding-block: 0.25rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        position: sticky;
        inset-block-start: 0;
        background: inherit;
      }

      .ui-time-picker__option {
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        border-radius: var(--radius-sm, 0.25rem);
        background: transparent;
        color: var(--text-primary, oklch(90% 0 0));
        font-family: inherit;
        font-size: var(--text-sm, 0.875rem);
        font-variant-numeric: tabular-nums;
        padding-block: 0.375rem;
        padding-inline: 0.5rem;
        cursor: pointer;
        outline: none;
        transition: background 0.1s ease-out;
        min-block-size: 2rem;
      }

      .ui-time-picker__option:hover:not(:disabled) {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.08);
      }

      .ui-time-picker__option[data-selected] {
        background: var(--brand, oklch(65% 0.2 270));
        color: var(--text-on-brand, oklch(100% 0 0));
        font-weight: 600;
        box-shadow: 0 0 12px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2);
      }

      .ui-time-picker__option[data-current] {
        box-shadow: inset 0 0 0 1.5px var(--brand, oklch(65% 0.2 270));
      }

      .ui-time-picker__option:disabled {
        color: var(--text-tertiary, oklch(50% 0 0));
        opacity: 0.3;
        cursor: not-allowed;
        pointer-events: none;
      }

      .ui-time-picker__option:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 1px;
      }

      /* AM/PM column */
      .ui-time-picker__period-option {
        font-weight: 600;
        font-size: var(--text-xs, 0.75rem);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      /* Error */
      :scope[data-invalid] .ui-time-picker__trigger {
        border-color: var(--status-critical, oklch(65% 0.25 25));
        box-shadow: 0 0 0 1px oklch(from var(--status-critical, oklch(65% 0.25 25)) l c h / 0.2);
      }

      .ui-time-picker__error {
        font-size: var(--text-xs, 0.75rem);
        color: var(--status-critical, oklch(65% 0.25 25));
        line-height: 1.4;
      }

      :scope:not([data-motion="0"]) .ui-time-picker__error {
        animation: ui-time-picker-error-in 0.2s ease-out;
      }

      /* Touch targets */
      @media (pointer: coarse) {
        .ui-time-picker__trigger {
          min-block-size: 44px;
        }
        .ui-time-picker__option {
          min-block-size: 44px;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-time-picker__trigger {
          border: 2px solid ButtonText;
        }
        .ui-time-picker__trigger:focus-visible {
          outline: 2px solid Highlight;
        }
        :scope[data-invalid] .ui-time-picker__trigger {
          border-color: LinkText;
        }
        .ui-time-picker__dropdown {
          border: 2px solid ButtonText;
        }
        .ui-time-picker__option[data-selected] {
          outline: 2px solid Highlight;
        }
      }

      /* Print */
      @media print {
        .ui-time-picker__trigger {
          box-shadow: none;
          border: 1px solid;
        }
        .ui-time-picker__dropdown {
          display: none;
        }
      }

      /* Reduced data */
      @media (prefers-reduced-data: reduce) {
        .ui-time-picker__dropdown,
        .ui-time-picker__error {
          animation: none;
          transition: none;
        }
      }
    }

    @keyframes ui-time-picker-dropdown-in {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes ui-time-picker-error-in {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export const TimePicker = forwardRef<HTMLDivElement, TimePickerProps>(
  (
    {
      value: controlledValue,
      onChange,
      format = '12h',
      minuteStep = 1,
      minTime,
      maxTime,
      label,
      placeholder = 'Select time',
      size = 'md',
      error: errorProp,
      disabled,
      clearable = false,
      motion: motionProp,
      name,
      className,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('time-picker', timePickerStyles)
    const motionLevel = useMotionLevel(motionProp)
    const id = useStableId('tp')
    const labelId = `${id}-label`
    const errorId = `${id}-error`

    // ── Form context ──────────────────────────────────────────────────
    const formCtx = useFormContextOptional()
    const fieldProps = name && formCtx ? formCtx.getFieldProps(name) : null
    const touched = fieldProps?.touched ?? false
    const contextError = fieldProps && touched ? fieldProps.error : undefined
    const resolvedError = errorProp !== undefined ? errorProp : contextError

    // ── State ─────────────────────────────────────────────────────────
    const [isOpen, setIsOpen] = useState(false)
    const [internalValue, setInternalValue] = useState<string>('')

    const resolvedValue = controlledValue !== undefined ? controlledValue : internalValue
    const parsed = resolvedValue ? parseTime(resolvedValue) : null

    const triggerRef = useRef<HTMLButtonElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const rootRef = useRef<HTMLDivElement>(null)
    const hourColRef = useRef<HTMLDivElement>(null)
    const minuteColRef = useRef<HTMLDivElement>(null)

    // ── Position ──────────────────────────────────────────────────────
    const position = useAnchorPosition(triggerRef, dropdownRef, {
      placement: 'bottom',
      align: 'start',
      offset: 4,
      enabled: isOpen,
    })

    // ── Ref merge ─────────────────────────────────────────────────────
    const setRootRef = useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
      },
      [ref]
    )

    // ── Min/max checking ──────────────────────────────────────────────
    const minParsed = minTime ? parseTime(minTime) : null
    const maxParsed = maxTime ? parseTime(maxTime) : null
    const minMinutes = minParsed ? timeToMinutes(minParsed.hours, minParsed.minutes) : 0
    const maxMinutes = maxParsed ? timeToMinutes(maxParsed.hours, maxParsed.minutes) : 24 * 60 - 1

    const isTimeDisabled = useCallback(
      (hours: number, minutes: number): boolean => {
        const total = timeToMinutes(hours, minutes)
        return total < minMinutes || total > maxMinutes
      },
      [minMinutes, maxMinutes]
    )

    // ── Open / Close ──────────────────────────────────────────────────
    const open = useCallback(() => {
      if (disabled) return
      setIsOpen(true)
    }, [disabled])

    const close = useCallback(() => {
      setIsOpen(false)
      triggerRef.current?.focus()
      fieldProps?.onBlur?.()
    }, [fieldProps])

    // ── Select time ───────────────────────────────────────────────────
    const selectTime = useCallback(
      (hours: number, minutes: number) => {
        if (isTimeDisabled(hours, minutes)) return
        const formatted = formatTime(hours, minutes, format)
        setInternalValue(formatted)
        onChange?.(formatted)
        if (fieldProps) {
          fieldProps.onChange(formatted)
        }
      },
      [format, onChange, fieldProps, isTimeDisabled]
    )

    // ── Hour click ────────────────────────────────────────────────────
    const handleHourClick = useCallback(
      (hour: number) => {
        let h24 = hour
        if (format === '12h') {
          const currentPeriod = parsed ? (parsed.hours >= 12 ? 'PM' : 'AM') : 'AM'
          if (currentPeriod === 'PM' && hour !== 12) h24 = hour + 12
          else if (currentPeriod === 'AM' && hour === 12) h24 = 0
          else h24 = hour
        }
        const mins = parsed?.minutes ?? 0
        selectTime(h24, mins)
      },
      [format, parsed, selectTime]
    )

    // ── Minute click ──────────────────────────────────────────────────
    const handleMinuteClick = useCallback(
      (minute: number) => {
        const hrs = parsed?.hours ?? (format === '12h' ? 12 : 0)
        selectTime(hrs, minute)
      },
      [parsed, format, selectTime]
    )

    // ── Period click ──────────────────────────────────────────────────
    const handlePeriodClick = useCallback(
      (period: 'AM' | 'PM') => {
        if (!parsed) {
          const hours = period === 'PM' ? 12 : 0
          selectTime(hours, 0)
          return
        }
        let hours = parsed.hours
        if (period === 'AM' && hours >= 12) hours -= 12
        if (period === 'PM' && hours < 12) hours += 12
        selectTime(hours, parsed.minutes)
      },
      [parsed, selectTime]
    )

    // ── Clear ─────────────────────────────────────────────────────────
    const handleClear = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation()
        setInternalValue('')
        onChange?.('')
        if (fieldProps) {
          fieldProps.onChange('')
        }
      },
      [onChange, fieldProps]
    )

    // ── Click outside ─────────────────────────────────────────────────
    useEffect(() => {
      if (!isOpen) return
      const handleClickOutside = (e: MouseEvent) => {
        const root = rootRef.current
        const dropdown = dropdownRef.current
        const target = e.target as Node
        if (root && !root.contains(target) && (!dropdown || !dropdown.contains(target))) {
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

    // ── Scroll selected into view ─────────────────────────────────────
    useEffect(() => {
      if (!isOpen) return
      requestAnimationFrame(() => {
        hourColRef.current?.querySelector('[data-selected]')?.scrollIntoView?.({ block: 'nearest' })
        minuteColRef.current?.querySelector('[data-selected]')?.scrollIntoView?.({ block: 'nearest' })
      })
    }, [isOpen])

    // ── Keyboard on trigger ───────────────────────────────────────────
    const handleTriggerKeyDown = useCallback(
      (e: KeyboardEvent) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
          if (!isOpen) {
            e.preventDefault()
            open()
          }
        }
      },
      [isOpen, open]
    )

    // ── Keyboard on dropdown ──────────────────────────────────────────
    const handleDropdownKeyDown = useCallback(
      (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault()
          close()
        }
      },
      [close]
    )

    // ── Derived ───────────────────────────────────────────────────────
    const hours = generateHours(format)
    const minutes = generateMinutes(minuteStep)
    const hasValue = !!resolvedValue
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()

    const selectedHour12 = parsed
      ? (format === '12h'
        ? (parsed.hours === 0 ? 12 : parsed.hours > 12 ? parsed.hours - 12 : parsed.hours)
        : parsed.hours)
      : null
    const selectedMinute = parsed?.minutes ?? null
    const selectedPeriod = parsed ? (parsed.hours >= 12 ? 'PM' : 'AM') : null

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
          <label className="ui-time-picker__label" id={labelId}>
            {label}
          </label>
        )}

        <button
          ref={triggerRef}
          type="button"
          className="ui-time-picker__trigger"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-labelledby={label ? labelId : undefined}
          aria-invalid={resolvedError ? true : undefined}
          aria-describedby={resolvedError ? errorId : undefined}
          disabled={disabled}
          onClick={() => (isOpen ? close() : open())}
          onKeyDown={handleTriggerKeyDown}
        >
          <Icon name="clock" size="sm" className="ui-time-picker__icon" />
          <span className="ui-time-picker__value">
            {hasValue ? (
              resolvedValue
            ) : (
              <span className="ui-time-picker__placeholder">{placeholder}</span>
            )}
          </span>
          {clearable && hasValue && (
            <span
              className="ui-time-picker__clear"
              role="button"
              tabIndex={-1}
              aria-label="Clear time"
              onClick={handleClear}
            >
              <Icon name="x" size="sm" />
            </span>
          )}
        </button>

        {isOpen && createPortal(
          <div
            ref={dropdownRef}
            className="ui-time-picker__dropdown"
            role="listbox"
            aria-label="Select time"
            tabIndex={-1}
            onKeyDown={handleDropdownKeyDown}
            style={{
              position: 'fixed',
              left: `${position.x}px`,
              top: `${position.y}px`,
            }}
          >
            {/* Hour column */}
            <div className="ui-time-picker__column" ref={hourColRef}>
              <div className="ui-time-picker__column-header">Hr</div>
              {hours.map(h => {
                const isSelected = selectedHour12 === h
                const h24 = format === '12h'
                  ? (selectedPeriod === 'PM'
                    ? (h === 12 ? 12 : h + 12)
                    : (h === 12 ? 0 : h))
                  : h
                const currentH = format === '12h'
                  ? (currentHour === 0 ? 12 : currentHour > 12 ? currentHour - 12 : currentHour)
                  : currentHour
                const isCurrent = currentH === h

                return (
                  <button
                    key={h}
                    type="button"
                    role="option"
                    className="ui-time-picker__option"
                    aria-selected={isSelected || undefined}
                    {...(isSelected ? { 'data-selected': '' } : {})}
                    {...(isCurrent ? { 'data-current': '' } : {})}
                    onClick={() => handleHourClick(h)}
                  >
                    {format === '24h' ? String(h).padStart(2, '0') : h}
                  </button>
                )
              })}
            </div>

            {/* Minute column */}
            <div className="ui-time-picker__column" ref={minuteColRef}>
              <div className="ui-time-picker__column-header">Min</div>
              {minutes.map(m => {
                const isSelected = selectedMinute === m
                const isCurrent = currentMinute === m

                return (
                  <button
                    key={m}
                    type="button"
                    role="option"
                    className="ui-time-picker__option"
                    aria-selected={isSelected || undefined}
                    {...(isSelected ? { 'data-selected': '' } : {})}
                    {...(isCurrent ? { 'data-current': '' } : {})}
                    onClick={() => handleMinuteClick(m)}
                  >
                    {String(m).padStart(2, '0')}
                  </button>
                )
              })}
            </div>

            {/* AM/PM column (12h only) */}
            {format === '12h' && (
              <div className="ui-time-picker__column">
                <div className="ui-time-picker__column-header" />
                {(['AM', 'PM'] as const).map(period => (
                  <button
                    key={period}
                    type="button"
                    role="option"
                    className={cn('ui-time-picker__option', 'ui-time-picker__period-option')}
                    aria-selected={selectedPeriod === period || undefined}
                    {...(selectedPeriod === period ? { 'data-selected': '' } : {})}
                    onClick={() => handlePeriodClick(period)}
                  >
                    {period}
                  </button>
                ))}
              </div>
            )}
          </div>,
          document.body
        )}

        {resolvedError && (
          <div className="ui-time-picker__error" id={errorId} role="alert">
            {resolvedError}
          </div>
        )}
      </div>
    )
  }
)
TimePicker.displayName = 'TimePicker'
