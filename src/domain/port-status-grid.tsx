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

export interface PortStatus {
  port: number
  status: 'ok' | 'warning' | 'critical' | 'unknown'
  label?: string
}

export interface PortStatusGridProps extends HTMLAttributes<HTMLDivElement> {
  ports: PortStatus[]
  columns?: number
  size?: 'sm' | 'md'
  onPortClick?: (port: number) => void
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const gridStyles = css`
  @layer components {
    @scope (.ui-port-status-grid) {
      :scope {
        position: relative;
      }

      .ui-port-status-grid__grid {
        display: grid;
        grid-template-columns: repeat(var(--columns, 8), 1fr);
        gap: var(--space-xs, 0.25rem);
      }

      .ui-port-status-grid__item {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-sm, 0.375rem);
        font-size: var(--text-xs, 0.75rem);
        font-variant-numeric: tabular-nums;
        font-weight: 500;
        color: var(--text-primary, oklch(90% 0 0));
        cursor: default;
        user-select: none;
        transition: transform 0.15s ease;
      }

      :scope[data-size="sm"] .ui-port-status-grid__item {
        padding: var(--space-2xs, 0.125rem) var(--space-xs, 0.25rem);
        font-size: 0.625rem;
      }
      :scope[data-size="md"] .ui-port-status-grid__item {
        padding: var(--space-xs, 0.25rem) var(--space-sm, 0.5rem);
      }

      /* Status colors */
      .ui-port-status-grid__item[data-status="ok"] {
        background: oklch(72% 0.19 155 / 0.15);
        border: 1px solid oklch(72% 0.19 155 / 0.3);
      }
      .ui-port-status-grid__item[data-status="warning"] {
        background: oklch(80% 0.18 85 / 0.15);
        border: 1px solid oklch(80% 0.18 85 / 0.3);
      }
      .ui-port-status-grid__item[data-status="critical"] {
        background: oklch(62% 0.22 25 / 0.15);
        border: 1px solid oklch(62% 0.22 25 / 0.3);
      }
      .ui-port-status-grid__item[data-status="unknown"] {
        background: var(--bg-hover);
        border: 1px solid var(--border-default);
        color: var(--text-tertiary, oklch(55% 0 0));
      }

      /* Clickable */
      .ui-port-status-grid__item-btn {
        all: unset;
        display: flex;
        align-items: center;
        justify-content: center;
        inline-size: 100%;
        block-size: 100%;
        cursor: pointer;
        font: inherit;
        color: inherit;
      }
      .ui-port-status-grid__item-btn:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
        border-radius: var(--radius-sm, 0.375rem);
      }

      @media (hover: hover) {
        .ui-port-status-grid__item:hover:not([data-motion="0"]) {
          transform: scale(1.1);
          z-index: 1;
        }
      }

      /* Tooltip */
      .ui-port-status-grid__tooltip {
        position: absolute;
        inset-block-end: calc(100% + 4px);
        inset-inline-start: 50%;
        transform: translateX(-50%);
        padding: 0.25rem 0.5rem;
        background: var(--bg-elevated, oklch(28% 0.02 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.1));
        border-radius: var(--radius-sm, 0.375rem);
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-primary, oklch(90% 0 0));
        pointer-events: none;
        white-space: nowrap;
        z-index: 10;
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-port-status-grid__item {
          forced-color-adjust: none;
          border: 2px solid ButtonText;
        }
        .ui-port-status-grid__item[data-status="critical"] {
          border-color: LinkText;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

function PortStatusGridInner({
  ports,
  columns = 8,
  size = 'md',
  onPortClick,
  motion: motionProp,
  className,
  ...rest
}: PortStatusGridProps) {
  useStyles('port-status-grid', gridStyles)
  const motionLevel = useMotionLevel(motionProp)
  const [hoveredPort, setHoveredPort] = useState<number | null>(null)

  return (
    <div
      className={cn('ui-port-status-grid', className)}
      data-motion={motionLevel}
      data-size={size}
      role="group"
      aria-label="Port status"
      {...rest}
    >
      <div
        className="ui-port-status-grid__grid"
        style={{ '--columns': columns } as React.CSSProperties}
      >
        {ports.map(p => (
          <div
            key={p.port}
            className="ui-port-status-grid__item"
            data-status={p.status}
            onMouseEnter={() => setHoveredPort(p.port)}
            onMouseLeave={() => setHoveredPort(null)}
          >
            {onPortClick ? (
              <button
                className="ui-port-status-grid__item-btn"
                onClick={() => onPortClick(p.port)}
                aria-label={`Port ${p.port}${p.label ? ` (${p.label})` : ''}: ${p.status}`}
              >
                {p.port}
              </button>
            ) : (
              p.port
            )}

            {hoveredPort === p.port && p.label && (
              <div className="ui-port-status-grid__tooltip">
                {p.label} ({p.status})
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function PortStatusGrid(props: PortStatusGridProps) {
  return (
    <ComponentErrorBoundary>
      <PortStatusGridInner {...props} />
    </ComponentErrorBoundary>
  )
}

PortStatusGrid.displayName = 'PortStatusGrid'
