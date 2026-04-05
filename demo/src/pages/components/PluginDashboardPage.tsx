'use client'

import { useState, useMemo, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import {
  PluginDashboard,
  POSTGRES_DASHBOARD,
  MYSQL_DASHBOARD,
  REDIS_DASHBOARD,
  KAFKA_DASHBOARD,
  KUBERNETES_DASHBOARD,
  DOCKER_DASHBOARD,
  NGINX_DASHBOARD,
  ELASTICSEARCH_DASHBOARD,
  type PluginDashboardConfig,
  type DashboardWidget,
} from '@ui/domain/plugin-dashboard'
import { PluginDashboard as LitePluginDashboard } from '@ui/lite/plugin-dashboard'
import { PluginDashboard as PremiumPluginDashboard } from '@ui/premium/plugin-dashboard'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Icon } from '@ui/core/icons/icon'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { ColorInput } from '@ui/components/color-input'
import { generateTheme } from '@ui/core/tokens/generator'
import { TOKEN_TO_CSS, type ThemeTokens } from '@ui/core/tokens/tokens'
import { useTheme } from '@ui/core/tokens/theme-context'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

const BRAND_COLOR_PRESETS = [
  { hex: '#6366f1', name: 'Indigo' },
  { hex: '#f97316', name: 'Orange' },
  { hex: '#f43f5e', name: 'Rose' },
  { hex: '#0ea5e9', name: 'Sky' },
  { hex: '#10b981', name: 'Emerald' },
  { hex: '#8b5cf6', name: 'Violet' },
  { hex: '#d946ef', name: 'Fuchsia' },
  { hex: '#f59e0b', name: 'Amber' },
  { hex: '#06b6d4', name: 'Cyan' },
  { hex: '#64748b', name: 'Slate' },
]

// ─── Sample Data ────────────────────────────────────────────────────────────

const samplePostgresData: Record<string, unknown> = {
  connections: 42,
  max_connections: 100,
  qps: 1250,
  cache_hit_ratio: 98.5,
  replication_lag: 150,
  version: '16.2',
  host: 'db-primary.internal',
  port: '5432',
  database: 'production',
  uptime: 864000000,
  replication_status: 'streaming',
  active_queries: [
    { pid: 1234, query: 'SELECT * FROM users WHERE id = $1', duration: 120, state: 'active' },
    { pid: 1235, query: 'UPDATE orders SET status = $1 WHERE created_at < $2', duration: 3400, state: 'active' },
    { pid: 1236, query: 'INSERT INTO analytics (event, data) VALUES ($1, $2)', duration: 45, state: 'idle' },
  ],
  slow_queries_list: [
    'SELECT * FROM orders JOIN products ON ... (2.3s)',
    'UPDATE inventory SET count = count - 1 WHERE ... (1.8s)',
    'DELETE FROM sessions WHERE expired_at < now() (1.2s)',
  ],
}

const sampleMysqlData: Record<string, unknown> = {
  threads_connected: 50,
  threads_running: 8,
  qps: 800,
  innodb_buffer_hit_ratio: 99.2,
  slow_queries: 3,
  version: '8.0.35',
  host: 'mysql-primary.internal',
  port: '3306',
  database: 'app_production',
  uptime: 432000000,
}

const sampleRedisData: Record<string, unknown> = {
  connected_clients: 120,
  ops_per_sec: 45000,
  used_memory: 2_147_483_648,
  max_memory: 8_589_934_592,
  hit_rate: 97.3,
  version: '7.2.4',
  host: 'redis-cache.internal',
  port: '6379',
  role: 'master',
  uptime: 172800000,
}

const sampleKafkaData: Record<string, unknown> = {
  messages_per_sec: 25000,
  messages_in: 25000,
  messages_out: 23000,
  consumer_lag: 500,
  partitions: 64,
  under_replicated: 0,
  version: '3.6.1',
  broker_count: '3',
  cluster_id: 'abc-def-123',
  topics: '42',
  uptime: 604800000,
}

const sampleK8sData: Record<string, unknown> = {
  pod_count: 42,
  cpu_usage: 65,
  cpu_request: 50,
  memory_usage: 72,
  memory_limit: 85,
  restart_count: 2,
  cluster: 'prod-us-east-1',
  namespace: 'default',
  node_count: '6',
  k8s_version: '1.29.3',
  context: 'prod-cluster',
}

const sampleDockerData: Record<string, unknown> = {
  running_containers: 12,
  cpu_usage: 45,
  memory_usage: 3_221_225_472,
  disk_usage: 21_474_836_480,
  version: '25.0.3',
  host: 'docker-host.local',
  images: '38',
  volumes: '15',
  networks: '5',
}

const sampleNginxData: Record<string, unknown> = {
  active_connections: 2500,
  requests_per_sec: 8500,
  p99_response_time: 120,
  error_rate: 0.3,
  avg_response_time: 45,
  version: '1.25.4',
  host: 'lb-primary.internal',
  config_path: '/etc/nginx/nginx.conf',
  worker_processes: '4',
  uptime: 1_296_000_000,
}

const sampleElasticsearchData: Record<string, unknown> = {
  docs_count: 5_000_000,
  search_rate: 1200,
  index_rate: 350,
  store_size: 10_737_418_240,
  version: '8.12.2',
  cluster_name: 'prod-search',
  host: 'es-cluster.internal:9200',
  node_count: '3',
  status: 'green',
  uptime: 864000000,
}

type ConfigChoice = 'postgresql' | 'mysql' | 'redis' | 'kafka' | 'kubernetes' | 'docker' | 'nginx' | 'elasticsearch'

const CONFIG_MAP: Record<ConfigChoice, { config: PluginDashboardConfig; data: Record<string, unknown> }> = {
  postgresql: { config: POSTGRES_DASHBOARD, data: samplePostgresData },
  mysql: { config: MYSQL_DASHBOARD, data: sampleMysqlData },
  redis: { config: REDIS_DASHBOARD, data: sampleRedisData },
  kafka: { config: KAFKA_DASHBOARD, data: sampleKafkaData },
  kubernetes: { config: KUBERNETES_DASHBOARD, data: sampleK8sData },
  docker: { config: DOCKER_DASHBOARD, data: sampleDockerData },
  nginx: { config: NGINX_DASHBOARD, data: sampleNginxData },
  elasticsearch: { config: ELASTICSEARCH_DASHBOARD, data: sampleElasticsearchData },
}

const CONFIG_CHOICES: ConfigChoice[] = ['postgresql', 'mysql', 'redis', 'kafka', 'kubernetes', 'docker', 'nginx', 'elasticsearch']

// ─── Page Styles ────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.plugin-dashboard-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: plugin-dashboard-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .plugin-dashboard-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .plugin-dashboard-page__hero::before {
        content: '';
        position: absolute;
        inset: -50%;
        background: conic-gradient(
          from 0deg at 50% 50%,
          var(--aurora-1, oklch(60% 0.15 250 / 0.06)) 0deg,
          transparent 60deg,
          var(--aurora-2, oklch(55% 0.18 300 / 0.04)) 120deg,
          transparent 180deg,
          var(--aurora-1, oklch(60% 0.15 250 / 0.06)) 240deg,
          transparent 300deg,
          var(--aurora-2, oklch(55% 0.18 300 / 0.04)) 360deg
        );
        animation: pd-page-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes pd-page-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .plugin-dashboard-page__hero::before { animation: none; }
      }

      .plugin-dashboard-page__title {
        position: relative;
        font-size: clamp(2rem, 5vw, 3rem);
        font-weight: 800;
        letter-spacing: -0.03em;
        background: linear-gradient(135deg, var(--text-primary) 0%, var(--brand, oklch(65% 0.2 270)) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin: 0 0 0.5rem;
        line-height: 1.1;
      }

      .plugin-dashboard-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .plugin-dashboard-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .plugin-dashboard-page__import-code {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-sm, 0.875rem);
        background: oklch(0% 0 0 / 0.2);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 0.5rem 0.875rem;
        color: var(--text-primary);
        flex: 1;
        min-inline-size: 0;
        overflow-x: auto;
        white-space: nowrap;
        backdrop-filter: blur(8px);
      }

      .plugin-dashboard-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ─────────────────────────────────── */

      .plugin-dashboard-page__section {
        background: oklch(from var(--bg-elevated) calc(l + 0.02) c h);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        padding: 2rem;
        overflow: visible;
        position: relative;
        box-shadow: inset 0 1px 0 oklch(100% 0 0 / 0.04), 0 2px 8px oklch(0% 0 0 / 0.15);
        opacity: 0;
        transform: translateY(32px) scale(0.98);
        filter: blur(4px);
        animation: pd-page-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes pd-page-section-reveal {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .plugin-dashboard-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .plugin-dashboard-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .plugin-dashboard-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .plugin-dashboard-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .plugin-dashboard-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ──────────────────────────────── */

      .plugin-dashboard-page__preview {
        padding: 1.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
        min-block-size: 200px;
      }

      .plugin-dashboard-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ───────────────────────────────── */

      .plugin-dashboard-page__playground {
        display: grid;
        grid-template-columns: 1fr 240px;
        gap: 1.5rem;
        align-items: start;
      }

      @container plugin-dashboard-page (max-width: 680px) {
        .plugin-dashboard-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .plugin-dashboard-page__playground-controls {
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        position: sticky;
        top: 1rem;
      }

      .plugin-dashboard-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .plugin-dashboard-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .plugin-dashboard-page__control-select {
        font-size: var(--text-sm, 0.875rem);
        font-family: inherit;
        padding: 0.375rem 0.5rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: var(--bg-surface);
        color: var(--text-primary);
        cursor: pointer;
      }

      .plugin-dashboard-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .plugin-dashboard-page__option-btn {
        font-size: var(--text-xs, 0.75rem);
        padding: 0.25rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-secondary);
        cursor: pointer;
        font-family: inherit;
        font-weight: 500;
        transition: all 0.12s;
        line-height: 1.4;
      }
      .plugin-dashboard-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .plugin-dashboard-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .plugin-dashboard-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .plugin-dashboard-page__tier-card {
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        cursor: pointer;
        transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
        min-width: 0;
        overflow: hidden;
      }

      .plugin-dashboard-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .plugin-dashboard-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .plugin-dashboard-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .plugin-dashboard-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .plugin-dashboard-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .plugin-dashboard-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .plugin-dashboard-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .plugin-dashboard-page__tier-import {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 0.625rem;
        color: oklch(from var(--brand) calc(l + 0.1) c h);
        background: var(--border-subtle);
        padding: 0.375rem 0.5rem;
        border-radius: var(--radius-sm);
        overflow-wrap: break-word;
        word-break: break-all;
        text-align: start;
        line-height: 1.4;
      }

      /* ── Configs showcase ──────────────────────────── */

      .plugin-dashboard-page__configs-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
        gap: 1.5rem;
      }

      .plugin-dashboard-page__config-item {
        position: relative;
        overflow: hidden;
      }

      /* ── A11y list ──────────────────────────────────── */

      .plugin-dashboard-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .plugin-dashboard-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .plugin-dashboard-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .plugin-dashboard-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      .plugin-dashboard-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      .plugin-dashboard-page__code-tabs {
        margin-block-start: 1rem;
      }

      .plugin-dashboard-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .plugin-dashboard-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      .plugin-dashboard-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      /* ── Size breakdown ─────────────────────────── */

      .plugin-dashboard-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .plugin-dashboard-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Source link ────────────────────────────────── */

      .plugin-dashboard-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .plugin-dashboard-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Color picker ──────────────────────────────── */

      .plugin-dashboard-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .plugin-dashboard-page__color-preset {
        inline-size: 24px;
        block-size: 24px;
        border-radius: 50%;
        border: 2px solid transparent;
        cursor: pointer;
        padding: 0;
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
                    border-color 0.15s,
                    box-shadow 0.15s;
        box-shadow: 0 1px 3px oklch(0% 0 0 / 0.2);
      }
      .plugin-dashboard-page__color-preset:hover {
        transform: scale(1.2);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
      }
      .plugin-dashboard-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .plugin-dashboard-page__hero { padding: 2rem 1.25rem; }
        .plugin-dashboard-page__title { font-size: 1.75rem; }
        .plugin-dashboard-page__playground { grid-template-columns: 1fr; }
        .plugin-dashboard-page__tiers { grid-template-columns: 1fr; }
        .plugin-dashboard-page__section { padding: 1.25rem; }
        .plugin-dashboard-page__configs-grid { grid-template-columns: 1fr; }
      }
    }
  }
`

// ─── Props Data ─────────────────────────────────────────────────────────────

const pluginDashboardPropsData: PropDef[] = [
  { name: 'config', type: 'PluginDashboardConfig', required: true, description: 'Dashboard configuration defining metrics, charts, and properties.' },
  { name: 'data', type: 'Record<string, unknown>', required: true, description: 'Data object. Keys match config metric/property key fields.' },
  { name: 'timeSeries', type: 'Record<string, Array<{timestamp, value}>>', description: 'Optional time series data for sparkline rendering.' },
  { name: 'loading', type: 'boolean', default: 'false', description: 'Show loading overlay with spinner.' },
  { name: 'error', type: 'ReactNode', description: 'Error message to display instead of dashboard content.' },
  { name: 'onRefresh', type: '() => void', description: 'Callback when refresh is triggered.' },
  { name: 'autoRefresh', type: 'number', description: 'Auto-refresh interval in milliseconds.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override.' },
]

const pluginDashboardConfigProps: PropDef[] = [
  { name: 'name', type: 'string', required: true, description: 'Service name displayed as the dashboard title.' },
  { name: 'icon', type: 'ReactNode', description: 'Optional icon displayed next to the title.' },
  { name: 'metrics', type: 'PluginMetricDef[]', required: true, description: 'Array of metric definitions for the metric strip.' },
  { name: 'charts', type: 'PluginChartDef[]', required: true, description: 'Array of chart definitions for the main grid.' },
  { name: 'widgets', type: 'DashboardWidget[]', description: 'Flexible widget grid with metric, chart, gauge, table, status, list, and custom widgets.' },
  { name: 'layout', type: "'auto' | '2-col' | '3-col'", description: 'Widget grid column layout.' },
  { name: 'properties', type: 'PluginPropertyDef[]', required: true, description: 'Array of property definitions for the sidebar.' },
  { name: 'statusKey', type: 'string', description: 'Key of the metric used to derive overall dashboard status.' },
]

const pluginMetricDefProps: PropDef[] = [
  { name: 'key', type: 'string', required: true, description: 'Data key to look up the metric value.' },
  { name: 'label', type: 'string', required: true, description: 'Display label for the metric.' },
  { name: 'format', type: "'number'|'bytes'|'percent'|'duration'|'rate'", description: 'How to format the raw value.' },
  { name: 'unit', type: 'string', description: 'Optional unit suffix for number format.' },
  { name: 'thresholds', type: '{ warning: number; critical: number }', description: 'Auto-derive status from value thresholds.' },
  { name: 'sparkline', type: 'boolean', description: 'Show sparkline if timeSeries data is available for this key.' },
]

const pluginChartDefProps: PropDef[] = [
  { name: 'id', type: 'string', required: true, description: 'Unique chart identifier.' },
  { name: 'title', type: 'string', required: true, description: 'Chart section title.' },
  { name: 'series', type: 'Array<{key, label, color?}>', required: true, description: 'Data series for the chart.' },
  { name: 'height', type: 'number', description: 'Chart height in pixels.' },
  { name: 'yFormat', type: "'number'|'bytes'|'percent'|'duration'", description: 'Y-axis formatting.' },
]

const pluginPropertyDefProps: PropDef[] = [
  { name: 'key', type: 'string', required: true, description: 'Data key to look up the property value.' },
  { name: 'label', type: 'string', required: true, description: 'Display label for the property.' },
  { name: 'format', type: "'text'|'code'|'link'|'badge'|'timestamp'", description: 'How to render the property value.' },
  { name: 'copyable', type: 'boolean', description: 'Show copy button next to the value.' },
]

const dashboardWidgetProps: PropDef[] = [
  { name: 'id', type: 'string', required: true, description: 'Unique identifier for the widget.' },
  { name: 'type', type: "'metric'|'chart'|'table'|'status'|'list'|'gauge'|'custom'", required: true, description: 'Widget type determines rendering strategy.' },
  { name: 'title', type: 'string', required: true, description: 'Widget header title.' },
  { name: 'span', type: '1 | 2 | 3', description: 'Grid column span for wider widgets.' },
  { name: 'height', type: 'number | string', description: 'Minimum widget height.' },
  { name: 'metricKey', type: 'string', description: "Data key for metric value. Used with type='metric'." },
  { name: 'metricFormat', type: "'number'|'bytes'|'percent'|'duration'|'rate'", description: 'How to format the metric value.' },
  { name: 'metricUnit', type: 'string', description: 'Unit suffix for metric display.' },
  { name: 'metricThresholds', type: '{ warning: number; critical: number }', description: 'Auto-derive status colors from value thresholds.' },
  { name: 'metricSparkline', type: 'boolean', description: 'Show inline sparkline from timeSeries data.' },
  { name: 'metricTrend', type: 'boolean', description: 'Show trend arrow based on timeSeries.' },
  { name: 'chartSeries', type: 'Array<{key, label, color?}>', description: "Series definitions for type='chart'." },
  { name: 'chartType', type: "'line'|'area'|'bar'", description: 'Chart visualization type.' },
  { name: 'chartHeight', type: 'number', description: 'Chart height in pixels.' },
  { name: 'gaugeKey', type: 'string', description: "Data key for gauge value. Used with type='gauge'." },
  { name: 'gaugeMax', type: 'number', description: 'Maximum value for gauge scale.' },
  { name: 'gaugeThresholds', type: '{ warning: number; critical: number }', description: 'Color thresholds for gauge fill.' },
  { name: 'tableColumns', type: 'Array<{key, label, format?}>', description: "Column definitions for type='table'." },
  { name: 'tableDataKey', type: 'string', description: 'Data key for array of table row objects.' },
  { name: 'statusKey', type: 'string', description: "Data key for status value. Used with type='status'." },
  { name: 'statusLabels', type: 'Record<string, string>', description: 'Map raw status values to display labels.' },
  { name: 'listKey', type: 'string', description: "Data key for array of items. Used with type='list'." },
  { name: 'listItemFormat', type: "'text'|'badge'|'link'", description: 'How to render list items.' },
  { name: 'render', type: '(data) => ReactNode', description: "Custom render function for type='custom'." },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { PluginDashboard } from '@annondeveloper/ui-kit/lite'",
  standard: "import { PluginDashboard, POSTGRES_DASHBOARD } from '@annondeveloper/ui-kit'",
  premium: "import { PluginDashboard } from '@annondeveloper/ui-kit/premium'",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="plugin-dashboard-page__copy-btn"
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        })
      }}
      icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}
    >
      {copied ? 'Copied' : 'Copy'}
    </Button>
  )
}

// ─── Code Generation ───────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier,
  selectedConfig: ConfigChoice,
  motion: number,
  isLoading: boolean,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const configName = selectedConfig.toUpperCase() + '_DASHBOARD'
  const configImport = `import { ${configName} } from '@annondeveloper/ui-kit'`

  const props: string[] = [`  config={${configName}}`]
  props.push('  data={data}')
  if (isLoading) props.push('  loading')
  if (tier !== 'lite' && motion !== 3) props.push(`  motion={${motion}}`)
  props.push('  onRefresh={() => fetchData()}')
  props.push('  autoRefresh={30000}')

  return `${importStr}\n${configImport}\n\nconst data = {\n  // ... your ${CONFIG_MAP[selectedConfig].config.name} metrics data\n}\n\n<PluginDashboard\n${props.join('\n')}\n/>`
}

function generateHtmlCode(
  tier: Tier,
  selectedConfig: ConfigChoice,
): string {
  const tierLabel = tier === 'lite' ? 'lite' : tier === 'premium' ? 'premium' : 'standard'
  const cssPath = tier === 'lite'
    ? '@annondeveloper/ui-kit/lite/styles.css'
    : '@annondeveloper/ui-kit/css/components/plugin-dashboard.css'
  const configName = selectedConfig.toUpperCase() + '_DASHBOARD'

  return `<!-- PluginDashboard \u2014 @annondeveloper/ui-kit ${tierLabel} tier -->
<link rel="stylesheet" href="https://unpkg.com/${cssPath}">

<div class="ui-plugin-dashboard" data-config="${selectedConfig}">
  <div class="ui-plugin-dashboard__header">
    <h2>${CONFIG_MAP[selectedConfig].config.name} Dashboard</h2>
  </div>
  <div class="ui-plugin-dashboard__metrics">
    <!-- Metric strip rendered here -->
  </div>
  <div class="ui-plugin-dashboard__widgets">
    <!-- Widget grid rendered here -->
  </div>
</div>

<script>
  // Populate dashboard from JSON API
  fetch('/api/${selectedConfig}/metrics')
    .then(r => r.json())
    .then(data => renderDashboard('${configName}', data))
</script>`
}

function generateVueCode(
  tier: Tier,
  selectedConfig: ConfigChoice,
  motion: number,
  isLoading: boolean,
): string {
  const configName = selectedConfig.toUpperCase() + '_DASHBOARD'

  if (tier === 'lite') {
    return `<template>
  <div class="ui-plugin-dashboard" data-config="${selectedConfig}">
    <div v-for="metric in metrics" :key="metric.key" class="ui-plugin-dashboard__metric">
      {{ metric.label }}: {{ data[metric.key] }}
    </div>
  </div>
</template>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const props: string[] = [`:config="${configName}"`, ':data="data"']
  if (isLoading) props.push(':loading="true"')
  if (motion !== 3) props.push(`:motion="${motion}"`)
  props.push('@refresh="fetchData"')
  props.push(':auto-refresh="30000"')

  return `<template>
  <PluginDashboard
    ${props.join('\n    ')}
  />
</template>

<script setup>
import { PluginDashboard } from '${importPath}'
import { ${configName} } from '@annondeveloper/ui-kit'
import { ref, onMounted } from 'vue'

const data = ref({})

async function fetchData() {
  const res = await fetch('/api/${selectedConfig}/metrics')
  data.value = await res.json()
}

onMounted(fetchData)
</script>`
}

function generateAngularCode(
  tier: Tier,
  selectedConfig: ConfigChoice,
): string {
  if (tier === 'lite') {
    return `<!-- Angular \u2014 Lite tier (CSS-only) -->
<div class="ui-plugin-dashboard" data-config="${selectedConfig}">
  <div *ngFor="let metric of metrics" class="ui-plugin-dashboard__metric">
    {{ metric.label }}: {{ data[metric.key] }}
  </div>
</div>

/* In styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular \u2014 ${tier === 'premium' ? 'Premium' : 'Standard'} tier -->
<!-- Use React wrapper or CSS-only approach -->
<div
  class="ui-plugin-dashboard"
  data-config="${selectedConfig}"
>
  <div class="ui-plugin-dashboard__header">
    <h2>{{ config.name }} Dashboard</h2>
  </div>
  <div class="ui-plugin-dashboard__metrics">
    <div *ngFor="let metric of config.metrics" class="ui-plugin-dashboard__metric"
      [attr.data-status]="getMetricStatus(metric, data)">
      {{ metric.label }}: {{ formatValue(data[metric.key], metric.format) }}
    </div>
  </div>
</div>

/* Import component CSS */
@import '${importPath}/css/components/plugin-dashboard.css';`
}

function generateSvelteCode(
  tier: Tier,
  selectedConfig: ConfigChoice,
  motion: number,
  isLoading: boolean,
): string {
  const configName = selectedConfig.toUpperCase() + '_DASHBOARD'

  if (tier === 'lite') {
    return `<!-- Svelte \u2014 Lite tier (CSS-only) -->
<div class="ui-plugin-dashboard" data-config="${selectedConfig}">
  {#each config.metrics as metric (metric.key)}
    <div class="ui-plugin-dashboard__metric">
      {metric.label}: {data[metric.key]}
    </div>
  {/each}
</div>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const props: string[] = [`config={${configName}}`, '{data}']
  if (isLoading) props.push('loading')
  if (motion !== 3) props.push(`motion={${motion}}`)
  props.push('onRefresh={fetchData}')
  props.push('autoRefresh={30000}')

  return `<script>
  import { PluginDashboard } from '${importPath}';
  import { ${configName} } from '@annondeveloper/ui-kit';
  import { onMount } from 'svelte';

  let data = {};

  async function fetchData() {
    const res = await fetch('/api/${selectedConfig}/metrics');
    data = await res.json();
  }

  onMount(fetchData);
</script>

<PluginDashboard
  ${props.join('\n  ')}
/>`
}

// ─── Playground Section ─────────────────────────────────────────────────────

const WIDGET_TYPES = ['metric', 'chart', 'table', 'status', 'list', 'gauge', 'custom'] as const
type WidgetType = typeof WIDGET_TYPES[number]

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [selectedConfig, setSelectedConfig] = useState<ConfigChoice>('postgresql')
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [isLoading, setIsLoading] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')
  const [enabledWidgetTypes, setEnabledWidgetTypes] = useState<Set<WidgetType>>(new Set(WIDGET_TYPES))
  const [widgetLayout, setWidgetLayout] = useState<'auto' | '2-col' | '3-col'>('auto')

  const { config: baseConfig, data } = CONFIG_MAP[selectedConfig]

  // Filter widgets by enabled types
  const config = useMemo(() => {
    if (!baseConfig.widgets) return baseConfig
    const filtered = baseConfig.widgets.filter(w => enabledWidgetTypes.has(w.type as WidgetType))
    return { ...baseConfig, widgets: filtered.length > 0 ? filtered : undefined, layout: widgetLayout }
  }, [baseConfig, enabledWidgetTypes, widgetLayout])

  const toggleWidgetType = (type: WidgetType) => {
    setEnabledWidgetTypes(prev => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  const reactCode = useMemo(
    () => generateReactCode(tier, selectedConfig, motion, isLoading),
    [tier, selectedConfig, motion, isLoading],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(tier, selectedConfig),
    [tier, selectedConfig],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, selectedConfig, motion, isLoading),
    [tier, selectedConfig, motion, isLoading],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, selectedConfig),
    [tier, selectedConfig],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, selectedConfig, motion, isLoading),
    [tier, selectedConfig, motion, isLoading],
  )

  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const codeTabs = [
    { id: 'react', label: 'React' },
    { id: 'html', label: 'HTML+CSS' },
    { id: 'vue', label: 'Vue' },
    { id: 'angular', label: 'Angular' },
    { id: 'svelte', label: 'Svelte' },
  ]

  const activeCode = useMemo(() => {
    switch (activeCodeTab) {
      case 'react': return reactCode
      case 'html': return htmlCode
      case 'vue': return vueCode
      case 'angular': return angularCode
      case 'svelte': return svelteCode
      default: return reactCode
    }
  }, [activeCodeTab, reactCode, htmlCode, vueCode, angularCode, svelteCode])

  return (
    <section className="plugin-dashboard-page__section" id="playground">
      <h2 className="plugin-dashboard-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="plugin-dashboard-page__section-desc">
        Select a built-in config to preview a fully configured monitoring dashboard. Toggle loading state and motion level.
      </p>

      <div className="plugin-dashboard-page__playground">
        <div className="plugin-dashboard-page__playground-preview">
          <div className="plugin-dashboard-page__preview">
            {tier === 'lite' ? (
              <LitePluginDashboard config={config} data={data} loading={isLoading} />
            ) : tier === 'premium' ? (
              <PremiumPluginDashboard config={config} data={data} loading={isLoading} motion={motion} />
            ) : (
              <PluginDashboard config={config} data={data} loading={isLoading} motion={motion} />
            )}
          </div>

          <div className="plugin-dashboard-page__code-tabs">
            <div className="plugin-dashboard-page__export-row">
              <Button
                size="xs"
                variant="secondary"
                icon={<Icon name="copy" size="sm" />}
                onClick={() => {
                  navigator.clipboard?.writeText(activeCode).then(() => {
                    setCopyStatus(`Copied ${codeTabs.find(t => t.id === activeCodeTab)?.label}!`)
                    setTimeout(() => setCopyStatus(''), 2000)
                  })
                }}
              >
                Copy {codeTabs.find(t => t.id === activeCodeTab)?.label}
              </Button>
              {copyStatus && <span className="plugin-dashboard-page__export-status">{copyStatus}</span>}
            </div>
            <Tabs tabs={codeTabs} activeTab={activeCodeTab} onChange={setActiveCodeTab} size="sm" variant="pills">
              <TabPanel tabId="react">
                <CopyBlock code={reactCode} language="typescript" showLineNumbers />
              </TabPanel>
              <TabPanel tabId="html">
                <CopyBlock code={htmlCode} language="html" showLineNumbers />
              </TabPanel>
              <TabPanel tabId="vue">
                <CopyBlock code={vueCode} language="html" showLineNumbers />
              </TabPanel>
              <TabPanel tabId="angular">
                <CopyBlock code={angularCode} language="html" showLineNumbers />
              </TabPanel>
              <TabPanel tabId="svelte">
                <CopyBlock code={svelteCode} language="html" showLineNumbers />
              </TabPanel>
            </Tabs>
          </div>
        </div>

        <div className="plugin-dashboard-page__playground-controls">
          <div className="plugin-dashboard-page__control-group">
            <span className="plugin-dashboard-page__control-label">Config</span>
            <select
              className="plugin-dashboard-page__control-select"
              value={selectedConfig}
              onChange={e => setSelectedConfig(e.target.value as ConfigChoice)}
            >
              {CONFIG_CHOICES.map(c => (
                <option key={c} value={c}>{CONFIG_MAP[c].config.name}</option>
              ))}
            </select>
          </div>

          {tier !== 'lite' && (
            <div className="plugin-dashboard-page__control-group">
              <span className="plugin-dashboard-page__control-label">Motion</span>
              <div className="plugin-dashboard-page__control-options">
                {(['0', '1', '2', '3'] as const).map(v => (
                  <button
                    key={v}
                    type="button"
                    className={`plugin-dashboard-page__option-btn${String(motion) === v ? ' plugin-dashboard-page__option-btn--active' : ''}`}
                    onClick={() => setMotion(Number(v) as 0 | 1 | 2 | 3)}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="plugin-dashboard-page__control-group">
            <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <input
                type="checkbox"
                checked={isLoading}
                onChange={e => setIsLoading(e.target.checked)}
                style={{ accentColor: 'var(--brand)' }}
              />
              Loading state
            </label>
          </div>

          <div className="plugin-dashboard-page__control-group">
            <span className="plugin-dashboard-page__control-label">Widget Types</span>
            <div className="plugin-dashboard-page__control-options" style={{ flexDirection: 'column', gap: '0.25rem' }}>
              {WIDGET_TYPES.map(type => (
                <label key={type} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <input
                    type="checkbox"
                    checked={enabledWidgetTypes.has(type)}
                    onChange={() => toggleWidgetType(type)}
                    style={{ accentColor: 'var(--brand)' }}
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          <div className="plugin-dashboard-page__control-group">
            <span className="plugin-dashboard-page__control-label">Widget Layout</span>
            <div className="plugin-dashboard-page__control-options">
              {(['auto', '2-col', '3-col'] as const).map(v => (
                <button
                  key={v}
                  type="button"
                  className={`plugin-dashboard-page__option-btn${widgetLayout === v ? ' plugin-dashboard-page__option-btn--active' : ''}`}
                  onClick={() => setWidgetLayout(v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function PluginDashboardPage() {
  useStyles('plugin-dashboard-page', pageStyles)

  const { tier, setTier } = useTier()
  const [brandColor, setBrandColor] = useState('#6366f1')
  const { mode } = useTheme()

  const BRAND_ONLY_KEYS: (keyof ThemeTokens)[] = [
    'brand', 'brandLight', 'brandDark', 'brandSubtle', 'brandGlow',
    'borderGlow', 'aurora1', 'aurora2',
  ]

  const themeTokens = useMemo(() => {
    try {
      return generateTheme(brandColor, mode)
    } catch {
      return null
    }
  }, [brandColor, mode])

  const themeStyle = useMemo(() => {
    if (!themeTokens || brandColor === '#6366f1') return undefined
    const style: Record<string, string> = {}
    for (const key of BRAND_ONLY_KEYS) {
      const cssVar = TOKEN_TO_CSS[key]
      const value = themeTokens[key]
      if (cssVar && value) style[cssVar] = value
    }
    return style as React.CSSProperties
  }, [themeTokens, brandColor])

  // Scroll reveal fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.plugin-dashboard-page__section')
    if (!sections.length) return
    if (CSS.supports?.('animation-timeline', 'view()')) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            ;(entry.target as HTMLElement).style.opacity = '1'
            ;(entry.target as HTMLElement).style.transform = 'translateY(0) scale(1)'
            ;(entry.target as HTMLElement).style.filter = 'blur(0)'
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    sections.forEach(section => {
      ;(section as HTMLElement).style.opacity = '0'
      ;(section as HTMLElement).style.transform = 'translateY(32px) scale(0.98)'
      ;(section as HTMLElement).style.filter = 'blur(4px)'
      ;(section as HTMLElement).style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
      observer.observe(section)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="plugin-dashboard-page" style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="plugin-dashboard-page__hero">
        <h1 className="plugin-dashboard-page__title">PluginDashboard</h1>
        <p className="plugin-dashboard-page__desc">
          Declarative dashboard builder that takes a configuration object and renders a complete monitoring dashboard.
          Ships with 8 built-in configs for popular services including PostgreSQL, Redis, Kafka, Kubernetes, and more.
        </p>
        <div className="plugin-dashboard-page__import-row">
          <code className="plugin-dashboard-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Weight Tiers ────────────────────────────── */}
      <section className="plugin-dashboard-page__section" id="tiers">
        <h2 className="plugin-dashboard-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="plugin-dashboard-page__section-desc">
          Choose between three weight tiers. Lite renders a simple metrics grid with inline styles.
          Standard adds full DashboardTemplate layout with sidebar, charts, and auto-refresh.
          Premium adds shimmer loading, aurora glow on status, and enhanced hover effects.
        </p>

        <div className="plugin-dashboard-page__tiers">
          <div
            className={`plugin-dashboard-page__tier-card${tier === 'lite' ? ' plugin-dashboard-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="plugin-dashboard-page__tier-header">
              <span className="plugin-dashboard-page__tier-name">Lite</span>
              <span className="plugin-dashboard-page__tier-size">~1 KB</span>
            </div>
            <p className="plugin-dashboard-page__tier-desc">
              Simple metrics grid + property list. Inline styles, no charts, no sidebar, no auto-refresh.
            </p>
            <div className="plugin-dashboard-page__tier-import">
              import {'{'} PluginDashboard {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="plugin-dashboard-page__size-breakdown">
              <div className="plugin-dashboard-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.0 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.5 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>1.5 KB</strong> gzip</span>
              </div>
            </div>
            <div className="plugin-dashboard-page__tier-preview">
              <LitePluginDashboard config={POSTGRES_DASHBOARD} data={samplePostgresData} />
            </div>
          </div>

          <div
            className={`plugin-dashboard-page__tier-card${tier === 'standard' ? ' plugin-dashboard-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="plugin-dashboard-page__tier-header">
              <span className="plugin-dashboard-page__tier-name">Standard</span>
              <span className="plugin-dashboard-page__tier-size">~5 KB</span>
            </div>
            <p className="plugin-dashboard-page__tier-desc">
              Full DashboardTemplate with metric strip, chart sections, property sidebar,
              auto-refresh, loading overlay, and error handling.
            </p>
            <div className="plugin-dashboard-page__tier-import">
              import {'{'} PluginDashboard {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="plugin-dashboard-page__size-breakdown">
              <div className="plugin-dashboard-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>4.8 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>5.7 KB</strong> gzip</span>
              </div>
            </div>
            <div className="plugin-dashboard-page__tier-preview">
              <PluginDashboard config={POSTGRES_DASHBOARD} data={samplePostgresData} />
            </div>
          </div>

          <div
            className={`plugin-dashboard-page__tier-card${tier === 'premium' ? ' plugin-dashboard-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="plugin-dashboard-page__tier-header">
              <span className="plugin-dashboard-page__tier-name">Premium</span>
              <span className="plugin-dashboard-page__tier-size">~6 KB</span>
            </div>
            <p className="plugin-dashboard-page__tier-desc">
              Everything in Standard plus shimmer loading effect, aurora glow on status badges,
              enhanced property hover, and metric card glow on hover.
            </p>
            <div className="plugin-dashboard-page__tier-import">
              import {'{'} PluginDashboard {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="plugin-dashboard-page__size-breakdown">
              <div className="plugin-dashboard-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>5.6 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>1.2 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>6.8 KB</strong> gzip</span>
              </div>
            </div>
            <div className="plugin-dashboard-page__tier-preview">
              <PremiumPluginDashboard config={POSTGRES_DASHBOARD} data={samplePostgresData} />
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Props API ──────────────────────────────── */}
      <section className="plugin-dashboard-page__section" id="props">
        <h2 className="plugin-dashboard-page__section-title">
          <a href="#props">PluginDashboardProps</a>
        </h2>
        <p className="plugin-dashboard-page__section-desc">
          Top-level props for the PluginDashboard component.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={pluginDashboardPropsData} />
        </Card>
      </section>

      <section className="plugin-dashboard-page__section" id="config-props">
        <h2 className="plugin-dashboard-page__section-title">
          <a href="#config-props">PluginDashboardConfig</a>
        </h2>
        <p className="plugin-dashboard-page__section-desc">
          Configuration object defining the dashboard layout and data mapping.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={pluginDashboardConfigProps} />
        </Card>
      </section>

      <section className="plugin-dashboard-page__section" id="metric-def">
        <h2 className="plugin-dashboard-page__section-title">
          <a href="#metric-def">PluginMetricDef</a>
        </h2>
        <Card variant="default" padding="md">
          <PropsTable props={pluginMetricDefProps} />
        </Card>
      </section>

      <section className="plugin-dashboard-page__section" id="chart-def">
        <h2 className="plugin-dashboard-page__section-title">
          <a href="#chart-def">PluginChartDef</a>
        </h2>
        <Card variant="default" padding="md">
          <PropsTable props={pluginChartDefProps} />
        </Card>
      </section>

      <section className="plugin-dashboard-page__section" id="property-def">
        <h2 className="plugin-dashboard-page__section-title">
          <a href="#property-def">PluginPropertyDef</a>
        </h2>
        <Card variant="default" padding="md">
          <PropsTable props={pluginPropertyDefProps} />
        </Card>
      </section>

      <section className="plugin-dashboard-page__section" id="widget-def">
        <h2 className="plugin-dashboard-page__section-title">
          <a href="#widget-def">DashboardWidget</a>
        </h2>
        <p className="plugin-dashboard-page__section-desc">
          Flexible widget interface supporting 7 types: metric, chart, gauge, table, status, list, and custom.
          Each widget type uses a subset of the props below. Use the playground above to toggle widget types and see them in action.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={dashboardWidgetProps} />
        </Card>
      </section>

      {/* ── 5. Built-in Configs Showcase ──────────────── */}
      <section className="plugin-dashboard-page__section" id="configs">
        <h2 className="plugin-dashboard-page__section-title">
          <a href="#configs">Built-in Configs</a>
        </h2>
        <p className="plugin-dashboard-page__section-desc">
          All 8 built-in configs with sample data. Each config defines realistic metrics, charts,
          and properties for its respective service.
        </p>

        <div className="plugin-dashboard-page__configs-grid">
          {CONFIG_CHOICES.map(choice => {
            const { config, data } = CONFIG_MAP[choice]
            return (
              <div key={choice} className="plugin-dashboard-page__config-item">
                <PluginDashboard config={config} data={data} motion={0} />
              </div>
            )
          })}
        </div>
      </section>

      {/* ── 6. Brand Color ──────────────────────────── */}
      <section className="plugin-dashboard-page__section" id="brand-color">
        <h2 className="plugin-dashboard-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="plugin-dashboard-page__section-desc">
          Pick a brand color to see the page theme update in real-time. The aurora
          gradients and accent colors derive automatically from your choice.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ColorInput
            name="brand-color"
            value={brandColor}
            onChange={setBrandColor}
            size="sm"
            swatches={['#6366f1','#f97316','#f43f5e','#0ea5e9','#10b981','#8b5cf6','#d946ef','#f59e0b','#06b6d4','#64748b']}
          />
          <div className="plugin-dashboard-page__color-presets">
            {BRAND_COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`plugin-dashboard-page__color-preset${brandColor === p.hex ? ' plugin-dashboard-page__color-preset--active' : ''}`}
                style={{ background: p.hex }}
                onClick={() => setBrandColor(p.hex)}
                title={p.name}
                aria-label={`Set brand color to ${p.name}`}
              />
            ))}
          </div>
          {brandColor !== '#6366f1' && (
            <Button size="xs" variant="ghost" onClick={() => setBrandColor('#6366f1')}>
              <Icon name="refresh" size="sm" /> Reset to default
            </Button>
          )}
        </div>
      </section>

      {/* ── 7. Accessibility ──────────────────────────── */}
      <section className="plugin-dashboard-page__section" id="accessibility">
        <h2 className="plugin-dashboard-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="plugin-dashboard-page__section-desc">
          Built with semantic markup, ARIA attributes, and keyboard support.
        </p>
        <Card variant="default" padding="md">
          <ul className="plugin-dashboard-page__a11y-list">
            <li className="plugin-dashboard-page__a11y-item">
              <span className="plugin-dashboard-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Role:</strong> Uses <code className="plugin-dashboard-page__a11y-key">role="group"</code> with descriptive aria-label from the config name.
              </span>
            </li>
            <li className="plugin-dashboard-page__a11y-item">
              <span className="plugin-dashboard-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Metrics:</strong> Metric strip uses <code className="plugin-dashboard-page__a11y-key">role="list"</code> for screen reader enumeration.
              </span>
            </li>
            <li className="plugin-dashboard-page__a11y-item">
              <span className="plugin-dashboard-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Properties:</strong> Properties sidebar uses <code className="plugin-dashboard-page__a11y-key">role="list"</code> with descriptive labels.
              </span>
            </li>
            <li className="plugin-dashboard-page__a11y-item">
              <span className="plugin-dashboard-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Loading:</strong> Loading overlay has <code className="plugin-dashboard-page__a11y-key">role="status"</code> and aria-label.
              </span>
            </li>
            <li className="plugin-dashboard-page__a11y-item">
              <span className="plugin-dashboard-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Error:</strong> Error state uses <code className="plugin-dashboard-page__a11y-key">role="alert"</code> for immediate screen reader announcement.
              </span>
            </li>
            <li className="plugin-dashboard-page__a11y-item">
              <span className="plugin-dashboard-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced Motion:</strong> Respects <code className="plugin-dashboard-page__a11y-key">prefers-reduced-motion</code> and motion level props.
              </span>
            </li>
            <li className="plugin-dashboard-page__a11y-item">
              <span className="plugin-dashboard-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Forced Colors:</strong> Full <code className="plugin-dashboard-page__a11y-key">forced-colors: active</code> support for high contrast mode.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── Source ──────────────────────────────────────── */}
      <section className="plugin-dashboard-page__section" id="source">
        <h2 className="plugin-dashboard-page__section-title"><a href="#source">Source</a></h2>
        <p className="plugin-dashboard-page__section-desc">View the full component source code on GitHub.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a style={{ color: 'var(--brand)', textDecoration: 'none' }} href="https://github.com/annondeveloper/ui-kit/blob/main/src/domain/plugin-dashboard.tsx" target="_blank" rel="noopener noreferrer">
            src/domain/plugin-dashboard.tsx (Standard)
          </a>
          <a style={{ color: 'var(--brand)', textDecoration: 'none' }} href="https://github.com/annondeveloper/ui-kit/blob/main/src/lite/plugin-dashboard.tsx" target="_blank" rel="noopener noreferrer">
            src/lite/plugin-dashboard.tsx (Lite)
          </a>
          <a style={{ color: 'var(--brand)', textDecoration: 'none' }} href="https://github.com/annondeveloper/ui-kit/blob/main/src/premium/plugin-dashboard.tsx" target="_blank" rel="noopener noreferrer">
            src/premium/plugin-dashboard.tsx (Premium)
          </a>
        </div>
      </section>
    </div>
  )
}
