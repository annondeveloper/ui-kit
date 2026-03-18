'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, useInView, useReducedMotion, AnimatePresence } from 'framer-motion'
import {
  Sun, Moon, Copy, Check, Package, Server, Cpu, HardDrive, Network,
  Activity, Shield, Wifi, Zap, AlertTriangle, Bell, Clock, Database,
  Globe, BarChart3, Terminal, Gauge, Eye, Inbox, Settings, Github,
  Search, Users, FileText, Home, Trash2, Edit3, MoreHorizontal,
  ArrowRight, Play, Pause, RefreshCw, Download, Upload, Lock,
  Mail, MapPin, Bot, Sparkles, ChevronRight, ExternalLink,
} from 'lucide-react'

// Import all components from the ui-kit source
import {
  Button,
  Badge, createBadgeVariant,
  Checkbox,
  Select,
  ToggleSwitch,
  FormInput,
  FilterPill,
  EmptyState,
  Skeleton, SkeletonText, SkeletonCard,
  ConfirmDialog,
  AnimatedCounter,
  SuccessCheckmark,
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
  Tooltip,
  Popover,
  DropdownMenu,
  Avatar,
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
  StreamingText,
  TypingIndicator,
  ConfidenceBar,
  LiveFeed,
  DiffViewer,
  HeatmapCalendar,
  NotificationStack,
  KanbanColumn,
  SmartTable,
  RealtimeValue,
  CommandBar,
  SortableList, DragHandle,
  InfiniteScroll,
  ColorInput,
  StepWizard,
  CopyBlock,
  TruncatedText,
  fmtBytes, fmtBps, fmtCompact,
} from '../../src/index'

import type { ColumnDef } from '@tanstack/react-table'
import type {
  LogEntry, TimelineEvent, DayStatus, PortStatus, StageInfo,
  FeedItem, Notification, CommandItem, DayValue, SortableItem,
  WizardStep,
} from '../../src/index'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function randInt(min: number, max: number) {
  return Math.floor(rand(min, max))
}

function useInterval(fn: () => void, ms: number) {
  const saved = useRef(fn)
  useEffect(() => { saved.current = fn }, [fn])
  useEffect(() => {
    const id = setInterval(() => saved.current(), ms)
    return () => clearInterval(id)
  }, [ms])
}

// ---------------------------------------------------------------------------
// Section wrapper with scroll-into-view animations
// ---------------------------------------------------------------------------

function Section({
  id, title, description, children,
}: {
  id: string
  title: string
  description: string
  children: React.ReactNode
}) {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  const reduced = useReducedMotion()

  return (
    <section id={id} ref={ref} className="scroll-mt-28">
      <motion.div
        initial={reduced ? undefined : { opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-1">{title}</h2>
        <p className="text-sm text-[hsl(var(--text-secondary))] mb-8">{description}</p>
        <div className="space-y-8">
          {children}
        </div>
      </motion.div>
    </section>
  )
}

function DemoCard({ label, description, children, className }: {
  label: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card variant="elevated" className={className}>
      <CardHeader>
        <CardTitle className="text-base">{label}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Nav sections config
// ---------------------------------------------------------------------------

const SECTIONS = [
  { id: 'ai-realtime', label: 'AI & Real-Time' },
  { id: 'smart-data', label: 'Smart Data' },
  { id: 'monitoring', label: 'Monitoring Dashboard' },
  { id: 'interactive', label: 'Interactive' },
  { id: 'core', label: 'Core Components' },
  { id: 'forms', label: 'Forms' },
  { id: 'layout-feedback', label: 'Layout & Feedback' },
]

// ---------------------------------------------------------------------------
// Data generators
// ---------------------------------------------------------------------------

function generateSparklineData(length: number, min: number, max: number): number[] {
  return Array.from({ length }, () => rand(min, max))
}

function generateServerData(count: number) {
  const statuses = ['healthy', 'warning', 'critical', 'healthy', 'healthy', 'healthy'] as const
  const regions = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1', 'eu-central-1']
  const roles = ['web', 'api', 'db', 'cache', 'worker', 'gateway', 'monitor']
  return Array.from({ length: count }, (_, i) => ({
    id: `srv-${String(i + 1).padStart(3, '0')}`,
    hostname: `${roles[i % roles.length]}-${String(i + 1).padStart(2, '0')}.prod.internal`,
    ip: `10.${randInt(0, 255)}.${randInt(1, 254)}.${randInt(1, 254)}`,
    cpu: Math.round(rand(5, 98)),
    memory: Math.round(rand(20, 95)),
    status: statuses[i % statuses.length],
    region: regions[i % regions.length]!,
    uptime: `${randInt(1, 365)}d`,
    role: roles[i % roles.length]!,
  }))
}

function generateLogEntries(count: number): LogEntry[] {
  const levels: LogEntry['level'][] = ['info', 'info', 'warn', 'error', 'info', 'debug', 'info']
  const messages = [
    'Request completed successfully in 42ms',
    'Database connection pool expanded to 25',
    'High memory usage detected on worker-03 (92%)',
    'Failed to connect to upstream service: connection refused',
    'TLS certificate renewal scheduled for 2026-04-15',
    'Cache hit ratio: 94.2% (last 5 minutes)',
    'New deployment rolled out to production cluster',
    'BGP session established with peer 203.0.113.1',
    'SNMP walk completed for switch-rack14 (1247 OIDs)',
    'Alert rule "high_cpu" evaluated: 0 firing',
    'Syslog receiver processed 15,420 messages/sec',
    'Discovery scan found 3 new candidates in 10.0.0.0/24',
    'Metric retention policy applied: removed 847K rows older than 90d',
    'WebSocket hub: 142 active connections, 28 subscriptions',
    'Rate limiter: 0 requests throttled in last minute',
  ]
  const sources = ['api-server', 'normalizer', 'correlator', 'snmp-collector', 'discovery-engine']
  const now = Date.now()
  return Array.from({ length: count }, (_, i) => ({
    time: new Date(now - i * randInt(500, 5000)).toISOString(),
    level: levels[i % levels.length],
    message: messages[i % messages.length],
    source: sources[i % sources.length],
  }))
}

function generateTimelineEvents(count: number): TimelineEvent[] {
  const severities: TimelineEvent['severity'][] = ['critical', 'warning', 'info', 'info', 'warning', 'info', 'critical', 'ok', 'info', 'info']
  const labels = [
    'Link down on ge-0/0/12',
    'CPU threshold exceeded (92%)',
    'BGP session established',
    'Configuration backup completed',
    'Memory usage above 85%',
    'SNMP trap received: linkUp',
    'Power supply failure detected',
    'New device discovered: sw-rack07',
    'Certificate expiring in 14 days',
    'Firmware update available for FI-A',
  ]
  const now = Date.now()
  return Array.from({ length: count }, (_, i) => ({
    time: new Date(now - i * 600_000).toISOString(),
    severity: severities[i % severities.length],
    label: labels[i % labels.length],
    detail: `Source: ${['switch-core01', 'host-agent', 'discovery', 'bgp-monitor', 'trap-receiver'][i % 5]}`,
  }))
}

function generatePortStatuses(count: number): PortStatus[] {
  const states: PortStatus['status'][] = ['up', 'up', 'up', 'down', 'up', 'up', 'disabled', 'up']
  return Array.from({ length: count }, (_, i) => ({
    id: `${i + 1}`,
    label: `Gi0/${i + 1}`,
    status: states[i % states.length],
    speed: states[i % states.length] === 'up' ? (i % 3 === 0 ? '10G' : '1G') : undefined,
  }))
}

function generateUptimeDays(count: number): DayStatus[] {
  const statuses: DayStatus['status'][] = ['ok', 'ok', 'ok', 'ok', 'ok', 'degraded', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'outage', 'ok', 'ok']
  const now = new Date()
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (count - 1 - i))
    const s = statuses[i % statuses.length]
    return {
      date: d.toISOString().slice(0, 10),
      status: s,
      uptime: s === 'ok' ? 100 : s === 'degraded' ? 98.5 : 0,
    }
  })
}

function generatePipelineStages(): StageInfo[] {
  return [
    { name: 'Collect', status: 'active', metric: { label: 'Rate', value: '14.2K/s' } },
    { name: 'Normalize', status: 'active', metric: { label: 'Rate', value: '14.1K/s' } },
    { name: 'Correlate', status: 'active', metric: { label: 'Rate', value: '13.8K/s' } },
    { name: 'Store', status: 'active', metric: { label: 'Rate', value: '13.8K/s' } },
    { name: 'Alert Eval', status: 'error', metric: { label: 'Lag', value: '45ms' } },
  ]
}

function generateHeatmapData(): DayValue[] {
  const now = new Date()
  const data: DayValue[] = []
  for (let i = 364; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    data.push({
      date: d.toISOString().slice(0, 10),
      value: Math.random() < 0.15 ? 0 : randInt(1, 40),
    })
  }
  return data
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function DemoPage() {
  const [isDark, setIsDark] = useState(true)
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id)

  // Theme toggle
  useEffect(() => {
    document.documentElement.classList.toggle('light', !isDark)
  }, [isDark])

  // Scroll spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        }
      },
      { rootMargin: '-30% 0px -60% 0px' },
    )
    for (const s of SECTIONS) {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  // Install command copy
  const [installCopied, setInstallCopied] = useState(false)
  const handleCopyInstall = useCallback(() => {
    void navigator.clipboard.writeText('npm install @annondeveloper/ui-kit').then(() => {
      setInstallCopied(true)
      setTimeout(() => setInstallCopied(false), 2000)
    })
  }, [])

  return (
    <>
      <Toaster />
      <CommandBarDemo />

      {/* Sticky header */}
      <header className="sticky top-0 z-40 backdrop-blur-lg bg-[hsl(var(--bg-base)/0.85)] border-b border-[hsl(var(--border-subtle))]">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          <span className="text-sm font-semibold text-[hsl(var(--text-primary))]">
            @annondeveloper/ui-kit
          </span>
          <div className="flex items-center gap-3">
            <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-surface))] px-2 py-1 text-[10px] text-[hsl(var(--text-tertiary))] font-mono">
              Cmd+K
            </kbd>
            <a
              href="https://github.com/annondeveloper/ui-kit"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-elevated))] transition-colors"
            >
              <Github className="h-4 w-4" />
            </a>
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-elevated))] transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Section nav pills */}
        <div className="max-w-7xl mx-auto px-6 pb-2 overflow-x-auto">
          <div className="flex gap-1">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  activeSection === s.id
                    ? 'bg-[hsl(var(--brand-primary)/0.15)] text-[hsl(var(--brand-primary))]'
                    : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-elevated))]'
                }`}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pb-32">
        {/* Hero */}
        <div className="hero-gradient rounded-3xl p-10 sm:p-16 mt-8 mb-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-[hsl(var(--text-primary))] mb-4 tracking-tight">
            @annondeveloper/ui-kit
          </h1>
          <p className="text-lg text-[hsl(var(--text-secondary))] mb-6 max-w-2xl mx-auto">
            The React component library for monitoring dashboards, AI interfaces, and professional tools.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-8 text-xs font-medium text-[hsl(var(--text-secondary))]">
            <Badge color="brand" size="md">53 Components</Badge>
            <Badge color="purple" size="md">AI-Ready</Badge>
            <Badge color="green" size="md">Real-Time</Badge>
            <Badge color="blue" size="md">Dark/Light</Badge>
            <Badge color="teal" size="md">Accessible</Badge>
          </div>
          <button
            onClick={handleCopyInstall}
            className="inline-flex items-center gap-3 rounded-xl bg-[hsl(var(--bg-base))] border border-[hsl(var(--border-default))] px-5 py-3 font-mono text-sm text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-surface))] transition-colors cursor-pointer"
          >
            <span className="text-[hsl(var(--text-tertiary))]">$</span>
            npm install @annondeveloper/ui-kit
            {installCopied ? <Check className="h-4 w-4 text-[hsl(var(--status-ok))]" /> : <Copy className="h-4 w-4 text-[hsl(var(--text-tertiary))]" />}
          </button>
        </div>

        <div className="space-y-24">
          {/* ============================================================ */}
          {/* 1. AI & REAL-TIME */}
          {/* ============================================================ */}
          <Section id="ai-realtime" title="AI & Real-Time" description="Components purpose-built for AI interfaces, live data, and command-line workflows. No other library has these.">
            <StreamingTextDemo />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DemoCard label="TypingIndicator" description="Three animation variants">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <TypingIndicator variant="dots" label="AI is thinking" />
                  </div>
                  <div className="flex items-center gap-3">
                    <TypingIndicator variant="pulse" label="Processing query" />
                  </div>
                  <div className="flex items-center gap-3">
                    <TypingIndicator variant="text" label="Generating response" />
                  </div>
                </div>
              </DemoCard>

              <DemoCard label="ConfidenceBar" description="Probability display with threshold zones">
                <div className="space-y-5">
                  <ConfidenceBar value={0.92} label="Entity match" />
                  <ConfidenceBar value={0.65} label="Anomaly score" />
                  <ConfidenceBar value={0.23} label="False positive" />
                </div>
              </DemoCard>

              <RealtimeValueDemo />
            </div>

            <LiveFeedDemo />

            <DemoCard label="CommandBar" description="Press Cmd+K (or Ctrl+K) to open the universal command palette. 10 sample commands registered.">
              <p className="text-sm text-[hsl(var(--text-secondary))]">
                Try pressing <kbd className="rounded border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-surface))] px-1.5 py-0.5 text-[10px] font-mono">Cmd+K</kbd> now.
                The command bar supports fuzzy search, keyboard navigation, grouped items, and recent selections.
              </p>
            </DemoCard>
          </Section>

          {/* ============================================================ */}
          {/* 2. SMART DATA */}
          {/* ============================================================ */}
          <Section id="smart-data" title="Smart Data" description="Intelligent data components that analyze, filter, and display structured information with built-in insights.">
            <SmartTableDemo />
            <DataTableDemo />
            <DiffViewerDemo />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DemoCard label="HeatmapCalendar" description="GitHub-style 365-day contribution heatmap">
                <HeatmapCalendarDemo />
              </DemoCard>
              <DemoCard label="CopyBlock" description="Code blocks with one-click copy and line numbers">
                <div className="space-y-4">
                  <CopyBlock
                    language="bash"
                    label="Install"
                    content={`npm install @annondeveloper/ui-kit
# or
pnpm add @annondeveloper/ui-kit`}
                  />
                  <CopyBlock
                    language="json"
                    label="Config"
                    showLineNumbers
                    maxHeight={120}
                    content={`{
  "collector": "snmp-v3",
  "target": "10.0.1.1",
  "interval": 60,
  "credentials": {
    "username": "netrak",
    "auth_protocol": "sha256",
    "priv_protocol": "aes128"
  }
}`}
                  />
                </div>
              </DemoCard>
            </div>
          </Section>

          {/* ============================================================ */}
          {/* 3. MONITORING DASHBOARD */}
          {/* ============================================================ */}
          <Section id="monitoring" title="Monitoring Dashboard" description="Production-grade monitoring components for NOC dashboards, infrastructure visibility, and incident management.">
            <MetricCardsDemo />
            <ThresholdGaugesDemo />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DemoCard label="UtilizationBar" description="Resource utilization with threshold colors">
                <div className="space-y-4">
                  <UtilizationBar label="CPU" value={72} showValue />
                  <UtilizationBar label="Memory" value={88} showValue />
                  <UtilizationBar label="Disk" value={45} showValue />
                  <UtilizationBar label="Network" value={31} showValue />
                </div>
              </DemoCard>
              <DemoCard label="Sparkline" description="Inline trend visualization">
                <div className="space-y-6">
                  <div>
                    <span className="text-xs text-[hsl(var(--text-secondary))] mb-2 block">Requests/s (steady)</span>
                    <Sparkline data={generateSparklineData(30, 800, 1200)} height={40} color="hsl(var(--brand-primary))" />
                  </div>
                  <div>
                    <span className="text-xs text-[hsl(var(--text-secondary))] mb-2 block">Latency (spiky)</span>
                    <Sparkline data={[12, 15, 14, 45, 12, 11, 13, 60, 14, 12, 80, 13, 12, 14, 11, 50, 13, 12, 14, 90, 12, 11, 13, 14, 12, 55, 14, 12, 13, 11]} height={40} color="hsl(var(--status-warning))" />
                  </div>
                  <div>
                    <span className="text-xs text-[hsl(var(--text-secondary))] mb-2 block">Error rate (growing)</span>
                    <Sparkline data={[0.1, 0.2, 0.1, 0.3, 0.5, 0.8, 1.2, 1.5, 2.1, 2.8, 3.5, 4.2, 5.0, 5.8, 6.5, 7.2, 8.0, 8.5, 9.0, 9.5, 10.2, 11.0, 12.5, 13.0, 14.2, 15.0, 16.5, 18.0, 19.5, 21.0]} height={40} color="hsl(var(--status-critical))" />
                  </div>
                </div>
              </DemoCard>
            </div>

            <DemoCard label="UptimeTracker" description="90-day uptime visualization with per-day status">
              <UptimeTracker days={generateUptimeDays(90)} />
            </DemoCard>

            <DemoCard label="PortStatusGrid" description="48-port switch faceplate visualization">
              <PortStatusGrid ports={generatePortStatuses(48)} columns={24} />
            </DemoCard>

            <DemoCard label="PipelineStage" description="Data processing pipeline with per-stage metrics">
              <PipelineStage stages={generatePipelineStages()} />
            </DemoCard>

            <DemoCard label="SeverityTimeline" description="Time-ordered event stream with severity indicators">
              <SeverityTimeline events={generateTimelineEvents(10)} maxVisible={8} />
            </DemoCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DemoCard label="TimeRangeSelector" description="Interactive time range picker">
                <TimeRangeSelectorDemo />
              </DemoCard>
              <DemoCard label="StatusBadge & StatusPulse" description="All status variants">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {(['online', 'offline', 'degraded', 'maintenance', 'unknown', 'healthy', 'warning', 'critical', 'pending', 'syncing'] as const).map((s) => (
                      <StatusBadge key={s} status={s} />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {(['online', 'degraded', 'offline', 'unknown'] as const).map((s) => (
                      <div key={s} className="flex items-center gap-2">
                        <StatusPulse status={s} />
                      </div>
                    ))}
                  </div>
                </div>
              </DemoCard>
            </div>

            <DemoCard label="LogViewer" description="Searchable, filterable log viewer with level coloring">
              <LogViewer entries={generateLogEntries(15)} maxHeight={300} />
            </DemoCard>
          </Section>

          {/* ============================================================ */}
          {/* 4. INTERACTIVE COMPONENTS */}
          {/* ============================================================ */}
          <Section id="interactive" title="Interactive Components" description="Rich interactive patterns for drag-and-drop, wizards, infinite lists, kanban boards, and notifications.">
            <SortableListDemo />

            <DemoCard label="StepWizard" description="Multi-step form wizard with validation, keyboard nav, and session persistence">
              <StepWizardDemo />
            </DemoCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DemoCard label="ColorInput" description="Full-featured color picker with hue/saturation area, format switching, presets, and recents">
                <ColorInputDemo />
              </DemoCard>
              <DemoCard label="InfiniteScroll" description="Virtualized infinite list with intersection observer">
                <InfiniteScrollDemo />
              </DemoCard>
            </div>

            <DemoCard label="KanbanColumn" description="Board columns with cards, tags, assignees, and staggered animations">
              <div className="flex gap-4 overflow-x-auto pb-2">
                <KanbanColumn
                  title="To Do"
                  color="hsl(var(--brand-secondary))"
                  items={[
                    { id: 'k1', title: 'Implement gNMI streaming collector', description: 'Add support for gRPC telemetry ingestion', tags: [{ label: 'Backend', color: 'blue' }, { label: 'P1', color: 'red' }], assignee: { name: 'Alice Chen' } },
                    { id: 'k2', title: 'Design RBAC permission matrix', tags: [{ label: 'Security', color: 'purple' }], assignee: { name: 'Bob Kim' } },
                    { id: 'k3', title: 'Add NetFlow v9 template support', tags: [{ label: 'Backend', color: 'blue' }] },
                  ]}
                />
                <KanbanColumn
                  title="In Progress"
                  color="hsl(var(--status-warning))"
                  items={[
                    { id: 'k4', title: 'Build topology auto-layout engine', description: 'Force-directed graph with LLDP/CDP edge weights', tags: [{ label: 'Frontend', color: 'green' }, { label: 'Complex', color: 'orange' }], assignee: { name: 'Carol Wu' } },
                    { id: 'k5', title: 'SNMP v3 credential rotation', tags: [{ label: 'Security', color: 'purple' }, { label: 'Backend', color: 'blue' }], assignee: { name: 'David Park' } },
                  ]}
                />
                <KanbanColumn
                  title="Done"
                  color="hsl(var(--status-ok))"
                  items={[
                    { id: 'k6', title: 'Entity fingerprint scoring', tags: [{ label: 'Core', color: 'brand' }], assignee: { name: 'Eve Lin' } },
                    { id: 'k7', title: 'Dark/light theme system', tags: [{ label: 'Frontend', color: 'green' }], assignee: { name: 'Frank Yu' } },
                    { id: 'k8', title: 'TimescaleDB continuous aggregates', tags: [{ label: 'Database', color: 'teal' }] },
                  ]}
                />
              </div>
            </DemoCard>

            <NotificationStackDemo />
          </Section>

          {/* ============================================================ */}
          {/* 5. CORE COMPONENTS */}
          {/* ============================================================ */}
          <Section id="core" title="Core Components" description="Foundation building blocks: buttons, badges, cards, tabs, dialogs, and more.">
            <DemoCard label="Button" description="All variants, sizes, and loading state">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  {(['primary', 'secondary', 'danger', 'outline', 'ghost'] as const).map((v) => (
                    <Button key={v} variant={v}>{v}</Button>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon"><Settings className="h-4 w-4" /></Button>
                  <Button loading>Loading</Button>
                </div>
              </div>
            </DemoCard>

            <DemoCard label="Badge" description="All 10 color presets and createBadgeVariant">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {(['brand', 'blue', 'green', 'yellow', 'red', 'orange', 'purple', 'pink', 'teal', 'gray'] as const).map((c) => (
                    <Badge key={c} color={c}>{c}</Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge color="brand" icon={Zap}>With Icon</Badge>
                  <Badge color="green" size="xs">xs</Badge>
                  <Badge color="blue" size="sm">sm</Badge>
                  <Badge color="purple" size="md">md</Badge>
                </div>
              </div>
            </DemoCard>

            <DemoCard label="Card" description="All 4 variants with header, content, and footer">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(['default', 'elevated', 'outlined', 'interactive'] as const).map((v) => (
                  <Card key={v} variant={v}>
                    <CardHeader>
                      <CardTitle className="text-sm">{v}</CardTitle>
                      <CardDescription>Card variant</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-[hsl(var(--text-secondary))]">Content here</p>
                    </CardContent>
                    <CardFooter>
                      <span className="text-xs text-[hsl(var(--text-tertiary))]">Footer</span>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </DemoCard>

            <TabsDemo />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SheetDemo />
              <ConfirmDialogDemo />
              <DemoCard label="Toaster" description="Toast notifications via sonner">
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => toast.success('Deployment completed successfully')}>Success</Button>
                  <Button size="sm" variant="outline" onClick={() => toast.error('Connection to NATS failed')}>Error</Button>
                  <Button size="sm" variant="outline" onClick={() => toast.warning('Certificate expires in 7 days')}>Warning</Button>
                  <Button size="sm" variant="outline" onClick={() => toast.info('3 new devices discovered')}>Info</Button>
                </div>
              </DemoCard>
            </div>

            <DemoCard label="SuccessCheckmark" description="Animated SVG checkmark with spring physics">
              <div className="flex items-center gap-6">
                <SuccessCheckmark size={24} />
                <SuccessCheckmark size={36} />
                <SuccessCheckmark size={48} />
                <span className="text-sm text-[hsl(var(--text-secondary))]">Animated on mount</span>
              </div>
            </DemoCard>
          </Section>

          {/* ============================================================ */}
          {/* 6. FORMS */}
          {/* ============================================================ */}
          <Section id="forms" title="Forms" description="Themed form inputs, selects, checkboxes, toggles, radios, sliders, and filter pills.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInputDemo />

              <DemoCard label="Select, Checkbox, Toggle" description="Selection controls">
                <div className="space-y-5">
                  <SelectDemo />
                  <div className="space-y-3">
                    <CheckboxDemo />
                  </div>
                  <ToggleDemo />
                </div>
              </DemoCard>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DemoCard label="RadioGroup" description="Horizontal and vertical layouts">
                <div className="space-y-6">
                  <RadioGroupDemo />
                </div>
              </DemoCard>

              <DemoCard label="Slider" description="Range input with labels and value display">
                <SliderDemo />
              </DemoCard>
            </div>

            <DemoCard label="FilterPill" description="Toggleable filter tags">
              <FilterPillDemo />
            </DemoCard>
          </Section>

          {/* ============================================================ */}
          {/* 7. LAYOUT & FEEDBACK */}
          {/* ============================================================ */}
          <Section id="layout-feedback" title="Layout & Feedback" description="Empty states, skeletons, progress indicators, avatars, tooltips, popovers, and text utilities.">
            <DemoCard label="EmptyState" description="Purposeful empty states with icon and actions">
              <EmptyState
                icon={Inbox}
                title="No alerts configured"
                description="Create alert rules to get notified when thresholds are breached."
                actions={<Button size="sm"><Bell className="h-3.5 w-3.5" /> Create Alert Rule</Button>}
              />
            </DemoCard>

            <DemoCard label="Skeleton / SkeletonText / SkeletonCard" description="Content loading placeholders">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div>
                  <SkeletonText lines={4} />
                </div>
                <div>
                  <SkeletonCard />
                </div>
              </div>
            </DemoCard>

            <DemoCard label="Progress" description="Progress bars with color variants and indeterminate state">
              <div className="space-y-4">
                <Progress value={25} label="Deploying" showValue />
                <Progress value={65} variant="success" label="Healthy nodes" showValue />
                <Progress value={82} variant="warning" label="Memory usage" showValue />
                <Progress value={96} variant="danger" label="Disk usage" showValue />
                <Progress value={0} indeterminate label="Scanning network" />
              </div>
            </DemoCard>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DemoCard label="Avatar" description="Image, initials, and status dots">
                <div className="flex flex-wrap items-end gap-3">
                  <Avatar alt="Alice Chen" size="xs" status="online" />
                  <Avatar alt="Bob Kim" size="sm" status="busy" />
                  <Avatar alt="Carol Wu" size="md" status="away" />
                  <Avatar alt="David Park" size="lg" status="offline" />
                  <Avatar alt="Eve Lin" size="xl" />
                </div>
              </DemoCard>

              <DemoCard label="Tooltip" description="Hover for additional context">
                <div className="flex gap-4 items-center">
                  <Tooltip content="CPU: 72%">
                    <Badge color="yellow">web-01</Badge>
                  </Tooltip>
                  <Tooltip content="Last seen: 3 min ago" side="bottom">
                    <Badge color="green">api-02</Badge>
                  </Tooltip>
                  <Tooltip content="No data received" side="right">
                    <Badge color="red">db-03</Badge>
                  </Tooltip>
                </div>
              </DemoCard>

              <DemoCard label="Popover" description="Click-triggered overlay">
                <Popover
                  trigger={<Button size="sm" variant="outline">Open Popover</Button>}
                >
                  <div className="p-3 space-y-2 w-48">
                    <p className="text-sm font-medium text-[hsl(var(--text-primary))]">Quick Actions</p>
                    <Button size="sm" variant="ghost" className="w-full justify-start"><RefreshCw className="h-3.5 w-3.5" /> Refresh</Button>
                    <Button size="sm" variant="ghost" className="w-full justify-start"><Download className="h-3.5 w-3.5" /> Export</Button>
                  </div>
                </Popover>
              </DemoCard>

              <DemoCard label="DropdownMenu" description="Action menus">
                <DropdownMenu
                  trigger={<Button size="sm" variant="outline"><MoreHorizontal className="h-4 w-4" /></Button>}
                  items={[
                    { label: 'View Details', icon: Eye, onClick: () => toast.info('View details') },
                    { label: 'Edit', icon: Edit3, onClick: () => toast.info('Edit item') },
                    { label: 'Download', icon: Download, onClick: () => toast.info('Downloading') },
                    { label: 'Delete', icon: Trash2, variant: 'danger', onClick: () => toast.error('Deleted') },
                  ]}
                />
              </DemoCard>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DemoCard label="TruncatedText" description="Auto-truncate with tooltip and copy">
                <div className="space-y-3">
                  <TruncatedText text="This is a short text that fits just fine." maxWidth={300} />
                  <TruncatedText text="This is a very long hostname: super-long-web-server-name-01.us-east-1.production.internal.corp.example.com that definitely will not fit in the container" maxWidth={300} />
                </div>
              </DemoCard>

              <AnimatedCounterDemo />
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div className="mt-24 pt-8 border-t border-[hsl(var(--border-subtle))] text-center">
          <p className="text-sm text-[hsl(var(--text-tertiary))]">
            53 components. Zero compromises. Built for monitoring dashboards, AI interfaces, and professional tools.
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <a href="https://github.com/annondeveloper/ui-kit" target="_blank" rel="noopener noreferrer" className="text-sm text-[hsl(var(--brand-primary))] hover:underline inline-flex items-center gap-1">
              <Github className="h-3.5 w-3.5" /> GitHub
            </a>
            <a href="https://www.npmjs.com/package/@annondeveloper/ui-kit" target="_blank" rel="noopener noreferrer" className="text-sm text-[hsl(var(--brand-primary))] hover:underline inline-flex items-center gap-1">
              <Package className="h-3.5 w-3.5" /> npm
            </a>
          </div>
        </div>
      </main>
    </>
  )
}

// ---------------------------------------------------------------------------
// Demo sub-components (stateful)
// ---------------------------------------------------------------------------

function CommandBarDemo() {
  const commands: CommandItem[] = useMemo(() => [
    { id: 'search-entities', label: 'Search Entities', description: 'Find devices, hosts, and services', icon: Search, group: 'Navigation', shortcut: 'Cmd+E', onSelect: () => toast.info('Navigate: Entities'), keywords: ['device', 'host', 'find'] },
    { id: 'topology', label: 'Open Topology Map', icon: Globe, group: 'Navigation', onSelect: () => toast.info('Navigate: Topology') },
    { id: 'alerts', label: 'View Active Alerts', icon: AlertTriangle, group: 'Navigation', shortcut: 'Cmd+A', onSelect: () => toast.info('Navigate: Alerts'), keywords: ['warning', 'critical'] },
    { id: 'dashboard', label: 'Go to Dashboard', icon: BarChart3, group: 'Navigation', onSelect: () => toast.info('Navigate: Dashboard') },
    { id: 'settings', label: 'Open Settings', icon: Settings, group: 'Navigation', shortcut: 'Cmd+,', onSelect: () => toast.info('Navigate: Settings') },
    { id: 'add-device', label: 'Add New Device', description: 'Register a device for monitoring', icon: Server, group: 'Actions', onSelect: () => toast.success('Add device wizard opened') },
    { id: 'run-discovery', label: 'Run Network Discovery', icon: Wifi, group: 'Actions', onSelect: () => toast.success('Discovery scan started') },
    { id: 'export-data', label: 'Export Dashboard Data', icon: Download, group: 'Actions', onSelect: () => toast.info('Exporting...') },
    { id: 'toggle-theme', label: 'Toggle Dark/Light Mode', icon: Sun, group: 'Preferences', onSelect: () => document.documentElement.classList.toggle('light'), keywords: ['dark', 'light', 'theme'] },
    { id: 'help', label: 'Keyboard Shortcuts', icon: Terminal, group: 'Help', shortcut: 'Cmd+/', onSelect: () => toast.info('Shortcuts panel opened') },
  ], [])

  return <CommandBar items={commands} />
}

function StreamingTextDemo() {
  const fullText = `Analyzing network topology for **datacenter-west**...

Found **247 entities** across 12 racks. Detecting LLDP neighbors and building adjacency graph.

Identified 3 potential issues:
- Switch \`sw-rack07\` has asymmetric LLDP: sees \`fw-core01\` but not vice versa
- Host \`esxi-14\` reports 2 NICs down on \`vmnic3\` and \`vmnic4\`
- BGP session between \`core-rtr01\` and \`edge-rtr03\` is in **Idle** state

Recommendations:
1. Check cable between sw-rack07 port Gi0/24 and fw-core01 port eth1/3
2. Verify NIC firmware on esxi-14 (current: 20.5.13, available: 21.1.2)
3. Review BGP config for neighbor \`203.0.113.5\` on core-rtr01`

  const [displayed, setDisplayed] = useState('')
  const [isStreaming, setIsStreaming] = useState(true)
  const indexRef = useRef(0)

  useEffect(() => {
    if (!isStreaming) return
    const interval = setInterval(() => {
      if (indexRef.current < fullText.length) {
        const chunkSize = randInt(2, 8)
        indexRef.current = Math.min(indexRef.current + chunkSize, fullText.length)
        setDisplayed(fullText.slice(0, indexRef.current))
      } else {
        setIsStreaming(false)
        clearInterval(interval)
      }
    }, 30)
    return () => clearInterval(interval)
  }, [isStreaming, fullText])

  const handleRestart = useCallback(() => {
    indexRef.current = 0
    setDisplayed('')
    setIsStreaming(true)
  }, [])

  return (
    <DemoCard label="StreamingText" description="AI response streaming with markdown formatting, blinking cursor, and copy-on-complete">
      <div className="rounded-xl bg-[hsl(var(--bg-base))] border border-[hsl(var(--border-subtle))] p-4 max-h-[300px] overflow-y-auto">
        <StreamingText text={displayed} isStreaming={isStreaming} />
      </div>
      {!isStreaming && (
        <Button size="sm" variant="outline" onClick={handleRestart} className="mt-3">
          <RefreshCw className="h-3.5 w-3.5" /> Restart
        </Button>
      )}
    </DemoCard>
  )
}

function RealtimeValueDemo() {
  const [val, setVal] = useState(1247)
  const [prev, setPrev] = useState(1230)

  useInterval(() => {
    setPrev(val)
    setVal((v) => Math.max(0, v + randInt(-50, 60)))
  }, 2000)

  return (
    <DemoCard label="RealtimeValue" description="Live metric with animated transitions, freshness tracking, and delta display">
      <div className="space-y-6">
        <RealtimeValue
          value={val}
          previousValue={prev}
          label="Requests/sec"
          lastUpdated={new Date().toISOString()}
          connectionState="connected"
          size="lg"
        />
        <RealtimeValue
          value={42.8}
          label="Avg Latency (ms)"
          connectionState="reconnecting"
          size="md"
        />
        <RealtimeValue
          value="N/A"
          label="Throughput"
          connectionState="disconnected"
          size="sm"
        />
      </div>
    </DemoCard>
  )
}

function LiveFeedDemo() {
  const [items, setItems] = useState<FeedItem[]>(() => {
    const now = Date.now()
    return [
      { id: '1', content: 'SNMP collector completed walk for switch-core01 (1,247 OIDs)', timestamp: new Date(now - 3000), type: 'info' },
      { id: '2', content: 'Alert fired: CPU > 90% on host web-07.prod', timestamp: new Date(now - 8000), type: 'error' },
      { id: '3', content: 'Discovery scan found 2 new candidates in 10.0.5.0/24', timestamp: new Date(now - 15000), type: 'success' },
      { id: '4', content: 'BGP session flap detected on edge-rtr-03 (peer: 203.0.113.5)', timestamp: new Date(now - 22000), type: 'warning' },
      { id: '5', content: 'Syslog: interface GigabitEthernet0/12 changed state to up', timestamp: new Date(now - 30000), type: 'info' },
      { id: '6', content: 'Certificate renewal completed for api-server.internal', timestamp: new Date(now - 45000), type: 'success' },
    ]
  })

  const counterRef = useRef(7)

  useInterval(() => {
    const messages = [
      { content: `SNMP trap received from switch-rack${randInt(1, 20)}`, type: 'info' as const },
      { content: `Metric batch written: ${randInt(800, 1500)} observations`, type: 'success' as const },
      { content: `High memory usage on worker-${String(randInt(1, 12)).padStart(2, '0')} (${randInt(85, 98)}%)`, type: 'warning' as const },
      { content: `New entity approved: host ${randInt(1, 254)}.${randInt(1, 254)}.${randInt(1, 254)}.${randInt(1, 254)}`, type: 'info' as const },
    ]
    const msg = messages[randInt(0, messages.length)]!
    setItems((prev) => [{
      id: String(counterRef.current++),
      content: msg.content,
      timestamp: new Date(),
      type: msg.type,
    }, ...prev].slice(0, 30))
  }, 4000)

  return (
    <DemoCard label="LiveFeed" description="Real-time event feed with auto-scroll, pause/resume, and type-colored borders. New events arrive every 4 seconds.">
      <div className="h-[280px]">
        <LiveFeed items={items} maxVisible={20} />
      </div>
    </DemoCard>
  )
}

function SmartTableDemo() {
  const data = useMemo(() => generateServerData(15), [])
  const columns: ColumnDef<ReturnType<typeof generateServerData>[number]>[] = useMemo(() => [
    { accessorKey: 'hostname', header: 'Hostname' },
    { accessorKey: 'ip', header: 'IP Address' },
    { accessorKey: 'role', header: 'Role' },
    { accessorKey: 'cpu', header: 'CPU %' },
    { accessorKey: 'memory', header: 'Memory %' },
    { accessorKey: 'status', header: 'Status' },
    { accessorKey: 'region', header: 'Region' },
  ], [])

  return (
    <DemoCard label="SmartTable" description="DataTable with auto-generated filter suggestions: outlier detection, top-N, threshold, pattern analysis">
      <SmartTable columns={columns} data={data} searchPlaceholder="Search servers..." density="compact" />
    </DemoCard>
  )
}

function DataTableDemo() {
  const data = useMemo(() => generateServerData(20), [])
  const columns: ColumnDef<ReturnType<typeof generateServerData>[number]>[] = useMemo(() => [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'hostname', header: 'Hostname' },
    { accessorKey: 'ip', header: 'IP Address' },
    { accessorKey: 'cpu', header: 'CPU %', cell: ({ getValue }) => <span className="tabular-nums">{getValue() as number}%</span> },
    { accessorKey: 'memory', header: 'Memory %', cell: ({ getValue }) => <span className="tabular-nums">{getValue() as number}%</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <StatusBadge status={getValue() as string} /> },
    { accessorKey: 'region', header: 'Region' },
    { accessorKey: 'uptime', header: 'Uptime' },
  ], [])

  return (
    <DemoCard label="DataTable" description="Full-featured table with sorting, search, pagination, density control, column visibility, and CSV export">
      <DataTable columns={columns} data={data} searchPlaceholder="Search infrastructure..." defaultPageSize={8} exportFilename="infrastructure" density="comfortable" />
    </DemoCard>
  )
}

function DiffViewerDemo() {
  const oldConfig = `# router-core01.conf
hostname router-core01
interface GigabitEthernet0/0
  ip address 10.0.1.1 255.255.255.0
  no shutdown
interface GigabitEthernet0/1
  ip address 10.0.2.1 255.255.255.0
  no shutdown
router ospf 1
  network 10.0.1.0 0.0.0.255 area 0
  network 10.0.2.0 0.0.0.255 area 0
line vty 0 4
  transport input ssh`

  const newConfig = `# router-core01.conf
hostname router-core01
interface GigabitEthernet0/0
  ip address 10.0.1.1 255.255.255.0
  description "Uplink to spine-01"
  no shutdown
interface GigabitEthernet0/1
  ip address 10.0.2.1 255.255.255.0
  no shutdown
interface GigabitEthernet0/2
  ip address 10.0.3.1 255.255.255.0
  description "New segment for monitoring VLAN"
  no shutdown
router ospf 1
  network 10.0.1.0 0.0.0.255 area 0
  network 10.0.2.0 0.0.0.255 area 0
  network 10.0.3.0 0.0.0.255 area 0
line vty 0 4
  transport input ssh
  access-class 10 in`

  return (
    <DemoCard label="DiffViewer" description="Side-by-side config diff with LCS algorithm, collapsible unchanged sections, and line numbers">
      <DiffViewer oldValue={oldConfig} newValue={newConfig} mode="side-by-side" language="cisco-ios" />
    </DemoCard>
  )
}

function HeatmapCalendarDemo() {
  const data = useMemo(() => generateHeatmapData(), [])
  return <HeatmapCalendar data={data} />
}

function MetricCardsDemo() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        label="Requests/s"
        value={12847}
        format={fmtCompact}
        previousValue={12200}
        sparklineData={generateSparklineData(20, 10000, 15000)}
        status="ok"
      />
      <MetricCard
        label="Avg Latency"
        value={42.3}
        format={(n) => `${n.toFixed(1)} ms`}
        previousValue={44.4}
        trendDirection="down-good"
        sparklineData={generateSparklineData(20, 35, 55)}
        status="ok"
      />
      <MetricCard
        label="Error Rate"
        value={2.8}
        format={(n) => `${n.toFixed(1)}%`}
        previousValue={1.4}
        trendDirection="up-bad"
        sparklineData={[0.5, 0.8, 1.0, 1.2, 1.5, 1.8, 2.0, 2.2, 2.4, 2.5, 2.6, 2.7, 2.8, 2.8, 2.9, 3.0, 2.9, 2.8, 2.7, 2.8]}
        status="warning"
      />
      <MetricCard
        label="Uptime"
        value={99.97}
        format={(n) => `${n.toFixed(2)}%`}
        previousValue={99.97}
        sparklineData={Array(20).fill(99.97)}
        status="ok"
      />
    </div>
  )
}

function ThresholdGaugesDemo() {
  return (
    <DemoCard label="ThresholdGauge" description="Arc gauges with configurable threshold zones">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        <ThresholdGauge value={25} label="Healthy" />
        <ThresholdGauge value={65} label="Moderate" />
        <ThresholdGauge value={85} label="High" />
        <ThresholdGauge value={97} label="Critical" />
      </div>
    </DemoCard>
  )
}

function TimeRangeSelectorDemo() {
  const [rangeVal, setRangeVal] = useState('1h')
  return (
    <div>
      <TimeRangeSelector
        value={rangeVal}
        onChange={(val) => setRangeVal(val)}
      />
      <p className="text-xs text-[hsl(var(--text-tertiary))] mt-2">Selected: {rangeVal}</p>
    </div>
  )
}

function SortableListDemo() {
  type TaskItem = SortableItem & { label: string; priority: string }
  const [items, setItems] = useState<TaskItem[]>([
    { id: '1', label: 'Configure SNMP v3 credentials', priority: 'High' },
    { id: '2', label: 'Deploy host agent to rack-14', priority: 'Medium' },
    { id: '3', label: 'Review discovery candidates', priority: 'Low' },
    { id: '4', label: 'Update firewall rules for monitoring VLAN', priority: 'High' },
    { id: '5', label: 'Schedule certificate renewal', priority: 'Medium' },
  ])

  return (
    <DemoCard label="SortableList" description="Drag-and-drop reorderable list. Grab the handle to reorder. Also supports keyboard reordering.">
      <SortableList
        items={items}
        onReorder={setItems}
        renderItem={(item, _idx, dragHandleProps) => (
          <div className="flex items-center gap-3 py-2 px-3 rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-surface))] mb-2">
            <DragHandle {...dragHandleProps} />
            <span className="flex-1 text-sm text-[hsl(var(--text-primary))]">{item.label}</span>
            <Badge color={item.priority === 'High' ? 'red' : item.priority === 'Medium' ? 'yellow' : 'gray'} size="xs">
              {item.priority}
            </Badge>
          </div>
        )}
      />
    </DemoCard>
  )
}

function StepWizardDemo() {
  const steps: WizardStep[] = useMemo(() => [
    {
      id: 'target',
      title: 'Select Target',
      description: 'Choose what to monitor',
      icon: Server,
      content: (
        <div className="space-y-4 py-4">
          <p className="text-sm text-[hsl(var(--text-secondary))]">Choose the type of target to add for monitoring.</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Network Device', icon: Network },
              { label: 'Server/Host', icon: Server },
              { label: 'Firewall', icon: Shield },
              { label: 'API Endpoint', icon: Globe },
            ].map(({ label, icon: Icon }) => (
              <button key={label} className="flex items-center gap-3 p-3 rounded-xl border border-[hsl(var(--border-subtle))] hover:border-[hsl(var(--brand-primary))] hover:bg-[hsl(var(--brand-primary)/0.05)] transition-colors text-left">
                <Icon className="h-5 w-5 text-[hsl(var(--brand-primary))]" />
                <span className="text-sm font-medium text-[hsl(var(--text-primary))]">{label}</span>
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'credentials',
      title: 'Credentials',
      description: 'Configure access',
      icon: Lock,
      content: (
        <div className="space-y-4 py-4">
          <div>
            <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">IP Address</label>
            <input className="w-full rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-surface))] px-3 py-2 text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))]" placeholder="10.0.1.1" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">SNMP Community</label>
            <input type="password" className="w-full rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-surface))] px-3 py-2 text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))]" placeholder="Enter community string" />
          </div>
        </div>
      ),
    },
    {
      id: 'confirm',
      title: 'Confirm',
      description: 'Review and create',
      icon: Check,
      content: (
        <div className="py-4">
          <p className="text-sm text-[hsl(var(--text-secondary))]">
            Review your configuration and click Complete to begin monitoring.
          </p>
          <div className="mt-4 p-4 rounded-xl bg-[hsl(var(--bg-surface))] border border-[hsl(var(--border-subtle))]">
            <div className="text-xs space-y-2 text-[hsl(var(--text-secondary))]">
              <div><span className="font-medium text-[hsl(var(--text-primary))]">Type:</span> Network Device</div>
              <div><span className="font-medium text-[hsl(var(--text-primary))]">Target:</span> 10.0.1.1</div>
              <div><span className="font-medium text-[hsl(var(--text-primary))]">Protocol:</span> SNMP v3</div>
            </div>
          </div>
        </div>
      ),
    },
  ], [])

  return (
    <StepWizard
      steps={steps}
      onComplete={() => toast.success('Monitoring target created!')}
      showSummary
    />
  )
}

function ColorInputDemo() {
  const [color, setColor] = useState('#6366f1')
  return (
    <ColorInput
      value={color}
      onChange={setColor}
      label="Brand Color"
      presets={['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#06b6d4']}
    />
  )
}

function InfiniteScrollDemo() {
  const [items, setItems] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      name: `Event #${i + 1}`,
      time: `${randInt(1, 59)} min ago`,
    })),
  )
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const loadMore = useCallback(async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setItems((prev) => {
      const next = Array.from({ length: 10 }, (_, i) => ({
        id: prev.length + i,
        name: `Event #${prev.length + i + 1}`,
        time: `${randInt(1, 120)} min ago`,
      }))
      const combined = [...prev, ...next]
      if (combined.length >= 50) setHasMore(false)
      return combined
    })
    setLoading(false)
  }, [])

  return (
    <div className="h-[250px]">
      <InfiniteScroll
        items={items}
        renderItem={(item) => (
          <div className="flex items-center justify-between px-3 py-2 border-b border-[hsl(var(--border-subtle))] text-sm">
            <span className="text-[hsl(var(--text-primary))]">{item.name}</span>
            <span className="text-xs text-[hsl(var(--text-tertiary))] tabular-nums">{item.time}</span>
          </div>
        )}
        loadMore={loadMore}
        hasMore={hasMore}
        isLoading={loading}
        getItemKey={(item) => item.id}
        className="h-full"
      />
    </div>
  )
}

function NotificationStackDemo() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const counterRef = useRef(0)

  const addNotification = useCallback((type: Notification['type']) => {
    const messages: Record<Notification['type'], { title: string; message: string }> = {
      info: { title: 'Discovery Complete', message: 'Found 3 new devices in 10.0.5.0/24' },
      success: { title: 'Deployment Successful', message: 'Host agent deployed to 12 servers' },
      warning: { title: 'Certificate Expiring', message: 'TLS cert for api.internal expires in 7 days' },
      error: { title: 'Connection Lost', message: 'NATS server at 10.0.0.5:4222 is unreachable' },
    }
    const msg = messages[type]
    setNotifications((prev) => [...prev, {
      id: String(counterRef.current++),
      title: msg.title,
      message: msg.message,
      type,
      dismissible: true,
      duration: 5000,
    }])
  }, [])

  const handleDismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  return (
    <DemoCard label="NotificationStack" description="Fixed-position notification cards with auto-dismiss progress bars and slide animations">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => addNotification('info')}>Info</Button>
        <Button size="sm" variant="outline" onClick={() => addNotification('success')}>Success</Button>
        <Button size="sm" variant="outline" onClick={() => addNotification('warning')}>Warning</Button>
        <Button size="sm" variant="outline" onClick={() => addNotification('error')}>Error</Button>
      </div>
      <NotificationStack notifications={notifications} onDismiss={handleDismiss} position="bottom-right" />
    </DemoCard>
  )
}

function SheetDemo() {
  const [open, setOpen] = useState(false)
  return (
    <DemoCard label="Sheet" description="Slide-over panel">
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>Open Sheet</Button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Device Details" description="View and edit device configuration">
        <div className="p-6 space-y-4">
          <FormInput label="Hostname" value="switch-core01.prod" onChange={() => {}} disabled />
          <FormInput label="IP Address" value="10.0.1.1" onChange={() => {}} disabled />
          <div className="flex gap-3">
            <Badge color="green">Online</Badge>
            <Badge color="blue">SNMP v3</Badge>
          </div>
          <Button variant="primary" className="w-full" onClick={() => setOpen(false)}>Save Changes</Button>
        </div>
      </Sheet>
    </DemoCard>
  )
}

function ConfirmDialogDemo() {
  const [open, setOpen] = useState(false)
  return (
    <DemoCard label="ConfirmDialog" description="Confirmation modal">
      <Button size="sm" variant="danger" onClick={() => setOpen(true)}>Delete Entity</Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete Entity"
        description="Are you sure you want to delete switch-core01? This action cannot be undone and will remove all associated metrics and alerts."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => toast.success('Entity deleted')}
      />
    </DemoCard>
  )
}

function SelectDemo() {
  const [val, setVal] = useState('snmpv3')
  return (
    <div>
      <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Protocol</label>
      <Select
        value={val}
        onValueChange={setVal}
        options={[
          { value: 'snmpv2c', label: 'SNMP v2c' },
          { value: 'snmpv3', label: 'SNMP v3' },
          { value: 'rest', label: 'REST API' },
          { value: 'gnmi', label: 'gNMI' },
          { value: 'ssh', label: 'SSH CLI' },
        ]}
      />
    </div>
  )
}

function CheckboxDemo() {
  const [a, setA] = useState(true)
  const [b, setB] = useState(false)
  const [c, setC] = useState(false)
  return (
    <>
      <label className="flex items-center gap-2 text-sm text-[hsl(var(--text-primary))] cursor-pointer">
        <Checkbox checked={a} onChange={() => setA(!a)} />
        Enable SNMP collection
      </label>
      <label className="flex items-center gap-2 text-sm text-[hsl(var(--text-primary))] cursor-pointer">
        <Checkbox checked={b} onChange={() => setB(!b)} />
        Send alert notifications
      </label>
      <label className="flex items-center gap-2 text-sm text-[hsl(var(--text-primary))] cursor-pointer">
        <Checkbox checked={c} indeterminate={!c && !a} onChange={() => setC(!c)} />
        Select all interfaces
      </label>
    </>
  )
}

function ToggleDemo() {
  const [on, setOn] = useState(true)
  return (
    <div className="flex items-center gap-6">
      <ToggleSwitch label="Auto-discovery" enabled={on} onChange={setOn} />
      <ToggleSwitch label="Disabled" enabled={false} onChange={() => {}} disabled />
    </div>
  )
}

function RadioGroupDemo() {
  const [val, setVal] = useState('60')
  return (
    <div>
      <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-2">Collection Interval</label>
      <RadioGroup
        value={val}
        onChange={setVal}
        options={[
          { value: '30', label: '30 seconds' },
          { value: '60', label: '1 minute' },
          { value: '300', label: '5 minutes' },
          { value: '900', label: '15 minutes' },
        ]}
      />
    </div>
  )
}

function SliderDemo() {
  const [val, setVal] = useState(75)
  return (
    <div className="space-y-4">
      <Slider
        label="Alert Threshold"
        value={val}
        onChange={setVal}
        min={0}
        max={100}
        step={1}
      />
      <p className="text-xs text-[hsl(var(--text-tertiary))] tabular-nums">Value: {val}%</p>
    </div>
  )
}

function FilterPillDemo() {
  const [filters, setFilters] = useState<Record<string, boolean>>({
    Critical: true,
    Warning: true,
    Info: false,
    Switches: false,
    Firewalls: true,
    Hosts: false,
  })
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(filters).map(([label, active]) => (
        <FilterPill
          key={label}
          label={label}
          active={active}
          onClick={() => setFilters((f) => ({ ...f, [label]: !f[label] }))}
        />
      ))}
    </div>
  )
}

function FormInputDemo() {
  const [hostname, setHostname] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [port, setPort] = useState('8080')
  const [ip, setIp] = useState('10.0.0')
  return (
    <DemoCard label="FormInput" description="Text inputs with hints and types">
      <div className="space-y-4">
        <FormInput label="Hostname" value={hostname} onChange={setHostname} placeholder="web-01.prod.internal" hint="FQDN of the target host" />
        <FormInput label="API Key" value={apiKey} onChange={setApiKey} type="password" placeholder="Enter API key" required />
        <FormInput label="Port" value={port} onChange={setPort} placeholder="8080" disabled hint="Disabled field" />
        <FormInput label="IP Address" value={ip} onChange={setIp} placeholder="10.0.0.1" />
      </div>
    </DemoCard>
  )
}

function TabsDemo() {
  const [tab1, setTab1] = useState('overview')
  const [tab2, setTab2] = useState('day')
  return (
    <DemoCard label="Tabs" description="Three variants: underline, pills, enclosed">
      <div className="space-y-6">
        <div>
          <Tabs
            variant="underline"
            value={tab1}
            onChange={setTab1}
            tabs={[
              { value: 'overview', label: 'Overview' },
              { value: 'metrics', label: 'Metrics' },
              { value: 'alerts', label: 'Alerts' },
            ]}
          />
          <p className="text-sm text-[hsl(var(--text-secondary))] pt-4">
            {tab1 === 'overview' && 'Overview content with underline tabs'}
            {tab1 === 'metrics' && 'Metrics content'}
            {tab1 === 'alerts' && 'Alerts content with badge count'}
          </p>
        </div>
        <div>
          <Tabs
            variant="pills"
            value={tab2}
            onChange={setTab2}
            tabs={[
              { value: 'day', label: 'Day' },
              { value: 'week', label: 'Week' },
              { value: 'month', label: 'Month' },
            ]}
          />
          <p className="text-sm text-[hsl(var(--text-secondary))] pt-4">
            {tab2 === 'day' && 'Daily view'}
            {tab2 === 'week' && 'Weekly view'}
            {tab2 === 'month' && 'Monthly view'}
          </p>
        </div>
      </div>
    </DemoCard>
  )
}

function AnimatedCounterDemo() {
  const [count, setCount] = useState(42847)
  return (
    <DemoCard label="AnimatedCounter" description="Smooth number transitions with spring physics">
      <div className="flex items-center gap-6">
        <AnimatedCounter value={count} className="text-3xl font-bold text-[hsl(var(--text-primary))] tabular-nums" format={fmtCompact} />
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setCount((c) => c + randInt(100, 1000))}>+</Button>
          <Button size="sm" variant="outline" onClick={() => setCount((c) => Math.max(0, c - randInt(100, 1000)))}>-</Button>
          <Button size="sm" variant="outline" onClick={() => setCount(randInt(10000, 99999))}>Random</Button>
        </div>
      </div>
    </DemoCard>
  )
}
