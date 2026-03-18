'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, useInView, useReducedMotion, AnimatePresence } from 'framer-motion'
import {
  Sun, Moon, Copy, Check, Package, Layers, Palette, TreePine,
  Server, Cpu, HardDrive, Network, Activity, Shield, Wifi, Zap,
  AlertTriangle, Bell, Clock, Database, Globe, BarChart3,
  Filter as FilterIcon, Terminal, Gauge, Eye, Box,
  Inbox, Settings, ChevronRight, ExternalLink, Github,
} from 'lucide-react'

// Import all components from the ui-kit source
import {
  Button,
  Badge,
  Checkbox,
  Select,
  ToggleSwitch,
  FormInput,
  FilterPill,
  EmptyState,
  Skeleton, SkeletonText, SkeletonCard,
  ConfirmDialog,
  AnimatedCounter,
  StatusBadge,
  StatusPulse,
  Toaster, toast,
  DataTable,
  Tabs,
  Sheet,
  Progress,
  Slider,
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  RadioGroup,
  MetricCard,
  UtilizationBar,
  Sparkline,
  ThresholdGauge,
  SeverityTimeline,
  LogViewer,
  PortStatusGrid,
  TimeRangeSelector,
  PipelineStage,
  UptimeTracker,
  fmtBytes, fmtBps, fmtCompact,
} from '../../src/index'

import type { ColumnDef } from '@tanstack/react-table'
import type { LogEntry, TimelineEvent, DayStatus, PortStatus, StageInfo } from '../../src/index'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function randInt(min: number, max: number) {
  return Math.floor(rand(min, max))
}

function generateSparkline(points = 20, base = 50, variance = 30): number[] {
  return Array.from({ length: points }, () => base + rand(-variance, variance))
}

const INSTALL_CMD = 'npm install @annondeveloper/ui-kit'

// ---------------------------------------------------------------------------
// Section wrapper with scroll-triggered animation
// ---------------------------------------------------------------------------

function Section({
  id,
  title,
  description,
  children,
  className = '',
}: {
  id: string
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  const reduced = useReducedMotion()

  return (
    <section id={id} ref={ref} className={`py-16 ${className}`}>
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="mb-8">
          <h2 className="text-heading-1 text-[hsl(var(--text-primary))] mb-2">{title}</h2>
          {description && (
            <p className="text-body text-[hsl(var(--text-secondary))] max-w-2xl">{description}</p>
          )}
        </div>
        {children}
      </motion.div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Copy button
// ---------------------------------------------------------------------------

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [text])

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-overlay))] transition-colors text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]"
      title="Copy to clipboard"
    >
      {copied ? <Check className="size-4 text-[hsl(var(--status-ok))]" /> : <Copy className="size-4" />}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------

interface ServerRow {
  name: string
  status: string
  cpu: number
  memory: number
  ip: string
  responseTime: number
  lastSeen: string
  role: string
}

function generateServers(count: number): ServerRow[] {
  const roles = ['Web Server', 'Database', 'Cache', 'Worker', 'Load Balancer', 'API Gateway']
  const statuses = ['ok', 'ok', 'ok', 'ok', 'warning', 'critical', 'maintenance', 'unknown']
  const names = [
    'prod-web', 'prod-api', 'prod-db', 'staging-web', 'staging-api', 'cache-redis',
    'worker-bg', 'worker-cron', 'lb-haproxy', 'gw-nginx', 'mon-grafana', 'log-elastic',
    'queue-rabbitmq', 'search-solr', 'cdn-edge', 'vault-hashi', 'consul-srv', 'k8s-master',
    'k8s-node', 'backup-restic',
  ]

  return Array.from({ length: count }, (_, i) => ({
    name: `${names[i % names.length]}-${String(i + 1).padStart(2, '0')}`,
    status: statuses[randInt(0, statuses.length)]!,
    cpu: rand(5, 98),
    memory: rand(20, 95),
    ip: `10.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(1, 254)}`,
    responseTime: rand(1, 500),
    lastSeen: new Date(Date.now() - randInt(0, 3600000)).toISOString(),
    role: roles[i % roles.length]!,
  }))
}

const serverColumns: ColumnDef<ServerRow, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ getValue }) => (
      <span className="font-medium text-[hsl(var(--text-primary))]">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
    filterFn: (row, _colId, filterValues) => {
      if (!Array.isArray(filterValues) || filterValues.length === 0) return true
      return filterValues.includes(row.getValue('status'))
    },
  },
  {
    accessorKey: 'cpu',
    header: 'CPU',
    cell: ({ getValue }) => <UtilizationBar value={getValue() as number} size="sm" showValue />,
  },
  {
    accessorKey: 'memory',
    header: 'Memory',
    cell: ({ getValue }) => {
      const v = getValue() as number
      return <span className="tabular-nums text-[0.8125rem]">{v.toFixed(1)}%</span>
    },
  },
  {
    accessorKey: 'ip',
    header: 'IP Address',
    cell: ({ getValue }) => (
      <code className="text-[0.75rem] text-[hsl(var(--text-secondary))] bg-[hsl(var(--bg-elevated))] px-1.5 py-0.5 rounded">
        {getValue() as string}
      </code>
    ),
  },
  {
    accessorKey: 'responseTime',
    header: 'Response',
    cell: ({ getValue }) => {
      const ms = getValue() as number
      return <span className="tabular-nums text-[0.8125rem]">{ms.toFixed(0)}ms</span>
    },
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ getValue }) => <Badge color="brand">{getValue() as string}</Badge>,
    filterFn: (row, _colId, filterValues) => {
      if (!Array.isArray(filterValues) || filterValues.length === 0) return true
      return filterValues.includes(row.getValue('role'))
    },
  },
]

function generateLogs(): LogEntry[] {
  const messages = [
    'Connection established to primary database',
    'Processed 1,247 events in batch',
    'Cache miss ratio: 2.3% — within threshold',
    'Health check passed for all endpoints',
    'SSL certificate expires in 45 days',
    'Failed to connect to replica: timeout after 30s',
    'Rate limit triggered for client 10.0.1.5',
    'Memory usage at 87% — approaching threshold',
    'Background job queue depth: 342 items',
    'Disk I/O latency spike detected: p99=45ms',
    'New deployment v2.4.1 rolled out successfully',
    'Graceful restart completed in 1.2s',
  ]
  const levels: LogEntry['level'][] = ['info', 'info', 'info', 'debug', 'warn', 'error', 'warn', 'warn', 'info', 'error', 'info', 'debug']
  const sources = ['api-server', 'worker', 'cache', 'scheduler', 'db-proxy']

  return messages.map((msg, i) => ({
    time: new Date(Date.now() - (messages.length - i) * 12000).toISOString(),
    level: levels[i]!,
    message: msg,
    source: sources[i % sources.length],
  }))
}

function generateUptimeDays(count: number): DayStatus[] {
  return Array.from({ length: count }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (count - 1 - i))
    const r = Math.random()
    let status: DayStatus['status'] = 'ok'
    let uptime = 99.9 + rand(0, 0.1)
    if (r > 0.92) { status = 'outage'; uptime = rand(90, 98) }
    else if (r > 0.85) { status = 'degraded'; uptime = rand(98, 99.9) }
    return {
      date: date.toISOString().split('T')[0]!,
      status,
      uptime,
    }
  })
}

function generateTimelineEvents(): TimelineEvent[] {
  const events: TimelineEvent[] = [
    { time: new Date(Date.now() - 300000).toISOString(), label: 'Deploy v2.4', severity: 'info' },
    { time: new Date(Date.now() - 900000).toISOString(), label: 'CPU spike', severity: 'warning' },
    { time: new Date(Date.now() - 1800000).toISOString(), label: 'DB failover', severity: 'critical' },
    { time: new Date(Date.now() - 3600000).toISOString(), label: 'Scale up', severity: 'info' },
    { time: new Date(Date.now() - 5400000).toISOString(), label: 'Cert renewed', severity: 'ok' },
    { time: new Date(Date.now() - 7200000).toISOString(), label: 'Disk alert', severity: 'warning' },
    { time: new Date(Date.now() - 9000000).toISOString(), label: 'All clear', severity: 'ok' },
    { time: new Date(Date.now() - 10800000).toISOString(), label: 'OOM kill', severity: 'critical' },
  ]
  return events
}

function generatePorts(count: number): PortStatus[] {
  const statuses: PortStatus['status'][] = ['up', 'up', 'up', 'up', 'down', 'disabled', 'error']
  const speeds = ['10G', '1G', '25G', '40G']
  return Array.from({ length: count }, (_, i) => ({
    id: `port-${i}`,
    label: `Gi1/0/${i + 1}`,
    status: statuses[randInt(0, statuses.length)]!,
    speed: speeds[randInt(0, speeds.length)],
    utilization: rand(0, 100),
  }))
}

function generatePipelineStages(): StageInfo[] {
  return [
    { name: 'Collector', status: 'active', icon: Wifi, metric: { label: 'msg/s', value: '2.4K' } },
    { name: 'Normalizer', status: 'active', icon: Layers, metric: { label: 'msg/s', value: '2.3K' } },
    { name: 'Correlator', status: 'active', icon: Network, metric: { label: 'entities', value: '689' } },
    { name: 'Alert Eval', status: 'idle', icon: Bell, metric: { label: 'rules', value: '12' } },
    { name: 'Writer', status: 'active', icon: Database, metric: { label: 'rows/s', value: '1.8K' } },
  ]
}

// ---------------------------------------------------------------------------
// Nav items for the sidebar
// ---------------------------------------------------------------------------

const NAV_ITEMS = [
  { id: 'buttons', label: 'Buttons & Actions', icon: Zap },
  { id: 'data-display', label: 'Data Display', icon: BarChart3 },
  { id: 'status', label: 'Status & Monitoring', icon: Activity },
  { id: 'pipeline', label: 'Pipeline', icon: Layers },
  { id: 'data-table', label: 'Data Table', icon: Database },
  { id: 'forms', label: 'Forms', icon: Settings },
  { id: 'layout', label: 'Layout', icon: Box },
  { id: 'logs', label: 'Log Viewer', icon: Terminal },
]

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function DemoPage() {
  const [isDark, setIsDark] = useState(true)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [servers] = useState(() => generateServers(20))
  const [logs] = useState(() => generateLogs())

  // Live metric simulation
  const [liveMetrics, setLiveMetrics] = useState({
    requests: 48291,
    latency: 23.4,
    errorRate: 0.12,
    throughput: 1_240_000_000,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics(prev => ({
        requests: prev.requests + randInt(10, 80),
        latency: Math.max(5, prev.latency + rand(-3, 3)),
        errorRate: Math.max(0, Math.min(5, prev.errorRate + rand(-0.05, 0.05))),
        throughput: Math.max(100_000_000, prev.throughput + rand(-50_000_000, 50_000_000)),
      }))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  // Theme toggle
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
    }
  }, [isDark])

  // Form state
  const [formName, setFormName] = useState('')
  const [formSelect, setFormSelect] = useState('option1')
  const [formCheck, setFormCheck] = useState(false)
  const [formToggle, setFormToggle] = useState(true)
  const [formSlider, setFormSlider] = useState(65)
  const [formRadio, setFormRadio] = useState('email')
  const [activeFilters, setActiveFilters] = useState<string[]>(['all'])
  const [activeTab, setActiveTab] = useState('overview')
  const [timeRange, setTimeRange] = useState('24h')

  const toggleFilter = (f: string) => {
    if (f === 'all') {
      setActiveFilters(['all'])
    } else {
      setActiveFilters(prev => {
        const next = prev.filter(x => x !== 'all')
        if (next.includes(f)) {
          const filtered = next.filter(x => x !== f)
          return filtered.length === 0 ? ['all'] : filtered
        }
        return [...next, f]
      })
    }
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-base))]">
      <Toaster theme={isDark ? 'dark' : 'light'} />

      {/* Theme toggle - fixed top right */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2.5 rounded-xl bg-[hsl(var(--bg-elevated))] border border-[hsl(var(--border-subtle))] shadow-lg
            hover:bg-[hsl(var(--bg-overlay))] transition-all text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        <div className="hero-gradient absolute inset-0" />
        <div className="relative max-w-5xl mx-auto px-6 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(var(--brand-primary))]/10 text-[hsl(var(--brand-primary))] text-sm font-medium mb-6">
              <Package className="size-4" />
              v0.1.0
            </div>

            <h1 className="text-display text-[hsl(var(--text-primary))] mb-4">
              @annondeveloper/ui-kit
            </h1>
            <p className="text-lg text-[hsl(var(--text-secondary))] max-w-2xl mx-auto mb-8">
              The UI kit for monitoring dashboards and professional tools.
              Dark/light theming, real-time metrics, accessibility built in.
            </p>

            {/* Install command */}
            <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[hsl(var(--bg-surface))] border border-[hsl(var(--border-subtle))] shadow-sm mb-8">
              <code className="text-sm text-[hsl(var(--text-primary))] font-mono">{INSTALL_CMD}</code>
              <CopyButton text={INSTALL_CMD} />
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[hsl(var(--text-secondary))]">
              <div className="flex items-center gap-2">
                <Layers className="size-4 text-[hsl(var(--brand-primary))]" />
                <span className="font-medium">37 Components</span>
              </div>
              <div className="flex items-center gap-2">
                <Palette className="size-4 text-[hsl(var(--brand-secondary))]" />
                <span className="font-medium">Dark/Light</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="size-4 text-[hsl(var(--status-ok))]" />
                <span className="font-medium">Accessible</span>
              </div>
              <div className="flex items-center gap-2">
                <TreePine className="size-4 text-[hsl(var(--status-warning))]" />
                <span className="font-medium">Tree-shakeable</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Navigation ───────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-[hsl(var(--bg-base))]/80 backdrop-blur-xl border-b border-[hsl(var(--border-subtle))]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-thin">
            {NAV_ITEMS.map(item => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap
                  text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-elevated))] transition-colors"
              >
                <item.icon className="size-3.5" />
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6">

        {/* ── Buttons & Actions ───────────────────────────────────────── */}
        <Section
          id="buttons"
          title="Buttons & Actions"
          description="Five button variants with loading states, plus confirmation dialogs."
        >
          <div className="space-y-8">
            {/* Button variants */}
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Button Variants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="danger">Danger</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon"><Zap className="size-4" /></Button>
                  <Button loading>Loading</Button>
                  <Button disabled>Disabled</Button>
                </div>
              </CardContent>
            </Card>

            {/* Badge variants */}
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge color="brand">Brand</Badge>
                  <Badge color="blue">Blue</Badge>
                  <Badge color="green" icon={Check}>Success</Badge>
                  <Badge color="yellow" icon={AlertTriangle}>Warning</Badge>
                  <Badge color="red">Critical</Badge>
                  <Badge color="orange">Orange</Badge>
                  <Badge color="purple">Purple</Badge>
                  <Badge color="pink">Pink</Badge>
                  <Badge color="teal">Teal</Badge>
                  <Badge color="gray">Gray</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <Badge size="xs" color="brand">XS</Badge>
                  <Badge size="sm" color="brand">SM</Badge>
                  <Badge size="md" color="brand">MD</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Confirm dialog + toast */}
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Confirm Dialog & Toast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button variant="danger" onClick={() => setConfirmOpen(true)}>
                    Delete Server
                  </Button>
                  <Button variant="secondary" onClick={() => toast.success('Deployment started successfully!')}>
                    Trigger Success Toast
                  </Button>
                  <Button variant="outline" onClick={() => toast.error('Connection refused: timeout after 30s')}>
                    Trigger Error Toast
                  </Button>
                  <Button variant="ghost" onClick={() => toast.warning('SSL certificate expires in 7 days')}>
                    Warning Toast
                  </Button>
                </div>
              </CardContent>
            </Card>

            <ConfirmDialog
              open={confirmOpen}
              onOpenChange={setConfirmOpen}
              title="Delete Server"
              description="This will permanently delete prod-web-01 and all associated data. This action cannot be undone."
              confirmLabel="Delete"
              variant="danger"
              onConfirm={() => {
                setConfirmOpen(false)
                toast.success('Server deleted successfully')
              }}
            />
          </div>
        </Section>

        {/* ── Data Display ────────────────────────────────────────────── */}
        <Section
          id="data-display"
          title="Data Display"
          description="Real-time metrics, sparklines, gauges, and progress indicators. Values update live."
        >
          <div className="space-y-8">
            {/* Metric Cards - live updating */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                label="Total Requests"
                value={liveMetrics.requests}
                format={fmtCompact}
                previousValue={liveMetrics.requests - 127}
                trendDirection="up-good"
                icon={Globe}
                status="ok"
                sparklineData={generateSparkline(20, liveMetrics.requests, 500)}
              />
              <MetricCard
                label="Avg Latency"
                value={liveMetrics.latency}
                format={(n) => `${n.toFixed(1)}ms`}
                previousValue={liveMetrics.latency + 2}
                trendDirection="up-bad"
                icon={Clock}
                status={liveMetrics.latency > 50 ? 'critical' : liveMetrics.latency > 30 ? 'warning' : 'ok'}
                sparklineData={generateSparkline(20, liveMetrics.latency, 8)}
              />
              <MetricCard
                label="Error Rate"
                value={liveMetrics.errorRate}
                format={(n) => `${n.toFixed(2)}%`}
                previousValue={liveMetrics.errorRate + 0.05}
                trendDirection="up-bad"
                icon={AlertTriangle}
                status={liveMetrics.errorRate > 2 ? 'critical' : liveMetrics.errorRate > 0.5 ? 'warning' : 'ok'}
              />
              <MetricCard
                label="Throughput"
                value={liveMetrics.throughput}
                format={fmtBps}
                previousValue={liveMetrics.throughput - 50_000_000}
                trendDirection="up-good"
                icon={Activity}
              />
            </div>

            {/* Time range selector */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-[hsl(var(--text-secondary))]">Time Range:</span>
              <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
            </div>

            {/* Sparklines */}
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Sparklines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[hsl(var(--text-secondary))]">CPU</span>
                    <Sparkline data={generateSparkline(30, 60, 25)} width={120} height={32} showDots />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[hsl(var(--text-secondary))]">Memory</span>
                    <Sparkline data={generateSparkline(30, 75, 10)} width={120} height={32} color="hsl(var(--status-warning))" fillOpacity={0.2} />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[hsl(var(--text-secondary))]">Disk I/O</span>
                    <Sparkline data={generateSparkline(30, 30, 20)} width={120} height={32} color="hsl(var(--status-ok))" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Threshold Gauges */}
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Threshold Gauges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-end justify-around gap-6">
                  <ThresholdGauge value={25} label="Storage" size={130} />
                  <ThresholdGauge value={72} label="CPU Load" size={130} />
                  <ThresholdGauge value={95} label="Memory" size={130} />
                  <ThresholdGauge value={45} label="Network" size={130} format={(n) => `${n}%`} />
                </div>
              </CardContent>
            </Card>

            {/* Utilization Bars */}
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Utilization Bars</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-w-md">
                  <UtilizationBar value={25} label="CPU" showValue />
                  <UtilizationBar value={62} label="Memory" showValue />
                  <UtilizationBar value={78} label="Disk" showValue />
                  <UtilizationBar value={93} label="Network" showValue />
                  <UtilizationBar value={45} label="GPU" showValue size="lg" />
                  <UtilizationBar value={12} label="Swap" showValue size="sm" />
                </div>
              </CardContent>
            </Card>

            {/* Progress bars */}
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-w-md">
                  <Progress value={75} label="Upload" showValue variant="default" />
                  <Progress value={100} label="Complete" showValue variant="success" />
                  <Progress value={60} label="Processing" showValue variant="warning" />
                  <Progress value={30} label="Failed" showValue variant="danger" />
                  <Progress value={0} label="Loading..." indeterminate variant="default" />
                </div>
              </CardContent>
            </Card>

            {/* Animated Counter */}
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Animated Counter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-4">
                  <span className="text-4xl font-bold text-[hsl(var(--text-primary))] tabular-nums">
                    <AnimatedCounter value={liveMetrics.requests} format={fmtCompact} />
                  </span>
                  <span className="text-sm text-[hsl(var(--text-secondary))]">total requests</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* ── Status & Monitoring ─────────────────────────────────────── */}
        <Section
          id="status"
          title="Status & Monitoring"
          description="Status indicators, uptime tracking, severity timelines, and port grids."
        >
          <div className="space-y-8">
            {/* StatusBadge */}
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Status Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status="ok" />
                  <StatusBadge status="active" pulse />
                  <StatusBadge status="warning" />
                  <StatusBadge status="critical" pulse />
                  <StatusBadge status="unknown" />
                  <StatusBadge status="maintenance" />
                  <StatusBadge status="stale" />
                  <StatusBadge status="inactive" />
                  <StatusBadge status="decommissioned" />
                  <StatusBadge status="pending" />
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <StatusBadge status="ok" size="sm" />
                  <StatusBadge status="warning" size="sm" />
                  <StatusBadge status="critical" size="sm" />
                </div>
              </CardContent>
            </Card>

            {/* StatusPulse */}
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Status Pulse</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-6">
                  <StatusPulse status="online" />
                  <StatusPulse status="degraded" />
                  <StatusPulse status="offline" />
                  <StatusPulse status="unknown" />
                </div>
              </CardContent>
            </Card>

            {/* UptimeTracker */}
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Uptime Tracker</CardTitle>
                <CardDescription>30-day uptime visualization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <UptimeTracker days={generateUptimeDays(30)} label="API Server" showPercentage />
                  <UptimeTracker days={generateUptimeDays(30)} label="Database" showPercentage />
                  <UptimeTracker days={generateUptimeDays(90)} label="CDN Edge (90d)" showPercentage />
                </div>
              </CardContent>
            </Card>

            {/* SeverityTimeline */}
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Severity Timeline</CardTitle>
                <CardDescription>Recent events with severity indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <SeverityTimeline
                  events={generateTimelineEvents()}
                  onEventClick={(e) => toast.info(`Event: ${e.label}`)}
                />
              </CardContent>
            </Card>

            {/* PortStatusGrid */}
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Port Status Grid</CardTitle>
                <CardDescription>48-port switch faceplate visualization</CardDescription>
              </CardHeader>
              <CardContent>
                <PortStatusGrid
                  ports={generatePorts(48)}
                  columns={24}
                  size="md"
                  onPortClick={(p) => toast.info(`Port ${p.label}: ${p.status}`)}
                />
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* ── Pipeline ────────────────────────────────────────────────── */}
        <Section
          id="pipeline"
          title="Pipeline"
          description="Data pipeline stage visualization with status indicators and metrics."
        >
          <Card padding="lg">
            <CardHeader>
              <CardTitle>Pipeline Stages</CardTitle>
              <CardDescription>Real-time data processing pipeline</CardDescription>
            </CardHeader>
            <CardContent>
              <PipelineStage
                stages={generatePipelineStages()}
                onStageClick={(stage) => toast.info(`Stage: ${stage.name} — ${stage.status}`)}
              />
            </CardContent>
          </Card>
        </Section>

        {/* ── Data Table ──────────────────────────────────────────────── */}
        <Section
          id="data-table"
          title="Data Table"
          description="Full-featured table with search, column filters, sorting, pagination, density control, column picker, and CSV export."
        >
          <DataTable
            columns={serverColumns}
            data={servers}
            searchPlaceholder="Search servers..."
            exportFilename="servers"
            defaultSort={{ id: 'name', desc: false }}
            defaultPageSize={10}
            onRowClick={(row) => toast.info(`Clicked: ${row.name}`)}
          />
        </Section>

        {/* ── Forms ───────────────────────────────────────────────────── */}
        <Section
          id="forms"
          title="Forms"
          description="Form controls with consistent theming and accessibility."
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Input Controls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <FormInput
                    label="Server Name"
                    value={formName}
                    onChange={setFormName}
                    placeholder="e.g. prod-web-01"
                    required
                    hint="Lowercase letters, numbers, and hyphens only"
                  />

                  <div className="space-y-1.5">
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[hsl(var(--text-secondary))]">
                      Environment
                    </label>
                    <Select
                      value={formSelect}
                      onValueChange={setFormSelect}
                      options={[
                        { value: 'option1', label: 'Production' },
                        { value: 'option2', label: 'Staging' },
                        { value: 'option3', label: 'Development' },
                        { value: 'option4', label: 'Testing' },
                      ]}
                      placeholder="Select environment..."
                    />
                  </div>

                  <Slider
                    value={formSlider}
                    onChange={setFormSlider}
                    label="CPU Limit (%)"
                    showValue
                    min={10}
                    max={100}
                    step={5}
                  />
                </div>
              </CardContent>
            </Card>

            <Card padding="lg">
              <CardHeader>
                <CardTitle>Toggles & Choices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={formCheck} onChange={() => setFormCheck(!formCheck)} />
                    <span className="text-sm text-[hsl(var(--text-primary))]">Enable auto-scaling</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <ToggleSwitch enabled={formToggle} onChange={setFormToggle} label="Monitoring enabled" />
                    <span className="text-sm text-[hsl(var(--text-primary))]">
                      Monitoring {formToggle ? 'enabled' : 'disabled'}
                    </span>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[hsl(var(--text-secondary))]">
                      Notification Channel
                    </label>
                    <RadioGroup
                      value={formRadio}
                      onChange={setFormRadio}
                      options={[
                        { value: 'email', label: 'Email', description: 'Send alerts to email addresses' },
                        { value: 'slack', label: 'Slack', description: 'Post to a Slack channel' },
                        { value: 'pagerduty', label: 'PagerDuty', description: 'Create PagerDuty incidents' },
                        { value: 'webhook', label: 'Webhook', description: 'HTTP POST to custom URL' },
                      ]}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Filter Pills */}
            <Card padding="lg" className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Filter Pills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <FilterPill label="All" count={20} active={activeFilters.includes('all')} onClick={() => toggleFilter('all')} />
                  <FilterPill label="Online" count={14} active={activeFilters.includes('online')} onClick={() => toggleFilter('online')} />
                  <FilterPill label="Warning" count={3} active={activeFilters.includes('warning')} onClick={() => toggleFilter('warning')} />
                  <FilterPill label="Critical" count={2} active={activeFilters.includes('critical')} onClick={() => toggleFilter('critical')} />
                  <FilterPill label="Maintenance" count={1} active={activeFilters.includes('maintenance')} onClick={() => toggleFilter('maintenance')} />
                </div>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* ── Layout ──────────────────────────────────────────────────── */}
        <Section
          id="layout"
          title="Layout"
          description="Cards, tabs, sheets, empty states, and skeleton loaders."
        >
          <div className="space-y-8">
            {/* Tabs */}
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Tabs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <p className="text-xs text-[hsl(var(--text-tertiary))] mb-2">Underline variant</p>
                    <Tabs
                      tabs={[
                        { value: 'overview', label: 'Overview', icon: Eye },
                        { value: 'metrics', label: 'Metrics', icon: BarChart3 },
                        { value: 'alerts', label: 'Alerts', icon: Bell },
                        { value: 'settings', label: 'Settings', icon: Settings },
                      ]}
                      value={activeTab}
                      onChange={setActiveTab}
                    />
                    <div className="mt-4 p-4 rounded-xl bg-[hsl(var(--bg-elevated))] border border-[hsl(var(--border-subtle))]">
                      <p className="text-sm text-[hsl(var(--text-secondary))]">
                        Active tab: <span className="font-medium text-[hsl(var(--text-primary))]">{activeTab}</span>
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-[hsl(var(--text-tertiary))] mb-2">Pills variant</p>
                    <Tabs
                      tabs={[
                        { value: 'overview', label: 'Overview' },
                        { value: 'metrics', label: 'Metrics' },
                        { value: 'alerts', label: 'Alerts' },
                      ]}
                      value={activeTab}
                      onChange={setActiveTab}
                      variant="pills"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card variants */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card variant="default" padding="md">
                <CardTitle>Default</CardTitle>
                <CardContent>
                  <p className="text-sm text-[hsl(var(--text-secondary))]">Standard card variant with subtle border.</p>
                </CardContent>
              </Card>
              <Card variant="elevated" padding="md">
                <CardTitle>Elevated</CardTitle>
                <CardContent>
                  <p className="text-sm text-[hsl(var(--text-secondary))]">Elevated with stronger shadow.</p>
                </CardContent>
              </Card>
              <Card variant="outlined" padding="md">
                <CardTitle>Outlined</CardTitle>
                <CardContent>
                  <p className="text-sm text-[hsl(var(--text-secondary))]">Transparent with border only.</p>
                </CardContent>
              </Card>
              <Card variant="interactive" padding="md">
                <CardTitle>Interactive</CardTitle>
                <CardContent>
                  <p className="text-sm text-[hsl(var(--text-secondary))]">Hover to see the effect.</p>
                </CardContent>
              </Card>
            </div>

            {/* Card with full structure */}
            <Card padding="lg">
              <CardHeader>
                <div>
                  <CardTitle>Server Configuration</CardTitle>
                  <CardDescription>Configure the deployment parameters for this service.</CardDescription>
                </div>
                <Badge color="green" icon={Check}>Active</Badge>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-[hsl(var(--text-tertiary))]">Region</span>
                    <p className="text-sm font-medium text-[hsl(var(--text-primary))]">US East (N. Virginia)</p>
                  </div>
                  <div>
                    <span className="text-xs text-[hsl(var(--text-tertiary))]">Instance Type</span>
                    <p className="text-sm font-medium text-[hsl(var(--text-primary))]">c5.2xlarge</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="primary" size="sm">Save Changes</Button>
                <Button variant="ghost" size="sm">Discard</Button>
              </CardFooter>
            </Card>

            {/* Sheet */}
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Sheet (Slide-over)</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" onClick={() => setSheetOpen(true)}>
                  Open Sheet <ChevronRight className="size-4" />
                </Button>
              </CardContent>
            </Card>

            <Sheet
              open={sheetOpen}
              onClose={() => setSheetOpen(false)}
              title="Server Details"
              description="View and edit server configuration."
            >
              <div className="space-y-4">
                <FormInput label="Hostname" value="prod-web-01" onChange={() => {}} />
                <FormInput label="IP Address" value="10.0.1.15" onChange={() => {}} />
                <div className="space-y-1.5">
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[hsl(var(--text-secondary))]">
                    Status
                  </label>
                  <Select
                    value="ok"
                    onValueChange={() => {}}
                    options={[
                      { value: 'ok', label: 'OK' },
                      { value: 'maintenance', label: 'Maintenance' },
                      { value: 'decommissioned', label: 'Decommissioned' },
                    ]}
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <Button variant="primary" onClick={() => { setSheetOpen(false); toast.success('Changes saved') }}>
                    Save
                  </Button>
                  <Button variant="ghost" onClick={() => setSheetOpen(false)}>Cancel</Button>
                </div>
              </div>
            </Sheet>

            {/* Empty State */}
            <EmptyState
              icon={Inbox}
              title="No alerts"
              description="There are no active alerts. All systems are operating normally."
              actions={
                <Button variant="secondary" size="sm">Configure Alert Rules</Button>
              }
            />

            {/* Skeleton loading */}
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Skeleton Loaders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <p className="text-xs text-[hsl(var(--text-tertiary))] mb-2">Single skeleton</p>
                    <Skeleton className="h-8 w-48" />
                  </div>
                  <div>
                    <p className="text-xs text-[hsl(var(--text-tertiary))] mb-2">Text skeleton (3 lines)</p>
                    <SkeletonText lines={3} />
                  </div>
                  <div>
                    <p className="text-xs text-[hsl(var(--text-tertiary))] mb-2">Card skeleton</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <SkeletonCard />
                      <SkeletonCard />
                      <SkeletonCard />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* ── Log Viewer ──────────────────────────────────────────────── */}
        <Section
          id="logs"
          title="Log Viewer"
          description="Real-time log stream with severity coloring, search filtering, and auto-scroll."
        >
          <LogViewer
            entries={logs}
            maxHeight={320}
            showTimestamps
            showLevel
            onEntryClick={(e) => toast.info(e.message)}
          />
        </Section>

      </div>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="mt-24 border-t border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-surface))]">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-semibold text-[hsl(var(--text-primary))] mb-1">
                @annondeveloper/ui-kit
              </h3>
              <p className="text-sm text-[hsl(var(--text-secondary))]">
                Built with React 19, Tailwind CSS v4, Framer Motion, Radix UI
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/annondeveloper/ui-kit"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
                  text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]
                  hover:bg-[hsl(var(--bg-elevated))] transition-colors"
              >
                <Github className="size-4" />
                GitHub
              </a>
              <a
                href="https://www.npmjs.com/package/@annondeveloper/ui-kit"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
                  text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]
                  hover:bg-[hsl(var(--bg-elevated))] transition-colors"
              >
                <Package className="size-4" />
                npm
              </a>
              <a
                href="https://jsr.io/@annondeveloper/ui-kit"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
                  text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]
                  hover:bg-[hsl(var(--bg-elevated))] transition-colors"
              >
                <ExternalLink className="size-4" />
                JSR
              </a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-[hsl(var(--border-subtle))] text-center">
            <p className="text-xs text-[hsl(var(--text-tertiary))]">
              MIT License. Components designed for monitoring dashboards and professional tools.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
