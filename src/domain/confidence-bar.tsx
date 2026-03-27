'use client'

import {
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'
import { ComponentErrorBoundary } from '../core/utils/error-boundary'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ConfidenceBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number
  label?: ReactNode
  showValue?: boolean
  thresholds?: { low: number; medium: number }
  size?: 'sm' | 'md' | 'lg'
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const confidenceBarStyles = css`
  @layer components {
    @scope (.ui-confidence-bar) {
      :scope {
        display: flex;
        min-inline-size: 200px;
        flex-direction: column;
        gap: var(--space-2xs, 0.25rem);
      }

      .ui-confidence-bar__header {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: var(--space-xs, 0.5rem);
      }

      .ui-confidence-bar__label {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 500;
        color: var(--text-secondary, oklch(70% 0 0));
      }

      .ui-confidence-bar__value {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        color: var(--text-primary, oklch(90% 0 0));
      }

      .ui-confidence-bar__track {
        position: relative;
        block-size: 8px;
        border-radius: var(--radius-full, 9999px);
        background: var(--bg-inset, oklch(18% 0.01 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.06));
        overflow: hidden;
      }

      :scope[data-size="sm"] .ui-confidence-bar__track {
        block-size: 4px;
      }
      :scope[data-size="lg"] .ui-confidence-bar__track {
        block-size: 12px;
      }

      .ui-confidence-bar__fill {
        position: absolute;
        inset-block: 0;
        inset-inline-start: 0;
        border-radius: inherit;
        transition: inline-size 0.3s var(--ease-out, ease-out);
      }

      :scope[data-motion="0"] .ui-confidence-bar__fill {
        transition: none;
      }

      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-confidence-bar__fill {
        transition: inline-size 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      /* Level colors */
      :scope[data-level="low"] .ui-confidence-bar__fill {
        background: oklch(62% 0.22 25);
      }
      :scope[data-level="medium"] .ui-confidence-bar__fill {
        background: oklch(80% 0.18 85);
      }
      :scope[data-level="high"] .ui-confidence-bar__fill {
        background: oklch(72% 0.19 155);
      }

      /* Aurora glow on fill */
      .ui-confidence-bar__fill::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: linear-gradient(
          to right,
          transparent,
          oklch(100% 0 0 / 0.15)
        );
        pointer-events: none;
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-confidence-bar__track {
          border: 1px solid ButtonText;
        }
        .ui-confidence-bar__fill {
          background: Highlight;
        }
        .ui-confidence-bar__fill::after {
          display: none;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

function getLevel(
  value: number,
  thresholds: { low: number; medium: number }
): 'low' | 'medium' | 'high' {
  if (value < thresholds.low) return 'low'
  if (value < thresholds.medium) return 'medium'
  return 'high'
}

function ConfidenceBarInner({
  value,
  label,
  showValue = true,
  thresholds = { low: 0.3, medium: 0.7 },
  size = 'md',
  motion: motionProp,
  className,
  ...rest
}: ConfidenceBarProps) {
  useStyles('confidence-bar', confidenceBarStyles)
  const motionLevel = useMotionLevel(motionProp)
  const level = getLevel(value, thresholds)
  const percentage = Math.round(value * 100)

  return (
    <div
      className={cn('ui-confidence-bar', className)}
      data-motion={motionLevel}
      data-size={size}
      data-level={level}
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={1}
      aria-label={label && typeof label === 'string' ? label : 'Confidence'}
      {...rest}
    >
      {(label || showValue) && (
        <div className="ui-confidence-bar__header">
          {label && <span className="ui-confidence-bar__label">{label}</span>}
          {showValue && <span className="ui-confidence-bar__value">{percentage}%</span>}
        </div>
      )}
      <div className="ui-confidence-bar__track">
        <div
          className="ui-confidence-bar__fill"
          style={{ inlineSize: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export function ConfidenceBar(props: ConfidenceBarProps) {
  return (
    <ComponentErrorBoundary>
      <ConfidenceBarInner {...props} />
    </ComponentErrorBoundary>
  )
}

ConfidenceBar.displayName = 'ConfidenceBar'
