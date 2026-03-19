'use client'

import React, { useState } from 'react'
import {
  MetricCard, UtilizationBar, Sparkline, ThresholdGauge,
  SeverityTimeline, LogViewer, PortStatusGrid, TimeRangeSelector,
  PipelineStage, UptimeTracker, StatusBadge, StatusPulse, fmtCompact,
} from '../../../src/index'
import type { LogEntry, TimelineEvent, PortStatus, DayStatus, StageInfo } from '../../../src/index'

function Preview({ label, hint, children, wide }: {
  label: string; hint: string; children: React.ReactNode; wide?: boolean
}): React.JSX.Element {
  return (
    <figure className={`preview-card ${wide ? 'col-span-full' : ''}`}>
      <div className="preview-label">
        <span>{label}</span>
        <span className="text-[10px] font-normal normal-case tracking-normal text-[hsl(var(--text-disabled))]">Live</span>
      </div>
      <div className="preview-body">{children}</div>
      <div className="code-snippet font-mono"><code>{hint}</code></div>
    </figure>
  )
}

function rand(min: number, max: number) { return Math.random() * (max - min) + min }
function randInt(min: number, max: number) { return Math.floor(rand(min, max)) }
function spark(len: number, lo: number, hi: number) { return Array.from({ length: len }, () => rand(lo, hi)) }

const logEntries: LogEntry[] = (() => {
  const levels: LogEntry['level'][] = ['info', 'info', 'warn', 'error', 'info', 'debug', 'info']
  const msgs = ['Request completed in 42ms', 'Pool expanded to 25', 'High memory on worker-03 (92%)',
    'Upstream connection refused', 'TLS renewal scheduled', 'Cache hit: 94.2%', 'Deployed to prod']
  const srcs = ['api-server', 'normalizer', 'correlator', 'snmp-collector', 'discovery']
  const now = Date.now()
  return Array.from({ length: 12 }, (_, i) => ({
    time: new Date(now - i * randInt(500, 5000)).toISOString(),
    level: levels[i % levels.length], message: msgs[i % msgs.length], source: srcs[i % srcs.length],
  }))
})()

const timelineEvents: TimelineEvent[] = (() => {
  const sevs: TimelineEvent['severity'][] = ['critical', 'warning', 'info', 'info', 'warning', 'ok', 'critical', 'info']
  const labels = ['Link down ge-0/0/12', 'CPU 92%', 'BGP established', 'Backup done',
    'Memory 85%', 'New device sw-rack07', 'PSU failure', 'Cert expiring 14d']
  const now = Date.now()
  return Array.from({ length: 8 }, (_, i) => ({
    time: new Date(now - i * 600_000).toISOString(), severity: sevs[i % sevs.length],
    label: labels[i % labels.length], detail: `Source: node-${i}`,
  }))
})()

const ports: PortStatus[] = (() => {
  const states: PortStatus['status'][] = ['up', 'up', 'up', 'down', 'up', 'up', 'disabled', 'up']
  return Array.from({ length: 48 }, (_, i) => ({
    id: `${i + 1}`, label: `Gi0/${i + 1}`, status: states[i % states.length],
    speed: states[i % states.length] === 'up' ? (i % 3 === 0 ? '10G' : '1G') : undefined,
  }))
})()

const uptimeDays: DayStatus[] = (() => {
  const sts: DayStatus['status'][] = ['ok', 'ok', 'ok', 'ok', 'ok', 'degraded', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'outage', 'ok', 'ok']
  const now = new Date()
  return Array.from({ length: 90 }, (_, i) => {
    const d = new Date(now); d.setDate(d.getDate() - (89 - i))
    const s = sts[i % sts.length]
    return { date: d.toISOString().slice(0, 10), status: s, uptime: s === 'ok' ? 100 : s === 'degraded' ? 98.5 : 0 }
  })
})()

const stages: StageInfo[] = [
  { name: 'Collect', status: 'active', metric: { label: 'Rate', value: '14.2K/s' } },
  { name: 'Normalize', status: 'active', metric: { label: 'Rate', value: '14.1K/s' } },
  { name: 'Correlate', status: 'active', metric: { label: 'Rate', value: '13.8K/s' } },
  { name: 'Store', status: 'active', metric: { label: 'Rate', value: '13.8K/s' } },
  { name: 'Alert Eval', status: 'error', metric: { label: 'Lag', value: '45ms' } },
]

function TimeRangeSelectorDemo() {
  const [v, setV] = useState('1h')
  return (
    <div>
      <TimeRangeSelector value={v} onChange={setV} />
      <p className="text-xs text-[hsl(var(--text-tertiary))] mt-2">Selected: {v}</p>
    </div>
  )
}

export default function MonitoringSection() {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[hsl(var(--text-primary))] tracking-tight">Monitoring</h2>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Production-grade monitoring components for NOC dashboards.</p>
      </div>

      <div className="demo-grid">
        <Preview label="MetricCard" hint='<MetricCard label="Req/s" value={n} sparklineData={data} />' wide>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Requests/s" value={12847} format={fmtCompact} previousValue={12200} sparklineData={spark(20, 10000, 15000)} status="ok" />
            <MetricCard label="Avg Latency" value={42.3} format={(n) => `${n.toFixed(1)} ms`} previousValue={44.4} trendDirection="down-good" sparklineData={spark(20, 35, 55)} status="ok" />
            <MetricCard label="Error Rate" value={2.8} format={(n) => `${n.toFixed(1)}%`} previousValue={1.4} trendDirection="up-bad" sparklineData={[0.5, 0.8, 1.2, 1.5, 2.0, 2.4, 2.6, 2.8, 2.9, 3.0, 2.9, 2.8]} status="warning" />
            <MetricCard label="Uptime" value={99.97} format={(n) => `${n.toFixed(2)}%`} previousValue={99.97} sparklineData={Array(20).fill(99.97)} status="ok" />
          </div>
        </Preview>

        <Preview label="ThresholdGauge" hint='<ThresholdGauge value={85} label="High" />' wide>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <ThresholdGauge value={25} label="Healthy" />
            <ThresholdGauge value={65} label="Moderate" />
            <ThresholdGauge value={85} label="High" />
            <ThresholdGauge value={97} label="Critical" />
          </div>
        </Preview>

        <Preview label="UtilizationBar" hint='<UtilizationBar label="CPU" value={72} showValue />'>
          <div className="space-y-3">
            <UtilizationBar label="CPU" value={72} showValue />
            <UtilizationBar label="Memory" value={88} showValue />
            <UtilizationBar label="Disk" value={45} showValue />
            <UtilizationBar label="Network" value={31} showValue />
          </div>
        </Preview>

        <Preview label="Sparkline" hint='<Sparkline data={points} height={40} color="..." />'>
          <div className="space-y-4">
            <div>
              <span className="text-xs text-[hsl(var(--text-secondary))] mb-1 block">Requests/s</span>
              <Sparkline data={spark(30, 800, 1200)} height={40} color="hsl(var(--brand-primary))" />
            </div>
            <div>
              <span className="text-xs text-[hsl(var(--text-secondary))] mb-1 block">Latency (spiky)</span>
              <Sparkline data={[12, 15, 45, 12, 60, 14, 80, 13, 50, 90, 12, 55, 14, 12, 11]} height={40} color="hsl(var(--status-warning))" />
            </div>
          </div>
        </Preview>

        <Preview label="TimeRangeSelector" hint='<TimeRangeSelector value={range} onChange={set} />'>
          <TimeRangeSelectorDemo />
        </Preview>

        <Preview label="StatusBadge & StatusPulse" hint='<StatusBadge status="online" />'>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {(['online', 'offline', 'degraded', 'maintenance', 'unknown', 'healthy', 'warning', 'critical'] as const).map((s) => (
                <StatusBadge key={s} status={s} />
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              {(['online', 'degraded', 'offline', 'unknown'] as const).map((s) => (
                <div key={s} className="flex items-center gap-2"><StatusPulse status={s} /></div>
              ))}
            </div>
          </div>
        </Preview>

        <Preview label="UptimeTracker" hint='<UptimeTracker days={days} />' wide>
          <UptimeTracker days={uptimeDays} />
        </Preview>

        <Preview label="PortStatusGrid" hint='<PortStatusGrid ports={ports} columns={24} />' wide>
          <PortStatusGrid ports={ports} columns={24} />
        </Preview>

        <Preview label="PipelineStage" hint='<PipelineStage stages={stages} />' wide>
          <PipelineStage stages={stages} />
        </Preview>

        <Preview label="SeverityTimeline" hint='<SeverityTimeline events={events} maxVisible={8} />' wide>
          <SeverityTimeline events={timelineEvents} maxVisible={8} />
        </Preview>

        <Preview label="LogViewer" hint='<LogViewer entries={logs} maxHeight={300} />' wide>
          <LogViewer entries={logEntries} maxHeight={300} />
        </Preview>
      </div>
    </>
  )
}
