'use client'

import { useState } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { MetricCard } from '@ui/domain/metric-card'
import { NetworkTrafficCard } from '@ui/domain/network-traffic-card'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Divider } from '@ui/components/divider'
import { PropsTable, type PropDef } from '../../components/PropsTable'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.metriccard-page) {
      :scope {
        max-inline-size: 860px;
        margin-inline: auto;
      }

      /* ── Hero header ────────────────────────────────── */

      .metriccard-page__hero {
        margin-block-end: 2.5rem;
      }

      .metriccard-page__title {
        font-size: clamp(1.75rem, 4vw, 2.5rem);
        font-weight: 800;
        letter-spacing: -0.02em;
        color: var(--text-primary);
        margin: 0 0 0.5rem;
        line-height: 1.15;
      }

      .metriccard-page__desc {
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .metriccard-page__import-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .metriccard-page__import-code {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-sm, 0.875rem);
        background: oklch(100% 0 0 / 0.05);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 0.5rem 0.875rem;
        color: var(--text-primary);
        flex: 1;
        min-inline-size: 0;
        overflow-x: auto;
        white-space: nowrap;
      }

      /* ── Sections ───────────────────────────────────── */

      .metriccard-page__section {
        margin-block-end: 3rem;
      }

      .metriccard-page__section-title {
        font-size: var(--text-lg, 1.125rem);
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.25rem;
        scroll-margin-block-start: 2rem;
      }

      .metriccard-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .metriccard-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .metriccard-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .metriccard-page__preview {
        padding: 2rem;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        background: var(--bg-surface);
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
      }

      .metriccard-page__preview--col {
        flex-direction: column;
        align-items: flex-start;
      }

      /* ── Playground ─────────────────────────────────── */

      .metriccard-page__playground {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
      }
      @container (max-width: 600px) {
        .metriccard-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .metriccard-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .metriccard-page__playground-result {
        min-block-size: 120px;
        display: grid;
        place-items: center;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        background: var(--bg-base);
        padding: 2rem;
      }

      .metriccard-page__playground-controls {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .metriccard-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .metriccard-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .metriccard-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .metriccard-page__option-btn {
        font-size: var(--text-xs, 0.75rem);
        padding: 0.25rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-secondary);
        cursor: pointer;
        font-family: inherit;
        font-weight: 500;
        transition: all 0.12s;
        line-height: 1.4;
      }
      .metriccard-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .metriccard-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
      }

      .metriccard-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .metriccard-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .metriccard-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
      }

      /* ── Dashboard grid ─────────────────────────────── */

      .metriccard-page__dashboard-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 1rem;
        inline-size: 100%;
      }

      /* ── Sizes gallery ──────────────────────────────── */

      .metriccard-page__sizes-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        align-items: flex-start;
        inline-size: 100%;
      }

      .metriccard-page__size-item {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        align-items: center;
      }

      .metriccard-page__size-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      /* ── Source link ─────────────────────────────────── */

      .metriccard-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .metriccard-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }
    }
  }
`

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="metriccard-page__toggle-label">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        style={{ accentColor: 'var(--brand)' }}
      />
      {label}
    </label>
  )
}

function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: readonly T[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="metriccard-page__control-group">
      <span className="metriccard-page__control-label">{label}</span>
      <div className="metriccard-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`metriccard-page__option-btn${opt === value ? ' metriccard-page__option-btn--active' : ''}`}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

const IMPORT_STR = "import { MetricCard } from '@annondeveloper/ui-kit'"

const SPARKLINE_DATA = [42, 38, 55, 47, 62, 58, 71, 65, 78, 72, 85, 80, 92]

// ─── Props Data ──────────────────────────────────────────────────────────────

const metricCardPropDefs: PropDef[] = [
  { name: 'title', type: 'ReactNode', required: true, description: 'The metric label displayed in the header.' },
  { name: 'value', type: 'ReactNode', required: true, description: 'The primary metric value displayed prominently.' },
  { name: 'change', type: '{ value: number; period?: string }', description: 'Change indicator showing percentage change and comparison period.' },
  { name: 'trend', type: "'up' | 'down' | 'flat'", description: 'Arrow direction indicator for the trend.' },
  { name: 'status', type: "'ok' | 'warning' | 'critical'", description: 'Colored accent border indicating operational status.' },
  { name: 'icon', type: 'ReactNode', description: 'Icon element displayed in the header alongside the title.' },
  { name: 'sparkline', type: 'number[]', description: 'Array of data points rendered as an inline sparkline chart.' },
  { name: 'loading', type: 'boolean', default: 'false', description: 'Show a pulsing skeleton placeholder for the value.' },
  { name: 'error', type: 'ReactNode', description: 'Error content displayed instead of the value.' },
  { name: 'empty', type: 'ReactNode', description: 'Empty state content when value is falsy.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Controls entrance animation and hover lift.' },
]

// ─── Section: Interactive Playground ─────────────────────────────────────────

function PlaygroundSection() {
  const [title, setTitle] = useState('CPU Usage')
  const [value, setValue] = useState('78.5%')
  const [trend, setTrend] = useState<'up' | 'down' | 'flat'>('up')
  const [status, setStatus] = useState<'ok' | 'warning' | 'critical' | 'none'>('warning')
  const [showSparkline, setShowSparkline] = useState(true)
  const [loading, setLoading] = useState(false)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)

  const codeLines: string[] = ['<MetricCard']
  codeLines.push(`  title="${title}"`)
  codeLines.push(`  value="${value}"`)
  if (trend !== 'flat') codeLines.push(`  trend="${trend}"`)
  else codeLines.push(`  trend="flat"`)
  if (status !== 'none') codeLines.push(`  status="${status}"`)
  codeLines.push(`  change={{ value: ${trend === 'up' ? '12.3' : trend === 'down' ? '-5.2' : '0'}, period: "last hour" }}`)
  if (showSparkline) codeLines.push(`  sparkline={[42, 38, 55, 47, 62, 58, 71, 65, 78]}`)
  if (loading) codeLines.push('  loading')
  if (motion !== 3) codeLines.push(`  motion={${motion}}`)
  codeLines.push('/>')
  const code = codeLines.join('\n')

  return (
    <section className="metriccard-page__section" id="playground">
      <h2 className="metriccard-page__section-title">
        <a href="#playground">Interactive Playground</a>
      </h2>
      <p className="metriccard-page__section-desc">
        Customize every prop and see the MetricCard update in real-time. The generated code reflects your settings.
      </p>

      <Card variant="default" padding="md" style={{ containerType: 'inline-size' }}>
        <div className="metriccard-page__playground">
          {/* Preview + Code */}
          <div className="metriccard-page__playground-preview">
            <div className="metriccard-page__playground-result">
              <MetricCard
                title={title}
                value={loading ? '' : value}
                trend={trend}
                status={status === 'none' ? undefined : status}
                change={{
                  value: trend === 'up' ? 12.3 : trend === 'down' ? -5.2 : 0,
                  period: 'last hour',
                }}
                sparkline={showSparkline ? SPARKLINE_DATA : undefined}
                loading={loading}
                motion={motion}
                style={{ minInlineSize: '220px' }}
              />
            </div>
            <CopyBlock code={code} language="typescript" showLineNumbers />
          </div>

          {/* Controls */}
          <div className="metriccard-page__playground-controls">
            <div className="metriccard-page__control-group">
              <span className="metriccard-page__control-label">Title</span>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="metriccard-page__text-input"
                placeholder="Metric title..."
              />
            </div>

            <div className="metriccard-page__control-group">
              <span className="metriccard-page__control-label">Value</span>
              <input
                type="text"
                value={value}
                onChange={e => setValue(e.target.value)}
                className="metriccard-page__text-input"
                placeholder="Metric value..."
              />
            </div>

            <OptionGroup
              label="Trend"
              options={['up', 'down', 'flat'] as const}
              value={trend}
              onChange={setTrend}
            />

            <OptionGroup
              label="Status"
              options={['none', 'ok', 'warning', 'critical'] as const}
              value={status}
              onChange={setStatus}
            />

            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />

            <div className="metriccard-page__control-group">
              <span className="metriccard-page__control-label">Toggles</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <Toggle label="Sparkline" checked={showSparkline} onChange={setShowSparkline} />
                <Toggle label="Loading" checked={loading} onChange={setLoading} />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </section>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function MetricCardPage() {
  useStyles('metriccard-page', pageStyles)

  return (
    <div className="metriccard-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="metriccard-page__hero">
        <h1 className="metriccard-page__title">MetricCard</h1>
        <p className="metriccard-page__desc">
          A dashboard-ready metric card for NOC and monitoring interfaces.
          Displays title, value, trend arrow, change percentage, sparkline chart,
          and status accent -- with Aurora Fluid glow and container-query responsiveness.
        </p>
        <div className="metriccard-page__import-row">
          <code className="metriccard-page__import-code">{IMPORT_STR}</code>
        </div>
      </div>

      <Divider spacing="sm" />

      {/* ── 2. Interactive Playground ───────────────────── */}
      <PlaygroundSection />

      <Divider spacing="sm" />

      {/* ── 3. Basic ───────────────────────────────────── */}
      <section className="metriccard-page__section" id="basic">
        <h2 className="metriccard-page__section-title">
          <a href="#basic">Basic</a>
        </h2>
        <p className="metriccard-page__section-desc">
          The simplest form: just a title and value.
        </p>
        <div className="metriccard-page__preview">
          <MetricCard title="Requests" value="1,247" />
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<MetricCard title="Requests" value="1,247" />`}
            language="typescript"
            showLineNumbers
          />
        </div>
      </section>

      <Divider spacing="sm" />

      {/* ── 4. With Trend Indicator ────────────────────── */}
      <section className="metriccard-page__section" id="trend">
        <h2 className="metriccard-page__section-title">
          <a href="#trend">With Trend Indicator</a>
        </h2>
        <p className="metriccard-page__section-desc">
          Add <code>trend</code> and <code>change</code> to show directional arrows and percentage deltas.
        </p>
        <div className="metriccard-page__preview">
          <MetricCard
            title="Revenue"
            value="$42,891"
            trend="up"
            change={{ value: 12.3, period: 'last month' }}
            style={{ minInlineSize: '200px' }}
          />
          <MetricCard
            title="Error Rate"
            value="0.42%"
            trend="down"
            change={{ value: -8.1, period: 'last hour' }}
            style={{ minInlineSize: '200px' }}
          />
          <MetricCard
            title="Latency"
            value="142ms"
            trend="flat"
            change={{ value: 0, period: 'last week' }}
            style={{ minInlineSize: '200px' }}
          />
        </div>
      </section>

      <Divider spacing="sm" />

      {/* ── 5. With Sparkline ──────────────────────────── */}
      <section className="metriccard-page__section" id="sparkline">
        <h2 className="metriccard-page__section-title">
          <a href="#sparkline">With Sparkline</a>
        </h2>
        <p className="metriccard-page__section-desc">
          Pass an array of numbers to <code>sparkline</code> for an inline SVG trend chart.
        </p>
        <div className="metriccard-page__preview">
          <MetricCard
            title="Network I/O"
            value="2.4 Gbps"
            trend="up"
            change={{ value: 5.7, period: 'last 5m' }}
            sparkline={[18, 22, 19, 28, 32, 27, 35, 42, 38, 45, 50, 48, 55]}
            style={{ minInlineSize: '260px' }}
          />
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<MetricCard
  title="Network I/O"
  value="2.4 Gbps"
  trend="up"
  change={{ value: 5.7, period: "last 5m" }}
  sparkline={[18, 22, 19, 28, 32, 27, 35, 42, 38, 45]}
/>`}
            language="typescript"
            showLineNumbers
          />
        </div>
      </section>

      <Divider spacing="sm" />

      {/* ── 6. With Status Accent ─────────────────────── */}
      <section className="metriccard-page__section" id="status">
        <h2 className="metriccard-page__section-title">
          <a href="#status">With Status Accent</a>
        </h2>
        <p className="metriccard-page__section-desc">
          The <code>status</code> prop adds a colored left border for at-a-glance operational awareness.
        </p>
        <div className="metriccard-page__preview">
          <MetricCard
            title="API Health"
            value="99.97%"
            status="ok"
            trend="up"
            change={{ value: 0.02, period: 'last 24h' }}
            style={{ minInlineSize: '200px' }}
          />
          <MetricCard
            title="Disk Usage"
            value="78%"
            status="warning"
            trend="up"
            change={{ value: 3.1, period: 'last week' }}
            style={{ minInlineSize: '200px' }}
          />
          <MetricCard
            title="Error Rate"
            value="4.2%"
            status="critical"
            trend="up"
            change={{ value: 180, period: 'last hour' }}
            style={{ minInlineSize: '200px' }}
          />
        </div>
      </section>

      <Divider spacing="sm" />

      {/* ── 7. Dashboard Grid ─────────────────────────── */}
      <section className="metriccard-page__section" id="dashboard">
        <h2 className="metriccard-page__section-title">
          <a href="#dashboard">Dashboard Grid</a>
        </h2>
        <p className="metriccard-page__section-desc">
          Four cards in a responsive grid -- a typical NOC dashboard layout showing CPU, Memory, Network, and Error Rate.
        </p>
        <div className="metriccard-page__preview metriccard-page__preview--col">
          <div className="metriccard-page__dashboard-grid">
            <MetricCard
              title="CPU Usage"
              value="72.4%"
              status="warning"
              trend="up"
              change={{ value: 8.2, period: 'last hour' }}
              sparkline={[55, 58, 62, 59, 65, 68, 72, 70, 74, 72]}
            />
            <MetricCard
              title="Memory"
              value="14.2 GB"
              status="ok"
              trend="flat"
              change={{ value: 0.3, period: 'last hour' }}
              sparkline={[13.8, 13.9, 14.0, 14.1, 14.0, 14.2, 14.1, 14.2, 14.2, 14.2]}
            />
            <MetricCard
              title="Network"
              value="847 Mbps"
              status="ok"
              trend="up"
              change={{ value: 12.5, period: 'last 5m' }}
              sparkline={[620, 680, 720, 750, 780, 810, 790, 830, 850, 847]}
            />
            <MetricCard
              title="Error Rate"
              value="0.03%"
              status="ok"
              trend="down"
              change={{ value: -42, period: 'last hour' }}
              sparkline={[0.08, 0.07, 0.06, 0.05, 0.05, 0.04, 0.04, 0.03, 0.03, 0.03]}
            />
          </div>
        </div>
      </section>

      <Divider spacing="sm" />

      {/* ── 8. Loading / Error / Empty States ─────────── */}
      <section className="metriccard-page__section" id="states">
        <h2 className="metriccard-page__section-title">
          <a href="#states">Loading, Error, and Empty States</a>
        </h2>
        <p className="metriccard-page__section-desc">
          MetricCard handles all three data lifecycle states gracefully.
        </p>
        <div className="metriccard-page__preview">
          <MetricCard
            title="Loading..."
            value=""
            loading
            style={{ minInlineSize: '180px' }}
          />
          <MetricCard
            title="Error"
            value=""
            error="Failed to fetch metric"
            style={{ minInlineSize: '180px' }}
          />
          <MetricCard
            title="Empty"
            value=""
            empty="No data available"
            style={{ minInlineSize: '180px' }}
          />
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`{/* Loading */}
<MetricCard title="CPU" value="" loading />

{/* Error */}
<MetricCard title="CPU" value="" error="Failed to fetch" />

{/* Empty */}
<MetricCard title="CPU" value="" empty="No data available" />`}
            language="typescript"
            showLineNumbers
          />
        </div>
      </section>

      <Divider spacing="sm" />

      {/* ── 9. All Sizes ──────────────────────────────── */}
      <section className="metriccard-page__section" id="sizes">
        <h2 className="metriccard-page__section-title">
          <a href="#sizes">Container-Responsive Sizing</a>
        </h2>
        <p className="metriccard-page__section-desc">
          MetricCard uses container queries to adapt its layout. At narrow widths
          it hides the sparkline and header; at the narrowest it shows only the value.
        </p>
        <div className="metriccard-page__preview metriccard-page__preview--col">
          <div className="metriccard-page__sizes-row">
            <div className="metriccard-page__size-item">
              <MetricCard
                title="Narrow"
                value="42%"
                sparkline={[10, 20, 15, 25, 30]}
                trend="up"
                style={{ inlineSize: '120px' }}
              />
              <span className="metriccard-page__size-label">120px</span>
            </div>
            <div className="metriccard-page__size-item">
              <MetricCard
                title="Medium"
                value="42%"
                sparkline={[10, 20, 15, 25, 30]}
                trend="up"
                change={{ value: 5, period: 'last hour' }}
                style={{ inlineSize: '200px' }}
              />
              <span className="metriccard-page__size-label">200px</span>
            </div>
            <div className="metriccard-page__size-item">
              <MetricCard
                title="Wide"
                value="42%"
                sparkline={[10, 20, 15, 25, 30]}
                trend="up"
                change={{ value: 5, period: 'last hour' }}
                style={{ inlineSize: '320px' }}
              />
              <span className="metriccard-page__size-label">320px</span>
            </div>
          </div>
        </div>
      </section>

      <Divider spacing="sm" />

      {/* ── 10. NetworkTrafficCard ─────────────────────── */}
      <section className="metriccard-page__section" id="network-traffic">
        <h2 className="metriccard-page__section-title">
          <a href="#network-traffic">NetworkTrafficCard</a>
        </h2>
        <p className="metriccard-page__section-desc">
          An enterprise companion component that extends MetricCard's design language for
          network monitoring. Shows inbound/outbound traffic with animated arrows and vendor/location metadata.
        </p>
        <div className="metriccard-page__preview metriccard-page__preview--col">
          <div className="metriccard-page__dashboard-grid">
            <NetworkTrafficCard
              title="Edge Router - Primary"
              vendor="Cisco Nexus 9300"
              location="US-East / DC-1"
              traffic={{ inbound: 125_000_000, outbound: 89_000_000 }}
              trend={[80, 90, 85, 95, 100, 110, 120, 115, 125, 130]}
              status="ok"
            />
            <NetworkTrafficCard
              title="Core Switch - B2"
              vendor="Arista 7280R"
              location="EU-West / DC-3"
              traffic={{ inbound: 340_000_000, outbound: 290_000_000 }}
              trend={[250, 260, 280, 300, 310, 320, 330, 340, 335, 340]}
              status="warning"
            />
            <NetworkTrafficCard
              title="WAN Link"
              vendor="Juniper MX204"
              location="US-West / DC-2"
              traffic={{ inbound: 45_000_000, outbound: 12_000_000 }}
              status="critical"
            />
            <NetworkTrafficCard
              title="Backup Link"
              vendor="Palo Alto PA-5250"
              location="AP-South / DC-5"
              traffic={{ inbound: 0, outbound: 0 }}
              status="unknown"
              compact
            />
          </div>
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`import { NetworkTrafficCard } from '@annondeveloper/ui-kit'

<NetworkTrafficCard
  title="Edge Router - Primary"
  vendor="Cisco Nexus 9300"
  location="US-East / DC-1"
  traffic={{ inbound: 125_000_000, outbound: 89_000_000 }}
  trend={[80, 90, 85, 95, 100, 110, 120, 115, 125, 130]}
  status="ok"
/>`}
            language="typescript"
            showLineNumbers
          />
        </div>
      </section>

      <Divider spacing="sm" />

      {/* ── 11. Props Reference ────────────────────────── */}
      <section className="metriccard-page__section" id="props">
        <h2 className="metriccard-page__section-title">
          <a href="#props">Props Reference</a>
        </h2>
        <p className="metriccard-page__section-desc">
          Complete list of MetricCard props.
        </p>
        <PropsTable props={metricCardPropDefs} />
      </section>

      <Divider spacing="sm" />

      {/* ── 12. Source ─────────────────────────────────── */}
      <section className="metriccard-page__section" id="source">
        <a
          className="metriccard-page__source-link"
          href="https://github.com/annondeveloper/ui-kit/blob/v2/src/domain/metric-card.tsx"
          target="_blank"
          rel="noopener noreferrer"
        >
          View source on GitHub
        </a>
      </section>
    </div>
  )
}
