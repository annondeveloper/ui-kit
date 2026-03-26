'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
  type KeyboardEvent,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useStableId } from '../core/a11y/stable-id'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ColorInputProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  name: string
  value?: string
  defaultValue?: string
  onChange?: (color: string) => void
  label?: ReactNode
  error?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  swatches?: string[]
  showInput?: boolean
  motion?: 0 | 1 | 2 | 3
}

// ─── Color conversion helpers ───────────────────────────────────────────────

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0
  let s = 0

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100
  const ln = l / 100
  const a = sn * Math.min(ln, 1 - ln)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = ln - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * Math.max(0, Math.min(1, color)))
      .toString(16)
      .padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

function isValidHex(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value)
}

function normalizeHex(value: string): string {
  if (/^#[0-9a-fA-F]{3}$/.test(value)) {
    const r = value[1], g = value[2], b = value[3]
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
  }
  return value.toLowerCase()
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const colorInputStyles = css`
  @layer components {
    @scope (.ui-color-input) {
      :scope {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs, 0.25rem);
        position: relative;
        font-family: inherit;
      }

      :scope[data-disabled] {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      .ui-color-input__label {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 500;
        color: var(--text-primary, oklch(90% 0 0));
        line-height: 1.4;
        user-select: none;
      }

      /* Trigger row: swatch + text input */
      .ui-color-input__row {
        display: flex;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
      }

      .ui-color-input__trigger {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        cursor: pointer;
        border: 2px solid var(--border-default, oklch(100% 0 0 / 0.12));
        border-radius: var(--radius-md, 0.375rem);
        transition: border-color 0.15s var(--ease-out, ease-out),
                    box-shadow 0.15s var(--ease-out, ease-out);
        outline: none;
      }

      .ui-color-input__trigger:hover {
        border-color: var(--border-strong, oklch(100% 0 0 / 0.2));
      }

      .ui-color-input__trigger:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
        box-shadow: var(--shadow-glow, 0 0 0 4px oklch(65% 0.2 270 / 0.15));
      }

      /* Sizes for trigger */
      :scope[data-size="sm"] .ui-color-input__trigger {
        inline-size: 28px;
        block-size: 28px;
      }
      :scope[data-size="md"] .ui-color-input__trigger {
        inline-size: 36px;
        block-size: 36px;
      }
      :scope[data-size="lg"] .ui-color-input__trigger {
        inline-size: 44px;
        block-size: 44px;
      }

      .ui-color-input__swatch {
        inline-size: 100%;
        block-size: 100%;
        border-radius: calc(var(--radius-md, 0.375rem) - 2px);
      }

      /* Hex text input */
      .ui-color-input__hex-input {
        display: block;
        inline-size: 7.5em;
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.12));
        border-radius: var(--radius-md, 0.375rem);
        background: transparent;
        color: var(--text-primary, oklch(90% 0 0));
        font-family: inherit;
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.5;
        outline: none;
        transition: border-color 0.15s var(--ease-out, ease-out),
                    box-shadow 0.15s var(--ease-out, ease-out);
      }

      :scope[data-size="sm"] .ui-color-input__hex-input {
        min-block-size: 28px;
        padding-block: 0.125rem;
        padding-inline: 0.5rem;
        font-size: var(--text-xs, 0.75rem);
      }
      :scope[data-size="md"] .ui-color-input__hex-input {
        min-block-size: 36px;
        padding-block: 0.375rem;
        padding-inline: 0.75rem;
      }
      :scope[data-size="lg"] .ui-color-input__hex-input {
        min-block-size: 44px;
        padding-block: 0.5rem;
        padding-inline: 1rem;
        font-size: var(--text-base, 1rem);
      }

      .ui-color-input__hex-input:focus {
        border-color: var(--brand, oklch(65% 0.2 270));
        box-shadow: 0 0 0 3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15);
      }

      /* ── Popover ──────────────────────────────── */
      .ui-color-input__popover {
        position: absolute;
        z-index: 100;
        inset-block-start: 100%;
        inset-inline-start: 0;
        margin-block-start: var(--space-xs, 0.25rem);
        background: var(--bg-elevated, oklch(16% 0.02 275));
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.12));
        border-radius: var(--radius-lg, 0.75rem);
        padding: var(--space-md, 0.75rem);
        box-shadow: var(--shadow-lg, 0 8px 32px oklch(0% 0 0 / 0.25));
        display: flex;
        flex-direction: column;
        gap: var(--space-sm, 0.5rem);
        min-inline-size: 220px;
        max-inline-size: min(320px, calc(100vw - 2rem));
      }

      /* Mobile: position popover to not overflow viewport */
      @media (max-width: 480px) {
        .ui-color-input__popover {
          position: fixed;
          inset-block-end: 0;
          inset-block-start: auto;
          inset-inline: 0;
          margin: 0;
          max-inline-size: 100%;
          border-radius: var(--radius-lg) var(--radius-lg) 0 0;
          padding: 1rem;
        }
      }

      /* Entry animation */
      :scope:not([data-motion="0"]) .ui-color-input__popover {
        animation: ui-color-input-pop-in 0.15s var(--ease-out, ease-out);
      }

      /* Saturation/Lightness area */
      .ui-color-input__sl-area {
        position: relative;
        inline-size: 100%;
        block-size: 150px;
        border-radius: var(--radius-sm, 0.25rem);
        cursor: crosshair;
        touch-action: none;
        overflow: hidden;
      }

      .ui-color-input__sl-thumb {
        position: absolute;
        inline-size: 14px;
        block-size: 14px;
        border-radius: var(--radius-full, 9999px);
        border: 2px solid oklch(100% 0 0);
        box-shadow: 0 0 0 1px oklch(0% 0 0 / 0.3), var(--shadow-sm, 0 1px 2px oklch(0% 0 0 / 0.1));
        transform: translate(-50%, -50%);
        pointer-events: none;
      }

      /* Hue slider */
      .ui-color-input__hue-slider {
        appearance: none;
        -webkit-appearance: none;
        inline-size: 100%;
        block-size: 12px;
        border-radius: var(--radius-full, 9999px);
        background: linear-gradient(
          to right,
          hsl(0, 100%, 50%),
          hsl(60, 100%, 50%),
          hsl(120, 100%, 50%),
          hsl(180, 100%, 50%),
          hsl(240, 100%, 50%),
          hsl(300, 100%, 50%),
          hsl(360, 100%, 50%)
        );
        outline: none;
        cursor: pointer;
      }

      .ui-color-input__hue-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        inline-size: 16px;
        block-size: 16px;
        border-radius: var(--radius-full, 9999px);
        background: oklch(100% 0 0);
        border: 2px solid oklch(100% 0 0);
        box-shadow: 0 0 0 1px oklch(0% 0 0 / 0.3), var(--shadow-sm, 0 1px 2px oklch(0% 0 0 / 0.15));
        cursor: pointer;
      }

      .ui-color-input__hue-slider::-moz-range-thumb {
        inline-size: 16px;
        block-size: 16px;
        border-radius: var(--radius-full, 9999px);
        background: oklch(100% 0 0);
        border: 2px solid oklch(100% 0 0);
        box-shadow: 0 0 0 1px oklch(0% 0 0 / 0.3), var(--shadow-sm, 0 1px 2px oklch(0% 0 0 / 0.15));
        cursor: pointer;
      }

      .ui-color-input__hue-slider:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      /* Swatches */
      .ui-color-input__swatches {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-xs, 0.25rem);
      }

      .ui-color-input__preset-swatch {
        appearance: none;
        border: 2px solid var(--border-default, oklch(100% 0 0 / 0.12));
        border-radius: var(--radius-sm, 0.25rem);
        inline-size: 24px;
        block-size: 24px;
        cursor: pointer;
        padding: 0;
        transition: border-color 0.1s, transform 0.1s;
        outline: none;
      }

      .ui-color-input__preset-swatch:hover {
        border-color: var(--border-strong, oklch(100% 0 0 / 0.4));
        transform: scale(1.1);
      }

      .ui-color-input__preset-swatch:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      /* Error */
      .ui-color-input__error {
        font-size: var(--text-xs, 0.75rem);
        color: var(--status-critical, oklch(65% 0.25 25));
        line-height: 1.4;
      }

      :scope:not([data-motion="0"]) .ui-color-input__error {
        animation: ui-color-input-error-in 0.2s var(--ease-out, ease-out);
      }

      /* Touch targets */
      @media (pointer: coarse) {
        .ui-color-input__trigger {
          min-inline-size: 44px;
          min-block-size: 44px;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-color-input__trigger {
          border: 2px solid ButtonText;
        }
        .ui-color-input__trigger:focus-visible {
          outline: 2px solid Highlight;
        }
        .ui-color-input__hex-input {
          border: 1px solid ButtonText;
        }
        .ui-color-input__popover {
          border: 2px solid ButtonText;
        }
      }

      /* Print */
      @media print {
        .ui-color-input__popover {
          display: none;
        }
      }
    }

    @keyframes ui-color-input-pop-in {
      from {
        opacity: 0;
        transform: translateY(-4px) scale(0.97);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes ui-color-input-error-in {
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

export const ColorInput = forwardRef<HTMLDivElement, ColorInputProps>(
  (
    {
      name,
      value: controlledValue,
      defaultValue,
      onChange,
      label,
      error,
      disabled = false,
      size = 'md',
      swatches,
      showInput = true,
      motion: motionProp,
      className,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('color-input', colorInputStyles)
    const motionLevel = useMotionLevel(motionProp)
    const stableId = useStableId('color-input')
    const errorId = error ? `${stableId}-error` : undefined

    // ── State ─────────────────────────────────────────────────────────
    const isControlled = controlledValue !== undefined
    const [internalValue, setInternalValue] = useState(defaultValue || '#000000')
    const currentColor = isControlled ? controlledValue : internalValue

    const [isOpen, setIsOpen] = useState(false)
    const [hexInputValue, setHexInputValue] = useState(currentColor)

    // HSL state for the picker
    const hsl = hexToHsl(currentColor)
    const [hue, setHue] = useState(hsl.h)
    const [saturation, setSaturation] = useState(hsl.s)
    const [lightness, setLightness] = useState(hsl.l)

    const popoverRef = useRef<HTMLDivElement>(null)
    const slAreaRef = useRef<HTMLDivElement>(null)

    // Sync hex input display when controlled value changes
    useEffect(() => {
      if (isControlled && controlledValue) {
        setHexInputValue(controlledValue)
        const newHsl = hexToHsl(controlledValue)
        setHue(newHsl.h)
        setSaturation(newHsl.s)
        setLightness(newHsl.l)
      }
    }, [controlledValue, isControlled])

    // ── Handlers ──────────────────────────────────────────────────────

    const updateColor = useCallback(
      (hex: string) => {
        if (!isControlled) {
          setInternalValue(hex)
        }
        setHexInputValue(hex)
        onChange?.(hex)
      },
      [isControlled, onChange]
    )

    const handleToggle = useCallback(() => {
      if (disabled) return
      setIsOpen(prev => !prev)
    }, [disabled])

    const handleTriggerKeyDown = useCallback(
      (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleToggle()
        }
      },
      [handleToggle]
    )

    const handlePopoverKeyDown = useCallback(
      (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Escape') {
          e.preventDefault()
          setIsOpen(false)
        }
      },
      []
    )

    // Close on click outside
    useEffect(() => {
      if (!isOpen) return
      const handler = (e: MouseEvent) => {
        const target = e.target as Node
        if (popoverRef.current && !popoverRef.current.contains(target)) {
          // Also check if click was on the trigger
          const trigger = popoverRef.current.parentElement?.querySelector('.ui-color-input__trigger')
          if (trigger && trigger.contains(target)) return
          setIsOpen(false)
        }
      }
      document.addEventListener('mousedown', handler)
      return () => document.removeEventListener('mousedown', handler)
    }, [isOpen])

    const handleHexBlur = useCallback(() => {
      const trimmed = hexInputValue.trim()
      if (isValidHex(trimmed)) {
        const normalized = normalizeHex(trimmed)
        const newHsl = hexToHsl(normalized)
        setHue(newHsl.h)
        setSaturation(newHsl.s)
        setLightness(newHsl.l)
        updateColor(normalized)
      } else {
        // Revert to current valid color
        setHexInputValue(currentColor)
      }
    }, [hexInputValue, currentColor, updateColor])

    const handleHueChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newHue = Number(e.target.value)
        setHue(newHue)
        const hex = hslToHex(newHue, saturation, lightness)
        updateColor(hex)
      },
      [saturation, lightness, updateColor]
    )

    const handleSLPointerDown = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (disabled) return
        const area = slAreaRef.current
        if (!area) return
        area.setPointerCapture?.(e.pointerId)

        const updateSL = (clientX: number, clientY: number) => {
          const rect = area.getBoundingClientRect()
          const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
          const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))
          const newS = Math.round(x * 100)
          const newL = Math.round((1 - y) * 100)
          setSaturation(newS)
          setLightness(newL)
          const hex = hslToHex(hue, newS, newL)
          updateColor(hex)
        }

        updateSL(e.clientX, e.clientY)

        const onMove = (ev: PointerEvent) => updateSL(ev.clientX, ev.clientY)
        const onUp = () => {
          area.removeEventListener('pointermove', onMove)
          area.removeEventListener('pointerup', onUp)
        }
        area.addEventListener('pointermove', onMove)
        area.addEventListener('pointerup', onUp)
      },
      [disabled, hue, updateColor]
    )

    const handleSwatchClick = useCallback(
      (color: string) => {
        const normalized = normalizeHex(color)
        const newHsl = hexToHsl(normalized)
        setHue(newHsl.h)
        setSaturation(newHsl.s)
        setLightness(newHsl.l)
        updateColor(normalized)
      },
      [updateColor]
    )

    // ── Render ────────────────────────────────────────────────────────

    const slBackground = `
      linear-gradient(to top, #000, transparent),
      linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))
    `.trim()

    return (
      <div
        ref={ref}
        className={cn(cls('root'), className)}
        data-size={size}
        data-motion={motionLevel}
        {...(disabled ? { 'data-disabled': '' } : {})}
        {...(error ? { 'data-invalid': '' } : {})}
        {...rest}
      >
        {label && (
          <label className="ui-color-input__label">{label}</label>
        )}

        <div className="ui-color-input__row">
          <div
            className="ui-color-input__trigger"
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-label={`Choose color: ${currentColor}`}
            aria-expanded={isOpen}
            onClick={handleToggle}
            onKeyDown={handleTriggerKeyDown}
          >
            <div
              className="ui-color-input__swatch"
              style={{ backgroundColor: currentColor }}
            />
          </div>

          {showInput && (
            <input
              type="text"
              className="ui-color-input__hex-input"
              name={name}
              value={hexInputValue}
              disabled={disabled}
              onChange={e => setHexInputValue(e.target.value)}
              onBlur={handleHexBlur}
              aria-label={`Hex color value`}
              aria-invalid={error ? true : undefined}
              aria-describedby={errorId}
              spellCheck={false}
              autoComplete="off"
            />
          )}
        </div>

        {isOpen && (
          <div
            ref={popoverRef}
            className="ui-color-input__popover"
            role="dialog"
            aria-label="Color picker"
            onKeyDown={handlePopoverKeyDown}
          >
            {/* Saturation/Lightness area */}
            <div
              ref={slAreaRef}
              className="ui-color-input__sl-area"
              style={{ background: slBackground }}
              onPointerDown={handleSLPointerDown}
              role="slider"
              aria-label="Saturation and lightness"
              aria-valuetext={`Saturation ${saturation}%, Lightness ${lightness}%`}
              tabIndex={0}
            >
              <div
                className="ui-color-input__sl-thumb"
                style={{
                  insetInlineStart: `${saturation}%`,
                  insetBlockStart: `${100 - lightness}%`,
                  backgroundColor: currentColor,
                }}
              />
            </div>

            {/* Hue slider */}
            <input
              type="range"
              className="ui-color-input__hue-slider"
              min={0}
              max={360}
              value={hue}
              onChange={handleHueChange}
              aria-label="Hue"
            />

            {/* Swatches */}
            {swatches && swatches.length > 0 && (
              <div className="ui-color-input__swatches" role="group" aria-label="Preset colors">
                {swatches.map((color, i) => (
                  <button
                    key={`${color}-${i}`}
                    type="button"
                    className="ui-color-input__preset-swatch"
                    style={{ backgroundColor: color }}
                    onClick={() => handleSwatchClick(color)}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {error && (
          <span id={errorId} className="ui-color-input__error" role="alert">
            {error}
          </span>
        )}
      </div>
    )
  }
)
ColorInput.displayName = 'ColorInput'
