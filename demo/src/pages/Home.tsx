import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Copy, Check } from 'lucide-react'
import { MetricCard, Sparkline, StatusBadge, Badge, AnimatedCounter } from '@ui/index'

const sparkBase = [40, 42, 38, 45, 50, 48, 52, 55, 53, 58, 60, 62]

const categories = [
  { path: '/ai',          label: 'AI & Realtime', emoji: '\u{1F916}', count: 6,  desc: 'Streaming, typing, confidence' },
  { path: '/monitor',     label: 'Monitoring',    emoji: '\u{1F4CA}', count: 12, desc: 'Gauges, sparklines, grids' },
  { path: '/data',        label: 'Smart Data',    emoji: '\u{1F9E0}', count: 7,  desc: 'Tables, diffs, heatmaps' },
  { path: '/interactive', label: 'Interactive',    emoji: '\u{1F579}', count: 6,  desc: 'Drag, sort, kanban' },
  { path: '/core',        label: 'Core',           emoji: '\u{1F9F1}', count: 11, desc: 'Buttons, badges, cards' },
  { path: '/forms',       label: 'Forms',          emoji: '\u{270D}',  count: 8,  desc: 'Inputs, selects, sliders' },
  { path: '/layout',      label: 'Layout',         emoji: '\u{1F4D0}', count: 6,  desc: 'Empty states, skeletons' },
]

export function Home() {
  const [copied, setCopied] = useState(false)
  const [rps, setRps] = useState(12847)
  const [latency, setLatency] = useState(2.4)
  const [uptime, setUptime] = useState(99.97)
  const [sparkData, setSparkData] = useState(sparkBase)

  useEffect(() => {
    const id = setInterval(() => {
      setRps(p => p + Math.floor(Math.random() * 200 - 80))
      setLatency(p => Math.max(0.5, p + (Math.random() - 0.5) * 0.4))
      setUptime(p => Math.min(100, Math.max(99.8, p + (Math.random() - 0.5) * 0.02)))
      setSparkData(p => [...p.slice(1), p[p.length - 1] + Math.floor(Math.random() * 10 - 4)])
    }, 2000)
    return () => clearInterval(id)
  }, [])

  const handleCopy = useCallback(() => {
    void navigator.clipboard.writeText('npm install @annondeveloper/ui-kit').then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Hero */}
      <div className="text-center mb-12 stagger">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(var(--brand-primary))]/10 text-[hsl(var(--brand-primary))] text-xs font-medium mb-6">
          <span className="size-1.5 rounded-full bg-[hsl(var(--brand-primary))] animate-pulse" />
          56 components, dark + light, fully typed
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-[hsl(var(--text-primary))] tracking-tight mb-4">
          Build dashboards<br />that <span className="text-[hsl(var(--brand-primary))]">operate.</span>
        </h1>
        <p className="text-lg text-[hsl(var(--text-secondary))] max-w-xl mx-auto mb-8">
          Production-grade React components for monitoring, observability, and infrastructure management.
        </p>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl bg-[hsl(var(--bg-surface))] border border-[hsl(var(--border-default))] hover:border-[hsl(var(--brand-primary))] transition-colors text-sm font-mono text-[hsl(var(--text-secondary))] cursor-pointer"
        >
          <span>npm install @annondeveloper/ui-kit</span>
          {copied ? <Check className="size-4 text-[hsl(var(--status-ok))]" /> : <Copy className="size-4" />}
        </button>
      </div>

      {/* Live mini dashboard */}
      <div className="mb-16 rounded-2xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-surface))] p-6 shadow-lg stagger">
        <div className="flex items-center gap-2 mb-4">
          <span className="size-2 rounded-full bg-[hsl(var(--status-ok))] animate-pulse" />
          <span className="text-xs font-medium text-[hsl(var(--text-secondary))]">Live preview</span>
          <div className="ml-auto flex gap-1.5">
            <StatusBadge status="active" size="sm" />
            <StatusBadge status="warning" size="sm" />
            <Badge color="purple" size="xs">v1.0</Badge>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <MetricCard label="Requests/sec" value={rps} previousValue={12600} trendDirection="up-good" status="ok" sparklineData={sparkData} />
          <MetricCard label="Avg Latency" value={latency} format={n => `${n.toFixed(1)}ms`} previousValue={2.6} trendDirection="down-good" status="ok" />
          <MetricCard label="Uptime" value={uptime} format={n => `${n.toFixed(2)}%`} previousValue={99.95} trendDirection="up-good" status="ok" />
        </div>
        <div className="flex items-center gap-6 text-xs text-[hsl(var(--text-tertiary))]">
          <span className="tabular-nums"><AnimatedCounter value={rps} /> events processed</span>
          <Sparkline data={sparkData} width={120} height={20} color="hsl(var(--brand-primary))" fillOpacity={0.1} />
        </div>
      </div>

      {/* Category grid */}
      <h2 className="text-xl font-semibold text-[hsl(var(--text-primary))] mb-6">Browse components</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
        {categories.map(c => (
          <Link
            key={c.path}
            to={c.path}
            className="group rounded-2xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-surface))] p-5 hover:border-[hsl(var(--border-default))] hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{c.emoji}</span>
              <span className="text-[10px] tabular-nums px-2 py-0.5 rounded-full bg-[hsl(var(--bg-overlay))] text-[hsl(var(--text-tertiary))] font-medium">
                {c.count}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-[hsl(var(--text-primary))] mb-1 group-hover:text-[hsl(var(--brand-primary))] transition-colors">
              {c.label}
            </h3>
            <p className="text-xs text-[hsl(var(--text-tertiary))]">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
