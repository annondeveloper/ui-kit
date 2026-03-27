'use client'

import {
  forwardRef,
  useState,
  useCallback,
  useRef,
  useEffect,
  useLayoutEffect,
  type HTMLAttributes,
  type ReactNode,
  type KeyboardEvent,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SegmentedControlOption {
  value: string
  label: ReactNode
  icon?: ReactNode
  disabled?: boolean
}

export interface SegmentedControlProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  data: SegmentedControlOption[] | string[]
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  fullWidth?: boolean
  orientation?: 'horizontal' | 'vertical'
  color?: string
  disabled?: boolean
  readOnly?: boolean
  motion?: 0 | 1 | 2 | 3
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function normalizeOptions(data: SegmentedControlOption[] | string[]): SegmentedControlOption[] {
  return data.map((item) =>
    typeof item === 'string' ? { value: item, label: item } : item
  )
}

// Use useLayoutEffect on client, useEffect on server
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

// ─── Styles ─────────────────────────────────────────────────────────────────

const segmentedControlStyles = css`
  @layer components {
    @scope (.ui-segmented) {
      :scope {
        position: relative;
        display: inline-flex;
        align-items: stretch;
        background: oklch(50% 0 0 / 0.08);
        backdrop-filter: blur(12px);
        border: 1px solid oklch(100% 0 0 / 0.06);
        border-radius: var(--radius-md, 0.5rem);
        padding: 3px;
        gap: 2px;
        box-shadow:
          inset 0 1px 2px oklch(0% 0 0 / 0.06),
          0 1px 0 oklch(100% 0 0 / 0.04);
        container-type: inline-size;
      }

      :scope[data-full-width="true"] {
        display: flex;
        inline-size: 100%;
      }

      :scope[data-orientation="vertical"] {
        flex-direction: column;
      }

      :scope[data-disabled="true"] {
        opacity: 0.5;
        pointer-events: none;
      }

      /* ── Indicator ──────────────────────────────────── */

      .ui-segmented__indicator {
        position: absolute;
        inset-block-start: 3px;
        inset-inline-start: 3px;
        block-size: calc(100% - 6px);
        border-radius: calc(var(--radius-md, 0.5rem) - 2px);
        background: oklch(100% 0 0 / 0.12);
        backdrop-filter: blur(8px);
        border: 1px solid oklch(100% 0 0 / 0.1);
        box-shadow:
          0 2px 8px oklch(0% 0 0 / 0.1),
          0 0 16px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.08);
        pointer-events: none;
        z-index: 0;
      }

      :scope[data-motion="0"] .ui-segmented__indicator {
        transition: none;
      }
      :scope[data-motion="1"] .ui-segmented__indicator {
        transition: transform 0.15s ease-out, inline-size 0.15s ease-out;
      }
      :scope[data-motion="2"] .ui-segmented__indicator {
        transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
                    inline-size 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      :scope[data-motion="3"] .ui-segmented__indicator {
        transition: transform 0.35s cubic-bezier(0.22, 1.3, 0.36, 1),
                    inline-size 0.35s cubic-bezier(0.22, 1.3, 0.36, 1);
      }

      :scope[data-orientation="vertical"] .ui-segmented__indicator {
        inline-size: calc(100% - 6px);
      }

      /* ── Segment Button ─────────────────────────────── */

      .ui-segmented__item {
        position: relative;
        z-index: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-xs, 0.25rem);
        border: none;
        background: transparent;
        color: var(--text-secondary, oklch(70% 0 0));
        cursor: pointer;
        white-space: nowrap;
        font-family: inherit;
        font-weight: 500;
        outline: none;
        border-radius: calc(var(--radius-md, 0.5rem) - 2px);
        transition: color 0.15s;
        user-select: none;
        flex-shrink: 0;
      }

      :scope[data-full-width="true"] .ui-segmented__item {
        flex: 1;
      }

      .ui-segmented__item:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: -2px;
      }

      .ui-segmented__item[data-active="true"] {
        color: var(--text-primary, oklch(95% 0 0));
        font-weight: 600;
      }

      .ui-segmented__item[data-disabled="true"] {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .ui-segmented__item:hover:not([data-active="true"]):not([data-disabled="true"]) {
        color: var(--text-primary, oklch(85% 0 0));
        background: oklch(100% 0 0 / 0.04);
      }

      .ui-segmented__item svg {
        inline-size: 1em;
        block-size: 1em;
        flex-shrink: 0;
      }

      .ui-segmented__item-label {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
      }

      /* ── Sizes ──────────────────────────────────────── */

      :scope[data-size="xs"] .ui-segmented__item {
        padding-block: 0.1875rem;
        padding-inline: 0.375rem;
        font-size: var(--text-xs, 0.6875rem);
      }
      :scope[data-size="sm"] .ui-segmented__item {
        padding-block: 0.25rem;
        padding-inline: 0.5rem;
        font-size: var(--text-xs, 0.75rem);
      }
      :scope[data-size="md"] .ui-segmented__item {
        padding-block: 0.375rem;
        padding-inline: 0.75rem;
        font-size: var(--text-sm, 0.875rem);
      }
      :scope[data-size="lg"] .ui-segmented__item {
        padding-block: 0.5rem;
        padding-inline: 1rem;
        font-size: var(--text-base, 1rem);
      }
      :scope[data-size="xl"] .ui-segmented__item {
        padding-block: 0.625rem;
        padding-inline: 1.25rem;
        font-size: var(--text-lg, 1.125rem);
      }

      /* ── Custom color on indicator ──────────────────── */

      :scope[data-has-color="true"] .ui-segmented__indicator {
        background: oklch(from var(--segmented-color) l c h / 0.18);
        border-color: oklch(from var(--segmented-color) l c h / 0.25);
        box-shadow:
          0 2px 8px oklch(from var(--segmented-color) l c h / 0.15),
          0 0 16px oklch(from var(--segmented-color) l c h / 0.08);
      }

      /* ── Touch targets ──────────────────────────────── */

      @media (pointer: coarse) {
        .ui-segmented__item {
          min-block-size: 44px;
          min-inline-size: 44px;
        }
      }

      /* ── Forced colors ──────────────────────────────── */

      @media (forced-colors: active) {
        :scope {
          border: 1px solid ButtonText;
        }
        .ui-segmented__item[data-active="true"] {
          outline: 2px solid Highlight;
        }
        .ui-segmented__indicator {
          display: none;
        }
      }

      /* ── Print ──────────────────────────────────────── */

      @media print {
        :scope {
          border: 1px solid;
          box-shadow: none;
          backdrop-filter: none;
        }
        .ui-segmented__indicator {
          display: none;
        }
        .ui-segmented__item[data-active="true"] {
          font-weight: 700;
          text-decoration: underline;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export const SegmentedControl = forwardRef<HTMLDivElement, SegmentedControlProps>(
  (
    {
      data,
      value: controlledValue,
      defaultValue,
      onChange,
      size = 'md',
      fullWidth = false,
      orientation = 'horizontal',
      color,
      disabled = false,
      readOnly = false,
      motion: motionProp,
      className,
      style,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('segmented', segmentedControlStyles)
    const motionLevel = useMotionLevel(motionProp)
    const options = normalizeOptions(data)

    const isControlled = controlledValue !== undefined
    const [internalValue, setInternalValue] = useState(
      () => defaultValue ?? options[0]?.value ?? ''
    )
    const activeValue = isControlled ? controlledValue : internalValue

    const containerRef = useRef<HTMLDivElement>(null)
    const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
    const indicatorRef = useRef<HTMLDivElement>(null)

    // Update indicator position
    const updateIndicator = useCallback(() => {
      const container = containerRef.current
      const indicator = indicatorRef.current
      const activeEl = itemRefs.current.get(activeValue)
      if (!container || !indicator || !activeEl) return

      const containerRect = container.getBoundingClientRect()
      const activeRect = activeEl.getBoundingClientRect()

      if (orientation === 'horizontal') {
        const offsetX = activeRect.left - containerRect.left - 3 // 3px padding
        indicator.style.transform = `translateX(${offsetX}px)`
        indicator.style.inlineSize = `${activeRect.width}px`
        indicator.style.blockSize = ''
      } else {
        const offsetY = activeRect.top - containerRect.top - 3
        indicator.style.transform = `translateY(${offsetY}px)`
        indicator.style.blockSize = `${activeRect.height}px`
        indicator.style.inlineSize = `calc(100% - 6px)`
      }
    }, [activeValue, orientation])

    useIsomorphicLayoutEffect(() => {
      updateIndicator()
    }, [updateIndicator])

    // Recompute on resize
    useEffect(() => {
      const observer = new ResizeObserver(() => updateIndicator())
      if (containerRef.current) observer.observe(containerRef.current)
      return () => observer.disconnect()
    }, [updateIndicator])

    const handleSelect = useCallback(
      (val: string) => {
        if (disabled || readOnly) return
        const option = options.find((o) => o.value === val)
        if (option?.disabled) return
        if (!isControlled) setInternalValue(val)
        onChange?.(val)
      },
      [disabled, readOnly, options, isControlled, onChange]
    )

    const enabledOptions = options.filter((o) => !o.disabled)

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLDivElement>) => {
        const isVertical = orientation === 'vertical'
        const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight'
        const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft'

        if (![nextKey, prevKey, 'Home', 'End'].includes(e.key)) return
        e.preventDefault()

        const currentIdx = enabledOptions.findIndex((o) => o.value === activeValue)
        let targetIdx: number

        if (e.key === 'Home') {
          targetIdx = 0
        } else if (e.key === 'End') {
          targetIdx = enabledOptions.length - 1
        } else if (e.key === nextKey) {
          targetIdx = currentIdx + 1 >= enabledOptions.length ? 0 : currentIdx + 1
        } else {
          targetIdx = currentIdx - 1 < 0 ? enabledOptions.length - 1 : currentIdx - 1
        }

        const target = enabledOptions[targetIdx]
        if (target) {
          handleSelect(target.value)
          itemRefs.current.get(target.value)?.focus()
        }
      },
      [orientation, enabledOptions, activeValue, handleSelect]
    )

    const customStyle = color
      ? { ...style, '--segmented-color': color } as React.CSSProperties
      : style

    return (
      <div
        ref={(node) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
        }}
        role="radiogroup"
        className={cn(cls('root'), className)}
        data-size={size}
        data-orientation={orientation}
        data-motion={motionLevel}
        data-full-width={fullWidth || undefined}
        data-disabled={disabled || undefined}
        data-has-color={color ? 'true' : undefined}
        style={customStyle}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        <div
          ref={indicatorRef}
          className="ui-segmented__indicator"
          aria-hidden="true"
        />
        {options.map((option) => {
          const isActive = option.value === activeValue
          const isDisabled = disabled || option.disabled

          return (
            <button
              key={option.value}
              ref={(el) => {
                if (el) itemRefs.current.set(option.value, el)
                else itemRefs.current.delete(option.value)
              }}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-disabled={isDisabled || undefined}
              data-active={isActive || undefined}
              data-disabled={isDisabled || undefined}
              className="ui-segmented__item"
              tabIndex={isActive ? 0 : -1}
              onClick={() => handleSelect(option.value)}
            >
              <span className="ui-segmented__item-label">
                {option.icon && option.icon}
                {option.label}
              </span>
            </button>
          )
        })}
      </div>
    )
  }
)

SegmentedControl.displayName = 'SegmentedControl'
