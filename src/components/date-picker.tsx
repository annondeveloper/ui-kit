'use client'

import {
  forwardRef,
  useState,
  useRef,
  useCallback,
  useEffect,
  type HTMLAttributes,
  type ReactNode,
  type KeyboardEvent,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useStableId } from '../core/a11y/stable-id'
import { cn } from '../core/utils/cn'

export interface DatePickerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'value' | 'defaultValue'> {
  value?: string
  defaultValue?: string
  onChange?: (date: string) => void
  min?: string
  max?: string
  placeholder?: string
  label?: ReactNode
  error?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  showWeekNumbers?: boolean
  firstDayOfWeek?: 0 | 1
  motion?: 0 | 1 | 2 | 3
}

// ─── Icons ──────────────────────────────────────────────────────────────────

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const ChevronLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

const ChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

// ─── Date helpers ───────────────────────────────────────────────────────────

function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDate(iso: string): string {
  try {
    const date = parseDate(iso)
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date)
  } catch {
    return iso
  }
}

function getMonthName(year: number, month: number): string {
  return new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(
    new Date(year, month, 1)
  )
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay() // 0=Sun, 1=Mon, etc.
}

const DAY_NAMES_MON = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const DAY_NAMES_SUN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const datePickerStyles = css`
  @layer components {
    @scope (.ui-date-picker) {
      :scope {
        position: relative;
        display: inline-flex;
        flex-direction: column;
        gap: var(--space-xs, 0.25rem);
        font-family: inherit;
      }

      .ui-date-picker__label {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 500;
        color: var(--text-primary, oklch(90% 0 0));
        line-height: 1.4;
        user-select: none;
      }

      .ui-date-picker__input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
      }

      .ui-date-picker__input {
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
        padding-inline-start: 0.75rem;
        padding-inline-end: 2.5rem;
        cursor: pointer;
        transition: border-color 0.15s var(--ease-out, ease-out),
                    box-shadow 0.15s var(--ease-out, ease-out);
      }

      /* Sizes */
      :scope[data-size="sm"] .ui-date-picker__input {
        min-block-size: 32px;
        padding-block: 0.25rem;
        font-size: var(--text-xs, 0.75rem);
      }
      :scope[data-size="md"] .ui-date-picker__input {
        min-block-size: 36px;
        padding-block: 0.375rem;
      }
      :scope[data-size="lg"] .ui-date-picker__input {
        min-block-size: 44px;
        padding-block: 0.5rem;
        font-size: var(--text-base, 1rem);
      }

      .ui-date-picker__input:focus {
        border-color: var(--brand, oklch(65% 0.2 270));
        box-shadow: 0 0 0 3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15);
      }

      .ui-date-picker__input:hover:not(:focus):not(:disabled) {
        border-color: var(--border-strong, oklch(100% 0 0 / 0.2));
      }

      .ui-date-picker__input:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .ui-date-picker__input::placeholder {
        color: var(--text-tertiary, oklch(60% 0 0));
      }

      /* Calendar button */
      .ui-date-picker__trigger {
        position: absolute;
        inset-inline-end: 0.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.375rem;
        border: none;
        background: none;
        color: var(--text-tertiary, oklch(60% 0 0));
        cursor: pointer;
        border-radius: var(--radius-sm, 0.25rem);
      }
      .ui-date-picker__trigger:hover {
        color: var(--text-primary, oklch(90% 0 0));
      }
      .ui-date-picker__trigger:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 1px;
      }
      .ui-date-picker__trigger svg {
        inline-size: 1rem;
        block-size: 1rem;
      }

      /* Calendar popover */
      .ui-date-picker__calendar {
        position: absolute;
        inset-block-start: 100%;
        inset-inline-start: 0;
        z-index: 50;
        margin-block-start: var(--space-xs, 0.25rem);
        padding: var(--space-sm, 0.75rem);
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.12));
        border-radius: var(--radius-md, 0.375rem);
        background: var(--surface-raised, oklch(18% 0.01 270));
        box-shadow: var(--shadow-lg, 0 8px 24px oklch(0% 0 0 / 0.3));
        min-inline-size: 280px;
      }

      /* Calendar header */
      .ui-date-picker__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-block-end: var(--space-sm, 0.5rem);
      }

      .ui-date-picker__month-label {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 600;
        color: var(--text-primary, oklch(90% 0 0));
      }

      .ui-date-picker__nav-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.25rem;
        border: none;
        background: none;
        color: var(--text-secondary, oklch(70% 0 0));
        cursor: pointer;
        border-radius: var(--radius-sm, 0.25rem);
        transition: color 0.1s;
      }
      .ui-date-picker__nav-btn:hover {
        color: var(--text-primary, oklch(90% 0 0));
        background: var(--bg-hover);
      }
      .ui-date-picker__nav-btn:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 1px;
      }
      .ui-date-picker__nav-btn svg {
        inline-size: 1rem;
        block-size: 1rem;
      }

      /* Grid */
      .ui-date-picker__grid {
        border-collapse: collapse;
        inline-size: 100%;
      }

      .ui-date-picker__grid th {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 500;
        color: var(--text-tertiary, oklch(60% 0 0));
        text-align: center;
        padding-block-end: var(--space-xs, 0.25rem);
      }

      .ui-date-picker__grid td {
        text-align: center;
        padding: 1px;
      }

      .ui-date-picker__day {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: 2rem;
        block-size: 2rem;
        border: none;
        background: none;
        color: var(--text-primary, oklch(90% 0 0));
        font-family: inherit;
        font-size: var(--text-sm, 0.875rem);
        cursor: pointer;
        border-radius: var(--radius-sm, 0.25rem);
        transition: background 0.1s, color 0.1s;
      }
      .ui-date-picker__day:hover:not(:disabled):not([data-selected]) {
        background: var(--bg-active);
      }
      .ui-date-picker__day:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 1px;
      }
      .ui-date-picker__day:disabled {
        color: var(--text-tertiary, oklch(40% 0 0));
        cursor: not-allowed;
        opacity: 0.4;
      }

      /* Selected */
      .ui-date-picker__day[data-selected] {
        background: var(--brand, oklch(65% 0.2 270));
        color: var(--text-on-brand);
        font-weight: 600;
      }

      /* Today */
      .ui-date-picker__day[data-today="true"]:not([data-selected]) {
        border: 1px solid var(--brand, oklch(65% 0.2 270));
      }

      /* Outside month */
      .ui-date-picker__day[data-outside] {
        color: var(--text-tertiary, oklch(50% 0 0));
        opacity: 0.3;
      }

      /* Error state */
      :scope[data-invalid] .ui-date-picker__input {
        border-color: var(--status-critical, oklch(65% 0.25 25));
      }

      .ui-date-picker__error {
        font-size: var(--text-xs, 0.75rem);
        color: var(--status-critical, oklch(65% 0.25 25));
        line-height: 1.4;
      }

      /* Calendar entry animation — motion 1+ */
      :scope:not([data-motion="0"]) .ui-date-picker__calendar {
        animation: ui-date-picker-in 0.15s var(--ease-out, ease-out);
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-date-picker__input {
          border: 2px solid ButtonText;
        }
        .ui-date-picker__input:focus {
          outline: 2px solid Highlight;
        }
        .ui-date-picker__calendar {
          border: 2px solid CanvasText;
        }
        .ui-date-picker__day[data-selected] {
          background: Highlight;
          color: HighlightText;
        }
        .ui-date-picker__day[data-today="true"]:not([data-selected]) {
          border-color: Highlight;
        }
      }

      /* Print */
      @media print {
        .ui-date-picker__calendar {
          display: none;
        }
        .ui-date-picker__input {
          box-shadow: none;
          border: 1px solid;
        }
      }
    }

    @keyframes ui-date-picker-in {
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

export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  (
    {
      value: valueProp,
      defaultValue,
      onChange,
      min,
      max,
      placeholder,
      label,
      error,
      disabled = false,
      size = 'md',
      showWeekNumbers = false,
      firstDayOfWeek = 1,
      motion: motionProp,
      className,
      'aria-label': ariaLabel,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('date-picker', datePickerStyles)
    const motionLevel = useMotionLevel(motionProp)
    const stableId = useStableId('date-picker')

    const isControlled = valueProp !== undefined
    const [internalValue, setInternalValue] = useState(defaultValue || '')
    const currentValue = isControlled ? valueProp : internalValue

    const [isOpen, setIsOpen] = useState(false)
    const [viewDate, setViewDate] = useState(() => {
      if (currentValue) {
        const d = parseDate(currentValue)
        return { year: d.getFullYear(), month: d.getMonth() }
      }
      const now = new Date()
      return { year: now.getFullYear(), month: now.getMonth() }
    })

    // Update viewDate when value changes
    useEffect(() => {
      if (currentValue) {
        const d = parseDate(currentValue)
        setViewDate({ year: d.getFullYear(), month: d.getMonth() })
      }
    }, [currentValue])

    const calendarRef = useRef<HTMLDivElement>(null)
    const dayRefs = useRef<Map<number, HTMLButtonElement>>(new Map())

    const today = new Date()
    const dayNames = firstDayOfWeek === 1 ? DAY_NAMES_MON : DAY_NAMES_SUN

    // Calendar grid generation
    const daysInMonth = getDaysInMonth(viewDate.year, viewDate.month)
    const firstDay = getFirstDayOfMonth(viewDate.year, viewDate.month)
    // Adjust for first day of week
    const offset = firstDayOfWeek === 1
      ? (firstDay === 0 ? 6 : firstDay - 1)
      : firstDay

    const calendarDays: Array<{ day: number; inMonth: boolean; date: Date }> = []
    // Previous month padding
    const prevDays = getDaysInMonth(viewDate.year, viewDate.month - 1)
    for (let i = offset - 1; i >= 0; i--) {
      const d = prevDays - i
      calendarDays.push({ day: d, inMonth: false, date: new Date(viewDate.year, viewDate.month - 1, d) })
    }
    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      calendarDays.push({ day: d, inMonth: true, date: new Date(viewDate.year, viewDate.month, d) })
    }
    // Next month padding
    const remaining = 42 - calendarDays.length
    for (let d = 1; d <= remaining; d++) {
      calendarDays.push({ day: d, inMonth: false, date: new Date(viewDate.year, viewDate.month + 1, d) })
    }

    const weeks: typeof calendarDays[] = []
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7))
    }

    const isDateDisabled = useCallback(
      (date: Date): boolean => {
        if (min) {
          const minDate = parseDate(min)
          if (date < minDate) return true
        }
        if (max) {
          const maxDate = parseDate(max)
          if (date > maxDate) return true
        }
        return false
      },
      [min, max]
    )

    const selectDate = useCallback(
      (dateISO: string) => {
        if (!isControlled) {
          setInternalValue(dateISO)
        }
        onChange?.(dateISO)
        setIsOpen(false)
      },
      [isControlled, onChange]
    )

    const handleOpen = useCallback(() => {
      if (disabled) return
      setIsOpen(true)
    }, [disabled])

    const handleCalendarKeyDown = useCallback(
      (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsOpen(false)
          return
        }

        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', ' '].includes(e.key)) return

        const focused = document.activeElement as HTMLButtonElement
        const dayAttr = focused?.getAttribute('data-day')
        if (!dayAttr) return

        e.preventDefault()
        const currentDay = parseInt(dayAttr, 10)

        if (e.key === 'Enter' || e.key === ' ') {
          const dateISO = toISO(new Date(viewDate.year, viewDate.month, currentDay))
          const date = new Date(viewDate.year, viewDate.month, currentDay)
          if (!isDateDisabled(date)) {
            selectDate(dateISO)
          }
          return
        }

        let newDay = currentDay
        if (e.key === 'ArrowRight') newDay = currentDay + 1
        if (e.key === 'ArrowLeft') newDay = currentDay - 1
        if (e.key === 'ArrowDown') newDay = currentDay + 7
        if (e.key === 'ArrowUp') newDay = currentDay - 7

        if (newDay >= 1 && newDay <= daysInMonth) {
          dayRefs.current.get(newDay)?.focus()
        }
      },
      [viewDate, daysInMonth, isDateDisabled, selectDate]
    )

    const navigateMonth = useCallback((delta: number) => {
      setViewDate(prev => {
        let month = prev.month + delta
        let year = prev.year
        if (month < 0) { month = 11; year-- }
        if (month > 11) { month = 0; year++ }
        return { year, month }
      })
    }, [])

    // Close on click outside
    useEffect(() => {
      if (!isOpen) return
      const handleClick = (e: MouseEvent) => {
        const target = e.target as Node
        if (calendarRef.current && !calendarRef.current.contains(target)) {
          // Only close if click is also outside the main container
          const container = calendarRef.current.closest('.ui-date-picker')
          if (container && !container.contains(target)) {
            setIsOpen(false)
          }
        }
      }
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }, [isOpen])

    const errorId = error ? `${stableId}-error` : undefined
    const inputId = `${stableId}-input`
    const dialogId = `${stableId}-dialog`
    const selectedDate = currentValue ? parseDate(currentValue) : null

    return (
      <div
        ref={ref}
        className={cn(cls('root'), className)}
        data-size={size}
        data-motion={motionLevel}
        {...(error ? { 'data-invalid': '' } : {})}
        {...rest}
      >
        {label && (
          <label htmlFor={inputId} className="ui-date-picker__label">
            {label}
          </label>
        )}

        <div className="ui-date-picker__input-wrapper">
          <input
            id={inputId}
            type="text"
            role="combobox"
            className="ui-date-picker__input"
            value={currentValue ? formatDate(currentValue) : ''}
            placeholder={placeholder}
            disabled={disabled}
            readOnly
            onClick={handleOpen}
            aria-label={ariaLabel}
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            aria-controls={isOpen ? dialogId : undefined}
          />
          <button
            type="button"
            className="ui-date-picker__trigger"
            onClick={handleOpen}
            disabled={disabled}
            aria-label="Open calendar"
            tabIndex={-1}
          >
            <CalendarIcon />
          </button>
        </div>

        {isOpen && (
          <div
            ref={calendarRef}
            className="ui-date-picker__calendar"
            role="dialog"
            aria-label="Calendar"
            id={dialogId}
            onKeyDown={handleCalendarKeyDown}
          >
            <div className="ui-date-picker__header">
              <button
                type="button"
                className="ui-date-picker__nav-btn"
                onClick={() => navigateMonth(-1)}
                aria-label="Previous month"
              >
                <ChevronLeft />
              </button>
              <span className="ui-date-picker__month-label">
                {getMonthName(viewDate.year, viewDate.month)}
              </span>
              <button
                type="button"
                className="ui-date-picker__nav-btn"
                onClick={() => navigateMonth(1)}
                aria-label="Next month"
              >
                <ChevronRight />
              </button>
            </div>

            <table className="ui-date-picker__grid" role="grid">
              <thead>
                <tr>
                  {dayNames.map(name => (
                    <th key={name} role="columnheader" scope="col">{name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeks.map((week, wi) => (
                  <tr key={wi}>
                    {week.map((cell, di) => {
                      const isToday = isSameDay(cell.date, today)
                      const isSelected = selectedDate && isSameDay(cell.date, selectedDate)
                      const isDisabled = !cell.inMonth || isDateDisabled(cell.date)

                      return (
                        <td key={di}>
                          <button
                            type="button"
                            className="ui-date-picker__day"
                            disabled={isDisabled}
                            data-today={isToday || undefined}
                            {...(isSelected ? { 'data-selected': '' } : {})}
                            {...(!cell.inMonth ? { 'data-outside': '' } : {})}
                            {...(cell.inMonth ? { 'data-day': cell.day } : {})}
                            ref={(el) => {
                              if (cell.inMonth && el) {
                                dayRefs.current.set(cell.day, el)
                              }
                            }}
                            onClick={() => {
                              if (!isDisabled && cell.inMonth) {
                                selectDate(toISO(cell.date))
                              }
                            }}
                            tabIndex={isSelected ? 0 : cell.inMonth && cell.day === 1 ? 0 : -1}
                            aria-label={cell.date.toLocaleDateString(undefined, {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          >
                            {cell.day}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {error && (
          <span id={errorId} className="ui-date-picker__error" role="alert">
            {error}
          </span>
        )}
      </div>
    )
  }
)
DatePicker.displayName = 'DatePicker'
