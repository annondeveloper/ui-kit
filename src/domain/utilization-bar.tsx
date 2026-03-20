'use client'

import {
  type HTMLAttributes,
  type ReactNode,
  useState,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'
import { ComponentErrorBoundary } from '../core/utils/error-boundary'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface UtilizationSegment {
  value: number
  color?: string
  label?: string
}

export interface UtilizationBarProps extends HTMLAttributes<HTMLDivElement> {
  segments: UtilizationSegment[]
  max?: number
  thresholds?: { warning: number; critical: number }
  showLabels?: boolean
  size?: 'sm' | 'md' | 'lg'
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const utilizationBarStyles = css`
  @layer components {
    @scope (.ui-utilization-bar) {
      :scope {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: var(--space-xs, 0.25rem);
      }

      .ui-utilization-bar__track {
        position: relative;
        display: flex;
        overflow: hidden;
        border-radius: var(--radius-full, 9999px);
        background: var(--bg-muted, oklch(100% 0 0 / 0.06));
      }

      /* Sizes */
      :scope[data-size="sm"] .ui-utilization-bar__track { block-size: 0.375rem; }
      :scope[data-size="md"] .ui-utilization-bar__track { block-size: 0.5rem; }
      :scope[data-size="lg"] .ui-utilization-bar__track { block-size: 0.75rem; }

      .ui-utilization-bar__segment {
        block-size: 100%;
        transition: width 0.4s var(--ease-out, ease-out);
        cursor: default;
        position: relative;
      }

      :scope[data-motion="0"] .ui-utilization-bar__segment {
        transition: none;
      }

      .ui-utilization-bar__segment:first-child {
        border-start-start-radius: var(--radius-full, 9999px);
        border-end-start-radius: var(--radius-full, 9999px);
      }

      .ui-utilization-bar__segment:last-child {
        border-start-end-radius: var(--radius-full, 9999px);
        border-end-end-radius: var(--radius-full, 9999px);
      }

      /* Threshold markers */
      .ui-utilization-bar__threshold {
        position: absolute;
        inset-block: 0;
        inline-size: 2px;
        z-index: 2;
        pointer-events: none;
      }

      .ui-utilization-bar__threshold[data-level="warning"] {
        background: oklch(80% 0.18 85 / 0.7);
      }
      .ui-utilization-bar__threshold[data-level="critical"] {
        background: oklch(62% 0.22 25 / 0.7);
      }

      /* Labels */
      .ui-utilization-bar__labels {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-sm, 0.5rem);
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary, oklch(70% 0 0));
      }

      .ui-utilization-bar__label-item {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .ui-utilization-bar__label-dot {
        inline-size: 0.5rem;
        block-size: 0.5rem;
        border-radius: 50%;
        flex-shrink: 0;
      }

      /* Tooltip */
      .ui-utilization-bar__tooltip {
        position: absolute;
        inset-block-end: calc(100% + 4px);
        padding: 0.25rem 0.5rem;
        background: var(--bg-elevated, oklch(28% 0.02 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.1));
        border-radius: var(--radius-sm, 0.375rem);
        font-size: var(--text-xs, 0.75rem);
        font-variant-numeric: tabular-nums;
        color: var(--text-primary, oklch(90% 0 0));
        pointer-events: none;
        white-space: nowrap;
        z-index: 10;
        transform: translateX(-50%);
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-utilization-bar__track {
          border: 1px solid GrayText;
        }
        .ui-utilization-bar__segment {
          forced-color-adjust: none;
        }
        .ui-utilization-bar__threshold {
          background: Highlight;
        }
      }
    }
  }
`

// ─── Default colors ──────────────────────────────────────────────────────────

const DEFAULT_COLORS = [
  'oklch(65% 0.2 270)',
  'oklch(72% 0.19 155)',
  'oklch(80% 0.18 85)',
  'oklch(70% 0.15 330)',
  'oklch(60% 0.2 30)',
]

// ─── Component ──────────────────────────────────────────────────────────────

function UtilizationBarInner({
  segments,
  max = 100,
  thresholds,
  showLabels = false,
  size = 'md',
  motion: motionProp,
  className,
  ...rest
}: UtilizationBarProps) {
  useStyles('utilization-bar', utilizationBarStyles)
  const motionLevel = useMotionLevel(motionProp)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const total = segments.reduce((sum, s) => sum + s.value, 0)

  return (
    <div
      className={cn('ui-utilization-bar', className)}
      data-motion={motionLevel}
      data-size={size}
      role="group"
      aria-label="Utilization"
      {...rest}
    >
      <div className="ui-utilization-bar__track">
        {segments.map((seg, i) => {
          const pct = (seg.value / max) * 100
          const color = seg.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length]
          return (
            <div
              key={i}
              className="ui-utilization-bar__segment"
              style={{ width: `${pct}%`, background: color }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              role="presentation"
            >
              {hoveredIdx === i && (
                <div className="ui-utilization-bar__tooltip">
                  {seg.label ? `${seg.label}: ` : ''}{seg.value} / {max}
                </div>
              )}
            </div>
          )
        })}

        {thresholds && (
          <>
            <div
              className="ui-utilization-bar__threshold"
              data-level="warning"
              style={{ insetInlineStart: `${thresholds.warning}%` }}
            />
            <div
              className="ui-utilization-bar__threshold"
              data-level="critical"
              style={{ insetInlineStart: `${thresholds.critical}%` }}
            />
          </>
        )}
      </div>

      {showLabels && segments.some(s => s.label) && (
        <div className="ui-utilization-bar__labels">
          {segments.map((seg, i) => seg.label ? (
            <span key={i} className="ui-utilization-bar__label-item">
              <span
                className="ui-utilization-bar__label-dot"
                style={{ background: seg.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length] }}
              />
              {seg.label}
            </span>
          ) : null)}
        </div>
      )}
    </div>
  )
}

export function UtilizationBar(props: UtilizationBarProps) {
  return (
    <ComponentErrorBoundary>
      <UtilizationBarInner {...props} />
    </ComponentErrorBoundary>
  )
}

UtilizationBar.displayName = 'UtilizationBar'
