'use client'

import { useState, useEffect, useMemo } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { useRenderTime } from '../hooks/useRenderTime'
import { useWebVitals } from '../hooks/useWebVitals'

// ─── Types ───────────────────────────────────────────────────────────────────

interface BundleFile {
  name: string
  raw: number
  gzip: number
}

interface BundleReport {
  generated: string
  budget: number
  files: BundleFile[]
  total: { raw: number; gzip: number }
}

type SortKey = 'name' | 'raw' | 'gzip'
type SortDir = 'asc' | 'desc'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  return `${(kb / 1024).toFixed(2)} MB`
}

function formatMs(ms: number | null): string {
  if (ms === null) return '--'
  if (ms < 1) return `${(ms * 1000).toFixed(0)} us`
  if (ms < 1000) return `${ms.toFixed(0)} ms`
  return `${(ms / 1000).toFixed(2)} s`
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val))
}

// ─── SVG Components ──────────────────────────────────────────────────────────

function BudgetGauge({ used, budget }: { used: number; budget: number }) {
  const pct = clamp((used / budget) * 100, 0, 100)
  const radius = 70
  const stroke = 12
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (pct / 100) * circumference
  const center = radius + stroke

  // Color based on utilization
  const color =
    pct > 95 ? 'oklch(65% 0.25 25)' :   // red
    pct > 80 ? 'oklch(75% 0.18 85)' :    // amber
               'oklch(72% 0.19 155)'      // green

  return (
    <div className="perf__gauge-wrap">
      <svg
        viewBox={`0 0 ${center * 2} ${center * 2}`}
        className="perf__gauge-svg"
        aria-label={`Budget usage: ${pct.toFixed(1)}%`}
        role="img"
      >
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="oklch(30% 0.01 270 / 0.3)"
          strokeWidth={stroke}
        />
        {/* Used arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${center} ${center})`}
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />
        {/* Center text */}
        <text
          x={center}
          y={center - 8}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--text-primary, #e4e4e7)"
          fontSize="22"
          fontWeight="800"
        >
          {pct.toFixed(1)}%
        </text>
        <text
          x={center}
          y={center + 16}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--text-secondary, #a1a1aa)"
          fontSize="11"
        >
          {formatBytes(used)} / {formatBytes(budget)}
        </text>
      </svg>
      <div className="perf__gauge-label">Budget Utilization (gzip)</div>
    </div>
  )
}

function BarChart({ files, maxGzip }: { files: BundleFile[]; maxGzip: number }) {
  const barHeight = 22
  const gap = 4
  const labelWidth = 180
  const chartWidth = 500
  const sizeWidth = 70
  const totalWidth = labelWidth + chartWidth + sizeWidth + 20
  const totalHeight = files.length * (barHeight + gap) + 10

  return (
    <svg
      viewBox={`0 0 ${totalWidth} ${totalHeight}`}
      className="perf__bar-chart"
      role="img"
      aria-label="Bundle size per file"
    >
      {files.map((file, i) => {
        const y = i * (barHeight + gap) + 5
        const barW = maxGzip > 0 ? (file.gzip / maxGzip) * chartWidth : 0
        const pct = maxGzip > 0 ? (file.gzip / maxGzip) : 0

        // Gradient from teal to purple based on relative size
        const hue = 200 - pct * 140
        const color = `oklch(68% 0.17 ${hue})`

        return (
          <g key={file.name}>
            {/* Label */}
            <text
              x={labelWidth - 8}
              y={y + barHeight / 2}
              textAnchor="end"
              dominantBaseline="central"
              fill="var(--text-secondary, #a1a1aa)"
              fontSize="10"
              fontFamily="monospace"
            >
              {file.name.length > 28 ? file.name.slice(0, 26) + '..' : file.name}
            </text>
            {/* Bar */}
            <rect
              x={labelWidth}
              y={y}
              width={Math.max(2, barW)}
              height={barHeight}
              rx={4}
              fill={color}
              opacity={0.85}
            >
              <title>{file.name}: {formatBytes(file.gzip)} gzip</title>
            </rect>
            {/* Size label */}
            <text
              x={labelWidth + chartWidth + 8}
              y={y + barHeight / 2}
              dominantBaseline="central"
              fill="var(--text-secondary, #a1a1aa)"
              fontSize="10"
              fontFamily="monospace"
            >
              {formatBytes(file.gzip)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function VitalGauge({
  label,
  value,
  unit,
  thresholds,
}: {
  label: string
  value: number | null
  unit: string
  thresholds: [number, number] // [good, needs-improvement]
}) {
  const displayVal = value !== null ? (unit === '' ? value.toFixed(3) : value.toFixed(0)) : '--'
  let color = 'oklch(60% 0.02 270)' // gray for null
  if (value !== null) {
    if (value <= thresholds[0]) color = 'oklch(72% 0.19 155)'       // green
    else if (value <= thresholds[1]) color = 'oklch(75% 0.18 85)'   // amber
    else color = 'oklch(65% 0.25 25)'                                // red
  }

  const rating =
    value === null ? 'N/A' :
    value <= thresholds[0] ? 'Good' :
    value <= thresholds[1] ? 'Needs Work' :
                             'Poor'

  return (
    <div className="perf__vital" role="group" aria-label={label}>
      <div className="perf__vital-value" style={{ color }}>
        {displayVal}
        {value !== null && <span className="perf__vital-unit">{unit}</span>}
      </div>
      <div className="perf__vital-label">{label}</div>
      <div className="perf__vital-rating" style={{ color }}>{rating}</div>
    </div>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = css`
  @layer demo {
    .perf {
      max-width: 1200px;
      margin: 0 auto;
    }

    .perf__header {
      margin-block-end: 2rem;
    }

    .perf__title {
      font-size: var(--text-2xl, 1.875rem);
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-block-end: 0.25rem;
      text-wrap: balance;
    }

    .perf__subtitle {
      font-size: var(--text-sm, 0.875rem);
      color: var(--text-secondary, #a1a1aa);
    }

    /* ── Sections ──────────────────────────────────── */

    .perf__section {
      margin-block-end: 2.5rem;
    }

    .perf__section-title {
      font-size: var(--text-lg, 1.125rem);
      font-weight: 700;
      color: var(--text-primary, #e4e4e7);
      margin-block-end: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .perf__section-title svg {
      width: 1.25em;
      height: 1.25em;
      opacity: 0.6;
    }

    /* ── Cards ─────────────────────────────────────── */

    .perf__card {
      background: oklch(18% 0.01 270 / 0.6);
      border: 1px solid oklch(35% 0.02 270 / 0.3);
      border-radius: 1rem;
      padding: 1.5rem;
      backdrop-filter: blur(12px);
    }

    .perf__card + .perf__card {
      margin-block-start: 1rem;
    }

    /* ── Overview grid ─────────────────────────────── */

    .perf__overview {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    @media (max-width: 768px) {
      .perf__overview {
        grid-template-columns: 1fr;
      }
    }

    /* ── Gauge ─────────────────────────────────────── */

    .perf__gauge-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }

    .perf__gauge-svg {
      width: 180px;
      height: 180px;
    }

    .perf__gauge-label {
      margin-block-start: 0.75rem;
      font-size: var(--text-sm, 0.875rem);
      font-weight: 600;
      color: var(--text-secondary, #a1a1aa);
    }

    /* ── Bar chart ─────────────────────────────────── */

    .perf__bar-chart {
      width: 100%;
      max-height: 600px;
      overflow-y: auto;
    }

    /* ── Stats row ─────────────────────────────────── */

    .perf__stats {
      display: flex;
      gap: 2rem;
      flex-wrap: wrap;
      margin-block-start: 1rem;
      padding-block-start: 1rem;
      border-block-start: 1px solid oklch(35% 0.02 270 / 0.2);
    }

    .perf__stat {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .perf__stat-value {
      font-size: var(--text-xl, 1.25rem);
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      color: var(--text-primary, #e4e4e7);
    }

    .perf__stat-label {
      font-size: var(--text-xs, 0.75rem);
      color: var(--text-secondary, #a1a1aa);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* ── File table ────────────────────────────────── */

    .perf__table-wrap {
      overflow-x: auto;
      margin-block-start: 1rem;
    }

    .perf__table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--text-sm, 0.875rem);
    }

    .perf__table th,
    .perf__table td {
      padding: 0.5rem 0.75rem;
      text-align: start;
    }

    .perf__table th {
      font-weight: 600;
      color: var(--text-secondary, #a1a1aa);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      font-size: var(--text-xs, 0.75rem);
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
      border-block-end: 1px solid oklch(35% 0.02 270 / 0.3);
    }

    .perf__table th:hover {
      color: var(--text-primary, #e4e4e7);
    }

    .perf__table th[aria-sort] {
      color: oklch(72% 0.17 270);
    }

    .perf__table td {
      font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', monospace;
      color: var(--text-primary, #e4e4e7);
      border-block-end: 1px solid oklch(30% 0.01 270 / 0.15);
    }

    .perf__table td:first-child {
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .perf__table tr:hover td {
      background: oklch(25% 0.02 270 / 0.3);
    }

    .perf__sort-icon {
      display: inline-block;
      margin-inline-start: 0.25rem;
      opacity: 0.6;
    }

    /* ── Size bar in table ─────────────────────────── */

    .perf__size-bar-cell {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .perf__size-bar {
      height: 6px;
      border-radius: 3px;
      background: oklch(68% 0.17 270);
      min-width: 2px;
      transition: width 0.3s ease-out;
    }

    /* ── Web Vitals ────────────────────────────────── */

    .perf__vitals {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }

    @media (max-width: 600px) {
      .perf__vitals {
        grid-template-columns: 1fr;
      }
    }

    .perf__vital {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 1.25rem 1rem;
      background: oklch(20% 0.01 270 / 0.4);
      border-radius: 0.75rem;
      border: 1px solid oklch(35% 0.02 270 / 0.2);
    }

    .perf__vital-value {
      font-size: var(--text-3xl, 2rem);
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      line-height: 1;
    }

    .perf__vital-unit {
      font-size: var(--text-sm, 0.875rem);
      font-weight: 500;
      margin-inline-start: 0.2em;
      opacity: 0.7;
    }

    .perf__vital-label {
      margin-block-start: 0.5rem;
      font-size: var(--text-sm, 0.875rem);
      font-weight: 600;
      color: var(--text-secondary, #a1a1aa);
    }

    .perf__vital-rating {
      margin-block-start: 0.25rem;
      font-size: var(--text-xs, 0.75rem);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    /* ── Render profiler ───────────────────────────── */

    .perf__profiler {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }

    .perf__profiler-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem;
      background: oklch(20% 0.01 270 / 0.4);
      border-radius: 0.75rem;
      border: 1px solid oklch(35% 0.02 270 / 0.2);
    }

    .perf__profiler-value {
      font-size: var(--text-2xl, 1.5rem);
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      color: oklch(72% 0.17 270);
    }

    .perf__profiler-label {
      margin-block-start: 0.25rem;
      font-size: var(--text-xs, 0.75rem);
      color: var(--text-secondary, #a1a1aa);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* ── Generated timestamp ───────────────────────── */

    .perf__timestamp {
      font-size: var(--text-xs, 0.75rem);
      color: var(--text-secondary, #a1a1aa);
      opacity: 0.6;
      margin-block-start: 0.5rem;
    }

    /* ── Loading / Error states ────────────────────── */

    .perf__loading {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      color: var(--text-secondary, #a1a1aa);
      font-size: var(--text-sm, 0.875rem);
    }

    .perf__error {
      padding: 1.5rem;
      background: oklch(25% 0.05 25 / 0.2);
      border: 1px solid oklch(55% 0.15 25 / 0.3);
      border-radius: 0.75rem;
      color: oklch(75% 0.15 25);
      font-size: var(--text-sm, 0.875rem);
    }

    .perf__error-hint {
      margin-block-start: 0.5rem;
      font-size: var(--text-xs, 0.75rem);
      opacity: 0.7;
    }

    /* ── Search filter ─────────────────────────────── */

    .perf__filter {
      margin-block-end: 0.75rem;
    }

    .perf__filter-input {
      width: 100%;
      max-width: 320px;
      padding: 0.5rem 0.75rem;
      background: oklch(15% 0.01 270 / 0.6);
      border: 1px solid oklch(35% 0.02 270 / 0.3);
      border-radius: 0.5rem;
      color: var(--text-primary, #e4e4e7);
      font-size: var(--text-sm, 0.875rem);
      outline: none;
      transition: border-color 0.15s;
    }

    .perf__filter-input::placeholder {
      color: var(--text-secondary, #a1a1aa);
      opacity: 0.5;
    }

    .perf__filter-input:focus {
      border-color: oklch(65% 0.17 270);
    }

    /* ── Show more ─────────────────────────────────── */

    .perf__show-more {
      display: flex;
      justify-content: center;
      margin-block-start: 0.75rem;
    }

    .perf__show-more-btn {
      background: oklch(25% 0.02 270 / 0.5);
      border: 1px solid oklch(40% 0.02 270 / 0.3);
      border-radius: 0.5rem;
      color: var(--text-secondary, #a1a1aa);
      padding: 0.375rem 1rem;
      font-size: var(--text-xs, 0.75rem);
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }

    .perf__show-more-btn:hover {
      background: oklch(30% 0.03 270 / 0.6);
      color: var(--text-primary, #e4e4e7);
    }
  }
`

// ─── Section icon SVGs ───────────────────────────────────────────────────────

const PackageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
)

const GaugeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
    <path d="M12 6v6l4 2" />
  </svg>
)

const ActivityIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
)

const CpuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" />
    <line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" />
    <line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" />
    <line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" />
  </svg>
)

// ─── Page Component ──────────────────────────────────────────────────────────

export default function PerformancePage() {
  useStyles('performance-page', styles)
  const timing = useRenderTime('PerformancePage')
  const vitals = useWebVitals()

  const [report, setReport] = useState<BundleReport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('gzip')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [filter, setFilter] = useState('')
  const [showAll, setShowAll] = useState(false)

  // Fetch bundle report
  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'bundle-report.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data: BundleReport) => setReport(data))
      .catch(() => {
        setError('Could not load bundle-report.json. Run "npm run build:report" first.')
      })
  }, [])

  // Sorted + filtered files
  const sortedFiles = useMemo(() => {
    if (!report) return []
    let files = [...report.files]

    if (filter) {
      const lc = filter.toLowerCase()
      files = files.filter((f) => f.name.toLowerCase().includes(lc))
    }

    files.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name)
      else cmp = a[sortKey] - b[sortKey]
      return sortDir === 'desc' ? -cmp : cmp
    })

    return files
  }, [report, sortKey, sortDir, filter])

  const displayFiles = showAll ? sortedFiles : sortedFiles.slice(0, 20)
  const chartFiles = report ? report.files.slice(0, 15) : []
  const maxGzip = chartFiles.length > 0 ? Math.max(...chartFiles.map((f) => f.gzip)) : 0

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  function sortArrow(key: SortKey): string {
    if (sortKey !== key) return ''
    return sortDir === 'desc' ? ' \u25BC' : ' \u25B2'
  }

  function sortAria(key: SortKey): 'ascending' | 'descending' | undefined {
    if (sortKey !== key) return undefined
    return sortDir === 'desc' ? 'descending' : 'ascending'
  }

  const maxFileGzip = report ? Math.max(...report.files.map((f) => f.gzip)) : 1

  return (
    <div className="perf">
      {/* ── Header ────────────────────────────────────── */}
      <header className="perf__header">
        <h1 className="perf__title">Performance Dashboard</h1>
        <p className="perf__subtitle">
          Bundle sizes, budget tracking, Web Vitals, and render profiling.
        </p>
      </header>

      {/* ── Bundle Overview ───────────────────────────── */}
      <section className="perf__section" aria-labelledby="perf-bundle-overview">
        <h2 className="perf__section-title" id="perf-bundle-overview">
          <PackageIcon />
          Bundle Overview
        </h2>

        {error && (
          <div className="perf__error" role="alert">
            {error}
            <div className="perf__error-hint">
              Run: npm run build && npm run build:report
            </div>
          </div>
        )}

        {!error && !report && (
          <div className="perf__loading">Loading bundle report...</div>
        )}

        {report && (
          <>
            <div className="perf__overview">
              {/* Budget gauge */}
              <div className="perf__card">
                <BudgetGauge used={report.total.gzip} budget={report.budget} />
              </div>

              {/* Top files chart */}
              <div className="perf__card">
                <BarChart files={chartFiles} maxGzip={maxGzip} />
              </div>
            </div>

            {/* Quick stats */}
            <div className="perf__stats">
              <div className="perf__stat">
                <span className="perf__stat-value">{report.files.length}</span>
                <span className="perf__stat-label">Files</span>
              </div>
              <div className="perf__stat">
                <span className="perf__stat-value">{formatBytes(report.total.raw)}</span>
                <span className="perf__stat-label">Raw Total</span>
              </div>
              <div className="perf__stat">
                <span className="perf__stat-value">{formatBytes(report.total.gzip)}</span>
                <span className="perf__stat-label">Gzip Total</span>
              </div>
              <div className="perf__stat">
                <span className="perf__stat-value">{formatBytes(report.budget)}</span>
                <span className="perf__stat-label">Budget</span>
              </div>
            </div>

            {report.generated && (
              <div className="perf__timestamp">
                Report generated: {new Date(report.generated).toLocaleString()}
              </div>
            )}
          </>
        )}
      </section>

      {/* ── Component Size Table ──────────────────────── */}
      {report && (
        <section className="perf__section" aria-labelledby="perf-size-table">
          <h2 className="perf__section-title" id="perf-size-table">
            <GaugeIcon />
            Component Size Table
          </h2>

          <div className="perf__card">
            <div className="perf__filter">
              <input
                type="text"
                className="perf__filter-input"
                placeholder="Filter files..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                aria-label="Filter bundle files by name"
              />
            </div>

            <div className="perf__table-wrap">
              <table className="perf__table">
                <thead>
                  <tr>
                    <th
                      onClick={() => handleSort('name')}
                      aria-sort={sortAria('name')}
                    >
                      File
                      <span className="perf__sort-icon">{sortArrow('name')}</span>
                    </th>
                    <th
                      onClick={() => handleSort('raw')}
                      aria-sort={sortAria('raw')}
                      style={{ textAlign: 'end' }}
                    >
                      Raw
                      <span className="perf__sort-icon">{sortArrow('raw')}</span>
                    </th>
                    <th
                      onClick={() => handleSort('gzip')}
                      aria-sort={sortAria('gzip')}
                      style={{ textAlign: 'end' }}
                    >
                      Gzip
                      <span className="perf__sort-icon">{sortArrow('gzip')}</span>
                    </th>
                    <th style={{ width: '30%' }}>
                      Distribution
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayFiles.map((file) => (
                    <tr key={file.name}>
                      <td>{file.name}</td>
                      <td style={{ textAlign: 'end' }}>{formatBytes(file.raw)}</td>
                      <td style={{ textAlign: 'end' }}>{formatBytes(file.gzip)}</td>
                      <td>
                        <div className="perf__size-bar-cell">
                          <div
                            className="perf__size-bar"
                            style={{
                              width: `${(file.gzip / maxFileGzip) * 100}%`,
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!showAll && sortedFiles.length > 20 && (
              <div className="perf__show-more">
                <button
                  className="perf__show-more-btn"
                  onClick={() => setShowAll(true)}
                >
                  Show all {sortedFiles.length} files
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Web Vitals ────────────────────────────────── */}
      <section className="perf__section" aria-labelledby="perf-web-vitals">
        <h2 className="perf__section-title" id="perf-web-vitals">
          <ActivityIcon />
          Web Vitals
        </h2>

        <div className="perf__card">
          <div className="perf__vitals">
            <VitalGauge
              label="LCP (Largest Contentful Paint)"
              value={vitals.lcp}
              unit="ms"
              thresholds={[2500, 4000]}
            />
            <VitalGauge
              label="CLS (Cumulative Layout Shift)"
              value={vitals.cls}
              unit=""
              thresholds={[0.1, 0.25]}
            />
            <VitalGauge
              label="INP (Interaction to Next Paint)"
              value={vitals.inp}
              unit="ms"
              thresholds={[200, 500]}
            />
          </div>
        </div>
      </section>

      {/* ── Render Profiler ───────────────────────────── */}
      <section className="perf__section" aria-labelledby="perf-render">
        <h2 className="perf__section-title" id="perf-render">
          <CpuIcon />
          Render Profiler
        </h2>

        <div className="perf__card">
          <div className="perf__profiler">
            <div className="perf__profiler-stat">
              <span className="perf__profiler-value">{timing.componentName}</span>
              <span className="perf__profiler-label">Component</span>
            </div>
            <div className="perf__profiler-stat">
              <span className="perf__profiler-value">{timing.renderCount}</span>
              <span className="perf__profiler-label">Renders</span>
            </div>
            <div className="perf__profiler-stat">
              <span className="perf__profiler-value">{formatMs(timing.lastRenderMs)}</span>
              <span className="perf__profiler-label">Last Render</span>
            </div>
            <div className="perf__profiler-stat">
              <span className="perf__profiler-value">{formatMs(timing.averageRenderMs)}</span>
              <span className="perf__profiler-label">Avg Render</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
