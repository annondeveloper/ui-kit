'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'
import { Icon } from '../core/icons'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CalendarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  value?: Date | null
  defaultValue?: Date | null
  onChange?: (date: Date) => void
  minDate?: Date
  maxDate?: Date
  disabledDates?: Date[] | ((date: Date) => boolean)
  firstDayOfWeek?: 0 | 1
  locale?: string
  showOutsideDays?: boolean
  showWeekNumbers?: boolean
  numberOfMonths?: number
  highlightToday?: boolean
  size?: 'sm' | 'md' | 'lg'
  motion?: 0 | 1 | 2 | 3
  /** Internal: used by DateRangePicker for range highlighting */
  _rangeStart?: Date | null
  _rangeEnd?: Date | null
  _hoverDate?: Date | null
  _onDayHover?: (date: Date | null) => void
  _onDayClick?: (date: Date) => void
}

// ─── Pure date helpers ──────────────────────────────────────────────────────

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function isDateBetween(date: Date, start: Date, end: Date): boolean {
  const t = date.getTime()
  const s = Math.min(start.getTime(), end.getTime())
  const e = Math.max(start.getTime(), end.getTime())
  return t >= s && t <= e
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

function getDayNames(firstDay: 0 | 1, locale: string): string[] {
  const names: string[] = []
  // Use Jan 2024 which starts on Monday
  for (let i = 0; i < 7; i++) {
    const dayIndex = (firstDay + i) % 7
    // Jan 7 2024 is a Sunday (0), Jan 8 is Monday (1), etc
    const date = new Date(2024, 0, 7 + dayIndex)
    names.push(date.toLocaleDateString(locale, { weekday: 'short' }).slice(0, 2))
  }
  return names
}

function getMonthName(year: number, month: number, locale: string): string {
  return new Date(year, month, 1).toLocaleDateString(locale, { month: 'long' })
}

const ALL_MONTHS = Array.from({ length: 12 }, (_, i) => i)

// ─── Styles ─────────────────────────────────────────────────────────────────

const calendarStyles = css`
  @layer components {
    @scope (.ui-calendar) {
      :scope {
        display: inline-flex;
        gap: var(--space-lg, 1.5rem);
        font-family: inherit;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
      }

      .ui-calendar__panel {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs, 0.25rem);
      }

      /* Header with nav */
      .ui-calendar__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-xs, 0.25rem);
        padding-block-end: var(--space-xs, 0.25rem);
      }

      .ui-calendar__nav-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid transparent;
        border-radius: var(--radius-sm, 0.25rem);
        background: transparent;
        color: var(--text-secondary, oklch(70% 0 0));
        cursor: pointer;
        padding: 0;
        min-block-size: 28px;
        min-inline-size: 28px;
        font-family: inherit;
        outline: none;
        transition: background 0.15s ease-out, color 0.15s ease-out;
      }

      .ui-calendar__nav-btn:hover {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.08);
        color: var(--text-primary, oklch(90% 0 0));
      }

      .ui-calendar__nav-btn:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 1px;
      }

      .ui-calendar__nav-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
        pointer-events: none;
      }

      /* Month/year title — clickable for dropdown */
      .ui-calendar__title-area {
        display: flex;
        align-items: center;
        gap: var(--space-2xs, 0.125rem);
        position: relative;
      }

      .ui-calendar__title-btn {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2xs, 0.125rem);
        border: none;
        border-radius: var(--radius-sm, 0.25rem);
        background: transparent;
        color: var(--text-primary, oklch(90% 0 0));
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        padding-block: 0.125rem;
        padding-inline: 0.375rem;
        outline: none;
        transition: background 0.15s ease-out;
      }

      .ui-calendar__title-btn:hover {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.08);
      }

      .ui-calendar__title-btn:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 1px;
      }

      /* Month/year picker dropdown */
      .ui-calendar__picker-dropdown {
        position: absolute;
        inset-block-start: 100%;
        inset-inline-start: 50%;
        translate: -50% 0;
        z-index: 10;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.125rem;
        padding: 0.375rem;
        border: 1px solid oklch(100% 0 0 / 0.12);
        border-radius: var(--radius-md, 0.375rem);
        background: oklch(from var(--surface-elevated, oklch(22% 0.01 270)) l c h / 0.95);
        backdrop-filter: blur(16px) saturate(1.5);
        box-shadow: 0 8px 24px oklch(0% 0 0 / 0.3), inset 0 1px 0 oklch(100% 0 0 / 0.06);
        min-inline-size: 180px;
      }

      :scope:not([data-motion="0"]) .ui-calendar__picker-dropdown {
        animation: ui-calendar-dropdown-in 0.15s ease-out;
      }

      .ui-calendar__picker-item {
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        border-radius: var(--radius-sm, 0.25rem);
        background: transparent;
        color: var(--text-primary, oklch(90% 0 0));
        font-family: inherit;
        font-size: var(--text-xs, 0.75rem);
        padding-block: 0.375rem;
        padding-inline: 0.25rem;
        cursor: pointer;
        outline: none;
        transition: background 0.1s ease-out;
      }

      .ui-calendar__picker-item:hover {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.12);
      }

      .ui-calendar__picker-item[data-selected] {
        background: var(--brand, oklch(65% 0.2 270));
        color: var(--text-on-brand, oklch(100% 0 0));
        font-weight: 600;
      }

      .ui-calendar__picker-item:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 1px;
      }

      /* Grid */
      .ui-calendar__grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 1px;
      }

      :scope[data-show-week-numbers] .ui-calendar__grid {
        grid-template-columns: auto repeat(7, 1fr);
      }

      .ui-calendar__day-header {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-xs, 0.75rem);
        font-weight: 500;
        color: var(--text-tertiary, oklch(60% 0 0));
        padding-block: 0.25rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .ui-calendar__week-number {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary, oklch(60% 0 0));
        padding-inline-end: 0.375rem;
        min-inline-size: 2rem;
      }

      /* Day cell */
      .ui-calendar__day {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        border-radius: var(--radius-sm, 0.25rem);
        background: transparent;
        color: var(--text-primary, oklch(90% 0 0));
        font-family: inherit;
        font-size: var(--text-sm, 0.875rem);
        cursor: pointer;
        outline: none;
        transition: background 0.1s ease-out, box-shadow 0.15s ease-out, color 0.1s ease-out;
        font-variant-numeric: tabular-nums;
      }

      .ui-calendar__day:hover:not(:disabled):not([data-selected]) {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.08);
        box-shadow: 0 0 12px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.1);
      }

      .ui-calendar__day:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 1px;
        z-index: 1;
      }

      /* Today */
      .ui-calendar__day[data-today] {
        box-shadow: inset 0 0 0 1.5px var(--brand, oklch(65% 0.2 270));
        font-weight: 600;
      }

      /* Selected */
      .ui-calendar__day[data-selected] {
        background: var(--brand, oklch(65% 0.2 270));
        color: var(--text-on-brand, oklch(100% 0 0));
        font-weight: 600;
        box-shadow: 0 0 16px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.3), inset 0 1px 0 oklch(100% 0 0 / 0.15);
      }

      /* In range */
      .ui-calendar__day[data-in-range] {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.12);
        border-radius: 0;
      }

      .ui-calendar__day[data-range-start] {
        border-start-start-radius: var(--radius-sm, 0.25rem);
        border-end-start-radius: var(--radius-sm, 0.25rem);
        background: var(--brand, oklch(65% 0.2 270));
        color: var(--text-on-brand, oklch(100% 0 0));
        font-weight: 600;
      }

      .ui-calendar__day[data-range-end] {
        border-start-end-radius: var(--radius-sm, 0.25rem);
        border-end-end-radius: var(--radius-sm, 0.25rem);
        background: var(--brand, oklch(65% 0.2 270));
        color: var(--text-on-brand, oklch(100% 0 0));
        font-weight: 600;
      }

      /* Outside month */
      .ui-calendar__day[data-outside] {
        color: var(--text-tertiary, oklch(50% 0 0));
        opacity: 0.4;
      }

      /* Disabled */
      .ui-calendar__day:disabled {
        color: var(--text-tertiary, oklch(50% 0 0));
        opacity: 0.3;
        cursor: not-allowed;
        pointer-events: none;
      }

      /* Sizes */
      :scope[data-size="sm"] .ui-calendar__day {
        min-block-size: 28px;
        min-inline-size: 28px;
        font-size: var(--text-xs, 0.75rem);
      }
      :scope[data-size="sm"] .ui-calendar__title-btn {
        font-size: var(--text-sm, 0.875rem);
      }

      :scope[data-size="md"] .ui-calendar__day {
        min-block-size: 36px;
        min-inline-size: 36px;
        font-size: var(--text-sm, 0.875rem);
      }
      :scope[data-size="md"] .ui-calendar__title-btn {
        font-size: var(--text-base, 1rem);
      }

      :scope[data-size="lg"] .ui-calendar__day {
        min-block-size: 44px;
        min-inline-size: 44px;
        font-size: var(--text-base, 1rem);
      }
      :scope[data-size="lg"] .ui-calendar__title-btn {
        font-size: var(--text-lg, 1.125rem);
      }

      /* Touch targets */
      @media (pointer: coarse) {
        .ui-calendar__day {
          min-block-size: 44px;
          min-inline-size: 44px;
        }
        .ui-calendar__nav-btn {
          min-block-size: 44px;
          min-inline-size: 44px;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-calendar__day[data-selected] {
          outline: 2px solid Highlight;
          forced-color-adjust: none;
        }
        .ui-calendar__day[data-today] {
          outline: 2px solid LinkText;
        }
        .ui-calendar__day:focus-visible {
          outline: 2px solid Highlight;
        }
        .ui-calendar__nav-btn {
          border: 1px solid ButtonText;
        }
        .ui-calendar__picker-dropdown {
          border: 2px solid ButtonText;
        }
      }

      /* Print */
      @media print {
        .ui-calendar__day[data-selected] {
          background: none;
          border: 2px solid;
          font-weight: 700;
        }
        .ui-calendar__picker-dropdown {
          display: none;
        }
      }

      /* Reduced data */
      @media (prefers-reduced-data: reduce) {
        .ui-calendar__day {
          transition: none;
          box-shadow: none;
        }
      }
    }

    @keyframes ui-calendar-dropdown-in {
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

export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(
  (
    {
      value: controlledValue,
      defaultValue,
      onChange,
      minDate,
      maxDate,
      disabledDates,
      firstDayOfWeek = 0,
      locale = 'en-US',
      showOutsideDays = true,
      showWeekNumbers = false,
      numberOfMonths = 1,
      highlightToday = true,
      size = 'md',
      motion: motionProp,
      _rangeStart,
      _rangeEnd,
      _hoverDate,
      _onDayHover,
      _onDayClick,
      className,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('calendar', calendarStyles)
    const motionLevel = useMotionLevel(motionProp)

    // ── State ─────────────────────────────────────────────────────────
    const [internalValue, setInternalValue] = useState<Date | null>(defaultValue ?? null)
    const [viewYear, setViewYear] = useState(() => {
      const init = controlledValue ?? defaultValue ?? new Date()
      return init.getFullYear()
    })
    const [viewMonth, setViewMonth] = useState(() => {
      const init = controlledValue ?? defaultValue ?? new Date()
      return init.getMonth()
    })
    const [focusedDay, setFocusedDay] = useState<Date | null>(null)
    const [pickerOpen, setPickerOpen] = useState<'month' | 'year' | null>(null)

    const gridRef = useRef<HTMLDivElement>(null)

    const selectedDate = controlledValue !== undefined ? controlledValue : internalValue
    const today = useMemo(() => new Date(), [])

    // ── Navigation ────────────────────────────────────────────────────
    const goToPrevMonth = useCallback(() => {
      setViewMonth(m => {
        if (m === 0) {
          setViewYear(y => y - 1)
          return 11
        }
        return m - 1
      })
    }, [])

    const goToNextMonth = useCallback(() => {
      setViewMonth(m => {
        if (m === 11) {
          setViewYear(y => y + 1)
          return 0
        }
        return m + 1
      })
    }, [])

    // ── Disabled check ────────────────────────────────────────────────
    const isDisabled = useCallback(
      (date: Date): boolean => {
        if (minDate && date < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) return true
        if (maxDate && date > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())) return true
        if (!disabledDates) return false
        if (typeof disabledDates === 'function') return disabledDates(date)
        return disabledDates.some(d => isSameDay(d, date))
      },
      [minDate, maxDate, disabledDates]
    )

    // ── Day click ─────────────────────────────────────────────────────
    const handleDayClick = useCallback(
      (date: Date) => {
        if (isDisabled(date)) return
        if (_onDayClick) {
          _onDayClick(date)
          return
        }
        setInternalValue(date)
        onChange?.(date)
      },
      [isDisabled, onChange, _onDayClick]
    )

    // ── Keyboard navigation ───────────────────────────────────────────
    const handleKeyDown = useCallback(
      (e: KeyboardEvent) => {
        const current = focusedDay ?? selectedDate ?? today
        let next: Date | null = null

        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault()
            next = new Date(current.getFullYear(), current.getMonth(), current.getDate() - 1)
            break
          case 'ArrowRight':
            e.preventDefault()
            next = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1)
            break
          case 'ArrowUp':
            e.preventDefault()
            next = new Date(current.getFullYear(), current.getMonth(), current.getDate() - 7)
            break
          case 'ArrowDown':
            e.preventDefault()
            next = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 7)
            break
          case 'PageUp':
            e.preventDefault()
            if (e.shiftKey) {
              next = new Date(current.getFullYear() - 1, current.getMonth(), current.getDate())
            } else {
              next = new Date(current.getFullYear(), current.getMonth() - 1, current.getDate())
            }
            break
          case 'PageDown':
            e.preventDefault()
            if (e.shiftKey) {
              next = new Date(current.getFullYear() + 1, current.getMonth(), current.getDate())
            } else {
              next = new Date(current.getFullYear(), current.getMonth() + 1, current.getDate())
            }
            break
          case 'Home':
            e.preventDefault()
            next = new Date(current.getFullYear(), current.getMonth(), current.getDate() - current.getDay() + firstDayOfWeek)
            break
          case 'End':
            e.preventDefault()
            next = new Date(current.getFullYear(), current.getMonth(), current.getDate() + (6 - current.getDay() + firstDayOfWeek))
            break
          case 'Enter':
          case ' ':
            e.preventDefault()
            if (focusedDay) handleDayClick(focusedDay)
            return
          case 'Escape':
            e.preventDefault()
            setPickerOpen(null)
            return
        }

        if (next) {
          if (!isDisabled(next)) {
            setFocusedDay(next)
            setViewYear(next.getFullYear())
            setViewMonth(next.getMonth())
          }
        }
      },
      [focusedDay, selectedDate, today, firstDayOfWeek, handleDayClick, isDisabled]
    )

    // ── Focus management ──────────────────────────────────────────────
    useEffect(() => {
      if (!focusedDay || !gridRef.current) return
      const dayStr = `${focusedDay.getFullYear()}-${focusedDay.getMonth()}-${focusedDay.getDate()}`
      const btn = gridRef.current.querySelector(`[data-day-key="${dayStr}"]`) as HTMLButtonElement
      btn?.focus()
    }, [focusedDay])

    // ── Build day names ───────────────────────────────────────────────
    const dayNames = useMemo(() => getDayNames(firstDayOfWeek, locale), [firstDayOfWeek, locale])

    // ── Build grid for a month ────────────────────────────────────────
    const buildMonthGrid = useCallback(
      (year: number, month: number) => {
        const totalDays = daysInMonth(year, month)
        const firstDay = getFirstDayOfMonth(year, month)
        const startOffset = (firstDay - firstDayOfWeek + 7) % 7

        const days: Array<{ date: Date; outside: boolean }> = []

        // Previous month days
        if (showOutsideDays) {
          const prevMonthDays = daysInMonth(year, month - 1)
          for (let i = startOffset - 1; i >= 0; i--) {
            days.push({
              date: new Date(year, month - 1, prevMonthDays - i),
              outside: true,
            })
          }
        } else {
          for (let i = 0; i < startOffset; i++) {
            days.push({ date: new Date(year, month, 0), outside: true })
          }
        }

        // Current month days
        for (let d = 1; d <= totalDays; d++) {
          days.push({ date: new Date(year, month, d), outside: false })
        }

        // Next month days to fill out grid (6 rows)
        const remaining = 42 - days.length
        if (showOutsideDays) {
          for (let d = 1; d <= remaining; d++) {
            days.push({ date: new Date(year, month + 1, d), outside: true })
          }
        } else {
          for (let d = 0; d < remaining; d++) {
            days.push({ date: new Date(year, month + 1, 1), outside: true })
          }
        }

        // Break into weeks
        const weeks: Array<Array<{ date: Date; outside: boolean }>> = []
        for (let i = 0; i < days.length; i += 7) {
          weeks.push(days.slice(i, i + 7))
        }

        return weeks
      },
      [firstDayOfWeek, showOutsideDays]
    )

    // ── Render month panel ────────────────────────────────────────────
    const renderMonth = (panelYear: number, panelMonth: number, panelIndex: number) => {
      const weeks = buildMonthGrid(panelYear, panelMonth)
      const monthName = getMonthName(panelYear, panelMonth, locale)

      return (
        <div className="ui-calendar__panel" key={`${panelYear}-${panelMonth}`}>
          <div className="ui-calendar__header">
            {panelIndex === 0 && (
              <button
                type="button"
                className="ui-calendar__nav-btn"
                onClick={goToPrevMonth}
                aria-label="Previous month"
              >
                <Icon name="chevron-left" size="sm" />
              </button>
            )}
            {panelIndex > 0 && <span />}

            <div className="ui-calendar__title-area">
              <button
                type="button"
                className="ui-calendar__title-btn"
                onClick={() => setPickerOpen(pickerOpen === 'month' ? null : 'month')}
                aria-label="Select month"
              >
                {monthName}
              </button>
              <button
                type="button"
                className="ui-calendar__title-btn"
                onClick={() => setPickerOpen(pickerOpen === 'year' ? null : 'year')}
                aria-label="Select year"
              >
                {panelYear}
              </button>

              {pickerOpen === 'month' && panelIndex === 0 && (
                <div className="ui-calendar__picker-dropdown" role="listbox" aria-label="Select month">
                  {ALL_MONTHS.map(m => (
                    <button
                      key={m}
                      type="button"
                      role="option"
                      aria-selected={m === panelMonth}
                      className="ui-calendar__picker-item"
                      {...(m === panelMonth ? { 'data-selected': '' } : {})}
                      onClick={() => {
                        setViewMonth(m)
                        setPickerOpen(null)
                      }}
                    >
                      {getMonthName(panelYear, m, locale).slice(0, 3)}
                    </button>
                  ))}
                </div>
              )}

              {pickerOpen === 'year' && panelIndex === 0 && (
                <div className="ui-calendar__picker-dropdown" role="listbox" aria-label="Select year">
                  {Array.from({ length: 12 }, (_, i) => panelYear - 5 + i).map(y => (
                    <button
                      key={y}
                      type="button"
                      role="option"
                      aria-selected={y === panelYear}
                      className="ui-calendar__picker-item"
                      {...(y === panelYear ? { 'data-selected': '' } : {})}
                      onClick={() => {
                        setViewYear(y)
                        setPickerOpen(null)
                      }}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {panelIndex === (numberOfMonths - 1) && (
              <button
                type="button"
                className="ui-calendar__nav-btn"
                onClick={goToNextMonth}
                aria-label="Next month"
              >
                <Icon name="chevron-right" size="sm" />
              </button>
            )}
            {panelIndex < (numberOfMonths - 1) && <span />}
          </div>

          <div
            className="ui-calendar__grid"
            role="grid"
            aria-label={`${monthName} ${panelYear}`}
          >
            {/* Week number header placeholder */}
            {showWeekNumbers && <div className="ui-calendar__day-header" />}
            {/* Day name headers */}
            {dayNames.map((name, i) => (
              <div key={i} className="ui-calendar__day-header" role="columnheader" aria-label={name}>
                {name}
              </div>
            ))}

            {/* Day cells */}
            {weeks.map((week, wi) => (
              <>
                {showWeekNumbers && (
                  <div key={`wn-${wi}`} className="ui-calendar__week-number" aria-hidden="true">
                    {getWeekNumber(week[0].date)}
                  </div>
                )}
                {week.map(({ date, outside }, di) => {
                  if (outside && !showOutsideDays) {
                    return <div key={`${wi}-${di}`} />
                  }

                  const isToday = highlightToday && isSameDay(date, today)
                  const isSelected = selectedDate ? isSameDay(date, selectedDate) : false
                  const disabled = isDisabled(date)
                  const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`

                  // Range highlighting
                  const rangeStart = _rangeStart ?? null
                  const rangeEnd = _rangeEnd ?? _hoverDate ?? null
                  const inRange = rangeStart && rangeEnd && !outside
                    ? isDateBetween(date, rangeStart, rangeEnd)
                    : false
                  const isRangeStart = rangeStart && !outside ? isSameDay(date, rangeStart) : false
                  const isRangeEnd = rangeEnd && !outside ? isSameDay(date, rangeEnd) : false

                  return (
                    <button
                      key={`${wi}-${di}`}
                      type="button"
                      role="gridcell"
                      className="ui-calendar__day"
                      data-day-key={dayKey}
                      tabIndex={
                        focusedDay
                          ? isSameDay(date, focusedDay) ? 0 : -1
                          : (isSelected || (isToday && !selectedDate)) ? 0 : -1
                      }
                      disabled={disabled}
                      aria-selected={isSelected || undefined}
                      aria-disabled={disabled || undefined}
                      aria-current={isToday ? 'date' : undefined}
                      {...(isToday ? { 'data-today': '' } : {})}
                      {...(isSelected ? { 'data-selected': '' } : {})}
                      {...(outside ? { 'data-outside': '' } : {})}
                      {...(inRange ? { 'data-in-range': '' } : {})}
                      {...(isRangeStart ? { 'data-range-start': '' } : {})}
                      {...(isRangeEnd ? { 'data-range-end': '' } : {})}
                      onClick={() => handleDayClick(date)}
                      onMouseEnter={() => _onDayHover?.(date)}
                      onMouseLeave={() => _onDayHover?.(null)}
                      onFocus={() => setFocusedDay(date)}
                    >
                      {date.getDate()}
                    </button>
                  )
                })}
              </>
            ))}
          </div>
        </div>
      )
    }

    // ── Compute panels ────────────────────────────────────────────────
    const panels: Array<{ year: number; month: number }> = []
    for (let i = 0; i < numberOfMonths; i++) {
      let m = viewMonth + i
      let y = viewYear
      if (m > 11) {
        m -= 12
        y += 1
      }
      panels.push({ year: y, month: m })
    }

    return (
      <div
        ref={ref}
        className={cn(cls('root'), className)}
        data-size={size}
        data-motion={motionLevel}
        {...(showWeekNumbers ? { 'data-show-week-numbers': '' } : {})}
        role="application"
        aria-label="Calendar"
        {...rest}
      >
        <div ref={gridRef} onKeyDown={handleKeyDown}>
          {panels.map((p, i) => renderMonth(p.year, p.month, i))}
        </div>
      </div>
    )
  }
)
Calendar.displayName = 'Calendar'
