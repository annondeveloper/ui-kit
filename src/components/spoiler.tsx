'use client'

import { forwardRef, useState, useRef, useEffect, useCallback, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

export interface SpoilerProps extends HTMLAttributes<HTMLDivElement> {
  maxHeight: number
  showLabel?: string
  hideLabel?: string
  initialState?: 'hidden' | 'visible'
  transitionDuration?: number
  children: ReactNode
  motion?: 0 | 1 | 2 | 3
}

const spoilerStyles = css`
  @layer components {
    @scope (.ui-spoiler) {
      :scope {
        position: relative;
      }

      .ui-spoiler__content {
        overflow: hidden;
        transition: max-height var(--ui-spoiler-duration, 0.35s) cubic-bezier(0.16, 1, 0.3, 1);
      }

      :scope[data-motion="0"] .ui-spoiler__content {
        transition: none;
      }

      /* Gradient fade when collapsed */
      :scope[data-state="hidden"] .ui-spoiler__content::after {
        content: '';
        position: absolute;
        inset-inline: 0;
        inset-block-end: 0;
        block-size: 3rem;
        background: linear-gradient(
          to bottom,
          oklch(from var(--bg-surface, oklch(15% 0.01 270)) l c h / 0),
          var(--bg-surface, oklch(15% 0.01 270))
        );
        pointer-events: none;
      }

      :scope[data-state="hidden"] .ui-spoiler__content {
        position: relative;
      }

      /* Toggle button */
      .ui-spoiler__toggle {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
        margin-block-start: var(--space-xs, 0.25rem);
        padding: 0;
        border: none;
        background: transparent;
        color: var(--brand, oklch(65% 0.2 270));
        font-size: var(--text-sm, 0.875rem);
        font-weight: 500;
        font-family: inherit;
        cursor: pointer;
        outline: none;
        -webkit-tap-highlight-color: transparent;
        transition: color 0.15s;
      }

      .ui-spoiler__toggle:hover {
        color: var(--brand-light, oklch(72% 0.2 270));
      }

      .ui-spoiler__toggle:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
        border-radius: var(--radius-sm, 0.25rem);
      }

      .ui-spoiler__toggle-icon {
        display: inline-flex;
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }

      :scope[data-state="visible"] .ui-spoiler__toggle-icon {
        transform: rotate(180deg);
      }

      :scope[data-motion="0"] .ui-spoiler__toggle-icon {
        transition: none;
      }

      /* Touch targets */
      @media (pointer: coarse) {
        .ui-spoiler__toggle {
          min-block-size: 44px;
          min-inline-size: 44px;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-spoiler__toggle {
          color: LinkText;
        }
        :scope[data-state="hidden"] .ui-spoiler__content::after {
          background: none;
          border-block-start: 2px solid ButtonText;
        }
      }

      /* Print — always show full content */
      @media print {
        .ui-spoiler__content {
          max-height: none !important;
          overflow: visible !important;
        }
        :scope[data-state="hidden"] .ui-spoiler__content::after {
          display: none;
        }
        .ui-spoiler__toggle {
          display: none;
        }
      }
    }
  }
`

function ChevronDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export const Spoiler = forwardRef<HTMLDivElement, SpoilerProps>(
  (
    {
      maxHeight,
      showLabel = 'Show more',
      hideLabel = 'Show less',
      initialState = 'hidden',
      transitionDuration = 350,
      children,
      motion: motionProp,
      className,
      style,
      ...rest
    },
    ref
  ) => {
    useStyles('spoiler', spoilerStyles)
    const motionLevel = useMotionLevel(motionProp)
    const contentRef = useRef<HTMLDivElement>(null)
    const [expanded, setExpanded] = useState(initialState === 'visible')
    const [shouldShowToggle, setShouldShowToggle] = useState(false)
    const [contentHeight, setContentHeight] = useState<number | undefined>(undefined)

    // Measure content to determine if toggle is needed
    useEffect(() => {
      const content = contentRef.current
      if (!content) return

      const measure = () => {
        const scrollH = content.scrollHeight
        setShouldShowToggle(scrollH > maxHeight)
        setContentHeight(scrollH)
      }

      measure()

      const observer = new ResizeObserver(measure)
      observer.observe(content)
      return () => observer.disconnect()
    }, [maxHeight, children])

    const toggle = useCallback(() => {
      setExpanded((prev) => !prev)
    }, [])

    const currentMaxHeight = !shouldShowToggle
      ? undefined
      : expanded
        ? contentHeight
        : maxHeight

    const mergedStyle = {
      ...style,
      '--ui-spoiler-duration': `${transitionDuration}ms`,
    } as React.CSSProperties

    return (
      <div
        ref={ref}
        className={cn('ui-spoiler', className)}
        data-state={expanded ? 'visible' : 'hidden'}
        data-motion={motionLevel}
        style={mergedStyle}
        {...rest}
      >
        <div
          ref={contentRef}
          className="ui-spoiler__content"
          style={{ maxHeight: currentMaxHeight !== undefined ? `${currentMaxHeight}px` : undefined }}
        >
          {children}
        </div>
        {shouldShowToggle && (
          <button
            type="button"
            className="ui-spoiler__toggle"
            onClick={toggle}
            aria-expanded={expanded}
          >
            {expanded ? hideLabel : showLabel}
            <span className="ui-spoiler__toggle-icon">
              <ChevronDownIcon />
            </span>
          </button>
        )}
      </div>
    )
  }
)
Spoiler.displayName = 'Spoiler'
