'use client'

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

export interface IndicatorProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  label?: ReactNode
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  position?: 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'
  size?: number
  offset?: number
  processing?: boolean
  disabled?: boolean
  inline?: boolean
  withBorder?: boolean
  motion?: 0 | 1 | 2 | 3
}

const indicatorStyles = css`
  @layer components {
    @scope (.ui-indicator) {
      :scope {
        position: relative;
        display: inline-flex;
      }

      :scope[data-inline="true"] {
        display: inline-flex;
      }

      /* Indicator dot/badge */
      .ui-indicator__dot {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-full, 9999px);
        z-index: 1;
        pointer-events: none;
        line-height: 1;
        font-size: var(--text-xs, 0.6875rem);
        font-weight: 700;
        font-family: inherit;
        white-space: nowrap;
      }

      /* Position — top-end (default) */
      :scope[data-position="top-end"] .ui-indicator__dot {
        inset-block-start: 0;
        inset-inline-end: 0;
        translate: 50% -50%;
      }
      :scope[data-position="top-start"] .ui-indicator__dot {
        inset-block-start: 0;
        inset-inline-start: 0;
        translate: -50% -50%;
      }
      :scope[data-position="bottom-end"] .ui-indicator__dot {
        inset-block-end: 0;
        inset-inline-end: 0;
        translate: 50% 50%;
      }
      :scope[data-position="bottom-start"] .ui-indicator__dot {
        inset-block-end: 0;
        inset-inline-start: 0;
        translate: -50% 50%;
      }

      /* Colors */
      :scope[data-color="primary"] .ui-indicator__dot {
        background: var(--brand, oklch(65% 0.2 270));
        color: var(--text-on-brand, oklch(100% 0 0));
      }
      :scope[data-color="success"] .ui-indicator__dot {
        background: var(--status-ok, oklch(72% 0.19 155));
        color: oklch(20% 0 0);
      }
      :scope[data-color="warning"] .ui-indicator__dot {
        background: var(--status-warning, oklch(80% 0.18 85));
        color: oklch(20% 0 0);
      }
      :scope[data-color="danger"] .ui-indicator__dot {
        background: var(--status-critical, oklch(65% 0.25 25));
        color: oklch(100% 0 0);
      }
      :scope[data-color="info"] .ui-indicator__dot {
        background: var(--status-info, oklch(65% 0.2 240));
        color: oklch(100% 0 0);
      }

      /* Border for contrast */
      .ui-indicator__dot[data-bordered="true"] {
        border: 2px solid var(--bg-base, oklch(15% 0 0));
      }

      /* Label inside indicator — needs min width */
      .ui-indicator__dot[data-has-label="true"] {
        padding-inline: 0.35em;
        min-inline-size: 1.25em;
      }

      /* Pulse animation — processing */
      .ui-indicator__dot[data-processing="true"] {
        position: absolute;
      }
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-indicator__dot[data-processing="true"]::after {
        content: '';
        position: absolute;
        inset: -1px;
        border-radius: var(--radius-full, 9999px);
        background: inherit;
        opacity: 0;
        animation: ui-indicator-pulse 1.5s var(--ease-out, ease-out) infinite;
      }

      /* Disabled — hide indicator */
      :scope[data-disabled="true"] .ui-indicator__dot {
        display: none;
      }

      /* Touch targets */
      @media (pointer: coarse) {
        :scope {
          min-block-size: 28px;
          min-inline-size: 28px;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-indicator__dot {
          border: 2px solid ButtonText;
        }
      }

      /* Print */
      @media print {
        .ui-indicator__dot {
          border: 1px solid;
          box-shadow: none;
        }
        .ui-indicator__dot[data-processing="true"]::after {
          animation: none;
        }
      }
    }

    @keyframes ui-indicator-pulse {
      0% {
        transform: scale(1);
        opacity: 0.6;
      }
      100% {
        transform: scale(2.5);
        opacity: 0;
      }
    }
  }
`

export const Indicator = forwardRef<HTMLDivElement, IndicatorProps>(
  (
    {
      children,
      label,
      color = 'primary',
      position = 'top-end',
      size = 10,
      offset = 0,
      processing = false,
      disabled = false,
      inline = false,
      withBorder = false,
      motion: motionProp,
      className,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('indicator', indicatorStyles)
    const motionLevel = useMotionLevel(motionProp)

    const hasLabel = label !== undefined && label !== null

    const dotStyle: React.CSSProperties = {
      inlineSize: hasLabel ? undefined : `${size}px`,
      blockSize: hasLabel ? undefined : `${size}px`,
      ...(offset !== 0 && position === 'top-end' ? { marginInlineEnd: `${offset}px`, marginBlockStart: `${offset}px` } : {}),
      ...(offset !== 0 && position === 'top-start' ? { marginInlineStart: `${offset}px`, marginBlockStart: `${offset}px` } : {}),
      ...(offset !== 0 && position === 'bottom-end' ? { marginInlineEnd: `${offset}px`, marginBlockEnd: `${offset}px` } : {}),
      ...(offset !== 0 && position === 'bottom-start' ? { marginInlineStart: `${offset}px`, marginBlockEnd: `${offset}px` } : {}),
    }

    return (
      <div
        ref={ref}
        className={cn(cls('root'), className)}
        data-color={color}
        data-position={position}
        data-motion={motionLevel}
        data-inline={inline || undefined}
        data-disabled={disabled || undefined}
        {...rest}
      >
        <span
          className="ui-indicator__dot"
          data-processing={processing || undefined}
          data-bordered={withBorder || undefined}
          data-has-label={hasLabel || undefined}
          style={dotStyle}
          aria-hidden="true"
        >
          {hasLabel && label}
        </span>
        {children}
      </div>
    )
  }
)
Indicator.displayName = 'Indicator'
