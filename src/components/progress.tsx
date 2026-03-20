'use client'

import { forwardRef, type HTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'danger'
  label?: string
  showValue?: boolean
  motion?: 0 | 1 | 2 | 3
}

const progressStyles = css`
  @layer components {
    @scope (.ui-progress) {
      :scope {
        display: flex;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
        inline-size: 100%;
      }

      /* Track */
      .ui-progress__track {
        position: relative;
        flex: 1;
        overflow: hidden;
        border-radius: var(--radius-full, 9999px);
        background: var(--bg-surface, oklch(25% 0.02 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
      }

      /* Track sizes */
      :scope[data-size="sm"] .ui-progress__track {
        block-size: 4px;
      }
      :scope[data-size="md"] .ui-progress__track {
        block-size: 8px;
      }
      :scope[data-size="lg"] .ui-progress__track {
        block-size: 12px;
      }

      /* Fill */
      .ui-progress__fill {
        block-size: 100%;
        border-radius: inherit;
        transition: inline-size 0.3s var(--ease-out, ease-out);
      }

      /* Spring easing for motion level 2+ */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-progress__fill {
        transition: inline-size 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      /* Variant colors */
      :scope[data-variant="default"] .ui-progress__fill {
        background: linear-gradient(
          90deg,
          var(--brand, oklch(65% 0.2 270)),
          oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.08) c h)
        );
      }
      :scope[data-variant="success"] .ui-progress__fill {
        background: linear-gradient(
          90deg,
          var(--status-ok, oklch(72% 0.19 155)),
          oklch(from var(--status-ok, oklch(72% 0.19 155)) calc(l + 0.08) c h)
        );
      }
      :scope[data-variant="warning"] .ui-progress__fill {
        background: linear-gradient(
          90deg,
          var(--status-warning, oklch(80% 0.18 85)),
          oklch(from var(--status-warning, oklch(80% 0.18 85)) calc(l + 0.08) c h)
        );
      }
      :scope[data-variant="danger"] .ui-progress__fill {
        background: linear-gradient(
          90deg,
          var(--status-critical, oklch(65% 0.25 25)),
          oklch(from var(--status-critical, oklch(65% 0.25 25)) calc(l + 0.08) c h)
        );
      }

      /* Indeterminate animation */
      :scope[data-indeterminate] .ui-progress__fill {
        inline-size: 40% !important;
        animation: ui-progress-indeterminate 1.5s var(--ease-in-out, ease-in-out) infinite;
      }

      :scope[data-indeterminate][data-motion="0"] .ui-progress__fill {
        animation: none;
        inline-size: 100% !important;
        opacity: 0.3;
      }

      /* Value text */
      .ui-progress__value {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-secondary, oklch(70% 0 0));
        white-space: nowrap;
        min-inline-size: 3ch;
        text-align: end;
        font-family: inherit;
        font-variant-numeric: tabular-nums;
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-progress__track {
          border: 2px solid ButtonText;
        }
        .ui-progress__fill {
          background: Highlight;
        }
      }

      /* Print */
      @media print {
        .ui-progress__track {
          border: 1px solid;
        }
        .ui-progress__fill {
          animation: none;
          background: currentColor;
          opacity: 0.5;
        }
      }

      /* Reduced data */
      @media (prefers-reduced-data: reduce) {
        .ui-progress__fill {
          animation: none;
        }
      }
    }

    @keyframes ui-progress-indeterminate {
      0% { margin-inline-start: -40%; }
      100% { margin-inline-start: 100%; }
    }
  }
`

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value,
      max = 100,
      size = 'md',
      variant = 'default',
      label,
      showValue = false,
      motion: motionProp,
      className,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('progress', progressStyles)
    const motionLevel = useMotionLevel(motionProp)

    const isIndeterminate = value === undefined
    const clampedValue = isIndeterminate ? undefined : Math.min(Math.max(0, value), max)
    const percentage = isIndeterminate ? undefined : Math.round((clampedValue! / max) * 100)

    return (
      <div
        ref={ref}
        className={cn(cls('root'), className)}
        role="progressbar"
        aria-label={label}
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={max}
        data-size={size}
        data-variant={variant}
        data-motion={motionLevel}
        {...(isIndeterminate ? { 'data-indeterminate': '' } : {})}
        {...rest}
      >
        <div className="ui-progress__track">
          <div
            className="ui-progress__fill"
            style={!isIndeterminate ? { inlineSize: `${percentage}%` } : undefined}
          />
        </div>
        {showValue && !isIndeterminate && (
          <span className="ui-progress__value">{percentage}%</span>
        )}
      </div>
    )
  }
)
Progress.displayName = 'Progress'
