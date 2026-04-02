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

export interface PluginDashboardConfig {
  name: string
  icon?: ReactNode
  metrics: PluginMetricDef[]
  charts: PluginChartDef[]
  properties: PluginPropertyDef[]
  statusKey?: string
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

  // Build sections from charts
  const sections: DashboardSection[] = useMemo(() => {
    return config.charts.map(chart => ({
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
  }, [config.charts])

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
}
