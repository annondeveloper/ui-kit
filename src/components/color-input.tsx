'use client'

import type React from 'react'
import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Copy, Check, Pipette } from 'lucide-react'
import { cn } from '../utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Props for the ColorInput component. */
export interface ColorInputProps {
  /** Current color value as hex string (e.g. "#ff0000"). */
  value: string
  /** Called when the color changes. */
  onChange: (color: string) => void
  /** Optional label. */
  label?: string
  /** Preset color swatches. */
  presets?: string[]
  /** Show alpha/opacity slider. */
  showAlpha?: boolean
  /** Display format for the text input. Default "hex". */
  format?: 'hex' | 'rgb' | 'hsl'
  /** Additional class name. */
  className?: string
}

// ---------------------------------------------------------------------------
// Color conversion helpers
// ---------------------------------------------------------------------------

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '')
  const full = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean
  const num = parseInt(full, 16)
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 }
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(c => Math.round(c).toString(16).padStart(2, '0')).join('')
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6
  else if (max === gn) h = ((bn - rn) / d + 2) / 6
  else h = ((rn - gn) / d + 4) / 6
  return { h, s, l }
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  if (s === 0) {
    const v = Math.round(l * 255)
    return { r: v, g: v, b: v }
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    const tt = t < 0 ? t + 1 : t > 1 ? t - 1 : t
    if (tt < 1 / 6) return p + (q - p) * 6 * tt
    if (tt < 1 / 2) return q
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6
    return p
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  }
}

function formatColor(hex: string, fmt: 'hex' | 'rgb' | 'hsl'): string {
  if (fmt === 'hex') return hex
  const { r, g, b } = hexToRgb(hex)
  if (fmt === 'rgb') return `rgb(${r}, ${g}, ${b})`
  const { h, s, l } = rgbToHsl(r, g, b)
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
}

function isSafeColor(c: string): boolean {
  return /^#[0-9a-f]{3,8}$/i.test(c) ||
    /^rgba?\(\s*[\d.]+/.test(c) ||
    /^hsla?\(\s*[\d.]+/.test(c)
}

const RECENT_COLORS_KEY = 'ui-kit-recent-colors'
const MAX_RECENT = 8

// ---------------------------------------------------------------------------
// ColorInput
// ---------------------------------------------------------------------------

/**
 * @description A compact color picker input with swatch preview, expandable picker panel
 * featuring hue/saturation area, lightness slider, optional alpha slider, preset swatches,
 * format switching (hex/rgb/hsl), clipboard copy, and recent color history.
 */
export function ColorInput({
  value,
  onChange,
  label,
  presets,
  showAlpha = false,
  format = 'hex',
  className,
}: ColorInputProps): React.JSX.Element {
  const prefersReducedMotion = useReducedMotion()
  const isValidHex = /^#[0-9a-f]{3,8}$/i.test(value)
  const safeValue = isValidHex ? value : '#000000'
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [alpha, setAlpha] = useState(1)
  const panelRef = useRef<HTMLDivElement>(null)
  const satAreaRef = useRef<HTMLDivElement>(null)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (copyTimerRef.current) clearTimeout(copyTimerRef.current) }, [])

  // Recent colors
  const [recentColors, setRecentColors] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = JSON.parse(localStorage.getItem(RECENT_COLORS_KEY) ?? '[]')
      return Array.isArray(raw) ? raw.filter((x: unknown) => typeof x === 'string' && x.length < 256).slice(0, MAX_RECENT) : []
    } catch { return [] }
  })

  const addRecent = useCallback((color: string) => {
    setRecentColors(prev => {
      const updated = [color, ...prev.filter(c => c !== color)].slice(0, MAX_RECENT)
      try { localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(updated)) } catch { /* noop */ }
      return updated
    })
  }, [])

  // HSL from current value
  const { r, g, b } = useMemo(() => hexToRgb(safeValue), [safeValue])
  const hsl = useMemo(() => rgbToHsl(r, g, b), [r, g, b])

  // Sync text input
  useEffect(() => {
    setTextInput(formatColor(safeValue, format))
  }, [safeValue, format])

  // Close on click outside
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
        addRecent(value)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, value, addRecent])

  // Saturation/brightness area interaction
  const handleSatAreaPointer = useCallback(
    (e: React.PointerEvent | PointerEvent) => {
      if (!satAreaRef.current) return
      const rect = satAreaRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
      // x = saturation, y = 1-lightness (top=light, bottom=dark)
      const s = x
      const l = 1 - y
      const adjustedL = 0.05 + l * 0.9 // Keep within visible range
      const rgb = hslToRgb(hsl.h, s, adjustedL)
      onChange(rgbToHex(rgb.r, rgb.g, rgb.b))
    },
    [hsl.h, onChange],
  )

  const handleSatAreaDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      handleSatAreaPointer(e)
      const move = (ev: PointerEvent) => handleSatAreaPointer(ev)
      const up = () => {
        document.removeEventListener('pointermove', move)
        document.removeEventListener('pointerup', up)
      }
      document.addEventListener('pointermove', move)
      document.addEventListener('pointerup', up)
    },
    [handleSatAreaPointer],
  )

  // Hue slider
  const handleHueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const h = Number(e.target.value) / 360
      const rgb = hslToRgb(h, hsl.s || 0.5, hsl.l || 0.5)
      onChange(rgbToHex(rgb.r, rgb.g, rgb.b))
    },
    [hsl.s, hsl.l, onChange],
  )

  // Text input commit
  const handleTextCommit = useCallback(() => {
    const v = textInput.trim()
    // Try hex
    if (/^#?[0-9a-f]{3,6}$/i.test(v)) {
      const hex = v.startsWith('#') ? v : '#' + v
      onChange(hex)
      return
    }
    // Try rgb()
    const rgbMatch = v.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/)
    if (rgbMatch) {
      onChange(rgbToHex(Number(rgbMatch[1]), Number(rgbMatch[2]), Number(rgbMatch[3])))
      return
    }
    // Try hsl()
    const hslMatch = v.match(/hsl\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)/)
    if (hslMatch) {
      const rgb = hslToRgb(Number(hslMatch[1]) / 360, Number(hslMatch[2]) / 100, Number(hslMatch[3]) / 100)
      onChange(rgbToHex(rgb.r, rgb.g, rgb.b))
      return
    }
    // Revert
    setTextInput(formatColor(safeValue, format))
  }, [textInput, safeValue, format, onChange])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(formatColor(safeValue, format))
      setCopied(true)
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
      copyTimerRef.current = setTimeout(() => setCopied(false), 1500)
    } catch { /* noop */ }
  }, [safeValue, format])

  // Position for sat/brightness marker
  const markerX = hsl.s * 100
  const markerY = (1 - (hsl.l - 0.05) / 0.9) * 100

  return (
    <div ref={panelRef} className={cn('relative inline-block', className)}>
      {/* Label */}
      {label && (
        <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">
          {label}
        </label>
      )}

      {/* Compact input */}
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--border-subtle))]',
          'bg-[hsl(var(--bg-surface))] px-3 py-2 text-sm',
          'hover:border-[hsl(var(--border-default))] transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-primary))]',
        )}
      >
        <span
          className="h-5 w-5 rounded-md border border-[hsl(var(--border-subtle))]"
          style={{ backgroundColor: isSafeColor(safeValue) ? safeValue : undefined }}
        />
        <span className="font-mono text-xs text-[hsl(var(--text-primary))]">
          {formatColor(value, format)}
        </span>
      </button>

      {/* Expanded picker panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.96, y: -4 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.96, y: -4 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.15 }}
            className={cn(
              'absolute z-50 mt-2 w-64 rounded-xl overflow-hidden',
              'border border-[hsl(var(--border-default))]',
              'bg-[hsl(var(--bg-elevated))] shadow-xl',
              'p-3',
            )}
          >
            {/* Saturation/Brightness area */}
            <div
              ref={satAreaRef}
              onPointerDown={handleSatAreaDown}
              className="relative h-36 w-full rounded-lg cursor-crosshair overflow-hidden mb-3"
              style={{
                background: `linear-gradient(to top, #000, transparent),
                             linear-gradient(to right, #fff, hsl(${Math.round(hsl.h * 360)}, 100%, 50%))`,
              }}
            >
              {/* Marker */}
              <div
                className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  left: `${markerX}%`,
                  top: `${Math.max(0, Math.min(100, markerY))}%`,
                  backgroundColor: isSafeColor(safeValue) ? safeValue : undefined,
                }}
              />
            </div>

            {/* Hue slider */}
            <div className="mb-3">
              <input
                type="range"
                min={0}
                max={360}
                value={Math.round(hsl.h * 360)}
                onChange={handleHueChange}
                className="w-full h-3 rounded-full appearance-none cursor-pointer"
                style={{
                  background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)',
                }}
              />
            </div>

            {/* Alpha slider */}
            {showAlpha && (
              <div className="mb-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(alpha * 100)}
                  onChange={e => setAlpha(Number(e.target.value) / 100)}
                  className="w-full h-3 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, transparent, ${isSafeColor(safeValue) ? safeValue : '#000'})`,
                  }}
                />
              </div>
            )}

            {/* Text input + copy */}
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                onBlur={handleTextCommit}
                onKeyDown={e => { if (e.key === 'Enter') handleTextCommit() }}
                className={cn(
                  'flex-1 rounded-md border border-[hsl(var(--border-subtle))]',
                  'bg-[hsl(var(--bg-surface))] px-2 py-1 text-xs font-mono',
                  'text-[hsl(var(--text-primary))] outline-none',
                  'focus:border-[hsl(var(--brand-primary))] transition-colors',
                )}
              />
              <button
                onClick={handleCopy}
                className={cn(
                  'p-1.5 rounded-md transition-colors',
                  'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]',
                  'hover:bg-[hsl(var(--bg-surface))]',
                )}
                title="Copy color"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-[hsl(var(--status-ok))]" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Presets */}
            {presets && presets.length > 0 && (
              <div className="mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--text-tertiary))] mb-1.5 block">
                  Presets
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {presets.map(color => (
                    <button
                      key={color}
                      onClick={() => { onChange(color); addRecent(color) }}
                      className={cn(
                        'h-6 w-6 rounded-md border transition-all',
                        value === color
                          ? 'border-[hsl(var(--brand-primary))] ring-2 ring-[hsl(var(--brand-primary)/0.3)] scale-110'
                          : 'border-[hsl(var(--border-subtle))] hover:scale-110',
                      )}
                      style={{ backgroundColor: isSafeColor(color) ? color : undefined }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Recent colors */}
            {recentColors.length > 0 && (
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--text-tertiary))] mb-1.5 block">
                  Recent
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {recentColors.map(color => (
                    <button
                      key={color}
                      onClick={() => onChange(color)}
                      className={cn(
                        'h-6 w-6 rounded-md border border-[hsl(var(--border-subtle))]',
                        'hover:scale-110 transition-transform',
                      )}
                      style={{ backgroundColor: isSafeColor(color) ? color : undefined }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
