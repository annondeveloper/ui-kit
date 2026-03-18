'use client'

import { useCallback, useRef, useState, type KeyboardEvent, type MouseEvent, type TouchEvent } from 'react'
import { cn } from '../utils'

export interface SliderProps {
  /** Current value. */
  value: number
  /** Callback when value changes. */
  onChange: (value: number) => void
  /** Minimum value. */
  min?: number
  /** Maximum value. */
  max?: number
  /** Step increment. */
  step?: number
  /** Optional label displayed above the slider. */
  label?: string
  /** Show the current value. */
  showValue?: boolean
  /** Additional class name for the root element. */
  className?: string
}

/**
 * @description A custom-styled range slider with keyboard accessibility.
 * Features a styled track, filled portion, and draggable thumb.
 * Shows current value on hover/drag via a tooltip above the thumb.
 */
export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = false,
  className,
}: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100

  const clampToStep = useCallback(
    (raw: number) => {
      const clamped = Math.min(max, Math.max(min, raw))
      const stepped = Math.round((clamped - min) / step) * step + min
      // Avoid floating point issues
      return Math.min(max, Math.max(min, parseFloat(stepped.toPrecision(10))))
    },
    [min, max, step],
  )

  const getValueFromPosition = useCallback(
    (clientX: number) => {
      const track = trackRef.current
      if (!track) return value
      const rect = track.getBoundingClientRect()
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      return clampToStep(min + ratio * (max - min))
    },
    [min, max, value, clampToStep],
  )

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      e.preventDefault()
      setIsDragging(true)
      onChange(getValueFromPosition(e.clientX))

      const handleMouseMove = (ev: globalThis.MouseEvent) => {
        onChange(getValueFromPosition(ev.clientX))
      }
      const handleMouseUp = () => {
        setIsDragging(false)
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    },
    [getValueFromPosition, onChange],
  )

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      setIsDragging(true)
      if (e.touches[0]) {
        onChange(getValueFromPosition(e.touches[0].clientX))
      }

      const handleTouchMove = (ev: globalThis.TouchEvent) => {
        if (ev.touches[0]) {
          onChange(getValueFromPosition(ev.touches[0].clientX))
        }
      }
      const handleTouchEnd = () => {
        setIsDragging(false)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleTouchEnd)
      }
      document.addEventListener('touchmove', handleTouchMove)
      document.addEventListener('touchend', handleTouchEnd)
    },
    [getValueFromPosition, onChange],
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      let newValue = value
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault()
        newValue = clampToStep(value + step)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault()
        newValue = clampToStep(value - step)
      } else if (e.key === 'Home') {
        e.preventDefault()
        newValue = min
      } else if (e.key === 'End') {
        e.preventDefault()
        newValue = max
      }
      if (newValue !== value) onChange(newValue)
    },
    [value, min, max, step, clampToStep, onChange],
  )

  const showTooltip = isDragging || isHovering

  return (
    <div className={cn('w-full', className)}>
      {/* Label + value row */}
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-xs font-medium text-[hsl(var(--text-secondary))]">{label}</span>
          )}
          {showValue && (
            <span className="text-xs font-medium tabular-nums text-[hsl(var(--text-secondary))]">
              {value}
            </span>
          )}
        </div>
      )}

      {/* Track */}
      <div
        ref={trackRef}
        role="slider"
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={label}
        tabIndex={0}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className={cn(
          'relative h-6 w-full cursor-pointer select-none',
          'focus-visible:outline-none',
          'group',
        )}
      >
        {/* Track background */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 rounded-full bg-[hsl(var(--bg-overlay))]">
          {/* Filled portion */}
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-[hsl(var(--brand-primary))]"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Thumb */}
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 -translate-x-1/2',
            'h-5 w-5 rounded-full',
            'bg-[hsl(var(--text-on-brand))] border-2 border-[hsl(var(--brand-primary))]',
            'shadow-md transition-transform duration-100',
            isDragging && 'scale-110',
            'group-focus-visible:ring-2 group-focus-visible:ring-[hsl(var(--brand-primary))] group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-[hsl(var(--bg-base))]',
          )}
          style={{ left: `${pct}%` }}
        >
          {/* Value tooltip */}
          {showTooltip && (
            <div
              className={cn(
                'absolute -top-8 left-1/2 -translate-x-1/2',
                'px-2 py-0.5 rounded-md text-xs font-medium tabular-nums',
                'bg-[hsl(var(--bg-elevated))] text-[hsl(var(--text-primary))]',
                'border border-[hsl(var(--border-subtle))] shadow-sm',
                'pointer-events-none whitespace-nowrap',
              )}
            >
              {value}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
