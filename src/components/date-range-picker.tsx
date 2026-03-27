'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
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
import { Calendar } from './calendar'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface DateRangePreset {
  label: string
  range: [Date, Date]
}

export interface DateRangePickerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: [Date | null, Date | null]
  onChange?: (range: [Date | null, Date | null]) => void
  presets?: DateRangePreset[]
  minDate?: Date
  maxDate?: Date
  label?: string
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  error?: string
  disabled?: boolean
  motion?: 0 | 1 | 2 | 3
  name?: string
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(date: Date | null, locale = 'en-US'): string {
  if (!date) return ''
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' })
}

function formatRangeDisplay(
  range: [Date | null, Date | null],
  placeholder: string
): string {
  const [start, end] = range
  if (!start && !end) return placeholder
  if (start && !end) return formatDate(start)
  if (start && end) return `${formatDate(start)} – ${formatDate(end)}`
  return placeholder
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const dateRangePickerStyles = css`
  @layer components {
    @scope (.ui-date-range-picker) {
      :scope {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs, 0.25rem);
        position: relative;
        font-family: inherit;
      }

      .ui-date-range-picker__label {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 500;
        color: var(--text-primary, oklch(90% 0 0));
        line-height: 1.4;
        user-select: none;
      }

      .ui-date-range-picker__trigger {
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
      :scope[data-size="sm"] .ui-date-range-picker__trigger {
        min-block-size: 32px;
        padding-block: 0.25rem;
        padding-inline: 0.5rem;
        font-size: var(--text-xs, 0.75rem);
      }
      :scope[data-size="md"] .ui-date-range-picker__trigger {
        min-block-size: 36px;
        padding-block: 0.375rem;
        padding-inline: 0.75rem;
        font-size: var(--text-sm, 0.875rem);
      }
      :scope[data-size="lg"] .ui-date-range-picker__trigger {
        min-block-size: 44px;
        padding-block: 0.5rem;
        padding-inline: 1rem;
        font-size: var(--text-base, 1rem);
      }

      .ui-date-range-picker__trigger:focus-visible {
        border-color: var(--brand, oklch(65% 0.2 270));
        box-shadow: 0 0 0 3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15);
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 1px;
      }

      .ui-date-range-picker__trigger:hover:not(:focus-visible):not(:disabled) {
        border-color: var(--border-strong, oklch(100% 0 0 / 0.2));
      }

      /* Disabled */
      :scope[data-disabled] {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      .ui-date-range-picker__value {
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

      .ui-date-range-picker__placeholder {
        color: var(--text-tertiary, oklch(60% 0 0));
      }

      .ui-date-range-picker__icon {
        flex-shrink: 0;
        color: var(--text-tertiary, oklch(60% 0 0));
      }

      .ui-date-range-picker__clear {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        cursor: pointer;
        color: var(--text-tertiary, oklch(60% 0 0));
        border-radius: var(--radius-sm, 0.25rem);
        padding: 0.125rem;
      }

      .ui-date-range-picker__clear:hover {
        color: var(--text-primary, oklch(90% 0 0));
      }

      /* Popover */
      .ui-date-range-picker__popover {
        z-index: 50;
        display: flex;
        border: 1px solid oklch(100% 0 0 / 0.12);
        border-radius: var(--radius-lg, 0.5rem);
        background: oklch(from var(--surface-elevated, oklch(22% 0.01 270)) l c h / 0.95);
        backdrop-filter: blur(16px) saturate(1.5);
        box-shadow: 0 12px 40px oklch(0% 0 0 / 0.35), 0 4px 16px oklch(0% 0 0 / 0.2), inset 0 1px 0 oklch(100% 0 0 / 0.06);
        padding: var(--space-md, 0.75rem);
        outline: none;
      }

      :scope:not([data-motion="0"]) .ui-date-range-picker__popover {
        animation: ui-drp-popover-in 0.15s ease-out;
      }

      .ui-date-range-picker__presets {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
        border-inline-end: 1px solid oklch(100% 0 0 / 0.08);
        padding-inline-end: var(--space-md, 0.75rem);
        margin-inline-end: var(--space-md, 0.75rem);
        min-inline-size: 140px;
      }

      .ui-date-range-picker__preset-title {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary, oklch(60% 0 0));
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding-block: 0.375rem;
        padding-inline: 0.5rem;
      }

      .ui-date-range-picker__preset-btn {
        display: flex;
        align-items: center;
        border: none;
        border-radius: var(--radius-sm, 0.25rem);
        background: transparent;
        color: var(--text-primary, oklch(90% 0 0));
        font-family: inherit;
        font-size: var(--text-sm, 0.875rem);
        padding-block: 0.375rem;
        padding-inline: 0.5rem;
        cursor: pointer;
        outline: none;
        transition: background 0.1s ease-out;
        text-align: start;
      }

      .ui-date-range-picker__preset-btn:hover {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.08);
      }

      .ui-date-range-picker__preset-btn:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 1px;
      }

      .ui-date-range-picker__preset-btn[data-active] {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.12);
        font-weight: 500;
      }

      .ui-date-range-picker__calendars {
        display: flex;
        gap: var(--space-md, 0.75rem);
      }

      /* Error */
      :scope[data-invalid] .ui-date-range-picker__trigger {
        border-color: var(--status-critical, oklch(65% 0.25 25));
        box-shadow: 0 0 0 1px oklch(from var(--status-critical, oklch(65% 0.25 25)) l c h / 0.2);
      }

      .ui-date-range-picker__error {
        font-size: var(--text-xs, 0.75rem);
        color: var(--status-critical, oklch(65% 0.25 25));
        line-height: 1.4;
      }

      :scope:not([data-motion="0"]) .ui-date-range-picker__error {
        animation: ui-drp-error-in 0.2s ease-out;
      }

      /* Touch targets */
      @media (pointer: coarse) {
        .ui-date-range-picker__trigger {
          min-block-size: 44px;
        }
        .ui-date-range-picker__preset-btn {
          min-block-size: 44px;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-date-range-picker__trigger {
          border: 2px solid ButtonText;
        }
        .ui-date-range-picker__trigger:focus-visible {
          outline: 2px solid Highlight;
        }
        :scope[data-invalid] .ui-date-range-picker__trigger {
          border-color: LinkText;
        }
        .ui-date-range-picker__popover {
          border: 2px solid ButtonText;
        }
      }

      /* Print */
      @media print {
        .ui-date-range-picker__trigger {
          box-shadow: none;
          border: 1px solid;
        }
        .ui-date-range-picker__popover {
          display: none;
        }
      }

      /* Reduced data */
      @media (prefers-reduced-data: reduce) {
        .ui-date-range-picker__popover,
        .ui-date-range-picker__error {
          animation: none;
          transition: none;
        }
      }
    }

    @keyframes ui-drp-popover-in {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes ui-drp-error-in {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export const DateRangePicker = forwardRef<HTMLDivElement, DateRangePickerProps>(
  (
    {
      value: controlledValue,
      onChange,
      presets,
      minDate,
      maxDate,
      label,
      placeholder = 'Select date range',
      size = 'md',
      error: errorProp,
      disabled,
      motion: motionProp,
      name,
      className,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('date-range-picker', dateRangePickerStyles)
    const motionLevel = useMotionLevel(motionProp)
    const id = useStableId('drp')
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
    const [internalRange, setInternalRange] = useState<[Date | null, Date | null]>([null, null])
    const [hoverDate, setHoverDate] = useState<Date | null>(null)
    const [selectingEnd, setSelectingEnd] = useState(false)

    const resolvedRange = controlledValue ?? internalRange

    const triggerRef = useRef<HTMLButtonElement>(null)
    const popoverRef = useRef<HTMLDivElement>(null)
    const rootRef = useRef<HTMLDivElement>(null)

    // ── Position ──────────────────────────────────────────────────────
    const position = useAnchorPosition(triggerRef, popoverRef, {
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

    // ── Open / Close ──────────────────────────────────────────────────
    const open = useCallback(() => {
      if (disabled) return
      setIsOpen(true)
      setSelectingEnd(false)
    }, [disabled])

    const close = useCallback(() => {
      setIsOpen(false)
      setHoverDate(null)
      setSelectingEnd(false)
      triggerRef.current?.focus()
      fieldProps?.onBlur?.()
    }, [fieldProps])

    // ── Day click for range ───────────────────────────────────────────
    const handleDayClick = useCallback(
      (date: Date) => {
        if (!selectingEnd) {
          // First click: set start
          const newRange: [Date | null, Date | null] = [date, null]
          setInternalRange(newRange)
          onChange?.(newRange)
          setSelectingEnd(true)
        } else {
          // Second click: set end
          const start = resolvedRange[0]!
          const newRange: [Date | null, Date | null] =
            date >= start ? [start, date] : [date, start]
          setInternalRange(newRange)
          onChange?.(newRange)
          setSelectingEnd(false)
          close()
        }
      },
      [selectingEnd, resolvedRange, onChange, close]
    )

    // ── Preset validation helper ──────────────────────────────────────
    const isPresetFullyOutOfBounds = useCallback(
      (preset: DateRangePreset): boolean => {
        const [start, end] = preset.range
        if (minDate && maxDate) {
          return end < minDate || start > maxDate
        }
        if (minDate) return end < minDate
        if (maxDate) return start > maxDate
        return false
      },
      [minDate, maxDate]
    )

    // ── Preset click ──────────────────────────────────────────────────
    const handlePresetClick = useCallback(
      (preset: DateRangePreset) => {
        let start = preset.range[0]
        let end = preset.range[1]

        // Clamp the preset range to minDate/maxDate
        if (minDate && start < minDate) start = minDate
        if (maxDate && end > maxDate) end = maxDate

        const newRange: [Date | null, Date | null] = [start, end]
        setInternalRange(newRange)
        onChange?.(newRange)
        close()
      },
      [onChange, close, minDate, maxDate]
    )

    // ── Clear ─────────────────────────────────────────────────────────
    const handleClear = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation()
        const empty: [Date | null, Date | null] = [null, null]
        setInternalRange(empty)
        onChange?.(empty)
      },
      [onChange]
    )

    // ── Click outside ─────────────────────────────────────────────────
    useEffect(() => {
      if (!isOpen) return
      const handleClickOutside = (e: MouseEvent) => {
        const root = rootRef.current
        const popover = popoverRef.current
        const target = e.target as Node
        if (root && !root.contains(target) && (!popover || !popover.contains(target))) {
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

    // ── Derived ───────────────────────────────────────────────────────
    const hasValue = resolvedRange[0] !== null || resolvedRange[1] !== null
    const displayText = formatRangeDisplay(resolvedRange, placeholder)
    const isPlaceholder = !hasValue

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
          <label className="ui-date-range-picker__label" id={labelId}>
            {label}
          </label>
        )}

        <button
          ref={triggerRef}
          type="button"
          className="ui-date-range-picker__trigger"
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-labelledby={label ? labelId : undefined}
          aria-invalid={resolvedError ? true : undefined}
          aria-describedby={resolvedError ? errorId : undefined}
          disabled={disabled}
          onClick={() => (isOpen ? close() : open())}
        >
          <Icon name="calendar" size="sm" className="ui-date-range-picker__icon" />
          <span className="ui-date-range-picker__value">
            {isPlaceholder ? (
              <span className="ui-date-range-picker__placeholder">{placeholder}</span>
            ) : (
              displayText
            )}
          </span>
          {hasValue && (
            <span
              className="ui-date-range-picker__clear"
              role="button"
              tabIndex={-1}
              aria-label="Clear date range"
              onClick={handleClear}
            >
              <Icon name="x" size="sm" />
            </span>
          )}
        </button>

        {isOpen && createPortal(
          <div
            ref={popoverRef}
            className="ui-date-range-picker__popover"
            role="dialog"
            aria-label="Date range picker"
            tabIndex={-1}
            style={{
              position: 'fixed',
              left: `${position.x}px`,
              top: `${position.y}px`,
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault()
                close()
              }
            }}
          >
            {presets && presets.length > 0 && (
              <div className="ui-date-range-picker__presets">
                <div className="ui-date-range-picker__preset-title">Presets</div>
                {presets.map((preset, i) => {
                  const outOfBounds = isPresetFullyOutOfBounds(preset)
                  return (
                    <button
                      key={i}
                      type="button"
                      className="ui-date-range-picker__preset-btn"
                      onClick={() => handlePresetClick(preset)}
                      disabled={outOfBounds}
                      aria-disabled={outOfBounds || undefined}
                    >
                      {preset.label}
                    </button>
                  )
                })}
              </div>
            )}

            <div className="ui-date-range-picker__calendars">
              <Calendar
                numberOfMonths={2}
                minDate={minDate}
                maxDate={maxDate}
                size={size}
                motion={motionProp}
                _rangeStart={resolvedRange[0]}
                _rangeEnd={resolvedRange[1]}
                _hoverDate={selectingEnd ? (hoverDate ?? resolvedRange[0]) : null}
                _onDayHover={setHoverDate}
                _onDayClick={handleDayClick}
              />
            </div>
          </div>,
          document.body
        )}

        {resolvedError && (
          <div className="ui-date-range-picker__error" id={errorId} role="alert">
            {resolvedError}
          </div>
        )}
      </div>
    )
  }
)
DateRangePicker.displayName = 'DateRangePicker'
