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

export interface CoreChartCore {
  id: number
  usage: number
}

export interface CoreChartProps extends HTMLAttributes<HTMLDivElement> {
  cores: CoreChartCore[]
  columns?: number
  size?: 'sm' | 'md' | 'lg'
  showLabels?: boolean
  colorScale?: 'green-red' | 'blue-red' | 'brand'
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const coreChartStyles = css`
  @layer components {
    @scope (.ui-core-chart) {
      :scope {
        position: relative;
        display: inline-block;
      }

      .ui-core-chart__grid {
        display: grid;
        gap: 2px;
      }

      :scope[data-size="sm"] .ui-core-chart__grid { --cell-size: 16px; }
      :scope[data-size="md"] .ui-core-chart__grid { --cell-size: 24px; }
      :scope[data-size="lg"] .ui-core-chart__grid { --cell-size: 32px; }

      .ui-core-chart__cell {
        inline-size: var(--cell-size, 24px);
        block-size: var(--cell-size, 24px);
        border-radius: var(--radius-xs, 0.25rem);
        transition: background-color 0.4s ease;
        cursor: default;
        position: relative;
      }

      :scope[data-motion="0"] .ui-core-chart__cell {
        transition: none;
      }

      .ui-core-chart__cell-label {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.5rem;
        font-variant-numeric: tabular-nums;
        color: var(--text-primary, oklch(90% 0 0));
        pointer-events: none;
        opacity: 0.8;
      }

      :scope[data-size="sm"] .ui-core-chart__cell-label {
        font-size: 0.4rem;
      }
      :scope[data-size="lg"] .ui-core-chart__cell-label {
        font-size: 0.625rem;
      }

      .ui-core-chart__tooltip {
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

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-core-chart__cell {
          border: 1px solid CanvasText;
        }
      }
    }
  }
`

// ─── Color helpers ──────────────────────────────────────────────────────────

function usageToColor(usage: number, scale: 'green-red' | 'blue-red' | 'brand'): string {
  const u = Math.max(0, Math.min(100, usage))
  switch (scale) {
    case 'green-red': {
      // green (155) -> yellow (85) -> red (25)
      const hue = 155 - (u / 100) * 130
      const chroma = 0.15 + (u / 100) * 0.07
      return `oklch(65% ${chroma.toFixed(3)} ${hue.toFixed(0)})`
    }
    case 'blue-red': {
      const hue = 250 - (u / 100) * 225
      const chroma = 0.12 + (u / 100) * 0.1
      return `oklch(60% ${chroma.toFixed(3)} ${hue.toFixed(0)})`
    }
    case 'brand':
    default:
      return `oklch(${(50 + (u / 100) * 20).toFixed(0)}% 0.2 270)`
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

function CoreChartInner({
  cores,
  columns,
  size = 'md',
  showLabels = false,
  colorScale = 'green-red',
  motion: motionProp,
  className,
  ...rest
}: CoreChartProps) {
  useStyles('core-chart', coreChartStyles)
  const motionLevel = useMotionLevel(motionProp)
  const [tooltip, setTooltip] = useState<{ core: CoreChartCore; x: number; y: number } | null>(null)

  const cols = columns ?? Math.ceil(Math.sqrt(cores.length))

  return (
    <div
      className={cn('ui-core-chart', className)}
      data-size={size}
      data-motion={motionLevel}
      role="img"
      aria-label={`CPU core utilization: ${cores.length} cores`}
      {...rest}
    >
      <div
        className="ui-core-chart__grid"
        style={{ gridTemplateColumns: `repeat(${cols}, var(--cell-size, 24px))` }}
      >
        {cores.map((core) => (
          <div
            key={core.id}
            className="ui-core-chart__cell"
            style={{ backgroundColor: usageToColor(core.usage, colorScale) }}
            onMouseEnter={(e) => {
              const rect = (e.target as HTMLElement).getBoundingClientRect()
              setTooltip({ core, x: rect.left + rect.width / 2, y: rect.top })
            }}
            onMouseLeave={() => setTooltip(null)}
          >
            {showLabels && (
              <span className="ui-core-chart__cell-label">{core.id}</span>
            )}
          </div>
        ))}
      </div>

      {tooltip && (
        <div
          className="ui-core-chart__tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          Core {tooltip.core.id}: {tooltip.core.usage}%
        </div>
      )}
    </div>
  )
}

export function CoreChart(props: CoreChartProps) {
  return (
    <ComponentErrorBoundary>
      <CoreChartInner {...props} />
    </ComponentErrorBoundary>
  )
}

CoreChart.displayName = 'CoreChart'
