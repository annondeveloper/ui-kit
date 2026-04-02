'use client'

import {
  useMemo,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'
import { ComponentErrorBoundary } from '../core/utils/error-boundary'
import { DashboardTemplate, type DashboardMetric, type DashboardSection } from './dashboard-template'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PluginMetricDef {
  key: string
  label: string
  format?: 'number' | 'bytes' | 'percent' | 'duration' | 'rate'
  unit?: string
  thresholds?: { warning: number; critical: number }
  sparkline?: boolean
}

export interface PluginChartDef {
  id: string
  title: string
  series: Array<{ key: string; label: string; color?: string }>
  height?: number
  yFormat?: 'number' | 'bytes' | 'percent' | 'duration'
}

export interface PluginPropertyDef {
  key: string
  label: string
  format?: 'text' | 'code' | 'link' | 'badge' | 'timestamp' | 'duration'
  copyable?: boolean
}

export interface DashboardWidget {
  id: string
  type: 'metric' | 'chart' | 'table' | 'status' | 'list' | 'gauge' | 'custom'
  title: string
  span?: 1 | 2 | 3
  height?: number | string

  // For 'metric' type
  metricKey?: string
  metricFormat?: 'number' | 'bytes' | 'percent' | 'duration' | 'rate'
  metricUnit?: string
  metricThresholds?: { warning: number; critical: number }
  metricSparkline?: boolean
  metricTrend?: boolean

  // For 'chart' type
  chartSeries?: Array<{ key: string; label: string; color?: string }>
  chartHeight?: number
  chartType?: 'line' | 'area' | 'bar'

  // For 'gauge' type
  gaugeKey?: string
  gaugeMax?: number
  gaugeThresholds?: { warning: number; critical: number }

  // For 'table' type
  tableColumns?: Array<{ key: string; label: string; format?: string }>
  tableDataKey?: string

  // For 'status' type
  statusKey?: string
  statusLabels?: Record<string, string>

  // For 'list' type
  listKey?: string
  listItemFormat?: 'text' | 'badge' | 'link'

  // For 'custom' type
  render?: (data: Record<string, unknown>) => ReactNode
}

export interface PluginDashboardConfig {
  name: string
  icon?: ReactNode
  metrics: PluginMetricDef[]
  charts: PluginChartDef[]
  properties: PluginPropertyDef[]
  statusKey?: string
  widgets?: DashboardWidget[]
  layout?: 'auto' | '2-col' | '3-col'
}

export interface PluginDashboardProps extends HTMLAttributes<HTMLDivElement> {
  config: PluginDashboardConfig
  data: Record<string, unknown>
  timeSeries?: Record<string, Array<{ timestamp: number; value: number }>>
  loading?: boolean
  error?: ReactNode
  onRefresh?: () => void
  autoRefresh?: number
  motion?: 0 | 1 | 2 | 3
}

// ─── Formatters ─────────────────────────────────────────────────────────────

export function formatMetricValue(value: unknown, format?: string, unit?: string): string {
  if (value == null) return '—'
  const num = Number(value)
  if (Number.isNaN(num)) return String(value)

  switch (format) {
    case 'bytes': {
      const units = ['B', 'KB', 'MB', 'GB', 'TB']
      let v = num
      let i = 0
      while (v >= 1024 && i < units.length - 1) { v /= 1024; i++ }
      return `${i === 0 ? v : v.toFixed(1)} ${units[i]}`
    }
    case 'percent':
      return `${num % 1 === 0 ? num : num.toFixed(1)}%`
    case 'duration': {
      if (num < 1000) return `${Math.round(num)}ms`
      if (num < 60_000) return `${(num / 1000).toFixed(1)}s`
      const mins = Math.floor(num / 60_000)
      const secs = Math.round((num % 60_000) / 1000)
      if (num < 3_600_000) return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
      const hrs = Math.floor(num / 3_600_000)
      const rmins = Math.floor((num % 3_600_000) / 60_000)
      if (num < 86_400_000) return rmins > 0 ? `${hrs}h ${rmins}m` : `${hrs}h`
      const days = Math.floor(num / 86_400_000)
      const rhrs = Math.floor((num % 86_400_000) / 3_600_000)
      return rhrs > 0 ? `${days}d ${rhrs}h` : `${days}d`
    }
    case 'rate': {
      if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M/s`
      if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K/s`
      return `${num.toFixed(0)}/s`
    }
    case 'number':
    default:
      return unit ? `${num.toLocaleString()} ${unit}` : num.toLocaleString()
  }
}

export function deriveStatus(
  value: unknown,
  thresholds?: { warning: number; critical: number },
): 'ok' | 'warning' | 'critical' | undefined {
  if (!thresholds || value == null) return undefined
  const num = Number(value)
  if (Number.isNaN(num)) return undefined
  // For metrics where lower is worse (like cache_hit_ratio), critical < warning
  if (thresholds.critical < thresholds.warning) {
    if (num <= thresholds.critical) return 'critical'
    if (num <= thresholds.warning) return 'warning'
    return 'ok'
  }
  // Normal: higher is worse
  if (num >= thresholds.critical) return 'critical'
  if (num >= thresholds.warning) return 'warning'
  return 'ok'
}

// ─── Property Formatter ─────────────────────────────────────────────────────

function formatPropertyValue(value: unknown, format?: string): ReactNode {
  if (value == null) return '—'
  switch (format) {
    case 'code':
      return <code className="ui-plugin-dashboard__prop-code">{String(value)}</code>
    case 'link':
      return (
        <a
          className="ui-plugin-dashboard__prop-link"
          href={String(value)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {String(value)}
        </a>
      )
    case 'badge':
      return <span className="ui-plugin-dashboard__prop-badge">{String(value)}</span>
    case 'timestamp': {
      const d = new Date(typeof value === 'number' ? value : String(value))
      return d.toLocaleString()
    }
    case 'duration':
      return formatMetricValue(value, 'duration')
    default:
      return String(value)
  }
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const pluginDashboardStyles = css`
  @layer components {
    @scope (.ui-plugin-dashboard) {
      :scope {
        position: relative;
      }

      /* ── Property list ──────────────────────────── */

      .ui-plugin-dashboard__properties {
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
        margin: 0;
        padding: 0;
      }

      .ui-plugin-dashboard__prop {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
      }

      .ui-plugin-dashboard__prop-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary, oklch(55% 0 0));
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .ui-plugin-dashboard__prop-value {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-primary, oklch(90% 0 0));
        line-height: 1.4;
        word-break: break-word;
      }

      .ui-plugin-dashboard__prop-code {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', ui-monospace, monospace;
        font-size: var(--text-xs, 0.75rem);
        background: oklch(0% 0 0 / 0.2);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm, 0.375rem);
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.06));
      }

      .ui-plugin-dashboard__prop-link {
        color: oklch(70% 0.15 270);
        text-decoration: none;
      }
      .ui-plugin-dashboard__prop-link:hover {
        text-decoration: underline;
      }

      .ui-plugin-dashboard__prop-badge {
        display: inline-block;
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        padding: 0.125rem 0.5rem;
        border-radius: var(--radius-full, 9999px);
        background: oklch(65% 0.2 270 / 0.15);
        color: oklch(78% 0.12 270);
      }

      .ui-plugin-dashboard__prop-copy {
        all: unset;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary, oklch(55% 0 0));
        padding: 0.125rem 0.25rem;
        border-radius: var(--radius-sm, 0.375rem);
        transition: color 0.15s;
      }
      .ui-plugin-dashboard__prop-copy:hover {
        color: var(--text-secondary, oklch(70% 0 0));
      }
      .ui-plugin-dashboard__prop-copy:focus-visible {
        outline: 2px solid var(--focus-ring, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      /* ── Widget Grid ──────────────────────────────── */

      .ui-plugin-dashboard__widget-grid {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(3, 1fr);
      }

      .ui-plugin-dashboard__widget-grid--2-col {
        grid-template-columns: repeat(2, 1fr);
      }

      .ui-plugin-dashboard__widget-grid--3-col {
        grid-template-columns: repeat(3, 1fr);
      }

      .ui-plugin-dashboard__widget {
        background: var(--bg-surface, oklch(18% 0.01 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.06));
        border-radius: var(--radius-md, 0.5rem);
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        min-inline-size: 0;
        overflow: hidden;
      }

      .ui-plugin-dashboard__widget--span-2 {
        grid-column: span 2;
      }

      .ui-plugin-dashboard__widget--span-3 {
        grid-column: span 3;
      }

      .ui-plugin-dashboard__widget-title {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary, oklch(55% 0 0));
        text-transform: uppercase;
        letter-spacing: 0.04em;
        margin: 0;
      }

      /* ── Widget: Metric ────────────────────────────── */

      .ui-plugin-dashboard__widget-metric-value {
        font-size: clamp(1.25rem, 2.5vw, 1.75rem);
        font-weight: 700;
        color: var(--text-primary, oklch(90% 0 0));
        line-height: 1.2;
        font-variant-numeric: tabular-nums;
      }

      .ui-plugin-dashboard__widget-metric-row {
        display: flex;
        align-items: baseline;
        gap: 0.5rem;
      }

      .ui-plugin-dashboard__widget-trend {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 600;
      }

      .ui-plugin-dashboard__widget-trend--up {
        color: oklch(72% 0.19 155);
      }

      .ui-plugin-dashboard__widget-trend--down {
        color: oklch(62% 0.22 25);
      }

      .ui-plugin-dashboard__widget-status-indicator {
        display: inline-block;
        inline-size: 0.5rem;
        block-size: 0.5rem;
        border-radius: 50%;
        margin-inline-end: 0.375rem;
        vertical-align: middle;
      }

      .ui-plugin-dashboard__widget-status-indicator--ok {
        background: oklch(72% 0.19 155);
      }

      .ui-plugin-dashboard__widget-status-indicator--warning {
        background: oklch(80% 0.18 85);
      }

      .ui-plugin-dashboard__widget-status-indicator--critical {
        background: oklch(62% 0.22 25);
      }

      /* ── Widget: Gauge ─────────────────────────────── */

      .ui-plugin-dashboard__gauge-wrap {
        display: flex;
        align-items: center;
        justify-content: center;
        padding-block: 0.25rem;
      }

      .ui-plugin-dashboard__gauge-label {
        font-size: var(--text-lg, 1.125rem);
        font-weight: 700;
        fill: var(--text-primary, oklch(90% 0 0));
        text-anchor: middle;
        dominant-baseline: central;
      }

      .ui-plugin-dashboard__gauge-track {
        fill: none;
        stroke: var(--border-default, oklch(100% 0 0 / 0.08));
        stroke-linecap: round;
      }

      .ui-plugin-dashboard__gauge-fill {
        fill: none;
        stroke-linecap: round;
        transition: stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      }

      /* ── Widget: Table ─────────────────────────────── */

      .ui-plugin-dashboard__widget-table {
        inline-size: 100%;
        border-collapse: collapse;
        font-size: var(--text-sm, 0.875rem);
      }

      .ui-plugin-dashboard__widget-table th {
        text-align: start;
        font-weight: 600;
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary, oklch(55% 0 0));
        text-transform: uppercase;
        letter-spacing: 0.04em;
        padding: 0.375rem 0.5rem;
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.06));
      }

      .ui-plugin-dashboard__widget-table td {
        padding: 0.375rem 0.5rem;
        color: var(--text-secondary, oklch(70% 0 0));
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.03));
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-inline-size: 200px;
      }

      /* ── Widget: Status ────────────────────────────── */

      .ui-plugin-dashboard__widget-status-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        font-size: var(--text-sm, 0.875rem);
        font-weight: 600;
        padding: 0.25rem 0.75rem;
        border-radius: var(--radius-full, 9999px);
      }

      .ui-plugin-dashboard__widget-status-badge--ok {
        background: oklch(72% 0.19 155 / 0.15);
        color: oklch(78% 0.14 155);
      }

      .ui-plugin-dashboard__widget-status-badge--warning {
        background: oklch(80% 0.18 85 / 0.15);
        color: oklch(85% 0.14 85);
      }

      .ui-plugin-dashboard__widget-status-badge--critical {
        background: oklch(62% 0.22 25 / 0.15);
        color: oklch(72% 0.16 25);
      }

      .ui-plugin-dashboard__widget-status-badge--unknown {
        background: oklch(50% 0 0 / 0.15);
        color: oklch(65% 0 0);
      }

      /* ── Widget: List ──────────────────────────────── */

      .ui-plugin-dashboard__widget-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .ui-plugin-dashboard__widget-list-item {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary, oklch(70% 0 0));
        padding: 0.25rem 0;
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.03));
        line-height: 1.4;
      }

      .ui-plugin-dashboard__widget-list-item:last-child {
        border-block-end: none;
      }

      .ui-plugin-dashboard__widget-list-badge {
        display: inline-block;
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        padding: 0.125rem 0.5rem;
        border-radius: var(--radius-full, 9999px);
        background: oklch(65% 0.2 270 / 0.15);
        color: oklch(78% 0.12 270);
      }

      .ui-plugin-dashboard__widget-list-link {
        color: oklch(70% 0.15 270);
        text-decoration: none;
        font-size: var(--text-sm, 0.875rem);
      }

      .ui-plugin-dashboard__widget-list-link:hover {
        text-decoration: underline;
      }

      @container (max-width: 600px) {
        .ui-plugin-dashboard__widget-grid {
          grid-template-columns: 1fr;
        }
        .ui-plugin-dashboard__widget--span-2,
        .ui-plugin-dashboard__widget--span-3 {
          grid-column: span 1;
        }
      }

      /* ── Chart placeholder ──────────────────────── */

      .ui-plugin-dashboard__chart-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px dashed var(--border-default, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-md, 0.5rem);
        color: var(--text-tertiary, oklch(55% 0 0));
        font-size: var(--text-sm, 0.875rem);
        min-block-size: 120px;
      }

      /* ── Loading overlay ────────────────────────── */

      .ui-plugin-dashboard__loading-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: oklch(15% 0.01 270 / 0.7);
        @supports (background: oklch(from white l c h)) {
          background: oklch(from var(--bg-base, oklch(15% 0.01 270)) l c h / 0.7);
        }
        border-radius: inherit;
        z-index: 10;
        backdrop-filter: blur(2px);
      }

      .ui-plugin-dashboard__loading-spinner {
        inline-size: 1.5rem;
        block-size: 1.5rem;
        border: 2px solid var(--border-default, oklch(100% 0 0 / 0.1));
        border-block-start-color: var(--brand, oklch(65% 0.2 270));
        border-radius: 50%;
        animation: ui-pd-spin 0.8s linear infinite;
      }

      @keyframes ui-pd-spin {
        to { transform: rotate(360deg); }
      }

      /* ── Error state ────────────────────────────── */

      .ui-plugin-dashboard__error {
        padding: 1.5rem;
        border: 1px solid oklch(62% 0.22 25 / 0.3);
        border-radius: var(--radius-md, 0.5rem);
        background: oklch(62% 0.22 25 / 0.08);
        color: oklch(78% 0.16 25);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.5;
      }

      /* ── Motion 0 ───────────────────────────────── */

      :scope[data-motion="0"] .ui-plugin-dashboard__loading-spinner {
        animation: none;
      }

      /* ── Forced colors ──────────────────────────── */

      @media (forced-colors: active) {
        .ui-plugin-dashboard__prop-badge {
          border: 1px solid ButtonText;
        }
        .ui-plugin-dashboard__chart-placeholder {
          border: 2px dashed ButtonText;
        }
        .ui-plugin-dashboard__widget {
          border: 1px solid ButtonText;
        }
        .ui-plugin-dashboard__widget-status-badge {
          border: 1px solid ButtonText;
        }
        .ui-plugin-dashboard__gauge-track {
          stroke: ButtonText;
        }
        .ui-plugin-dashboard__gauge-fill {
          stroke: Highlight;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .ui-plugin-dashboard__loading-spinner {
          animation: none;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

function CopyButton({ value }: { value: string }) {
  const copy = () => { navigator.clipboard?.writeText(value) }
  return (
    <button
      type="button"
      className="ui-plugin-dashboard__prop-copy"
      onClick={copy}
      aria-label={`Copy ${value}`}
    >
      copy
    </button>
  )
}

// ─── Widget Renderers ──────────────────────────────────────────────────────

function renderGaugeSvg(value: number, max: number, thresholds?: { warning: number; critical: number }) {
  const pct = Math.min(Math.max(value / max, 0), 1)
  const radius = 40
  const strokeWidth = 8
  const circumference = Math.PI * radius // semicircle
  const offset = circumference * (1 - pct)

  let color = 'oklch(72% 0.19 155)' // ok green
  if (thresholds) {
    const status = deriveStatus(value, thresholds)
    if (status === 'warning') color = 'oklch(80% 0.18 85)'
    else if (status === 'critical') color = 'oklch(62% 0.22 25)'
  }

  return (
    <div className="ui-plugin-dashboard__gauge-wrap">
      <svg viewBox="0 0 100 60" width="120" height="72" aria-hidden="true">
        <path
          className="ui-plugin-dashboard__gauge-track"
          d="M 10 50 A 40 40 0 0 1 90 50"
          strokeWidth={strokeWidth}
        />
        <path
          className="ui-plugin-dashboard__gauge-fill"
          d="M 10 50 A 40 40 0 0 1 90 50"
          strokeWidth={strokeWidth}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <text x="50" y="45" className="ui-plugin-dashboard__gauge-label">
          {Math.round(pct * 100)}%
        </text>
      </svg>
    </div>
  )
}

function renderWidgetContent(widget: DashboardWidget, data: Record<string, unknown>, timeSeries?: Record<string, Array<{ timestamp: number; value: number }>>): ReactNode {
  switch (widget.type) {
    case 'metric': {
      const raw = widget.metricKey ? data[widget.metricKey] : undefined
      const formatted = formatMetricValue(raw, widget.metricFormat, widget.metricUnit)
      const status = deriveStatus(raw, widget.metricThresholds)
      const tsData = widget.metricSparkline && widget.metricKey ? timeSeries?.[widget.metricKey] : undefined
      const trend = widget.metricTrend && tsData && tsData.length >= 2
        ? (tsData[tsData.length - 1].value >= tsData[tsData.length - 2].value ? 'up' : 'down')
        : undefined

      return (
        <>
          <div className="ui-plugin-dashboard__widget-metric-row">
            <span className="ui-plugin-dashboard__widget-metric-value">
              {status && (
                <span className={`ui-plugin-dashboard__widget-status-indicator ui-plugin-dashboard__widget-status-indicator--${status}`} />
              )}
              {formatted}
            </span>
            {trend && (
              <span className={`ui-plugin-dashboard__widget-trend ui-plugin-dashboard__widget-trend--${trend}`}>
                {trend === 'up' ? '\u2191' : '\u2193'}
              </span>
            )}
          </div>
          {widget.metricSparkline && tsData && (
            <svg
              viewBox={`0 0 ${tsData.length - 1} 20`}
              preserveAspectRatio="none"
              width="100%"
              height="24"
              aria-hidden="true"
              style={{ display: 'block' }}
            >
              <polyline
                fill="none"
                stroke="oklch(65% 0.2 270)"
                strokeWidth="1.5"
                points={tsData.map((p, i) => {
                  const max = Math.max(...tsData.map(d => d.value))
                  const min = Math.min(...tsData.map(d => d.value))
                  const range = max - min || 1
                  const y = 20 - ((p.value - min) / range) * 18
                  return `${i},${y}`
                }).join(' ')}
              />
            </svg>
          )}
        </>
      )
    }

    case 'chart': {
      const series = widget.chartSeries ?? []
      const h = widget.chartHeight ?? 120
      return (
        <div
          className="ui-plugin-dashboard__chart-placeholder"
          style={{ minBlockSize: h }}
        >
          {series.map((s, i) => (
            <span key={s.key} style={{ color: s.color ?? 'oklch(65% 0.2 270)', marginInlineEnd: i < series.length - 1 ? '0.75rem' : 0 }}>
              {s.label}
            </span>
          ))}
          {series.length > 0 && ` (${widget.chartType ?? 'line'})`}
        </div>
      )
    }

    case 'gauge': {
      const raw = widget.gaugeKey ? data[widget.gaugeKey] : 0
      const value = Number(raw) || 0
      const max = widget.gaugeMax ?? 100
      return renderGaugeSvg(value, max, widget.gaugeThresholds)
    }

    case 'table': {
      const columns = widget.tableColumns ?? []
      const rows = (widget.tableDataKey ? data[widget.tableDataKey] : []) as Array<Record<string, unknown>>
      if (!Array.isArray(rows) || rows.length === 0) {
        return <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>No data</span>
      }
      return (
        <table className="ui-plugin-dashboard__widget-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 10).map((row, i) => (
              <tr key={i}>
                {columns.map(col => (
                  <td key={col.key}>{formatMetricValue(row[col.key], col.format)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )
    }

    case 'status': {
      const raw = widget.statusKey ? data[widget.statusKey] : undefined
      const strVal = String(raw ?? 'unknown')
      const label = widget.statusLabels?.[strVal] ?? strVal
      const statusClass = strVal === 'ok' || strVal === 'healthy' || strVal === 'green' || strVal === 'running' || strVal === 'active'
        ? 'ok'
        : strVal === 'warning' || strVal === 'degraded' || strVal === 'yellow'
          ? 'warning'
          : strVal === 'critical' || strVal === 'error' || strVal === 'red' || strVal === 'down'
            ? 'critical'
            : 'unknown'
      return (
        <span className={`ui-plugin-dashboard__widget-status-badge ui-plugin-dashboard__widget-status-badge--${statusClass}`}>
          <span className={`ui-plugin-dashboard__widget-status-indicator ui-plugin-dashboard__widget-status-indicator--${statusClass}`} />
          {label}
        </span>
      )
    }

    case 'list': {
      const items = (widget.listKey ? data[widget.listKey] : []) as unknown[]
      if (!Array.isArray(items) || items.length === 0) {
        return <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>No items</span>
      }
      const fmt = widget.listItemFormat ?? 'text'
      return (
        <ul className="ui-plugin-dashboard__widget-list">
          {items.slice(0, 20).map((item, i) => (
            <li key={i} className="ui-plugin-dashboard__widget-list-item">
              {fmt === 'badge' ? (
                <span className="ui-plugin-dashboard__widget-list-badge">{String(item)}</span>
              ) : fmt === 'link' ? (
                <a className="ui-plugin-dashboard__widget-list-link" href={String(item)} target="_blank" rel="noopener noreferrer">{String(item)}</a>
              ) : (
                String(item)
              )}
            </li>
          ))}
        </ul>
      )
    }

    case 'custom': {
      return widget.render ? widget.render(data) : null
    }

    default:
      return null
  }
}

function renderWidgetGrid(widgets: DashboardWidget[], data: Record<string, unknown>, layout?: 'auto' | '2-col' | '3-col', timeSeries?: Record<string, Array<{ timestamp: number; value: number }>>) {
  const layoutClass = layout === '2-col'
    ? ' ui-plugin-dashboard__widget-grid--2-col'
    : layout === '3-col'
      ? ' ui-plugin-dashboard__widget-grid--3-col'
      : ''

  return (
    <div className={`ui-plugin-dashboard__widget-grid${layoutClass}`} role="region" aria-label="Dashboard widgets">
      {widgets.map(widget => (
        <div
          key={widget.id}
          className={cn(
            'ui-plugin-dashboard__widget',
            widget.span === 2 && 'ui-plugin-dashboard__widget--span-2',
            widget.span === 3 && 'ui-plugin-dashboard__widget--span-3',
          )}
          style={widget.height ? { minBlockSize: typeof widget.height === 'number' ? `${widget.height}px` : widget.height } : undefined}
        >
          <h4 className="ui-plugin-dashboard__widget-title">{widget.title}</h4>
          {renderWidgetContent(widget, data, timeSeries)}
        </div>
      ))}
    </div>
  )
}

function PluginDashboardInner({
  config,
  data,
  timeSeries,
  loading = false,
  error,
  onRefresh,
  autoRefresh,
  motion: motionProp,
  className,
  ...rest
}: PluginDashboardProps) {
  useStyles('plugin-dashboard', pluginDashboardStyles)
  const motionLevel = useMotionLevel(motionProp)

  // Build metrics
  const metrics: DashboardMetric[] = useMemo(() => {
    return config.metrics.map(def => {
      const raw = data[def.key]
      const formatted = formatMetricValue(raw, def.format, def.unit)
      const status = deriveStatus(raw, def.thresholds)
      const tsData = timeSeries?.[def.key]
      const sparkline = def.sparkline && tsData ? tsData.map(p => p.value) : undefined

      return {
        id: def.key,
        title: def.label,
        value: formatted,
        status,
        sparkline,
      }
    })
  }, [config.metrics, data, timeSeries])

  // Derive overall status from statusKey
  const overallStatus = useMemo(() => {
    if (!config.statusKey) return undefined
    const def = config.metrics.find(m => m.key === config.statusKey)
    if (!def) return undefined
    return deriveStatus(data[def.key], def.thresholds)
  }, [config.statusKey, config.metrics, data])

  // Build sections from charts + widgets
  const sections: DashboardSection[] = useMemo(() => {
    const chartSections: DashboardSection[] = config.charts.map(chart => ({
      id: chart.id,
      title: chart.title,
      content: (
        <div
          className="ui-plugin-dashboard__chart-placeholder"
          style={{ minBlockSize: chart.height ?? 120 }}
        >
          {chart.series.map(s => s.label).join(', ')} chart
        </div>
      ),
    }))

    // If widgets exist, add them as a section
    if (config.widgets && config.widgets.length > 0) {
      chartSections.push({
        id: '__widgets__',
        title: 'Widgets',
        span: 3,
        content: renderWidgetGrid(config.widgets, data, config.layout, timeSeries),
      })
    }

    return chartSections
  }, [config.charts, config.widgets, config.layout, data, timeSeries])

  // Build sidebar from properties
  const sidebar = useMemo(() => {
    if (config.properties.length === 0) return undefined
    return (
      <div className="ui-plugin-dashboard__properties" role="list" aria-label="Properties">
        {config.properties.map(prop => (
          <div key={prop.key} className="ui-plugin-dashboard__prop" role="listitem">
            <span className="ui-plugin-dashboard__prop-label">{prop.label}</span>
            <span className="ui-plugin-dashboard__prop-value">
              {formatPropertyValue(data[prop.key], prop.format)}
              {prop.copyable && data[prop.key] != null && (
                <CopyButton value={String(data[prop.key])} />
              )}
            </span>
          </div>
        ))}
      </div>
    )
  }, [config.properties, data])

  // Error state
  if (error) {
    return (
      <div
        className={cn('ui-plugin-dashboard', className)}
        data-motion={motionLevel}
        {...rest}
      >
        <DashboardTemplate title={config.name} status="unknown">
          <div className="ui-plugin-dashboard__error" role="alert">{error}</div>
        </DashboardTemplate>
      </div>
    )
  }

  return (
    <div
      className={cn('ui-plugin-dashboard', className)}
      data-motion={motionLevel}
      {...rest}
    >
      {loading && (
        <div className="ui-plugin-dashboard__loading-overlay" role="status" aria-label="Loading">
          <div className="ui-plugin-dashboard__loading-spinner" />
        </div>
      )}
      <DashboardTemplate
        title={config.name}
        status={overallStatus}
        metrics={metrics}
        sections={sections}
        sidebar={sidebar}
        onRefresh={onRefresh}
        autoRefresh={autoRefresh}
        motion={motionProp}
      />
    </div>
  )
}

export function PluginDashboard(props: PluginDashboardProps) {
  return (
    <ComponentErrorBoundary>
      <PluginDashboardInner {...props} />
    </ComponentErrorBoundary>
  )
}

PluginDashboard.displayName = 'PluginDashboard'

// ─── Built-in Configs ───────────────────────────────────────────────────────

export const POSTGRES_DASHBOARD: PluginDashboardConfig = {
  name: 'PostgreSQL',
  metrics: [
    { key: 'connections', label: 'Active Connections', format: 'number', thresholds: { warning: 80, critical: 95 } },
    { key: 'qps', label: 'Queries/sec', format: 'rate' },
    { key: 'cache_hit_ratio', label: 'Cache Hit Ratio', format: 'percent', thresholds: { warning: 90, critical: 80 } },
    { key: 'replication_lag', label: 'Replication Lag', format: 'duration', thresholds: { warning: 1000, critical: 5000 } },
  ],
  charts: [
    { id: 'qps', title: 'Queries Per Second', series: [{ key: 'qps', label: 'QPS' }] },
    { id: 'connections', title: 'Connections', series: [{ key: 'connections', label: 'Active' }, { key: 'max_connections', label: 'Max', color: 'oklch(62% 0.22 25)' }] },
  ],
  properties: [
    { key: 'version', label: 'Version', format: 'text' },
    { key: 'host', label: 'Host', format: 'code', copyable: true },
    { key: 'port', label: 'Port', format: 'text' },
    { key: 'database', label: 'Database', format: 'text' },
    { key: 'uptime', label: 'Uptime', format: 'duration' },
  ],
  statusKey: 'connections',
  widgets: [
    { id: 'w-conn', type: 'metric', title: 'Active Connections', metricKey: 'connections', metricFormat: 'number', metricThresholds: { warning: 80, critical: 95 }, metricTrend: true },
    { id: 'w-qps', type: 'metric', title: 'Queries/sec', metricKey: 'qps', metricFormat: 'rate', metricSparkline: true },
    { id: 'w-cache', type: 'metric', title: 'Cache Hit Ratio', metricKey: 'cache_hit_ratio', metricFormat: 'percent', metricThresholds: { warning: 90, critical: 80 } },
    { id: 'w-lag', type: 'metric', title: 'Replication Lag', metricKey: 'replication_lag', metricFormat: 'duration', metricThresholds: { warning: 1000, critical: 5000 } },
    { id: 'w-qps-chart', type: 'chart', title: 'QPS Over Time', span: 2, chartSeries: [{ key: 'qps', label: 'QPS' }], chartType: 'area', chartHeight: 140 },
    { id: 'w-pool-gauge', type: 'gauge', title: 'Connection Pool', gaugeKey: 'connections', gaugeMax: 100, gaugeThresholds: { warning: 80, critical: 95 } },
    { id: 'w-queries', type: 'table', title: 'Active Queries', span: 2, tableDataKey: 'active_queries', tableColumns: [{ key: 'pid', label: 'PID' }, { key: 'query', label: 'Query' }, { key: 'duration', label: 'Duration', format: 'duration' }, { key: 'state', label: 'State' }] },
    { id: 'w-repl-status', type: 'status', title: 'Replication', statusKey: 'replication_status', statusLabels: { streaming: 'Streaming', stopped: 'Stopped', catchup: 'Catching Up' } },
    { id: 'w-slow', type: 'list', title: 'Recent Slow Queries', span: 3, listKey: 'slow_queries_list', listItemFormat: 'text' },
  ],
  layout: 'auto',
}

export const MYSQL_DASHBOARD: PluginDashboardConfig = {
  name: 'MySQL',
  metrics: [
    { key: 'threads_connected', label: 'Threads Connected', format: 'number', thresholds: { warning: 100, critical: 150 } },
    { key: 'qps', label: 'Queries/sec', format: 'rate' },
    { key: 'innodb_buffer_hit_ratio', label: 'Buffer Pool Hit Ratio', format: 'percent', thresholds: { warning: 95, critical: 90 } },
    { key: 'slow_queries', label: 'Slow Queries', format: 'number', thresholds: { warning: 10, critical: 50 } },
  ],
  charts: [
    { id: 'qps', title: 'Queries Per Second', series: [{ key: 'qps', label: 'QPS' }] },
    { id: 'threads', title: 'Thread Activity', series: [{ key: 'threads_connected', label: 'Connected' }, { key: 'threads_running', label: 'Running', color: 'oklch(72% 0.19 155)' }] },
  ],
  properties: [
    { key: 'version', label: 'Version', format: 'text' },
    { key: 'host', label: 'Host', format: 'code', copyable: true },
    { key: 'port', label: 'Port', format: 'text' },
    { key: 'database', label: 'Database', format: 'text' },
    { key: 'uptime', label: 'Uptime', format: 'duration' },
  ],
  statusKey: 'threads_connected',
  widgets: [
    { id: 'w-threads', type: 'metric', title: 'Threads Connected', metricKey: 'threads_connected', metricFormat: 'number', metricThresholds: { warning: 100, critical: 150 } },
    { id: 'w-qps', type: 'metric', title: 'Queries/sec', metricKey: 'qps', metricFormat: 'rate', metricSparkline: true },
    { id: 'w-buffer', type: 'gauge', title: 'Buffer Pool Hit Ratio', gaugeKey: 'innodb_buffer_hit_ratio', gaugeMax: 100, gaugeThresholds: { warning: 95, critical: 90 } },
    { id: 'w-slow', type: 'metric', title: 'Slow Queries', metricKey: 'slow_queries', metricFormat: 'number', metricThresholds: { warning: 10, critical: 50 } },
    { id: 'w-qps-chart', type: 'chart', title: 'QPS Over Time', span: 2, chartSeries: [{ key: 'qps', label: 'QPS' }], chartType: 'line', chartHeight: 140 },
    { id: 'w-repl', type: 'status', title: 'Replication Status', statusKey: 'replication_status' },
  ],
}

export const REDIS_DASHBOARD: PluginDashboardConfig = {
  name: 'Redis',
  metrics: [
    { key: 'connected_clients', label: 'Connected Clients', format: 'number', thresholds: { warning: 500, critical: 1000 } },
    { key: 'ops_per_sec', label: 'Ops/sec', format: 'rate' },
    { key: 'used_memory', label: 'Used Memory', format: 'bytes', thresholds: { warning: 4_294_967_296, critical: 8_589_934_592 } },
    { key: 'hit_rate', label: 'Hit Rate', format: 'percent', thresholds: { warning: 90, critical: 80 } },
  ],
  charts: [
    { id: 'ops', title: 'Operations Per Second', series: [{ key: 'ops_per_sec', label: 'Ops/s' }] },
    { id: 'memory', title: 'Memory Usage', series: [{ key: 'used_memory', label: 'Used' }, { key: 'max_memory', label: 'Max', color: 'oklch(62% 0.22 25)' }] },
  ],
  properties: [
    { key: 'version', label: 'Version', format: 'text' },
    { key: 'host', label: 'Host', format: 'code', copyable: true },
    { key: 'port', label: 'Port', format: 'text' },
    { key: 'role', label: 'Role', format: 'badge' },
    { key: 'uptime', label: 'Uptime', format: 'duration' },
  ],
  statusKey: 'connected_clients',
  widgets: [
    { id: 'w-clients', type: 'metric', title: 'Connected Clients', metricKey: 'connected_clients', metricFormat: 'number', metricThresholds: { warning: 500, critical: 1000 } },
    { id: 'w-ops', type: 'metric', title: 'Ops/sec', metricKey: 'ops_per_sec', metricFormat: 'rate', metricSparkline: true },
    { id: 'w-mem', type: 'metric', title: 'Used Memory', metricKey: 'used_memory', metricFormat: 'bytes' },
    { id: 'w-hit', type: 'gauge', title: 'Hit Rate', gaugeKey: 'hit_rate', gaugeMax: 100, gaugeThresholds: { warning: 90, critical: 80 } },
    { id: 'w-mem-chart', type: 'chart', title: 'Memory Over Time', span: 2, chartSeries: [{ key: 'used_memory', label: 'Used' }, { key: 'max_memory', label: 'Max', color: 'oklch(62% 0.22 25)' }], chartType: 'area' },
    { id: 'w-keys', type: 'list', title: 'Hot Keys', listKey: 'hot_keys', listItemFormat: 'badge' },
  ],
}

export const KAFKA_DASHBOARD: PluginDashboardConfig = {
  name: 'Kafka',
  metrics: [
    { key: 'messages_per_sec', label: 'Messages/sec', format: 'rate' },
    { key: 'consumer_lag', label: 'Consumer Lag', format: 'number', thresholds: { warning: 10_000, critical: 100_000 } },
    { key: 'partitions', label: 'Partitions', format: 'number' },
    { key: 'under_replicated', label: 'Under-replicated', format: 'number', thresholds: { warning: 1, critical: 5 } },
  ],
  charts: [
    { id: 'throughput', title: 'Message Throughput', series: [{ key: 'messages_in', label: 'In' }, { key: 'messages_out', label: 'Out', color: 'oklch(72% 0.19 155)' }] },
    { id: 'lag', title: 'Consumer Lag', series: [{ key: 'consumer_lag', label: 'Lag' }] },
  ],
  properties: [
    { key: 'version', label: 'Version', format: 'text' },
    { key: 'broker_count', label: 'Brokers', format: 'text' },
    { key: 'cluster_id', label: 'Cluster ID', format: 'code', copyable: true },
    { key: 'topics', label: 'Topics', format: 'text' },
    { key: 'uptime', label: 'Uptime', format: 'duration' },
  ],
  statusKey: 'under_replicated',
  widgets: [
    { id: 'w-msgs', type: 'metric', title: 'Messages/sec', metricKey: 'messages_per_sec', metricFormat: 'rate', metricSparkline: true },
    { id: 'w-lag', type: 'metric', title: 'Consumer Lag', metricKey: 'consumer_lag', metricFormat: 'number', metricThresholds: { warning: 10_000, critical: 100_000 } },
    { id: 'w-parts', type: 'metric', title: 'Partitions', metricKey: 'partitions', metricFormat: 'number' },
    { id: 'w-underrepl', type: 'metric', title: 'Under-replicated', metricKey: 'under_replicated', metricFormat: 'number', metricThresholds: { warning: 1, critical: 5 } },
    { id: 'w-throughput', type: 'chart', title: 'Message Throughput', span: 3, chartSeries: [{ key: 'messages_in', label: 'In' }, { key: 'messages_out', label: 'Out', color: 'oklch(72% 0.19 155)' }], chartType: 'area', chartHeight: 160 },
    { id: 'w-groups', type: 'table', title: 'Consumer Groups', span: 2, tableDataKey: 'consumer_groups', tableColumns: [{ key: 'group', label: 'Group' }, { key: 'members', label: 'Members' }, { key: 'lag', label: 'Lag', format: 'number' }] },
    { id: 'w-broker-status', type: 'status', title: 'Cluster Health', statusKey: 'cluster_health' },
  ],
}

export const KUBERNETES_DASHBOARD: PluginDashboardConfig = {
  name: 'Kubernetes',
  metrics: [
    { key: 'pod_count', label: 'Running Pods', format: 'number' },
    { key: 'cpu_usage', label: 'CPU Usage', format: 'percent', thresholds: { warning: 75, critical: 90 } },
    { key: 'memory_usage', label: 'Memory Usage', format: 'percent', thresholds: { warning: 80, critical: 95 } },
    { key: 'restart_count', label: 'Pod Restarts (1h)', format: 'number', thresholds: { warning: 5, critical: 20 } },
  ],
  charts: [
    { id: 'cpu', title: 'CPU Utilization', series: [{ key: 'cpu_usage', label: 'Usage' }, { key: 'cpu_request', label: 'Request', color: 'oklch(80% 0.18 85)' }] },
    { id: 'memory', title: 'Memory Utilization', series: [{ key: 'memory_usage', label: 'Usage' }, { key: 'memory_limit', label: 'Limit', color: 'oklch(62% 0.22 25)' }] },
  ],
  properties: [
    { key: 'cluster', label: 'Cluster', format: 'text' },
    { key: 'namespace', label: 'Namespace', format: 'badge' },
    { key: 'node_count', label: 'Nodes', format: 'text' },
    { key: 'k8s_version', label: 'Version', format: 'text' },
    { key: 'context', label: 'Context', format: 'code', copyable: true },
  ],
  statusKey: 'cpu_usage',
  widgets: [
    { id: 'w-pods', type: 'metric', title: 'Running Pods', metricKey: 'pod_count', metricFormat: 'number', metricTrend: true },
    { id: 'w-cpu', type: 'gauge', title: 'CPU Usage', gaugeKey: 'cpu_usage', gaugeMax: 100, gaugeThresholds: { warning: 75, critical: 90 } },
    { id: 'w-mem', type: 'gauge', title: 'Memory Usage', gaugeKey: 'memory_usage', gaugeMax: 100, gaugeThresholds: { warning: 80, critical: 95 } },
    { id: 'w-restarts', type: 'metric', title: 'Pod Restarts (1h)', metricKey: 'restart_count', metricFormat: 'number', metricThresholds: { warning: 5, critical: 20 } },
    { id: 'w-events', type: 'list', title: 'Recent Events', span: 2, listKey: 'recent_events', listItemFormat: 'text' },
    { id: 'w-ns-status', type: 'status', title: 'Namespace Status', statusKey: 'namespace_status' },
  ],
}

export const DOCKER_DASHBOARD: PluginDashboardConfig = {
  name: 'Docker',
  metrics: [
    { key: 'running_containers', label: 'Running Containers', format: 'number' },
    { key: 'cpu_usage', label: 'CPU Usage', format: 'percent', thresholds: { warning: 70, critical: 90 } },
    { key: 'memory_usage', label: 'Memory Usage', format: 'bytes', thresholds: { warning: 4_294_967_296, critical: 8_589_934_592 } },
    { key: 'disk_usage', label: 'Disk Usage', format: 'bytes' },
  ],
  charts: [
    { id: 'cpu', title: 'CPU Usage', series: [{ key: 'cpu_usage', label: 'CPU %' }] },
    { id: 'memory', title: 'Memory Usage', series: [{ key: 'memory_usage', label: 'Used' }] },
  ],
  properties: [
    { key: 'version', label: 'Docker Version', format: 'text' },
    { key: 'host', label: 'Host', format: 'code', copyable: true },
    { key: 'images', label: 'Images', format: 'text' },
    { key: 'volumes', label: 'Volumes', format: 'text' },
    { key: 'networks', label: 'Networks', format: 'text' },
  ],
  statusKey: 'cpu_usage',
  widgets: [
    { id: 'w-containers', type: 'metric', title: 'Running Containers', metricKey: 'running_containers', metricFormat: 'number' },
    { id: 'w-cpu', type: 'gauge', title: 'CPU Usage', gaugeKey: 'cpu_usage', gaugeMax: 100, gaugeThresholds: { warning: 70, critical: 90 } },
    { id: 'w-mem', type: 'metric', title: 'Memory Usage', metricKey: 'memory_usage', metricFormat: 'bytes' },
    { id: 'w-disk', type: 'metric', title: 'Disk Usage', metricKey: 'disk_usage', metricFormat: 'bytes' },
    { id: 'w-container-list', type: 'table', title: 'Container List', span: 3, tableDataKey: 'containers', tableColumns: [{ key: 'name', label: 'Name' }, { key: 'image', label: 'Image' }, { key: 'status', label: 'Status' }, { key: 'cpu', label: 'CPU', format: 'percent' }] },
  ],
}

export const NGINX_DASHBOARD: PluginDashboardConfig = {
  name: 'NGINX',
  metrics: [
    { key: 'active_connections', label: 'Active Connections', format: 'number', thresholds: { warning: 5000, critical: 10_000 } },
    { key: 'requests_per_sec', label: 'Requests/sec', format: 'rate' },
    { key: 'error_rate', label: 'Error Rate', format: 'percent', thresholds: { warning: 1, critical: 5 } },
    { key: 'avg_response_time', label: 'Avg Response', format: 'duration', thresholds: { warning: 500, critical: 2000 } },
  ],
  charts: [
    { id: 'requests', title: 'Request Rate', series: [{ key: 'requests_per_sec', label: 'Req/s' }] },
    { id: 'response', title: 'Response Time', series: [{ key: 'avg_response_time', label: 'Avg' }, { key: 'p99_response_time', label: 'p99', color: 'oklch(62% 0.22 25)' }] },
  ],
  properties: [
    { key: 'version', label: 'Version', format: 'text' },
    { key: 'host', label: 'Host', format: 'code', copyable: true },
    { key: 'config_path', label: 'Config', format: 'code' },
    { key: 'worker_processes', label: 'Workers', format: 'text' },
    { key: 'uptime', label: 'Uptime', format: 'duration' },
  ],
  statusKey: 'active_connections',
  widgets: [
    { id: 'w-conns', type: 'metric', title: 'Active Connections', metricKey: 'active_connections', metricFormat: 'number', metricThresholds: { warning: 5000, critical: 10_000 }, metricTrend: true },
    { id: 'w-rps', type: 'metric', title: 'Requests/sec', metricKey: 'requests_per_sec', metricFormat: 'rate', metricSparkline: true },
    { id: 'w-err', type: 'metric', title: 'Error Rate', metricKey: 'error_rate', metricFormat: 'percent', metricThresholds: { warning: 1, critical: 5 } },
    { id: 'w-resp', type: 'metric', title: 'Avg Response', metricKey: 'avg_response_time', metricFormat: 'duration', metricThresholds: { warning: 500, critical: 2000 } },
    { id: 'w-status-codes', type: 'table', title: 'Status Code Breakdown', span: 2, tableDataKey: 'status_codes', tableColumns: [{ key: 'code', label: 'Code' }, { key: 'count', label: 'Count', format: 'number' }, { key: 'percent', label: '%', format: 'percent' }] },
    { id: 'w-health', type: 'status', title: 'Service Health', statusKey: 'health_status' },
  ],
}

export const ELASTICSEARCH_DASHBOARD: PluginDashboardConfig = {
  name: 'Elasticsearch',
  metrics: [
    { key: 'docs_count', label: 'Documents', format: 'number' },
    { key: 'search_rate', label: 'Search Rate', format: 'rate' },
    { key: 'index_rate', label: 'Index Rate', format: 'rate' },
    { key: 'store_size', label: 'Store Size', format: 'bytes' },
  ],
  charts: [
    { id: 'search', title: 'Search Rate', series: [{ key: 'search_rate', label: 'Searches/s' }] },
    { id: 'indexing', title: 'Indexing Rate', series: [{ key: 'index_rate', label: 'Docs/s' }] },
  ],
  properties: [
    { key: 'version', label: 'Version', format: 'text' },
    { key: 'cluster_name', label: 'Cluster', format: 'text' },
    { key: 'host', label: 'Host', format: 'code', copyable: true },
    { key: 'node_count', label: 'Nodes', format: 'text' },
    { key: 'status', label: 'Health', format: 'badge' },
    { key: 'uptime', label: 'Uptime', format: 'duration' },
  ],
  statusKey: 'docs_count',
  widgets: [
    { id: 'w-docs', type: 'metric', title: 'Documents', metricKey: 'docs_count', metricFormat: 'number', metricTrend: true },
    { id: 'w-search', type: 'metric', title: 'Search Rate', metricKey: 'search_rate', metricFormat: 'rate', metricSparkline: true },
    { id: 'w-index', type: 'metric', title: 'Index Rate', metricKey: 'index_rate', metricFormat: 'rate' },
    { id: 'w-store', type: 'metric', title: 'Store Size', metricKey: 'store_size', metricFormat: 'bytes' },
    { id: 'w-health', type: 'status', title: 'Cluster Health', statusKey: 'cluster_status', statusLabels: { green: 'Healthy', yellow: 'Degraded', red: 'Critical' } },
    { id: 'w-indices', type: 'table', title: 'Top Indices', span: 2, tableDataKey: 'top_indices', tableColumns: [{ key: 'name', label: 'Index' }, { key: 'docs', label: 'Docs', format: 'number' }, { key: 'size', label: 'Size', format: 'bytes' }] },
  ],
}
