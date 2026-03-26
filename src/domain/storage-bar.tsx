'use client'

import {
  type HTMLAttributes,
  useState,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'
import { ComponentErrorBoundary } from '../core/utils/error-boundary'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface StorageBarSegment {
  label: string
  value: number
  color?: string
}

export interface StorageBarProps extends HTMLAttributes<HTMLDivElement> {
  segments: StorageBarSegment[]
  total: number
  showLabels?: boolean
  showLegend?: boolean
  size?: 'sm' | 'md' | 'lg'
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const storageBarStyles = css`
  @layer components {
    @scope (.ui-storage-bar) {
      :scope {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs, 0.25rem);
        inline-size: 100%;
      }

      .ui-storage-bar__track {
        display: flex;
        overflow: hidden;
        border-radius: var(--radius-sm, 0.375rem);
        background: var(--bg-muted, oklch(100% 0 0 / 0.06));
      }

      :scope[data-size="sm"] .ui-storage-bar__track { block-size: 8px; }
      :scope[data-size="md"] .ui-storage-bar__track { block-size: 16px; }
      :scope[data-size="lg"] .ui-storage-bar__track { block-size: 24px; }

      .ui-storage-bar__segment {
        position: relative;
        block-size: 100%;
        transition: inline-size 0.6s var(--ease-out, ease-out);
        min-inline-size: 0;
      }

      :scope[data-motion="0"] .ui-storage-bar__segment {
        transition: none;
      }

      .ui-storage-bar__segment-label {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-xs, 0.75rem);
        font-variant-numeric: tabular-nums;
        color: oklch(100% 0 0);
        text-shadow: 0 1px 2px oklch(0% 0 0 / 0.5);
        pointer-events: none;
        overflow: hidden;
        white-space: nowrap;
      }

      :scope[data-size="sm"] .ui-storage-bar__segment-label {
        display: none;
      }

      .ui-storage-bar__tooltip {
        position: fixed;
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
        transform: translate(-50%, -100%);
        margin-block-start: -0.5rem;
      }

      .ui-storage-bar__legend {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-sm, 0.5rem);
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary, oklch(70% 0 0));
      }

      .ui-storage-bar__legend-item {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
      }

      .ui-storage-bar__legend-swatch {
        display: inline-block;
        inline-size: 0.625rem;
        block-size: 0.625rem;
        border-radius: var(--radius-xs, 0.125rem);
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-storage-bar__segment {
          border-inline-end: 1px solid Canvas;
        }
        .ui-storage-bar__track {
          border: 1px solid CanvasText;
        }
      }
    }
  }
`

// ─── Default colors ─────────────────────────────────────────────────────────

const DEFAULT_COLORS = [
  'oklch(65% 0.2 270)',
  'oklch(72% 0.19 155)',
  'oklch(78% 0.17 85)',
  'oklch(62% 0.22 25)',
  'oklch(70% 0.16 200)',
  'oklch(68% 0.18 320)',
]

function formatValue(bytes: number): string {
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} TB`
  return `${bytes.toFixed(1)} GB`
}

// ─── Component ──────────────────────────────────────────────────────────────

function StorageBarInner({
  segments,
  total,
  showLabels = false,
  showLegend = false,
  size = 'md',
  motion: motionProp,
  className,
  ...rest
}: StorageBarProps) {
  useStyles('storage-bar', storageBarStyles)
  const motionLevel = useMotionLevel(motionProp)
  const [tooltip, setTooltip] = useState<{ seg: StorageBarSegment; pct: number; x: number; y: number } | null>(null)

  const usedTotal = segments.reduce((sum, s) => sum + s.value, 0)

  return (
    <div
      className={cn('ui-storage-bar', className)}
      data-size={size}
      data-motion={motionLevel}
      role="img"
      aria-label={`Storage: ${formatValue(usedTotal)} of ${formatValue(total)} used`}
      {...rest}
    >
      <div className="ui-storage-bar__track">
        {segments.map((seg, i) => {
          const pct = (seg.value / total) * 100
          const bgColor = seg.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]
          return (
            <div
              key={seg.label}
              className="ui-storage-bar__segment"
              style={{ inlineSize: `${pct}%`, backgroundColor: bgColor }}
              onMouseEnter={(e) => {
                const rect = (e.target as HTMLElement).getBoundingClientRect()
                setTooltip({ seg, pct, x: rect.left + rect.width / 2, y: rect.top })
              }}
              onMouseLeave={() => setTooltip(null)}
            >
              {showLabels && (
                <span className="ui-storage-bar__segment-label">
                  {seg.label}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {tooltip && (
        <div
          className="ui-storage-bar__tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.seg.label}: {formatValue(tooltip.seg.value)} ({tooltip.pct.toFixed(1)}%)
        </div>
      )}

      {showLegend && (
        <div className="ui-storage-bar__legend">
          {segments.map((seg, i) => (
            <span key={seg.label} className="ui-storage-bar__legend-item">
              <span
                className="ui-storage-bar__legend-swatch"
                style={{ backgroundColor: seg.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length] }}
              />
              {seg.label}: {formatValue(seg.value)}
            </span>
          ))}
          <span className="ui-storage-bar__legend-item">
            Free: {formatValue(total - usedTotal)}
          </span>
        </div>
      )}
    </div>
  )
}

export function StorageBar(props: StorageBarProps) {
  return (
    <ComponentErrorBoundary>
      <StorageBarInner {...props} />
    </ComponentErrorBoundary>
  )
}

StorageBar.displayName = 'StorageBar'
