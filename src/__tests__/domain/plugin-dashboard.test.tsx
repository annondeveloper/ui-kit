import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
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
  formatMetricValue,
  deriveStatus,
} from '../../domain/plugin-dashboard'
import type { PluginDashboardConfig, DashboardWidget } from '../../domain/plugin-dashboard'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

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
}

const minimalConfig: PluginDashboardConfig = {
  name: 'Test Service',
  metrics: [
    { key: 'value', label: 'Value', format: 'number' },
  ],
  charts: [],
  properties: [],
}

describe('PluginDashboard', () => {
  // ─── Rendering ────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(
        <PluginDashboard config={POSTGRES_DASHBOARD} data={samplePostgresData} />
      )
      expect(container.querySelector('.ui-plugin-dashboard')).toBeInTheDocument()
    })

    it('renders config name as title', () => {
      render(<PluginDashboard config={POSTGRES_DASHBOARD} data={samplePostgresData} />)
      expect(screen.getByText('PostgreSQL')).toBeInTheDocument()
    })

    it('renders metrics from config', () => {
      render(<PluginDashboard config={POSTGRES_DASHBOARD} data={samplePostgresData} />)
      expect(screen.getAllByText('Active Connections').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Queries/sec').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Cache Hit Ratio').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Replication Lag').length).toBeGreaterThanOrEqual(1)
    })
  })

  // ─── Formatting ───────────────────────────────────────────────────

  describe('formatting', () => {
    it('formats bytes correctly', () => {
      expect(formatMetricValue(1024, 'bytes')).toBe('1.0 KB')
      expect(formatMetricValue(1_048_576, 'bytes')).toBe('1.0 MB')
      expect(formatMetricValue(1_073_741_824, 'bytes')).toBe('1.0 GB')
      expect(formatMetricValue(500, 'bytes')).toBe('500 B')
    })

    it('formats percent correctly', () => {
      expect(formatMetricValue(98.5, 'percent')).toBe('98.5%')
      expect(formatMetricValue(100, 'percent')).toBe('100%')
    })

    it('formats duration correctly', () => {
      expect(formatMetricValue(150, 'duration')).toBe('150ms')
      expect(formatMetricValue(2500, 'duration')).toBe('2.5s')
      expect(formatMetricValue(192000, 'duration')).toBe('3m 12s')
      expect(formatMetricValue(3_600_000, 'duration')).toBe('1h')
      expect(formatMetricValue(864000000, 'duration')).toBe('10d')
    })

    it('formats rate correctly', () => {
      expect(formatMetricValue(1250, 'rate')).toBe('1.3K/s')
      expect(formatMetricValue(500, 'rate')).toBe('500/s')
      expect(formatMetricValue(2_500_000, 'rate')).toBe('2.5M/s')
    })

    it('formats number with locale', () => {
      const result = formatMetricValue(42, 'number')
      expect(result).toBe('42')
    })

    it('handles null/undefined values', () => {
      expect(formatMetricValue(null, 'number')).toBe('\u2014')
      expect(formatMetricValue(undefined, 'bytes')).toBe('\u2014')
    })
  })

  // ─── Status Thresholds ────────────────────────────────────────────

  describe('status thresholds', () => {
    it('derives ok status when below warning', () => {
      expect(deriveStatus(42, { warning: 80, critical: 95 })).toBe('ok')
    })

    it('derives warning status when at/above warning but below critical', () => {
      expect(deriveStatus(80, { warning: 80, critical: 95 })).toBe('warning')
      expect(deriveStatus(85, { warning: 80, critical: 95 })).toBe('warning')
    })

    it('derives critical status when at/above critical', () => {
      expect(deriveStatus(95, { warning: 80, critical: 95 })).toBe('critical')
      expect(deriveStatus(100, { warning: 80, critical: 95 })).toBe('critical')
    })

    it('handles inverted thresholds (lower is worse)', () => {
      // cache_hit_ratio: warning 90, critical 80
      expect(deriveStatus(98, { warning: 90, critical: 80 })).toBe('ok')
      expect(deriveStatus(85, { warning: 90, critical: 80 })).toBe('warning')
      expect(deriveStatus(75, { warning: 90, critical: 80 })).toBe('critical')
    })

    it('returns undefined with no thresholds', () => {
      expect(deriveStatus(42, undefined)).toBeUndefined()
    })

    it('returns undefined with null value', () => {
      expect(deriveStatus(null, { warning: 80, critical: 95 })).toBeUndefined()
    })
  })

  // ─── Properties ───────────────────────────────────────────────────

  describe('properties', () => {
    it('renders property list in sidebar', () => {
      render(<PluginDashboard config={POSTGRES_DASHBOARD} data={samplePostgresData} />)
      expect(screen.getByText('Version')).toBeInTheDocument()
      expect(screen.getByText('16.2')).toBeInTheDocument()
      expect(screen.getByText('Host')).toBeInTheDocument()
    })

    it('renders code-formatted properties', () => {
      const { container } = render(
        <PluginDashboard config={POSTGRES_DASHBOARD} data={samplePostgresData} />
      )
      const codeEl = container.querySelector('.ui-plugin-dashboard__prop-code')
      expect(codeEl).toBeInTheDocument()
      expect(codeEl?.textContent).toBe('db-primary.internal')
    })

    it('renders duration-formatted properties', () => {
      render(<PluginDashboard config={POSTGRES_DASHBOARD} data={samplePostgresData} />)
      expect(screen.getByText('Uptime')).toBeInTheDocument()
      expect(screen.getByText('10d')).toBeInTheDocument()
    })
  })

  // ─── Loading ──────────────────────────────────────────────────────

  describe('loading state', () => {
    it('shows loading indicator when loading', () => {
      const { container } = render(
        <PluginDashboard config={minimalConfig} data={{}} loading />
      )
      const overlay = container.querySelector('.ui-plugin-dashboard__loading-overlay')
      expect(overlay).toBeInTheDocument()
    })

    it('does not show loading indicator when not loading', () => {
      const { container } = render(
        <PluginDashboard config={minimalConfig} data={{}} />
      )
      const overlay = container.querySelector('.ui-plugin-dashboard__loading-overlay')
      expect(overlay).not.toBeInTheDocument()
    })
  })

  // ─── Error State ──────────────────────────────────────────────────

  describe('error state', () => {
    it('shows error message', () => {
      render(
        <PluginDashboard config={minimalConfig} data={{}} error="Connection failed" />
      )
      expect(screen.getByText('Connection failed')).toBeInTheDocument()
    })

    it('renders error with alert role', () => {
      const { container } = render(
        <PluginDashboard config={minimalConfig} data={{}} error="Timeout" />
      )
      expect(container.querySelector('[role="alert"]')).toBeInTheDocument()
    })
  })

  // ─── Auto-refresh ─────────────────────────────────────────────────

  describe('auto-refresh', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })
    afterEach(() => {
      vi.useRealTimers()
    })

    it('calls onRefresh at the specified interval', () => {
      const onRefresh = vi.fn()
      render(
        <PluginDashboard
          config={minimalConfig}
          data={{}}
          onRefresh={onRefresh}
          autoRefresh={5000}
        />
      )

      expect(onRefresh).not.toHaveBeenCalled()
      vi.advanceTimersByTime(5000)
      expect(onRefresh).toHaveBeenCalledTimes(1)
      vi.advanceTimersByTime(5000)
      expect(onRefresh).toHaveBeenCalledTimes(2)
    })

    it('does not call onRefresh without autoRefresh', () => {
      const onRefresh = vi.fn()
      render(
        <PluginDashboard config={minimalConfig} data={{}} onRefresh={onRefresh} />
      )
      vi.advanceTimersByTime(10000)
      expect(onRefresh).not.toHaveBeenCalled()
    })
  })

  // ─── Built-in Configs ─────────────────────────────────────────────

  describe('built-in configs', () => {
    const configs: [string, PluginDashboardConfig, Record<string, unknown>][] = [
      ['POSTGRES_DASHBOARD', POSTGRES_DASHBOARD, samplePostgresData],
      ['MYSQL_DASHBOARD', MYSQL_DASHBOARD, { threads_connected: 50, qps: 800, innodb_buffer_hit_ratio: 99.2, slow_queries: 3, version: '8.0.35', host: 'mysql.internal', port: '3306', database: 'app', uptime: 432000000 }],
      ['REDIS_DASHBOARD', REDIS_DASHBOARD, { connected_clients: 120, ops_per_sec: 45000, used_memory: 2_147_483_648, hit_rate: 97, version: '7.2', host: 'redis.internal', port: '6379', role: 'master', uptime: 172800000 }],
      ['KAFKA_DASHBOARD', KAFKA_DASHBOARD, { messages_per_sec: 25000, consumer_lag: 500, partitions: 64, under_replicated: 0, version: '3.6', broker_count: '3', cluster_id: 'abc-123', topics: '42', uptime: 604800000 }],
      ['KUBERNETES_DASHBOARD', KUBERNETES_DASHBOARD, { pod_count: 42, cpu_usage: 65, memory_usage: 72, restart_count: 2, cluster: 'prod-us-east', namespace: 'default', node_count: '6', k8s_version: '1.29', context: 'prod' }],
      ['DOCKER_DASHBOARD', DOCKER_DASHBOARD, { running_containers: 12, cpu_usage: 45, memory_usage: 3_221_225_472, disk_usage: 21_474_836_480, version: '25.0', host: 'docker.local', images: '38', volumes: '15', networks: '5' }],
      ['NGINX_DASHBOARD', NGINX_DASHBOARD, { active_connections: 2500, requests_per_sec: 8500, error_rate: 0.3, avg_response_time: 45, version: '1.25', host: 'lb.internal', config_path: '/etc/nginx/nginx.conf', worker_processes: '4', uptime: 1_296_000_000 }],
      ['ELASTICSEARCH_DASHBOARD', ELASTICSEARCH_DASHBOARD, { docs_count: 5_000_000, search_rate: 1200, index_rate: 350, store_size: 10_737_418_240, version: '8.12', cluster_name: 'prod', host: 'es.internal:9200', node_count: '3', status: 'green', uptime: 864000000 }],
    ]

    it.each(configs)('%s renders without errors', (_name, config, data) => {
      const { container } = render(
        <PluginDashboard config={config} data={data} />
      )
      expect(container.querySelector('.ui-plugin-dashboard')).toBeInTheDocument()
      expect(screen.getByText(config.name)).toBeInTheDocument()
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(
        <PluginDashboard config={POSTGRES_DASHBOARD} data={samplePostgresData} />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Edge Cases ───────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles empty data', () => {
      const { container } = render(
        <PluginDashboard config={POSTGRES_DASHBOARD} data={{}} />
      )
      expect(container.querySelector('.ui-plugin-dashboard')).toBeInTheDocument()
    })

    it('handles missing keys in data gracefully', () => {
      const partialData = { connections: 42 }
      const { container } = render(
        <PluginDashboard config={POSTGRES_DASHBOARD} data={partialData} />
      )
      expect(container.querySelector('.ui-plugin-dashboard')).toBeInTheDocument()
      // Missing values show dash
      const values = container.querySelectorAll('.ui-dashboard-template__metric-value')
      const valueTexts = Array.from(values).map(el => el.textContent)
      expect(valueTexts.some(t => t === '\u2014')).toBe(true)
    })

    it('renders with minimal config', () => {
      const { container } = render(
        <PluginDashboard config={minimalConfig} data={{ value: 42 }} />
      )
      expect(container.querySelector('.ui-plugin-dashboard')).toBeInTheDocument()
    })

    it('renders with empty metrics array', () => {
      const emptyConfig: PluginDashboardConfig = {
        name: 'Empty',
        metrics: [],
        charts: [],
        properties: [],
      }
      const { container } = render(
        <PluginDashboard config={emptyConfig} data={{}} />
      )
      expect(container.querySelector('.ui-plugin-dashboard')).toBeInTheDocument()
      expect(screen.getByText('Empty')).toBeInTheDocument()
    })
  })

  // ─── Widget System ────────────────────────────────────────────────

  describe('widget system', () => {
    const widgetConfig: PluginDashboardConfig = {
      name: 'Widget Test',
      metrics: [],
      charts: [],
      properties: [],
      widgets: [
        { id: 'w1', type: 'metric', title: 'CPU Metric', metricKey: 'cpu', metricFormat: 'percent', metricThresholds: { warning: 70, critical: 90 } },
        { id: 'w2', type: 'gauge', title: 'Memory Gauge', gaugeKey: 'memory', gaugeMax: 100 },
        { id: 'w3', type: 'status', title: 'Service Status', statusKey: 'health', statusLabels: { healthy: 'Healthy', degraded: 'Degraded' } },
        { id: 'w4', type: 'table', title: 'Processes', tableDataKey: 'processes', tableColumns: [{ key: 'name', label: 'Name' }, { key: 'cpu', label: 'CPU' }] },
        { id: 'w5', type: 'list', title: 'Recent Logs', listKey: 'logs', listItemFormat: 'text' },
        { id: 'w6', type: 'chart', title: 'Throughput', chartSeries: [{ key: 'tp', label: 'Throughput' }], chartType: 'area' },
        { id: 'w7', type: 'custom', title: 'Custom Widget', render: () => <span data-testid="custom-widget">Custom content</span> },
      ],
      layout: '3-col',
    }

    const widgetData: Record<string, unknown> = {
      cpu: 65,
      memory: 72,
      health: 'healthy',
      processes: [{ name: 'nginx', cpu: 12 }, { name: 'node', cpu: 45 }],
      logs: ['Error: timeout', 'Warning: slow query', 'Info: deploy complete'],
    }

    it('renders widget grid when widgets are provided', () => {
      const { container } = render(
        <PluginDashboard config={widgetConfig} data={widgetData} />
      )
      const grid = container.querySelector('.ui-plugin-dashboard__widget-grid')
      expect(grid).toBeInTheDocument()
    })

    it('renders metric widgets with formatted values', () => {
      render(<PluginDashboard config={widgetConfig} data={widgetData} />)
      expect(screen.getByText('CPU Metric')).toBeInTheDocument()
      expect(screen.getByText('65%')).toBeInTheDocument()
    })

    it('renders gauge widgets with SVG', () => {
      const { container } = render(
        <PluginDashboard config={widgetConfig} data={widgetData} />
      )
      expect(screen.getByText('Memory Gauge')).toBeInTheDocument()
      const gauge = container.querySelector('.ui-plugin-dashboard__gauge-wrap svg')
      expect(gauge).toBeInTheDocument()
    })

    it('renders status widgets with labels', () => {
      render(<PluginDashboard config={widgetConfig} data={widgetData} />)
      expect(screen.getByText('Service Status')).toBeInTheDocument()
      expect(screen.getByText('Healthy')).toBeInTheDocument()
    })

    it('renders table widgets with data', () => {
      const { container } = render(
        <PluginDashboard config={widgetConfig} data={widgetData} />
      )
      expect(screen.getByText('Processes')).toBeInTheDocument()
      const table = container.querySelector('.ui-plugin-dashboard__widget-table')
      expect(table).toBeInTheDocument()
      expect(screen.getByText('nginx')).toBeInTheDocument()
      expect(screen.getByText('node')).toBeInTheDocument()
    })

    it('renders list widgets', () => {
      render(<PluginDashboard config={widgetConfig} data={widgetData} />)
      expect(screen.getByText('Recent Logs')).toBeInTheDocument()
      expect(screen.getByText('Error: timeout')).toBeInTheDocument()
    })

    it('renders chart widgets as placeholders', () => {
      const { container } = render(
        <PluginDashboard config={widgetConfig} data={widgetData} />
      )
      // Title + chart placeholder content both contain series label
      expect(screen.getAllByText('Throughput').length).toBeGreaterThanOrEqual(1)
      expect(container.querySelector('.ui-plugin-dashboard__chart-placeholder')).toBeInTheDocument()
    })

    it('renders custom widgets via render prop', () => {
      render(<PluginDashboard config={widgetConfig} data={widgetData} />)
      expect(screen.getByTestId('custom-widget')).toBeInTheDocument()
      expect(screen.getByText('Custom content')).toBeInTheDocument()
    })

    it('applies span classes to widgets', () => {
      const spanConfig: PluginDashboardConfig = {
        name: 'Span Test',
        metrics: [],
        charts: [],
        properties: [],
        widgets: [
          { id: 'w1', type: 'metric', title: 'Wide', metricKey: 'x', span: 2 },
          { id: 'w2', type: 'metric', title: 'Full', metricKey: 'y', span: 3 },
        ],
      }
      const { container } = render(
        <PluginDashboard config={spanConfig} data={{ x: 1, y: 2 }} />
      )
      expect(container.querySelector('.ui-plugin-dashboard__widget--span-2')).toBeInTheDocument()
      expect(container.querySelector('.ui-plugin-dashboard__widget--span-3')).toBeInTheDocument()
    })

    it('applies layout class to widget grid', () => {
      const { container } = render(
        <PluginDashboard config={widgetConfig} data={widgetData} />
      )
      expect(container.querySelector('.ui-plugin-dashboard__widget-grid--3-col')).toBeInTheDocument()
    })

    it('backward compatible - configs without widgets still work', () => {
      const oldConfig: PluginDashboardConfig = {
        name: 'Legacy',
        metrics: [{ key: 'val', label: 'Value', format: 'number' }],
        charts: [],
        properties: [],
      }
      const { container } = render(
        <PluginDashboard config={oldConfig} data={{ val: 42 }} />
      )
      expect(container.querySelector('.ui-plugin-dashboard')).toBeInTheDocument()
      expect(container.querySelector('.ui-plugin-dashboard__widget-grid')).not.toBeInTheDocument()
    })

    it('handles empty table data gracefully', () => {
      const tableConfig: PluginDashboardConfig = {
        name: 'Empty Table',
        metrics: [],
        charts: [],
        properties: [],
        widgets: [{ id: 'w1', type: 'table', title: 'Empty', tableDataKey: 'rows', tableColumns: [{ key: 'x', label: 'X' }] }],
      }
      render(<PluginDashboard config={tableConfig} data={{}} />)
      expect(screen.getByText('No data')).toBeInTheDocument()
    })

    it('handles empty list data gracefully', () => {
      const listConfig: PluginDashboardConfig = {
        name: 'Empty List',
        metrics: [],
        charts: [],
        properties: [],
        widgets: [{ id: 'w1', type: 'list', title: 'Empty', listKey: 'items' }],
      }
      render(<PluginDashboard config={listConfig} data={{}} />)
      expect(screen.getByText('No items')).toBeInTheDocument()
    })

    it('all built-in configs have widgets defined', () => {
      expect(POSTGRES_DASHBOARD.widgets).toBeDefined()
      expect(POSTGRES_DASHBOARD.widgets!.length).toBeGreaterThan(0)
      expect(MYSQL_DASHBOARD.widgets).toBeDefined()
      expect(REDIS_DASHBOARD.widgets).toBeDefined()
      expect(KAFKA_DASHBOARD.widgets).toBeDefined()
      expect(KUBERNETES_DASHBOARD.widgets).toBeDefined()
      expect(DOCKER_DASHBOARD.widgets).toBeDefined()
      expect(NGINX_DASHBOARD.widgets).toBeDefined()
      expect(ELASTICSEARCH_DASHBOARD.widgets).toBeDefined()
    })
  })
})
