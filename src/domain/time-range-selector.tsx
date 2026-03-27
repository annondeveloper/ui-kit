'use client'

import {
  type HTMLAttributes,
  useRef,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'
import { ComponentErrorBoundary } from '../core/utils/error-boundary'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TimeRangePreset {
  label: string
  value: string
  range: [number, number]
}

export interface TimeRangeSelectorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  presets?: TimeRangePreset[]
  value?: [number, number]
  onChange?: (range: [number, number]) => void
  showCustom?: boolean
  motion?: 0 | 1 | 2 | 3
}

// ─── Default presets ─────────────────────────────────────────────────────────

function makeDefaultPresets(): TimeRangePreset[] {
  const now = Date.now()
  return [
    { label: '1h', value: '1h', range: [now - 3600000, now] },
    { label: '24h', value: '24h', range: [now - 86400000, now] },
    { label: '7d', value: '7d', range: [now - 604800000, now] },
    { label: '30d', value: '30d', range: [now - 2592000000, now] },
  ]
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const selectorStyles = css`
  @layer components {
    @scope (.ui-time-range-selector) {
      :scope {
        display: flex;
        min-inline-size: 200px;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
      }

      .ui-time-range-selector__presets {
        display: flex;
        gap: 2px;
        background: var(--bg-elevated, oklch(16% 0.02 275));
        border-radius: var(--radius-md, 0.5rem);
        padding: 2px;
      }

      .ui-time-range-selector__preset {
        all: unset;
        padding: var(--space-xs, 0.25rem) var(--space-sm, 0.5rem);
        font-size: var(--text-sm, 0.875rem);
        font-weight: 500;
        color: var(--text-secondary, oklch(70% 0 0));
        border-radius: calc(var(--radius-md, 0.5rem) - 2px);
        cursor: pointer;
        transition: background 0.15s ease, color 0.15s ease;
        white-space: nowrap;
      }

      :scope[data-motion="0"] .ui-time-range-selector__preset {
        transition: none;
      }

      .ui-time-range-selector__preset:hover {
        background: var(--brand-glow, oklch(65% 0.2 270 / 0.15));
        color: var(--text-primary, oklch(90% 0 0));
      }

      .ui-time-range-selector__preset[data-active="true"] {
        background: var(--brand-subtle, oklch(65% 0.2 270 / 0.08));
        color: var(--brand-light, oklch(75% 0.18 270));
        font-weight: 600;
      }

      .ui-time-range-selector__preset:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 1px;
      }

      /* Custom range inputs */
      .ui-time-range-selector__custom {
        display: flex;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary, oklch(70% 0 0));
      }

      .ui-time-range-selector__input {
        padding: var(--space-xs, 0.25rem) var(--space-sm, 0.5rem);
        font-size: var(--text-sm, 0.875rem);
        font-family: inherit;
        background: var(--bg-surface, oklch(12% 0.015 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.1));
        border-radius: var(--radius-sm, 0.375rem);
        color: var(--text-primary, oklch(90% 0 0));
        color-scheme: dark;
      }

      .ui-time-range-selector__input:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 1px;
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-time-range-selector__preset[data-active="true"] {
          border: 2px solid Highlight;
        }
        .ui-time-range-selector__input {
          border: 1px solid ButtonText;
        }
      }
    }
  }
`

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toDatetimeLocal(ts: number): string {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// ─── Component ──────────────────────────────────────────────────────────────

function TimeRangeSelectorInner({
  presets: presetsProp,
  value,
  onChange,
  showCustom = false,
  motion: motionProp,
  className,
  ...rest
}: TimeRangeSelectorProps) {
  useStyles('time-range-selector', selectorStyles)
  const motionLevel = useMotionLevel(motionProp)
  const defaultPresetsRef = useRef<TimeRangePreset[] | null>(null)

  if (!defaultPresetsRef.current && !presetsProp) {
    defaultPresetsRef.current = makeDefaultPresets()
  }
  const presets = presetsProp || defaultPresetsRef.current!

  const isActive = (preset: TimeRangePreset) => {
    if (!value) return false
    return value[0] === preset.range[0] && value[1] === preset.range[1]
  }

  const handleCustomStart = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ts = new Date(e.target.value).getTime()
    if (!isNaN(ts) && onChange) {
      onChange([ts, value?.[1] ?? Date.now()])
    }
  }

  const handleCustomEnd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ts = new Date(e.target.value).getTime()
    if (!isNaN(ts) && onChange) {
      onChange([value?.[0] ?? Date.now() - 86400000, ts])
    }
  }

  return (
    <div
      className={cn('ui-time-range-selector', className)}
      data-motion={motionLevel}
      role="group"
      aria-label="Time range"
      {...rest}
    >
      <div className="ui-time-range-selector__presets" role="group" aria-label="Preset ranges">
        {presets.map(preset => (
          <button
            key={preset.value}
            className="ui-time-range-selector__preset"
            data-active={isActive(preset) ? 'true' : undefined}
            onClick={() => onChange?.(preset.range)}
            aria-pressed={isActive(preset)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {showCustom && (
        <div className="ui-time-range-selector__custom">
          <label>
            <span className="sr-only">Start time</span>
            <input
              type="datetime-local"
              className="ui-time-range-selector__input"
              aria-label="Start time"
              value={value ? toDatetimeLocal(value[0]) : ''}
              onChange={handleCustomStart}
            />
          </label>
          <span aria-hidden="true">—</span>
          <label>
            <span className="sr-only">End time</span>
            <input
              type="datetime-local"
              className="ui-time-range-selector__input"
              aria-label="End time"
              value={value ? toDatetimeLocal(value[1]) : ''}
              onChange={handleCustomEnd}
            />
          </label>
        </div>
      )}
    </div>
  )
}

export function TimeRangeSelector(props: TimeRangeSelectorProps) {
  return (
    <ComponentErrorBoundary>
      <TimeRangeSelectorInner {...props} />
    </ComponentErrorBoundary>
  )
}

TimeRangeSelector.displayName = 'TimeRangeSelector'
