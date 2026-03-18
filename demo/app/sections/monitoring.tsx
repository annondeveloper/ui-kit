'use client'

import React, { useState } from 'react'
import {
  MetricCard, UtilizationBar, Sparkline, ThresholdGauge,
  SeverityTimeline, LogViewer, PortStatusGrid, TimeRangeSelector,
  PipelineStage, UptimeTracker, StatusBadge, StatusPulse,
  Card, CardHeader, CardTitle, CardDescription, CardContent,
  fmtCompact,
} from '../../../src/index'
import type { LogEntry, TimelineEvent, PortStatus, DayStatus, StageInfo } from '../../../src/index'

function rand(min: number, max: number) { return Math.random() * (max - min) + min }
function randInt(min: number, max: number) { return Math.floor(rand(min, max)) }

function DemoCard({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle className="text-base">{label}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function generateSparklineData(length: number, min: number, max: number): number[] {
  return Array.from({ length }, () => rand(min, max))
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
    'Link down on ge-0/0/12', 'CPU threshold exceeded (92%)', 'BGP session established',
    'Configuration backup completed', 'Memory usage above 85%', 'SNMP trap received: linkUp',
    'Power supply failure detected', 'New device discovered: sw-rack07',
    'Certificate expiring in 14 days', 'Firmware update available for FI-A',
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
    return { date: d.toISOString().slice(0, 10), status: s, uptime: s === 'ok' ? 100 : s === 'degraded' ? 98.5 : 0 }
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

function MetricCardsDemo() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard label="Requests/s" value={12847} format={fmtCompact} previousValue={12200} sparklineData={generateSparklineData(20, 10000, 15000)} status="ok" />
      <MetricCard label="Avg Latency" value={42.3} format={(n) => `${n.toFixed(1)} ms`} previousValue={44.4} trendDirection="down-good" sparklineData={generateSparklineData(20, 35, 55)} status="ok" />
      <MetricCard label="Error Rate" value={2.8} format={(n) => `${n.toFixed(1)}%`} previousValue={1.4} trendDirection="up-bad" sparklineData={[0.5, 0.8, 1.0, 1.2, 1.5, 1.8, 2.0, 2.2, 2.4, 2.5, 2.6, 2.7, 2.8, 2.8, 2.9, 3.0, 2.9, 2.8, 2.7, 2.8]} status="warning" />
      <MetricCard label="Uptime" value={99.97} format={(n) => `${n.toFixed(2)}%`} previousValue={99.97} sparklineData={Array(20).fill(99.97)} status="ok" />
    </div>
  )
}

function TimeRangeSelectorDemo() {
  const [rangeVal, setRangeVal] = useState('1h')
  return (
    <div>
      <TimeRangeSelector value={rangeVal} onChange={(val) => setRangeVal(val)} />
      <p className="text-xs text-[hsl(var(--text-tertiary))] mt-2">Selected: {rangeVal}</p>
    </div>
  )
}

export default function MonitoringSection() {
  return (
    <div className="section-enter">
      <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-1">Monitoring Dashboard</h2>
      <p className="text-sm text-[hsl(var(--text-secondary))] mb-8">Production-grade monitoring components for NOC dashboards, infrastructure visibility, and incident management.</p>
      <div className="space-y-8">
        <MetricCardsDemo />
        <DemoCard label="ThresholdGauge" description="Arc gauges with configurable threshold zones">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <ThresholdGauge value={25} label="Healthy" />
            <ThresholdGauge value={65} label="Moderate" />
            <ThresholdGauge value={85} label="High" />
            <ThresholdGauge value={97} label="Critical" />
          </div>
        </DemoCard>

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
      </div>
    </div>
  )
}
