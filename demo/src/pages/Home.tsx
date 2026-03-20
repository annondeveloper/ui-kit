import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Copy, Check, Activity, Gauge, Database, MousePointerClick, Layers, PenLine, Layout } from 'lucide-react'
import {
  MetricCard, Sparkline, StatusBadge, Badge, AnimatedCounter,
  DensityProvider, TypingIndicator, ThresholdGauge, UtilizationBar,
  StatusPulse, Button, FilterPill,
  type Density,
} from '@ui/index'

const sparkBase = [40, 42, 38, 45, 50, 48, 52, 55, 53, 58, 60, 62]

const categories = [
  { path: '/core',        label: 'Core',            icon: Layers,            count: 14, desc: 'Buttons, badges, cards, tabs, avatars, progress', preview: 'core' },
  { path: '/forms',       label: 'Forms',           icon: PenLine,           count: 9,  desc: 'Inputs, selects, sliders, combobox', preview: 'forms' },
  { path: '/overlays',    label: 'Overlays',        icon: Layout,            count: 9,  desc: 'Dialogs, sheets, tooltips, toasts, menus', preview: 'core' },
  { path: '/data',        label: 'Data',            icon: Database,          count: 9,  desc: 'Tables, diffs, heatmaps, tree view', preview: 'data' },
  { path: '/monitor',     label: 'Monitoring',      icon: Gauge,             count: 13, desc: 'Gauges, sparklines, grids, theme generator', preview: 'monitor' },
  { path: '/ai',          label: 'AI & Realtime',   icon: Activity,          count: 5,  desc: 'Streaming, typing, confidence, live feed', preview: 'ai' },
  { path: '/interactive', label: 'Interactive',      icon: MousePointerClick, count: 9,  desc: 'Drag, sort, kanban, density, scroll reveal', preview: 'interactive' },
  { path: '/layout',      label: 'Layout',          icon: Layout,            count: 6,  desc: 'Skeletons, file upload, infinite scroll', preview: 'layout' },
]

function MiniPreview({ type }: { type: string }) {
  switch (type) {
    case 'ai':
      return <TypingIndicator variant="dots" label="AI thinking" />
    case 'monitor':
      return (
        <div className="flex items-center gap-2">
          <StatusPulse status="ok" />
          <Sparkline data={[30, 35, 32, 40, 42, 38, 45]} width={60} height={16} color="hsl(var(--status-ok))" />
        </div>
      )
    case 'data':
      return (
        <div className="flex gap-1">
          {[65, 82, 45, 90, 30].map((v, i) => (
            <div key={i} className="w-2 rounded-sm bg-[hsl(var(--brand-primary))]" style={{ height: `${v * 0.2}px`, opacity: 0.3 + v / 140 }} />
          ))}
        </div>
      )
    case 'interactive':
      return (
        <div className="flex gap-1.5">
          <FilterPill label="All" active onClick={() => {}} />
          <FilterPill label="Active" active={false} onClick={() => {}} />
        </div>
      )
    case 'core':
      return (
        <div className="flex gap-1">
          <Badge color="green" size="xs">Active</Badge>
          <Badge color="red" size="xs">Alert</Badge>
        </div>
      )
    case 'forms':
      return (
        <div className="w-full h-2 rounded bg-[hsl(var(--bg-elevated))]">
          <div className="h-full w-3/5 rounded bg-[hsl(var(--brand-primary))]" />
        </div>
      )
    case 'layout':
      return (
        <div className="space-y-1">
          <div className="h-1.5 w-full rounded bg-[hsl(var(--bg-elevated))] animate-pulse" />
          <div className="h-1.5 w-3/4 rounded bg-[hsl(var(--bg-elevated))] animate-pulse" />
        </div>
      )
    default:
      return null
  }
}

export function Home() {
  const [copied, setCopied] = useState(false)
  const [rps, setRps] = useState(12847)
  const [latency, setLatency] = useState(2.4)
  const [uptime, setUptime] = useState(99.97)
  const [errors, setErrors] = useState(5)
  const [sparkData, setSparkData] = useState(sparkBase)
  const [density, setDensity] = useState<Density>('comfortable')
  const heroRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Only tick when hero is in viewport
  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!timerRef.current) {
            timerRef.current = setInterval(() => {
              setRps(p => p + Math.floor(Math.random() * 200 - 80))
              setLatency(p => Math.max(0.5, p + (Math.random() - 0.5) * 0.4))
              setUptime(p => Math.min(100, Math.max(99.8, p + (Math.random() - 0.5) * 0.02)))
              setErrors(p => Math.max(0, p + Math.floor(Math.random() * 4 - 2)))
              setSparkData(p => [...p.slice(1), p[p.length - 1] + Math.floor(Math.random() * 10 - 4)])
            }, 2000)
          }
        } else if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
      },
      { threshold: 0.1 },
    )
    obs.observe(el)
    return () => {
      obs.disconnect()
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const handleCopy = useCallback(() => {
    void navigator.clipboard.writeText('npm install @annondeveloper/ui-kit').then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Hero */}
      <div className="text-center mb-8 sm:mb-12 stagger">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(var(--brand-primary))]/10 text-[hsl(var(--brand-primary))] text-xs font-medium mb-6">
          <span className="size-1.5 rounded-full bg-[hsl(var(--brand-primary))] animate-pulse" />
          v2 — 62 components, zero deps, Aurora Fluid design
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[hsl(var(--text-primary))] tracking-tight mb-4">
          Build dashboards<br className="hidden sm:block" /> that <span className="text-[hsl(var(--brand-primary))]">operate.</span>
        </h1>
        <p className="text-base sm:text-lg text-[hsl(var(--text-secondary))] max-w-xl mx-auto mb-6">
          Production-grade React components for monitoring, observability, and infrastructure management.
        </p>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl bg-[hsl(var(--bg-surface))] border border-[hsl(var(--border-default))] hover:border-[hsl(var(--brand-primary))] transition-colors text-sm font-mono text-[hsl(var(--text-secondary))] cursor-pointer"
        >
          <span className="hidden sm:inline">npm install @annondeveloper/ui-kit</span>
          <span className="sm:hidden">npm i @annondeveloper/ui-kit</span>
          {copied ? <Check className="size-4 text-[hsl(var(--status-ok))]" /> : <Copy className="size-4" />}
        </button>
      </div>

      {/* Live mini dashboard hero */}
      <div ref={heroRef} className="mb-10 sm:mb-16 rounded-2xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-surface))] p-4 sm:p-6 shadow-lg stagger">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="size-2 rounded-full bg-[hsl(var(--status-ok))] animate-pulse" />
          <span className="text-xs font-medium text-[hsl(var(--text-secondary))]">Live dashboard preview</span>
          <div className="ml-auto flex gap-1.5 items-center">
            <StatusBadge status="active" size="sm" />
            <Badge color="purple" size="xs">v2</Badge>
          </div>
        </div>

        {/* Density toggle */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-[hsl(var(--text-tertiary))]">Density:</span>
          {(['compact', 'comfortable', 'spacious'] as Density[]).map(d => (
            <button
              key={d}
              onClick={() => setDensity(d)}
              className={`text-xs px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                density === d
                  ? 'bg-[hsl(var(--brand-primary))]/15 text-[hsl(var(--brand-primary))] font-medium'
                  : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-elevated))]'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <DensityProvider density={density}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
            <MetricCard title="Requests/sec" value={rps.toLocaleString()} change={{ value: 2.4, period: '1h' }} trend="up" status="ok" sparkline={sparkData} />
            <MetricCard title="Avg Latency" value={`${latency.toFixed(1)}ms`} change={{ value: -0.2 }} trend="down" status="ok" />
            <MetricCard title="Uptime" value={`${uptime.toFixed(2)}%`} change={{ value: 0.02 }} trend="up" status="ok" />
            <MetricCard title="Errors" value={String(errors)} change={{ value: -3 }} trend="down" status={errors > 10 ? 'warning' : 'ok'} />
          </div>
        </DensityProvider>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-[hsl(var(--text-tertiary))]">
          <span className="tabular-nums"><AnimatedCounter value={rps} /> events processed</span>
          <Sparkline data={sparkData} width={120} height={20} color="hsl(var(--brand-primary))" />
        </div>
      </div>

      {/* Category grid */}
      <h2 className="text-xl font-semibold text-[hsl(var(--text-primary))] mb-6">Browse components</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
        {categories.map(c => (
          <Link
            key={c.path}
            to={c.path}
            className="group rounded-2xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-surface))] p-4 sm:p-5 hover:border-[hsl(var(--border-default))] hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <c.icon className="size-5 text-[hsl(var(--text-tertiary))] group-hover:text-[hsl(var(--brand-primary))] transition-colors" />
              <span className="text-[10px] tabular-nums px-2 py-0.5 rounded-full bg-[hsl(var(--bg-overlay))] text-[hsl(var(--text-tertiary))] font-medium">
                {c.count}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-[hsl(var(--text-primary))] mb-1 group-hover:text-[hsl(var(--brand-primary))] transition-colors">
              {c.label}
            </h3>
            <p className="text-xs text-[hsl(var(--text-tertiary))] mb-3">{c.desc}</p>
            <div className="pt-2 border-t border-[hsl(var(--border-subtle))]">
              <MiniPreview type={c.preview} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
export default Home
