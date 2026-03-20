import { useState, useCallback, useEffect, useRef } from 'react'
import { Preview, useInViewTimer } from '../components/Preview.tsx'
import {
  MetricCard, ThresholdGauge, UtilizationBar, Sparkline,
  UptimeTracker, PortStatusGrid, PipelineStage, SeverityTimeline,
  TimeRangeSelector, LogViewer,
  type UptimeDay, type PortStatus, type Stage, type TimelineEvent, type LogLine,
} from '@ui/index'
import { generateTheme, themeToCSS } from '@ui/index'

function genSparkline(base: number, variance: number, len = 12): number[] {
  return Array.from({ length: len }, () => base + (Math.random() - 0.5) * variance * 2)
}

const uptimeDays: UptimeDay[] = Array.from({ length: 90 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - 89 + i)
  const r = Math.random()
  return { date: d.toISOString().slice(0, 10), status: r > 0.97 ? 'down' as const : r > 0.92 ? 'degraded' as const : 'up' as const, uptime: r > 0.97 ? 0.85 : r > 0.92 ? 0.95 : 0.999 }
})

const ports: PortStatus[] = Array.from({ length: 48 }, (_, i) => ({
  port: i + 1,
  label: `Gi1/0/${i + 1}`,
  status: (Math.random() > 0.85 ? 'critical' : Math.random() > 0.95 ? 'warning' : 'ok') as PortStatus['status'],
}))

const stages: Stage[] = [
  { id: 'collect', label: 'Collect', status: 'active' },
  { id: 'normalize', label: 'Normalize', status: 'active' },
  { id: 'correlate', label: 'Correlate', status: 'active' },
  { id: 'evaluate', label: 'Evaluate', status: 'idle' },
  { id: 'store', label: 'Store', status: 'active' },
]

const events: TimelineEvent[] = Array.from({ length: 10 }, (_, i) => {
  const d = new Date(); d.setMinutes(d.getMinutes() - i * 15)
  const severities: TimelineEvent['severity'][] = ['critical', 'warning', 'info', 'ok']
  return {
    id: `evt-${i}`,
    timestamp: d,
    title: `Event ${10 - i}: ${['Link down', 'High CPU', 'Config change', 'Recovery'][i % 4]}`,
    severity: severities[i % 4],
  }
})

const logs: LogLine[] = Array.from({ length: 15 }, (_, i) => {
  const d = new Date(); d.setSeconds(d.getSeconds() - i * 30)
  const levels: LogLine['level'][] = ['error', 'warn', 'info', 'debug', 'info']
  const msgs = ['Connection timeout to 10.0.1.5:161', 'SNMP walk completed in 2.3s', 'Rate calc delta: ifHCInOctets +847293', 'Entity correlated: uuid=a8f3...', 'Alert rule "CPU > 90%" matched on core-sw-01']
  return { id: i, timestamp: d, level: levels[i % 5], message: msgs[i % 5] }
})

export function MonitorPage() {
  const [sparkData, setSparkData] = useState(genSparkline(65, 15))

  // Gauge animation on viewport enter
  const [gaugeValues, setGaugeValues] = useState([0, 0, 0, 0])
  const gaugeAnimated = useRef(false)
  const gaugeRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = gaugeRef.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !gaugeAnimated.current) {
        gaugeAnimated.current = true
        setTimeout(() => setGaugeValues([67, 78, 45, 92]), 200)
      }
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Util bar animation
  const [utilValues, setUtilValues] = useState([0, 0, 0, 0])
  const utilAnimated = useRef(false)
  const utilRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = utilRef.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !utilAnimated.current) {
        utilAnimated.current = true
        setTimeout(() => setUtilValues([67, 78, 45, 92]), 200)
      }
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Theme generator demo
  const [brandColor, setBrandColor] = useState('#6366f1')
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark')
  const generatedTheme = generateTheme(brandColor, themeMode)
  const themeCSS = themeToCSS(generatedTheme, '.theme-demo')

  const tick = useCallback(() => {
    setSparkData(p => [...p.slice(1), p[p.length - 1] + Math.floor(Math.random() * 10 - 4)])
  }, [])

  const tickRef = useInViewTimer(2000, tick)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-1">Monitoring</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))]">13 components for dashboards, metrics, and infrastructure visualization</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger" ref={tickRef}>
        <Preview label="MetricCard" description="Dashboard stat tiles" glow="monitor" wide code={`<MetricCard title="CPU" value="67%" status="warning" />`}>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard title="Requests/sec" value="12,847" change={{ value: 2.4, period: '1h' }} trend="up" status="ok" sparkline={sparkData} />
            <MetricCard title="CPU Usage" value="67%" change={{ value: -1.2 }} trend="up" status="warning" />
            <MetricCard title="Memory" value="4.2 GB" change={{ value: 0.3 }} trend="up" status="ok" />
            <MetricCard title="Errors" value="23" change={{ value: -5 }} trend="down" status="ok" />
          </div>
        </Preview>

        <Preview label="ThresholdGauge" description="Animate to target on viewport enter" glow="monitor" code={`<ThresholdGauge value={72} label="CPU" />`}>
          <div ref={gaugeRef} className="flex flex-wrap justify-around gap-2">
            <ThresholdGauge value={gaugeValues[0]} label="CPU" size={100} />
            <ThresholdGauge value={gaugeValues[1]} label="Memory" size={100} />
            <ThresholdGauge value={gaugeValues[2]} label="Disk" size={100} />
            <ThresholdGauge value={gaugeValues[3]} label="Network" size={100} />
          </div>
        </Preview>

        <Preview label="UtilizationBar" description="Animated resource utilization fills" glow="monitor" code={`<UtilizationBar value={72} label="CPU" />`}>
          <div ref={utilRef} className="space-y-3">
            <UtilizationBar value={utilValues[0]} label="CPU" />
            <UtilizationBar value={utilValues[1]} label="Memory" />
            <UtilizationBar value={utilValues[2]} label="Disk I/O" />
            <UtilizationBar value={utilValues[3]} label="Network" />
          </div>
        </Preview>

        <Preview label="Sparkline" description="Inline SVG micro-charts" glow="monitor" code={`<Sparkline data={[40, 42, 38, 45, 50]} width={120} height={28} />`}>
          <div className="space-y-4">
            <div className="flex items-center gap-3"><span className="text-xs text-[hsl(var(--text-secondary))] w-20">Trending up</span><Sparkline data={genSparkline(40, 5).map((v, i) => v + i * 2)} width={200} height={32} color="hsl(var(--status-ok))" /></div>
            <div className="flex items-center gap-3"><span className="text-xs text-[hsl(var(--text-secondary))] w-20">Volatile</span><Sparkline data={genSparkline(50, 25)} width={200} height={32} color="hsl(var(--status-warning))" /></div>
            <div className="flex items-center gap-3"><span className="text-xs text-[hsl(var(--text-secondary))] w-20">Stable</span><Sparkline data={genSparkline(60, 3)} width={200} height={32} color="hsl(var(--brand-primary))" /></div>
          </div>
        </Preview>

        <Preview label="UptimeTracker" description="90-day uptime strip" glow="monitor" code={`<UptimeTracker days={days} />`}>
          <UptimeTracker days={uptimeDays} />
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

        <Preview label="TimeRangeSelector" description="Time range picker with presets" glow="monitor" code={`<TimeRangeSelector onChange={setRange} />`}>
          <TimeRangeSelector onChange={() => {}} />
        </Preview>

        <Preview label="generateTheme" description="Generate a full theme from one color" glow="monitor" wide code={`import { generateTheme, themeToCSS } from '@ui/index'\nconst theme = generateTheme('#6366f1', 'dark')\nconst css = themeToCSS(theme, ':root')`}>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="text-xs text-[hsl(var(--text-tertiary))] block mb-1">Brand Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={e => setBrandColor(e.target.value)}
                    className="w-10 h-8 rounded border border-[hsl(var(--border-default))] cursor-pointer"
                  />
                  <span className="text-xs font-mono text-[hsl(var(--text-secondary))]">{brandColor}</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-[hsl(var(--text-tertiary))] block mb-1">Mode</label>
                <div className="flex gap-1">
                  {(['dark', 'light'] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => setThemeMode(m)}
                      className={`text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                        themeMode === m ? 'bg-[hsl(var(--brand-primary))]/15 text-[hsl(var(--brand-primary))] font-medium' : 'text-[hsl(var(--text-tertiary))] hover:bg-[hsl(var(--bg-elevated))]'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* Live preview swatch */}
            <style>{themeCSS}</style>
            <div className="theme-demo theme-preview-panel rounded-xl border border-current/10 p-4" style={{
              background: `hsl(${generatedTheme['bg-surface']})`,
              color: `hsl(${generatedTheme['text-primary']})`,
              borderColor: `hsl(${generatedTheme['border-default']})`,
            }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full" style={{ background: `hsl(${generatedTheme['brand-primary']})` }} />
                <span className="text-sm font-semibold">Preview Panel</span>
                <span className="text-xs ml-auto" style={{ color: `hsl(${generatedTheme['text-tertiary']})` }}>Generated theme</span>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {(['bg-base', 'bg-surface', 'bg-elevated', 'bg-overlay'] as const).map(k => (
                  <div key={k} className="rounded-lg p-2 text-center" style={{ background: `hsl(${generatedTheme[k]})`, border: `1px solid hsl(${generatedTheme['border-subtle']})` }}>
                    <span className="text-[9px] font-mono" style={{ color: `hsl(${generatedTheme['text-tertiary']})` }}>{k.replace('bg-', '')}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                {(['status-ok', 'status-warning', 'status-critical', 'brand-primary'] as const).map(k => (
                  <div key={k} className="h-2 flex-1 rounded-full" style={{ background: `hsl(${generatedTheme[k]})` }} />
                ))}
              </div>
            </div>
          </div>
        </Preview>

        <Preview label="LogViewer" description="Structured log viewer" glow="monitor" wide code={`<LogViewer lines={logs} maxLines={200} autoTail />`}>
          <LogViewer lines={logs} maxLines={200} autoTail />
        </Preview>
      </div>
    </div>
  )
}
export default MonitorPage
