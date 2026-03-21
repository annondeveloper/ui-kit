import { useState } from 'react'
import { Preview } from '../components/Preview'
import { ComponentShowcase, type ShowcaseExample } from '../components/ComponentShowcase'
import type { PropDef } from '../components/PropsTable'
import { MetricCard } from '@ui/domain/metric-card'
import { ThresholdGauge } from '@ui/domain/threshold-gauge'
import { UtilizationBar } from '@ui/domain/utilization-bar'
import { Sparkline } from '@ui/domain/sparkline'
import { LogViewer } from '@ui/domain/log-viewer'
import { PipelineStage } from '@ui/domain/pipeline-stage'
import { UptimeTracker } from '@ui/domain/uptime-tracker'
import { HeatmapCalendar } from '@ui/domain/heatmap-calendar'
import { SeverityTimeline } from '@ui/domain/severity-timeline'
import { PortStatusGrid } from '@ui/domain/port-status-grid'
import { TimeRangeSelector } from '@ui/domain/time-range-selector'
import type { LogLine } from '@ui/domain/log-viewer'
import type { Stage } from '@ui/domain/pipeline-stage'
import type { UptimeDay } from '@ui/domain/uptime-tracker'
import type { HeatmapData } from '@ui/domain/heatmap-calendar'
import type { TimelineEvent } from '@ui/domain/severity-timeline'
import type { PortStatus } from '@ui/domain/port-status-grid'

const logLines: LogLine[] = [
  { id: 1, timestamp: Date.now() - 60000, level: 'info', message: 'Server started on port 3000' },
  { id: 2, timestamp: Date.now() - 55000, level: 'info', message: 'Connected to database cluster' },
  { id: 3, timestamp: Date.now() - 45000, level: 'debug', message: 'Cache warmed: 1,247 entries loaded' },
  { id: 4, timestamp: Date.now() - 30000, level: 'warn', message: 'Connection pool nearing limit: 45/50' },
  { id: 5, timestamp: Date.now() - 20000, level: 'error', message: 'Failed to reach upstream: timeout after 5s' },
  { id: 6, timestamp: Date.now() - 15000, level: 'info', message: 'Retry succeeded on attempt 2' },
  { id: 7, timestamp: Date.now() - 10000, level: 'info', message: 'Health check passed: all services nominal' },
  { id: 8, timestamp: Date.now() - 5000, level: 'warn', message: 'SSL certificate expires in 14 days' },
  { id: 9, timestamp: Date.now() - 2000, level: 'info', message: 'Metrics exported to Prometheus' },
  { id: 10, timestamp: Date.now(), level: 'debug', message: 'GC completed: freed 128MB in 12ms' },
]

const pipelineStages: Stage[] = [
  { id: 'build', label: 'Build', status: 'success', duration: 45 },
  { id: 'test', label: 'Test', status: 'success', duration: 120 },
  { id: 'deploy', label: 'Deploy', status: 'running', duration: 30 },
  { id: 'release', label: 'Release', status: 'pending' },
]

function generateUptimeDays(count: number): UptimeDay[] {
  const days: UptimeDay[] = []
  const statuses: UptimeDay['status'][] = ['up', 'up', 'up', 'up', 'up', 'degraded', 'up', 'up', 'up', 'down']
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    days.push({
      date: date.toISOString().slice(0, 10),
      status,
      uptime: status === 'up' ? 0.999 : status === 'degraded' ? 0.95 : 0.0,
    })
  }
  return days
}

function generateHeatmapData(): HeatmapData[] {
  const data: HeatmapData[] = []
  for (let i = 90; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toISOString().slice(0, 10),
      value: Math.floor(Math.random() * 100),
    })
  }
  return data
}

const timelineEvents: TimelineEvent[] = [
  { id: '1', timestamp: Date.now() - 3600000, severity: 'critical', title: 'Database failover triggered', description: 'Primary node unresponsive, promoted replica' },
  { id: '2', timestamp: Date.now() - 2400000, severity: 'warning', title: 'High memory usage on cache-01', description: 'Memory at 92%, approaching threshold' },
  { id: '3', timestamp: Date.now() - 1200000, severity: 'ok', title: 'Failover recovery complete', description: 'All services restored to normal operation' },
  { id: '4', timestamp: Date.now() - 600000, severity: 'info', title: 'Scheduled maintenance window', description: 'SSL cert renewal for *.api.example.com' },
]

const ports: PortStatus[] = [
  { port: 22, status: 'ok', label: 'SSH' },
  { port: 80, status: 'ok', label: 'HTTP' },
  { port: 443, status: 'ok', label: 'HTTPS' },
  { port: 3000, status: 'ok', label: 'API' },
  { port: 3306, status: 'warning', label: 'MySQL' },
  { port: 5432, status: 'ok', label: 'Postgres' },
  { port: 6379, status: 'ok', label: 'Redis' },
  { port: 8080, status: 'critical', label: 'Proxy' },
  { port: 9090, status: 'ok', label: 'Prometheus' },
  { port: 9200, status: 'unknown', label: 'Elastic' },
  { port: 27017, status: 'ok', label: 'MongoDB' },
  { port: 5672, status: 'ok', label: 'RabbitMQ' },
]

// ─── MetricCard Showcase ──────────────────────────────────────────────────────

const metricCardProps: PropDef[] = [
  { name: 'title', type: 'string', description: 'Metric label displayed above the value' },
  { name: 'value', type: 'string | number', description: 'Primary metric value to display' },
  { name: 'trend', type: "'up' | 'down' | 'flat'", description: 'Trend direction indicator arrow' },
  { name: 'status', type: "'ok' | 'warning' | 'critical'", description: 'Status color: green, amber, or red' },
  { name: 'sparkline', type: 'number[]', description: 'Array of values to render as an inline sparkline chart' },
  { name: 'icon', type: 'ReactNode', description: 'Optional icon displayed alongside the title' },
  { name: 'change', type: 'string', description: 'Percentage or delta text shown next to trend arrow' },
  { name: 'subtitle', type: 'string', description: 'Secondary text below the value' },
]

const metricCardExamples: ShowcaseExample[] = [
  {
    title: 'Basic MetricCard',
    description: 'A simple metric with title and value.',
    code: `<MetricCard title="CPU Usage" value="87.4%" />`,
    render: () => (
      <MetricCard title="CPU Usage" value="87.4%" />
    ),
  },
  {
    title: 'With Sparkline',
    description: 'Inline sparkline chart shows recent trend data.',
    code: `<MetricCard
  title="CPU Usage"
  value="87.4%"
  sparkline={[45, 52, 49, 63, 72, 68, 75, 82, 87]}
/>`,
    render: () => (
      <MetricCard title="CPU Usage" value="87.4%" sparkline={[45, 52, 49, 63, 72, 68, 75, 82, 87]} />
    ),
  },
  {
    title: 'With Trend & Status',
    description: 'Trend arrows and status colors provide at-a-glance health indication.',
    code: `<MetricCard title="CPU" value="87.4%" trend="up" status="warning" sparkline={[45, 52, 49, 63, 72, 68, 75, 82, 87]} />
<MetricCard title="Memory" value="62.1%" trend="flat" status="ok" sparkline={[58, 60, 59, 61, 62, 61, 63, 62, 62]} />
<MetricCard title="Disk" value="78.3%" trend="up" status="warning" sparkline={[70, 72, 73, 74, 75, 76, 77, 78]} />
<MetricCard title="Network" value="2.4 Gb/s" trend="up" status="ok" sparkline={[1.2, 1.5, 1.8, 2.0, 2.1, 2.3, 2.4]} />`,
    render: () => (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', width: '100%' }}>
        <MetricCard title="CPU Usage" value="87.4%" trend="up" status="warning" sparkline={[45, 52, 49, 63, 72, 68, 75, 82, 87]} />
        <MetricCard title="Memory" value="62.1%" trend="flat" status="ok" sparkline={[58, 60, 59, 61, 62, 61, 63, 62, 62]} />
        <MetricCard title="Disk" value="78.3%" trend="up" status="warning" sparkline={[70, 72, 73, 74, 75, 76, 77, 78]} />
        <MetricCard title="Network I/O" value="2.4 Gb/s" trend="up" status="ok" sparkline={[1.2, 1.5, 1.8, 2.0, 2.1, 2.3, 2.4]} />
      </div>
    ),
  },
]

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '1rem',
}

export default function MonitorPage() {
  const [uptimeDays] = useState(() => generateUptimeDays(30))
  const [heatmapData] = useState(() => generateHeatmapData())

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Monitoring</h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Real-time dashboards, gauges, logs, and infrastructure monitoring</p>
      </div>

      {/* ── MetricCard Showcase ──────────────────────────────────────── */}
      <ComponentShowcase
        name="MetricCard"
        description="A compact dashboard card for displaying key metrics with optional sparkline charts, trend indicators, and status colors. Designed for infrastructure monitoring dashboards."
        examples={metricCardExamples}
        props={metricCardProps}
        accessibility={`Status colors are paired with text labels (ok/warning/critical) so they are not color-only.\nTrend arrows include sr-only text describing the direction.\nSparkline charts have aria-hidden since they are decorative — the numeric value is the accessible content.`}
      />

      <div style={{ marginBlock: '2rem' }} />

      {/* ── Remaining components as Preview cards ─────────────────────── */}
      <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '1rem' }}>More Monitoring Components</h2>
      <div style={grid}>
        {/* ThresholdGauge */}
        <Preview label="ThresholdGauge" description="Gauge with warning/critical thresholds">
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <ThresholdGauge value={42} label="Healthy" showValue size="md" />
            <ThresholdGauge value={72} label="Warning" showValue size="md" thresholds={{ warning: 60, critical: 85 }} />
            <ThresholdGauge value={93} label="Critical" showValue size="md" thresholds={{ warning: 60, critical: 85 }} />
          </div>
        </Preview>

        {/* UtilizationBar */}
        <Preview label="UtilizationBar" description="Segmented resource utilization">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <UtilizationBar
              segments={[
                { value: 45, label: 'System', color: 'var(--status-info)' },
                { value: 25, label: 'User', color: 'var(--brand)' },
                { value: 10, label: 'Cache', color: 'var(--status-warning)' },
              ]}
              showLabels
              size="md"
            />
            <UtilizationBar
              segments={[
                { value: 78, label: 'Used', color: 'var(--status-critical)' },
              ]}
              max={100}
              thresholds={{ warning: 60, critical: 80 }}
              showLabels
              size="lg"
            />
          </div>
        </Preview>

        {/* Sparkline */}
        <Preview label="Sparkline" description="Inline trend visualization">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', width: 60 }}>CPU</span>
              <Sparkline data={[45, 52, 49, 63, 72, 68, 75, 82, 87]} color="var(--status-warning)" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', width: 60 }}>Memory</span>
              <Sparkline data={[58, 60, 59, 61, 62, 61, 63, 62, 62]} color="var(--status-ok)" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', width: 60 }}>Errors</span>
              <Sparkline data={[0.12, 0.08, 0.06, 0.05, 0.04, 0.03, 0.02]} color="var(--status-critical)" />
            </div>
          </div>
        </Preview>

        {/* LogViewer */}
        <Preview label="LogViewer" description="Real-time log output with levels" wide>
          <LogViewer
            lines={logLines}
            showTimestamp
            showLevel
            maxLines={50}
          />
        </Preview>

        {/* PipelineStage */}
        <Preview label="PipelineStage" description="Build pipeline: build > test > deploy > release" wide>
          <PipelineStage stages={pipelineStages} />
        </Preview>

        {/* UptimeTracker */}
        <Preview label="UptimeTracker" description="30-day uptime bar chart">
          <UptimeTracker days={uptimeDays} slaTarget={0.999} showSla />
        </Preview>

        {/* HeatmapCalendar */}
        <Preview label="HeatmapCalendar" description="90-day activity heatmap">
          <HeatmapCalendar data={heatmapData} showTooltip />
        </Preview>

        {/* SeverityTimeline */}
        <Preview label="SeverityTimeline" description="Incident timeline with severity levels" wide>
          <SeverityTimeline events={timelineEvents} expandable />
        </Preview>

        {/* PortStatusGrid */}
        <Preview label="PortStatusGrid" description="Service port status overview">
          <PortStatusGrid ports={ports} columns={4} size="md" />
        </Preview>

        {/* TimeRangeSelector */}
        <Preview label="TimeRangeSelector" description="Time range presets with custom option">
          <TimeRangeSelector showCustom />
        </Preview>
      </div>
    </div>
  )
}
