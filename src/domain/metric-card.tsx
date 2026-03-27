'use client'

import {
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useEntrance } from '../core/motion/use-entrance'
import { cn } from '../core/utils/cn'
import { ComponentErrorBoundary } from '../core/utils/error-boundary'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface MetricCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode
  value: ReactNode
  change?: { value: number; period?: string }
  trend?: 'up' | 'down' | 'flat'
  status?: 'ok' | 'warning' | 'critical'
  icon?: ReactNode
  sparkline?: number[]
  loading?: boolean
  error?: ReactNode
  empty?: ReactNode
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const metricCardStyles = css`
  @layer components {
    @scope (.ui-metric-card) {
      :scope {
        position: relative;
        min-inline-size: 280px;
        display: flex;
        flex-direction: column;
        gap: var(--space-xs, 0.25rem);
        padding: var(--space-md, 1rem);
        container-type: inline-size;
        border-radius: var(--radius-lg, 0.75rem);
        background: var(--bg-surface, oklch(22% 0.02 270));
        border: 1px solid var(--border-default);
        box-shadow: var(--shadow-sm);
        overflow: hidden;
        transition: box-shadow 0.2s var(--ease-out, ease-out),
                    transform 0.2s var(--ease-out, ease-out);
      }

      :scope[data-motion="0"] {
        transition: none;
      }

      /* Aurora glow */
      :scope::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: radial-gradient(
          ellipse at 20% 0%,
          oklch(from var(--aurora-1, oklch(70% 0.15 270)) l c h / 0.04) 0%,
          transparent 60%
        ),
        radial-gradient(
          ellipse at 80% 100%,
          oklch(from var(--aurora-2, oklch(70% 0.15 330)) l c h / 0.03) 0%,
          transparent 50%
        );
        pointer-events: none;
        z-index: 0;
      }

      :scope > * {
        position: relative;
        z-index: 1;
      }

      /* Status accent — ambient glow beneath card */
      :scope[data-status="ok"] {
        border-inline-start: 3px solid oklch(72% 0.19 155);
        box-shadow:
          0 8px 32px oklch(72% 0.19 155 / 0.12),
          0 2px 8px oklch(72% 0.19 155 / 0.08);
      }
      :scope[data-status="warning"] {
        border-inline-start: 3px solid oklch(80% 0.18 85);
        box-shadow:
          0 8px 32px oklch(80% 0.18 85 / 0.12),
          0 2px 8px oklch(80% 0.18 85 / 0.08);
      }
      :scope[data-status="critical"] {
        border-inline-start: 3px solid oklch(62% 0.22 25);
        box-shadow:
          0 8px 32px oklch(62% 0.22 25 / 0.15),
          0 2px 8px oklch(62% 0.22 25 / 0.1);
      }

      /* Pulsing status dot */
      .ui-metric-card__status-dot {
        position: absolute;
        inset-block-start: 0.75rem;
        inset-inline-end: 0.75rem;
        inline-size: 8px;
        block-size: 8px;
        border-radius: 9999px;
        z-index: 2;
      }
      .ui-metric-card__status-dot[data-status="ok"] {
        background: oklch(72% 0.19 155);
      }
      .ui-metric-card__status-dot[data-status="warning"] {
        background: oklch(80% 0.18 85);
      }
      .ui-metric-card__status-dot[data-status="critical"] {
        background: oklch(62% 0.22 25);
      }

      /* Pulse ring on dot — motion 2+ */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-metric-card__status-dot::after {
        content: '';
        position: absolute;
        inset: -3px;
        border-radius: 9999px;
        border: 2px solid currentColor;
        color: inherit;
        opacity: 0;
        animation: ui-metric-status-pulse 2s ease-out infinite;
      }
      .ui-metric-card__status-dot[data-status="ok"]::after { color: oklch(72% 0.19 155); }
      .ui-metric-card__status-dot[data-status="warning"]::after { color: oklch(80% 0.18 85); }
      .ui-metric-card__status-dot[data-status="critical"]::after { color: oklch(62% 0.22 25); }

      @keyframes ui-metric-status-pulse {
        0% { transform: scale(1); opacity: 0.6; }
        100% { transform: scale(2.5); opacity: 0; }
      }

      @media (prefers-reduced-motion: reduce) {
        .ui-metric-card__status-dot::after { animation: none; }
      }

      /* Header row */
      .ui-metric-card__header {
        display: flex;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
      }

      .ui-metric-card__icon {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        color: var(--text-secondary, oklch(70% 0 0));
      }

      .ui-metric-card__title {
        margin: 0;
        font-size: var(--text-sm, 0.875rem);
        font-weight: 500;
        color: var(--text-secondary, oklch(70% 0 0));
        text-wrap: balance;
        line-height: 1.4;
      }

      /* Value */
      .ui-metric-card__value {
        margin: 0;
        font-size: var(--text-2xl, 1.5rem);
        font-weight: 700;
        color: var(--text-primary, oklch(90% 0 0));
        line-height: 1.2;
        font-variant-numeric: tabular-nums;
      }

      /* Change / trend row */
      .ui-metric-card__change {
        display: flex;
        align-items: center;
        gap: var(--space-2xs, 0.125rem);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.4;
      }

      .ui-metric-card__change-value {
        font-weight: 600;
        font-variant-numeric: tabular-nums;
      }

      .ui-metric-card__change-value[data-direction="positive"] {
        color: oklch(72% 0.19 155);
      }
      .ui-metric-card__change-value[data-direction="negative"] {
        color: oklch(62% 0.22 25);
      }
      .ui-metric-card__change-value[data-direction="zero"] {
        color: var(--text-secondary, oklch(70% 0 0));
      }

      .ui-metric-card__change-period {
        color: var(--text-tertiary, oklch(55% 0 0));
      }

      /* Trend indicator */
      .ui-metric-card__trend {
        display: inline-flex;
        align-items: center;
        font-size: 0.75rem;
      }
      .ui-metric-card__trend[data-trend="up"] {
        color: oklch(72% 0.19 155);
      }
      .ui-metric-card__trend[data-trend="down"] {
        color: oklch(62% 0.22 25);
      }
      .ui-metric-card__trend[data-trend="flat"] {
        color: var(--text-secondary, oklch(70% 0 0));
      }

      /* Sparkline */
      .ui-metric-card__sparkline {
        margin-block-start: var(--space-xs, 0.25rem);
      }
      .ui-metric-card__sparkline svg {
        display: block;
        inline-size: 100%;
        block-size: 2rem;
      }

      /* Loading skeleton */
      :scope[data-loading] .ui-metric-card__value {
        background: var(--bg-hover);
        border-radius: var(--radius-sm, 0.375rem);
        min-inline-size: 4rem;
        min-block-size: 1.5rem;
        animation: ui-metric-card-pulse 1.5s ease-in-out infinite;
      }

      @keyframes ui-metric-card-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }

      /* Error / empty states */
      .ui-metric-card__error {
        color: oklch(62% 0.22 25);
        font-size: var(--text-sm, 0.875rem);
      }
      .ui-metric-card__empty {
        color: var(--text-tertiary, oklch(55% 0 0));
        font-size: var(--text-sm, 0.875rem);
      }

      /* Hover lift */
      @media (hover: hover) {
        :scope:hover:not([data-motion="0"]) {
          transform: translateY(-1px);
          box-shadow: var(--shadow-md, 0 4px 12px oklch(0% 0 0 / 0.2));
        }
      }

      /* Container query: narrow (< 160px) — value only */
      @container (max-width: 159px) {
        .ui-metric-card__header {
          display: none;
        }
        .ui-metric-card__sparkline,
        .ui-metric-card__change {
          display: none;
        }
        :scope {
          padding: var(--space-sm, 0.5rem);
        }
      }

      /* Container query: medium (160-280px) — +title */
      @container (min-width: 160px) and (max-width: 280px) {
        .ui-metric-card__sparkline {
          display: none;
        }
      }

      /* Container query: wide (> 280px) — everything visible */

      /* Forced colors */
      @media (forced-colors: active) {
        :scope {
          border: 2px solid ButtonText;
        }
        :scope::before {
          display: none;
        }
        :scope[data-status="ok"],
        :scope[data-status="warning"],
        :scope[data-status="critical"] {
          border-inline-start: 3px solid Highlight;
        }
      }

      /* Print */
      @media print {
        :scope {
          box-shadow: none;
          border: 1px solid;
          break-inside: avoid;
        }
        :scope::before {
          display: none;
        }
      }
    }
  }
`

// ─── Sparkline helper ────────────────────────────────────────────────────────

function MiniSparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const w = 100
  const h = 24
  const padding = 1

  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - padding - ((v - min) / range) * (h - padding * 2),
  }))

  // Simple smooth path using quadratic bezier
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const cpx = (prev.x + curr.x) / 2
    d += ` Q ${cpx} ${prev.y}, ${curr.x} ${curr.y}`
  }

  // Area fill path
  const areaD = `${d} L ${points[points.length - 1].x} ${h} L ${points[0].x} ${h} Z`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="sparkline-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(65% 0.2 270)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="oklch(65% 0.2 270)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#sparkline-fill)" />
      <path d={d} fill="none" stroke="oklch(65% 0.2 270)" strokeWidth="1.5" />
    </svg>
  )
}

// ─── Trend arrows ────────────────────────────────────────────────────────────

function TrendArrow({ trend }: { trend: 'up' | 'down' | 'flat' }) {
  const arrows = { up: '\u2191', down: '\u2193', flat: '\u2192' }
  return (
    <span
      className="ui-metric-card__trend"
      data-trend={trend}
      aria-label={`Trend: ${trend}`}
    >
      {arrows[trend]}
    </span>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

function MetricCardInner({
  title,
  value,
  change,
  trend,
  status,
  icon,
  sparkline,
  loading,
  error,
  empty,
  motion: motionProp,
  className,
  ...rest
}: MetricCardProps) {
  useStyles('metric-card', metricCardStyles)
  const motionLevel = useMotionLevel(motionProp)
  const cardRef = useRef<HTMLDivElement>(null)

  // Fade-up entrance at motion level 2+
  useEntrance(
    cardRef,
    motionLevel >= 2 ? 'fade-up' : 'none',
    { duration: 280 }
  )

  // Determine what body to show
  const showError = error !== undefined
  const showEmpty = !showError && empty !== undefined && !value

  return (
    <div
      ref={cardRef}
      className={cn('ui-metric-card', className)}
      data-motion={motionLevel}
      {...(status && { 'data-status': status })}
      {...(loading && { 'data-loading': '' })}
      role="group"
      aria-label={typeof title === 'string' ? title : undefined}
      {...rest}
    >
      {status && (
        <span
          className="ui-metric-card__status-dot"
          data-status={status}
          aria-hidden="true"
        />
      )}
      <div className="ui-metric-card__header">
        {icon && <span className="ui-metric-card__icon">{icon}</span>}
        <h3 className="ui-metric-card__title">{title}</h3>
      </div>

      {showError ? (
        <div className="ui-metric-card__error">{error}</div>
      ) : showEmpty ? (
        <div className="ui-metric-card__empty">{empty}</div>
      ) : (
        <div className="ui-metric-card__value">
          {loading ? '\u00A0' : value}
        </div>
      )}

      {!showError && (change || trend) && (
        <div className="ui-metric-card__change">
          {trend && <TrendArrow trend={trend} />}
          {change && (
            <span
              className="ui-metric-card__change-value"
              data-direction={change.value > 0 ? 'positive' : change.value < 0 ? 'negative' : 'zero'}
            >
              {change.value > 0 ? '+' : ''}{change.value}%
            </span>
          )}
          {change?.period && (
            <span className="ui-metric-card__change-period">
              vs {change.period}
            </span>
          )}
        </div>
      )}

      {sparkline && sparkline.length >= 2 && !showError && !showEmpty && (
        <div className="ui-metric-card__sparkline">
          <MiniSparkline data={sparkline} />
        </div>
      )}
    </div>
  )
}

export function MetricCard(props: MetricCardProps) {
  return (
    <ComponentErrorBoundary>
      <MetricCardInner {...props} />
    </ComponentErrorBoundary>
  )
}

MetricCard.displayName = 'MetricCard'
