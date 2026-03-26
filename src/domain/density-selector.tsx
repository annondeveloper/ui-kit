'use client'

import React, {
  forwardRef,
  useState,
  useCallback,
  type HTMLAttributes,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

type DensityValue = 'compact' | 'comfortable' | 'spacious'

export interface DensitySelectorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  value?: DensityValue
  defaultValue?: DensityValue
  onChange?: (value: DensityValue) => void
  size?: 'sm' | 'md'
  motion?: 0 | 1 | 2 | 3
}

const OPTIONS: DensityValue[] = ['compact', 'comfortable', 'spacious']

const densitySelectorStyles = css`
  @layer components {
    @scope (.ui-density-selector) {
      :scope {
        display: inline-flex;
        align-items: center;
        position: relative;
        border-radius: var(--radius-full, 9999px);
        background: var(--bg-elevated, oklch(50% 0 0 / 0.08));
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.1));
        padding: 3px;
        gap: 2px;
        font-family: inherit;
      }

      /* Sizes */
      :scope[data-size="sm"] {
        padding: 2px;
      }
      :scope[data-size="sm"] .ui-density-selector__option {
        padding-block: 0.25rem;
        padding-inline: 0.5rem;
        font-size: var(--text-xs, 0.75rem);
        min-block-size: 28px;
      }
      :scope[data-size="md"] .ui-density-selector__option {
        padding-block: 0.375rem;
        padding-inline: 0.75rem;
        font-size: var(--text-sm, 0.875rem);
        min-block-size: 34px;
      }

      /* Active indicator — sliding pill */
      .ui-density-selector__indicator {
        position: absolute;
        inset-block: 3px;
        border-radius: var(--radius-full, 9999px);
        background: var(--brand, oklch(65% 0.2 270));
        pointer-events: none;
        z-index: 0;
      }
      :scope[data-size="sm"] .ui-density-selector__indicator {
        inset-block: 2px;
      }

      /* Motion levels for indicator */
      :scope[data-motion="0"] .ui-density-selector__indicator { transition: none; }
      :scope[data-motion="1"] .ui-density-selector__indicator {
        transition: inset-inline-start 0.15s ease-out, inline-size 0.15s ease-out;
      }
      :scope[data-motion="2"] .ui-density-selector__indicator {
        transition: inset-inline-start 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
                    inline-size 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      :scope[data-motion="3"] .ui-density-selector__indicator {
        transition: inset-inline-start 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
                    inline-size 0.35s cubic-bezier(0.22, 1, 0.36, 1);
      }

      /* Option buttons */
      .ui-density-selector__option {
        position: relative;
        z-index: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-xs, 0.25rem);
        border: none;
        border-radius: var(--radius-full, 9999px);
        background: transparent;
        color: var(--text-secondary, oklch(70% 0 0));
        cursor: pointer;
        font-family: inherit;
        font-weight: 500;
        white-space: nowrap;
        user-select: none;
        outline: none;
        transition: color 0.15s ease-out;
      }
      .ui-density-selector__option:hover:not([data-active="true"]) {
        color: var(--text-primary, oklch(90% 0 0));
      }
      .ui-density-selector__option[data-active="true"] {
        color: oklch(100% 0 0);
      }
      .ui-density-selector__option:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      /* Icons */
      .ui-density-selector__icon {
        display: flex;
        align-items: center;
      }
      .ui-density-selector__icon svg {
        inline-size: 1em;
        block-size: 1em;
      }

      /* Touch targets */
      @media (pointer: coarse) {
        .ui-density-selector__option {
          min-block-size: 44px;
          min-inline-size: 44px;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        :scope {
          border: 2px solid ButtonText;
        }
        .ui-density-selector__indicator {
          background: Highlight;
        }
        .ui-density-selector__option[data-active="true"] {
          color: HighlightText;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .ui-density-selector__indicator {
          transition: none;
        }
      }
    }
  }
`

/** Icon: 4 tightly spaced lines */
function CompactIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <line x1="2" y1="3" x2="14" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1="6.5" x2="14" y2="6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1="10" x2="14" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1="13.5" x2="14" y2="13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/** Icon: 3 medium spaced lines */
function ComfortableIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <line x1="2" y1="3" x2="14" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1="13" x2="14" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/** Icon: 2 widely spaced lines */
function SpaciousIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <line x1="2" y1="4.5" x2="14" y2="4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1="11.5" x2="14" y2="11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

const ICONS: Record<DensityValue, () => React.ReactElement> = {
  compact: CompactIcon,
  comfortable: ComfortableIcon,
  spacious: SpaciousIcon,
}

export const DensitySelector = forwardRef<HTMLDivElement, DensitySelectorProps>(
  (
    {
      value: controlledValue,
      defaultValue = 'comfortable',
      onChange,
      size = 'md',
      motion: motionProp,
      className,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('density-selector', densitySelectorStyles)
    const motionLevel = useMotionLevel(motionProp)
    const [internalValue, setInternalValue] = useState<DensityValue>(defaultValue)
    const current = controlledValue ?? internalValue

    const handleSelect = useCallback(
      (val: DensityValue) => {
        if (controlledValue === undefined) setInternalValue(val)
        onChange?.(val)
      },
      [controlledValue, onChange]
    )

    const activeIndex = OPTIONS.indexOf(current)

    return (
      <div
        ref={ref}
        role="radiogroup"
        aria-label="UI density"
        className={cn(cls('root'), className)}
        data-size={size}
        data-motion={motionLevel}
        {...rest}
      >
        <div
          className="ui-density-selector__indicator"
          style={{
            insetInlineStart: `calc(${activeIndex} * (100% / 3) + 3px)`,
            inlineSize: `calc(100% / 3 - 4px)`,
          }}
        />
        {OPTIONS.map((opt) => {
          const Icon = ICONS[opt]
          const active = opt === current
          return (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={opt}
              data-active={active || undefined}
              className="ui-density-selector__option"
              onClick={() => handleSelect(opt)}
            >
              <span className="ui-density-selector__icon"><Icon /></span>
              {size === 'md' && opt}
            </button>
          )
        })}
      </div>
    )
  }
)
DensitySelector.displayName = 'DensitySelector'
