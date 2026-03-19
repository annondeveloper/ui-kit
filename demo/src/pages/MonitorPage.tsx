import { useState, useCallback } from 'react'
import { Preview, useInViewTimer } from '../components/Preview.tsx'
import {
  MetricCard, ThresholdGauge, UtilizationBar, Sparkline,
  UptimeTracker, PortStatusGrid, PipelineStage, SeverityTimeline,
  TimeRangeSelector, StatusBadge, StatusPulse, LogViewer,
  type DayStatus, type PortStatus, type StageInfo, type TimelineEvent, type LogEntry,
} from '@ui/index'
import { Server, Cpu, HardDrive, Wifi } from 'lucide-react'

function genSparkline(base: number, variance: number, len = 12): number[] {
  return Array.from({ length: len }, () => base + (Math.random() - 0.5) * variance * 2)
}

const uptimeDays: DayStatus[] = Array.from({ length: 90 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - 89 + i)
  const r = Math.random()
  return { date: d.toISOString().slice(0, 10), status: r > 0.97 ? 'outage' : r > 0.92 ? 'degraded' : 'ok', uptime: r > 0.97 ? 85 : r > 0.92 ? 95 : 99.9 }
})

const ports: PortStatus[] = Array.from({ length: 48 }, (_, i) => ({
  id: `p${i}`, label: `Gi1/0/${i + 1}`,
  status: Math.random() > 0.85 ? 'down' : Math.random() > 0.95 ? 'error' : 'up',
  speed: Math.random() > 0.5 ? '10G' : '1G',
  utilization: Math.floor(Math.random() * 100),
}))

const stages: StageInfo[] = [
  { name: 'Collect', status: 'active', metric: { label: 'rate', value: '1.2k/s' }, icon: Wifi },
  { name: 'Normalize', status: 'active', metric: { label: 'lag', value: '12ms' } },
  { name: 'Correlate', status: 'active', metric: { label: 'queue', value: '847' } },
  { name: 'Evaluate', status: 'idle', metric: { label: 'rules', value: '24' } },
  { name: 'Store', status: 'active', metric: { label: 'write', value: '980/s' } },
]

const events: TimelineEvent[] = Array.from({ length: 10 }, (_, i) => {
  const d = new Date(); d.setMinutes(d.getMinutes() - i * 15)
  const severities: TimelineEvent['severity'][] = ['critical', 'warning', 'info', 'ok']
  return { time: d.toISOString(), label: `Event ${10 - i}: ${['Link down', 'High CPU', 'Config change', 'Recovery'][i % 4]}`, severity: severities[i % 4] }
})

const logs: LogEntry[] = Array.from({ length: 15 }, (_, i) => {
  const d = new Date(); d.setSeconds(d.getSeconds() - i * 30)
  const levels: LogEntry['level'][] = ['error', 'warn', 'info', 'debug', 'info']
  const msgs = ['Connection timeout to 10.0.1.5:161', 'SNMP walk completed in 2.3s', 'Rate calc delta: ifHCInOctets +847293', 'Entity correlated: uuid=a8f3...', 'Alert rule "CPU > 90%" matched on core-sw-01']
  return { time: d.toISOString(), level: levels[i % 5], message: msgs[i % 5], source: ['snmp-collector', 'normalizer', 'correlator'][i % 3] }
})

export function MonitorPage() {
  const [metrics, setMetrics] = useState({ rps: 12847, cpu: 67, mem: 4.2, err: 23 })
  const [sparkData, setSparkData] = useState(genSparkline(65, 15))
  const [timeRange, setTimeRange] = useState('24h')

  const tick = useCallback(() => {
    setMetrics(p => ({
      rps: p.rps + Math.floor(Math.random() * 200 - 80),
      cpu: Math.min(100, Math.max(10, p.cpu + (Math.random() - 0.5) * 8)),
      mem: Math.max(0.5, p.mem + (Math.random() - 0.5) * 0.3),
      err: Math.max(0, p.err + Math.floor(Math.random() * 6 - 3)),
    }))
    setSparkData(p => [...p.slice(1), p[p.length - 1] + Math.floor(Math.random() * 10 - 4)])
  }, [])

  const tickRef = useInViewTimer(2000, tick)

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-1">Monitoring</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))]">12 components for dashboards, metrics, and infrastructure visualization</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger" ref={tickRef}>
        <Preview label="MetricCard" description="Dashboard stat tiles with sparklines" glow="monitor" wide code={`<MetricCard label="Requests/sec" value={12847} sparklineData={data} status="ok" />`}>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard label="Requests/sec" value={metrics.rps} previousValue={12600} trendDirection="up-good" status="ok" sparklineData={sparkData} icon={Server} />
            <MetricCard label="CPU Usage" value={metrics.cpu} format={n => `${n.toFixed(0)}%`} previousValue={62} trendDirection="up-bad" status={metrics.cpu > 80 ? 'critical' : metrics.cpu > 60 ? 'warning' : 'ok'} icon={Cpu} />
            <MetricCard label="Memory" value={metrics.mem} format={n => `${n.toFixed(1)} GB`} previousValue={4.0} trendDirection="up-bad" status="ok" icon={HardDrive} />
            <MetricCard label="Errors" value={metrics.err} previousValue={28} trendDirection="down-good" status={metrics.err > 20 ? 'warning' : 'ok'} />
          </div>
        </Preview>

        <Preview label="ThresholdGauge" description="SVG gauges with threshold zones" glow="monitor" code={`<ThresholdGauge value={72} label="CPU" />`}>
          <div className="flex justify-around">
            <ThresholdGauge value={metrics.cpu} label="CPU" size={100} />
            <ThresholdGauge value={78} label="Memory" size={100} />
            <ThresholdGauge value={45} label="Disk" size={100} />
            <ThresholdGauge value={92} label="Network" size={100} />
          </div>
        </Preview>

        <Preview label="UtilizationBar" description="Resource utilization with thresholds" glow="monitor" code={`<UtilizationBar value={72} label="CPU" />`}>
          <div className="space-y-3">
            <UtilizationBar value={metrics.cpu} label="CPU" />
            <UtilizationBar value={78} label="Memory" />
            <UtilizationBar value={45} label="Disk I/O" />
            <UtilizationBar value={92} label="Network" thresholds={{ warning: 60, critical: 85 }} />
          </div>
        </Preview>

        <Preview label="Sparkline" description="Inline SVG micro-charts" glow="monitor" code={`<Sparkline data={[40, 42, 38, 45, 50]} width={120} height={28} />`}>
          <div className="space-y-4">
            <div className="flex items-center gap-3"><span className="text-xs text-[hsl(var(--text-secondary))] w-20">Trending up</span><Sparkline data={genSparkline(40, 5).map((v, i) => v + i * 2)} width={200} height={32} color="hsl(var(--status-ok))" fillOpacity={0.15} showDots /></div>
            <div className="flex items-center gap-3"><span className="text-xs text-[hsl(var(--text-secondary))] w-20">Volatile</span><Sparkline data={genSparkline(50, 25)} width={200} height={32} color="hsl(var(--status-warning))" fillOpacity={0.15} showDots /></div>
            <div className="flex items-center gap-3"><span className="text-xs text-[hsl(var(--text-secondary))] w-20">Stable</span><Sparkline data={genSparkline(60, 3)} width={200} height={32} color="hsl(var(--brand-primary))" fillOpacity={0.15} showDots /></div>
          </div>
        </Preview>

        <Preview label="UptimeTracker" description="90-day uptime strip" glow="monitor" code={`<UptimeTracker days={days} showPercentage label="API Gateway" />`}>
          <UptimeTracker days={uptimeDays} showPercentage label="API Gateway" />
        </Preview>

        <Preview label="PortStatusGrid" description="48-port switch visualization" glow="monitor" code={`<PortStatusGrid ports={ports} columns={12} />`}>
          <PortStatusGrid ports={ports} columns={12} size="sm" />
        </Preview>

        <Preview label="PipelineStage" description="Data processing pipeline" glow="monitor" wide code={`<PipelineStage stages={stages} />`}>
          <PipelineStage stages={stages} />
        </Preview>

        <Preview label="SeverityTimeline" description="Event timeline with severity dots" glow="monitor" code={`<SeverityTimeline events={events} />`}>
          <SeverityTimeline events={events} maxVisible={6} />
        </Preview>

        <Preview label="TimeRangeSelector" description="Time range picker" glow="monitor" code={`<TimeRangeSelector value="24h" onChange={setValue} />`}>
          <TimeRangeSelector value={timeRange} onChange={v => setTimeRange(v)} />
        </Preview>

        <Preview label="StatusBadge" description="All 10 status variants" glow="monitor" code={`<StatusBadge status="active" />\n<StatusBadge status="critical" pulse />`}>
          <div className="flex flex-wrap gap-2">
            {['ok', 'active', 'warning', 'critical', 'unknown', 'maintenance', 'stale', 'inactive', 'decommissioned', 'pending'].map(s => (
              <StatusBadge key={s} status={s} pulse={s === 'critical'} />
            ))}
          </div>
        </Preview>

        <Preview label="StatusPulse" description="Animated status dots" glow="monitor" code={`<StatusPulse status="online" showLabel />`}>
          <div className="flex gap-6">
            {['online', 'degraded', 'offline', 'unknown'].map(s => (
              <StatusPulse key={s} status={s} label />
            ))}
          </div>
        </Preview>

        <Preview label="LogViewer" description="Structured log viewer with search" glow="monitor" wide code={`<LogViewer entries={logs} maxHeight={200} autoScroll />`}>
          <LogViewer entries={logs} maxHeight={200} autoScroll showTimestamps showLevel />
        </Preview>
      </div>
    </div>
  )
}
