'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { GeoMap, type GeoPoint, type GeoConnection } from '@ui/domain/geo-map'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.geo-map-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: geo-map-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .geo-map-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .geo-map-page__hero::before {
        content: '';
        position: absolute;
        inset: -50%;
        background: conic-gradient(
          from 0deg at 50% 50%,
          var(--aurora-1, oklch(60% 0.15 250 / 0.06)) 0deg,
          transparent 60deg,
          var(--aurora-2, oklch(55% 0.18 300 / 0.04)) 120deg,
          transparent 180deg,
          var(--aurora-1, oklch(60% 0.15 250 / 0.06)) 240deg,
          transparent 300deg,
          var(--aurora-2, oklch(55% 0.18 300 / 0.04)) 360deg
        );
        animation: geomap-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes geomap-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .geo-map-page__hero::before { animation: none; }
      }

      .geo-map-page__title {
        position: relative;
        font-size: clamp(2rem, 5vw, 3rem);
        font-weight: 800;
        letter-spacing: -0.03em;
        background: linear-gradient(135deg, var(--text-primary) 0%, var(--brand, oklch(65% 0.2 270)) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin: 0 0 0.5rem;
        line-height: 1.1;
      }

      .geo-map-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .geo-map-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .geo-map-page__import-code {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-sm, 0.875rem);
        background: oklch(0% 0 0 / 0.2);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 0.5rem 0.875rem;
        color: var(--text-primary);
        flex: 1;
        min-inline-size: 0;
        overflow-x: auto;
        white-space: nowrap;
        backdrop-filter: blur(8px);
        box-shadow: inset 0 1px 0 oklch(100% 0 0 / 0.03);
      }

      .geo-map-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .geo-map-page__section {
        background: oklch(from var(--bg-elevated) calc(l + 0.02) c h);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        padding: 2rem;
        overflow: visible;
        position: relative;
        box-shadow: inset 0 1px 0 oklch(100% 0 0 / 0.04), 0 2px 8px oklch(0% 0 0 / 0.15);
        opacity: 0;
        transform: translateY(32px) scale(0.98);
        filter: blur(4px);
        animation: geomap-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes geomap-section-reveal {
        from {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0);
        }
      }

      @supports not (animation-timeline: view()) {
        .geo-map-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .geo-map-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .geo-map-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .geo-map-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .geo-map-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .geo-map-page__preview {
        padding: 2.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 1.25rem;
        min-block-size: 80px;
      }

      .geo-map-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .geo-map-page__preview--col {
        flex-direction: column;
        align-items: stretch;
      }

      /* ── Playground ─────────────────────────────────── */

      .geo-map-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @container geo-map-page (max-width: 680px) {
        .geo-map-page__playground {
          grid-template-columns: 1fr;
        }
        .geo-map-page__playground-controls {
          position: static !important;
        }
      }

      .geo-map-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .geo-map-page__playground-result {
        min-block-size: 300px;
        display: grid;
        place-items: center;
        padding: 1.5rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .geo-map-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .geo-map-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .geo-map-page__playground-controls {
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        position: sticky;
        top: 1rem;
      }

      .geo-map-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .geo-map-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .geo-map-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .geo-map-page__option-btn {
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
      .geo-map-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .geo-map-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .geo-map-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .geo-map-page__code-tabs {
        margin-block-start: 1rem;
      }

      .geo-map-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .geo-map-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Labeled row ────────────────────────────────── */

      .geo-map-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .geo-map-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .geo-map-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .geo-map-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .geo-map-page__tier-card {
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        cursor: pointer;
        transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
        min-width: 0;
        overflow: hidden;
      }

      .geo-map-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .geo-map-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .geo-map-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .geo-map-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .geo-map-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .geo-map-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .geo-map-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .geo-map-page__tier-import {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 0.625rem;
        color: oklch(from var(--brand) calc(l + 0.1) c h);
        background: var(--border-subtle);
        padding: 0.375rem 0.5rem;
        border-radius: var(--radius-sm);
        overflow-wrap: break-word;
        word-break: break-all;
        text-align: start;
        line-height: 1.4;
      }

      .geo-map-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      .geo-map-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .geo-map-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── A11y list ──────────────────────────────────── */

      .geo-map-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .geo-map-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .geo-map-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .geo-map-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Event log ──────────────────────────────────── */

      .geo-map-page__event-log {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-sm);
        padding: 0.75rem;
        max-block-size: 120px;
        overflow-y: auto;
        line-height: 1.6;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .geo-map-page__hero { padding: 2rem 1.25rem; }
        .geo-map-page__title { font-size: 1.75rem; }
        .geo-map-page__preview { padding: 1.75rem; }
        .geo-map-page__playground { grid-template-columns: 1fr; }
        .geo-map-page__playground-controls { position: static !important; }
        .geo-map-page__tiers { grid-template-columns: 1fr; }
        .geo-map-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .geo-map-page__hero { padding: 1.5rem 1rem; }
        .geo-map-page__title { font-size: 1.5rem; }
        .geo-map-page__preview { padding: 1rem; }
      }

      /* ── Scrollbar ──────────────────────────────── */

      .geo-map-page__import-code,
      .geo-map-page code,
      pre {
        overflow-x: auto;
        scrollbar-width: thin;
        scrollbar-color: var(--border-default) transparent;
        max-inline-size: 100%;
      }
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const geoMapProps: PropDef[] = [
  { name: 'points', type: 'GeoPoint[]', description: 'Array of geographic points to render on the map. Each point has id, lat, lng, and optional label/value/status.' },
  { name: 'connections', type: 'GeoConnection[]', description: 'Optional connections between points drawn as curved lines. Requires matching point IDs.' },
  { name: 'projection', type: "'mercator' | 'equirectangular'", default: "'equirectangular'", description: 'Map projection type. Equirectangular is the default simple projection.' },
  { name: 'showLabels', type: 'boolean', default: 'false', description: 'Display text labels below each point on the map.' },
  { name: 'interactive', type: 'boolean', default: 'false', description: 'Enable click and hover interactions on points.' },
  { name: 'onPointClick', type: '(point: GeoPoint) => void', description: 'Callback when an interactive point is clicked.' },
  { name: 'onPointHover', type: '(point: GeoPoint | null) => void', description: 'Callback when hovering over or leaving a point.' },
  { name: 'height', type: 'number | string', description: 'Override the map container height. Accepts px number or CSS string.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Controls pulse and dash animations.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
]

// ─── Sample Data ──────────────────────────────────────────────────────────────

const SAMPLE_POINTS: GeoPoint[] = [
  { id: 'nyc', lat: 40.7128, lng: -74.006, label: 'New York', value: 95, status: 'ok' },
  { id: 'lon', lat: 51.5074, lng: -0.1278, label: 'London', value: 88, status: 'ok' },
  { id: 'tok', lat: 35.6762, lng: 139.6503, label: 'Tokyo', value: 72, status: 'warning' },
  { id: 'syd', lat: -33.8688, lng: 151.2093, label: 'Sydney', value: 60, status: 'ok' },
  { id: 'fra', lat: 50.1109, lng: 8.6821, label: 'Frankfurt', value: 85, status: 'ok' },
  { id: 'sin', lat: 1.3521, lng: 103.8198, label: 'Singapore', value: 78, status: 'critical' },
  { id: 'sfo', lat: 37.7749, lng: -122.4194, label: 'San Francisco', value: 90, status: 'ok' },
  { id: 'mum', lat: 19.076, lng: 72.8777, label: 'Mumbai', value: 45, status: 'warning' },
]

const SAMPLE_CONNECTIONS: GeoConnection[] = [
  { from: 'nyc', to: 'lon', status: 'ok', value: 850 },
  { from: 'lon', to: 'fra', status: 'ok', value: 720 },
  { from: 'fra', to: 'tok', status: 'warning', value: 340 },
  { from: 'tok', to: 'syd', status: 'ok', value: 480 },
  { from: 'sfo', to: 'tok', status: 'ok', value: 620 },
  { from: 'nyc', to: 'sfo', status: 'ok', value: 910 },
  { from: 'sin', to: 'mum', status: 'critical', value: 210 },
  { from: 'lon', to: 'sin', status: 'ok', value: 550 },
]

const MINIMAL_POINTS: GeoPoint[] = [
  { id: 'a', lat: 40.7, lng: -74, label: 'A', status: 'ok' },
  { id: 'b', lat: 51.5, lng: -0.1, label: 'B', status: 'ok' },
  { id: 'c', lat: 35.7, lng: 139.7, label: 'C', status: 'warning' },
]

const STATUS_POINTS: GeoPoint[] = [
  { id: 's1', lat: 48.85, lng: 2.35, label: 'Paris', status: 'ok', value: 80 },
  { id: 's2', lat: 55.75, lng: 37.62, label: 'Moscow', status: 'warning', value: 55 },
  { id: 's3', lat: 22.31, lng: 114.17, label: 'Hong Kong', status: 'critical', value: 30 },
  { id: 's4', lat: -23.55, lng: -46.63, label: 'Sao Paulo', status: 'unknown', value: 10 },
  { id: 's5', lat: 39.9, lng: 116.4, label: 'Beijing', status: 'ok', value: 95 },
]

type Projection = 'mercator' | 'equirectangular'

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { GeoMap } from '@annondeveloper/ui-kit/lite'",
  standard: "import { GeoMap } from '@annondeveloper/ui-kit'",
  premium: "import { GeoMap } from '@annondeveloper/ui-kit/premium'",
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="geo-map-page__copy-btn"
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        })
      }}
      icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}
    >
      {copied ? 'Copied' : 'Copy'}
    </Button>
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
    <div className="geo-map-page__control-group">
      <span className="geo-map-page__control-label">{label}</span>
      <div className="geo-map-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`geo-map-page__option-btn${opt === value ? ' geo-map-page__option-btn--active' : ''}`}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

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
    <label className="geo-map-page__toggle-label">
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

// ─── Code Generation ─────────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier,
  projection: Projection,
  showLabels: boolean,
  interactive: boolean,
  showConnections: boolean,
  motion: number,
  height: string,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  props.push('  points={points}')
  if (showConnections) props.push('  connections={connections}')
  if (projection !== 'equirectangular') props.push(`  projection="${projection}"`)
  if (showLabels) props.push('  showLabels')
  if (interactive) props.push('  interactive')
  if (interactive) props.push('  onPointClick={(pt) => console.log(pt)}')
  if (motion !== 3) props.push(`  motion={${motion}}`)
  if (height !== '300') props.push(`  height={${height}}`)

  return `${importStr}
import type { GeoPoint, GeoConnection } from '@annondeveloper/ui-kit'

const points: GeoPoint[] = [
  { id: 'nyc', lat: 40.71, lng: -74.01, label: 'New York', status: 'ok', value: 95 },
  { id: 'lon', lat: 51.51, lng: -0.13, label: 'London', status: 'ok', value: 88 },
  { id: 'tok', lat: 35.68, lng: 139.65, label: 'Tokyo', status: 'warning', value: 72 },
]

${showConnections ? `const connections: GeoConnection[] = [
  { from: 'nyc', to: 'lon', status: 'ok' },
  { from: 'lon', to: 'tok', status: 'warning' },
]

` : ''}<GeoMap
${props.join('\n')}
/>`
}

function generateHtmlCode(projection: Projection, showLabels: boolean, height: string): string {
  return `<!-- GeoMap — @annondeveloper/ui-kit -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/geo-map.css">

<div class="ui-geo-map" style="height: ${height}px">
  <!-- SVG map is rendered by the component -->
  <!-- For static HTML, use the exported geoToSvg() helper -->
  <!-- to calculate point positions -->
</div>

<script type="module">
  import { GeoMap } from '@annondeveloper/ui-kit'
  // Mount with your framework or use CSS-only approach
</script>`
}

function generateVueCode(tier: Tier, projection: Projection, showLabels: boolean, interactive: boolean, showConnections: boolean): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = ['  :points="points"']
  if (showConnections) attrs.push('  :connections="connections"')
  if (projection !== 'equirectangular') attrs.push(`  projection="${projection}"`)
  if (showLabels) attrs.push('  show-labels')
  if (interactive) attrs.push('  interactive')
  if (interactive) attrs.push('  @point-click="handlePointClick"')

  return `<template>
  <GeoMap
${attrs.join('\n')}
  />
</template>

<script setup>
import { GeoMap } from '${importPath}'
import { ref } from 'vue'

const points = ref([
  { id: 'nyc', lat: 40.71, lng: -74.01, label: 'New York', status: 'ok' },
  { id: 'lon', lat: 51.51, lng: -0.13, label: 'London', status: 'ok' },
])${showConnections ? `

const connections = ref([
  { from: 'nyc', to: 'lon', status: 'ok' },
])` : ''}

const handlePointClick = (point) => {
  console.log('Clicked:', point)
}
</script>`
}

function generateAngularCode(tier: Tier, projection: Projection, showLabels: boolean, interactive: boolean): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular — ${tier} tier -->
<ui-geo-map
  [points]="points"
  [connections]="connections"
  ${projection !== 'equirectangular' ? `projection="${projection}"` : ''}
  ${showLabels ? 'showLabels' : ''}
  ${interactive ? 'interactive' : ''}
  ${interactive ? '(pointClick)="onPointClick($event)"' : ''}
></ui-geo-map>

/* Import component CSS */
@import '${importPath}/css/components/geo-map.css';`
}

function generateSvelteCode(tier: Tier, projection: Projection, showLabels: boolean, interactive: boolean, showConnections: boolean): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = ['{points}']
  if (showConnections) attrs.push('{connections}')
  if (projection !== 'equirectangular') attrs.push(`projection="${projection}"`)
  if (showLabels) attrs.push('showLabels')
  if (interactive) attrs.push('interactive')
  if (interactive) attrs.push('on:pointClick={handleClick}')

  return `<script>
  import { GeoMap } from '${importPath}';

  const points = [
    { id: 'nyc', lat: 40.71, lng: -74.01, label: 'New York', status: 'ok' },
    { id: 'lon', lat: 51.51, lng: -0.13, label: 'London', status: 'ok' },
  ];${showConnections ? `

  const connections = [
    { from: 'nyc', to: 'lon', status: 'ok' },
  ];` : ''}

  function handleClick(point) {
    console.log('Clicked:', point);
  }
</script>

<GeoMap
  ${attrs.join('\n  ')}
/>`
}

// ─── Playground Section ────────────────────────────────────────────────────────

function PlaygroundSection({ tier }: { tier: Tier }) {
  const [projection, setProjection] = useState<Projection>('equirectangular')
  const [showLabels, setShowLabels] = useState(true)
  const [interactive, setInteractive] = useState(true)
  const [showConnections, setShowConnections] = useState(true)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [height, setHeight] = useState('300')
  const [clickLog, setClickLog] = useState<string[]>([])
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const handlePointClick = useCallback((point: GeoPoint) => {
    setClickLog(prev => [`Clicked: ${point.label ?? point.id} (${point.status})`, ...prev].slice(0, 10))
  }, [])

  const reactCode = useMemo(
    () => generateReactCode(tier, projection, showLabels, interactive, showConnections, motion, height),
    [tier, projection, showLabels, interactive, showConnections, motion, height],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(projection, showLabels, height),
    [projection, showLabels, height],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, projection, showLabels, interactive, showConnections),
    [tier, projection, showLabels, interactive, showConnections],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, projection, showLabels, interactive),
    [tier, projection, showLabels, interactive],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, projection, showLabels, interactive, showConnections),
    [tier, projection, showLabels, interactive, showConnections],
  )

  const codeTabs = [
    { id: 'react', label: 'React' },
    { id: 'html', label: 'HTML+CSS' },
    { id: 'vue', label: 'Vue' },
    { id: 'angular', label: 'Angular' },
    { id: 'svelte', label: 'Svelte' },
  ]

  const activeCode = useMemo(() => {
    switch (activeCodeTab) {
      case 'react': return reactCode
      case 'html': return htmlCode
      case 'vue': return vueCode
      case 'angular': return angularCode
      case 'svelte': return svelteCode
      default: return reactCode
    }
  }, [activeCodeTab, reactCode, htmlCode, vueCode, angularCode, svelteCode])

  return (
    <section className="geo-map-page__section" id="playground">
      <h2 className="geo-map-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="geo-map-page__section-desc">
        Configure the map props in real-time. Click points to see interaction events in the log below.
      </p>

      <div className="geo-map-page__playground">
        <div className="geo-map-page__playground-preview">
          <div className="geo-map-page__playground-result">
            <GeoMap
              points={SAMPLE_POINTS}
              connections={showConnections ? SAMPLE_CONNECTIONS : undefined}
              projection={projection}
              showLabels={showLabels}
              interactive={interactive}
              onPointClick={handlePointClick}
              height={Number(height)}
              motion={motion}
              style={{ width: '100%', position: 'relative', zIndex: 1 }}
            />
          </div>

          {interactive && clickLog.length > 0 && (
            <div className="geo-map-page__event-log">
              {clickLog.map((msg, i) => (
                <div key={i}>{msg}</div>
              ))}
            </div>
          )}

          <div className="geo-map-page__code-tabs">
            <div className="geo-map-page__export-row">
              <Button
                size="xs"
                variant="secondary"
                icon={<Icon name="copy" size="sm" />}
                onClick={() => {
                  navigator.clipboard?.writeText(activeCode).then(() => {
                    setCopyStatus(`Copied ${codeTabs.find(t => t.id === activeCodeTab)?.label}!`)
                    setTimeout(() => setCopyStatus(''), 2000)
                  })
                }}
              >
                Copy {codeTabs.find(t => t.id === activeCodeTab)?.label}
              </Button>
              {copyStatus && <span className="geo-map-page__export-status">{copyStatus}</span>}
            </div>
            <Tabs tabs={codeTabs} activeTab={activeCodeTab} onChange={setActiveCodeTab} size="sm" variant="pills">
              <TabPanel tabId="react">
                <CopyBlock code={reactCode} language="typescript" showLineNumbers />
              </TabPanel>
              <TabPanel tabId="html">
                <CopyBlock code={htmlCode} language="html" showLineNumbers />
              </TabPanel>
              <TabPanel tabId="vue">
                <CopyBlock code={vueCode} language="html" showLineNumbers />
              </TabPanel>
              <TabPanel tabId="angular">
                <CopyBlock code={angularCode} language="html" showLineNumbers />
              </TabPanel>
              <TabPanel tabId="svelte">
                <CopyBlock code={svelteCode} language="html" showLineNumbers />
              </TabPanel>
            </Tabs>
          </div>
        </div>

        <div className="geo-map-page__playground-controls">
          <OptionGroup
            label="Projection"
            options={['equirectangular', 'mercator'] as const}
            value={projection}
            onChange={v => setProjection(v as Projection)}
          />

          <OptionGroup
            label="Motion"
            options={['0', '1', '2', '3'] as const}
            value={String(motion) as '0' | '1' | '2' | '3'}
            onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
          />

          <div className="geo-map-page__control-group">
            <span className="geo-map-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Show labels" checked={showLabels} onChange={setShowLabels} />
              <Toggle label="Interactive" checked={interactive} onChange={setInteractive} />
              <Toggle label="Show connections" checked={showConnections} onChange={setShowConnections} />
            </div>
          </div>

          <div className="geo-map-page__control-group">
            <span className="geo-map-page__control-label">Height (px)</span>
            <input
              type="number"
              value={height}
              onChange={e => setHeight(e.target.value)}
              className="geo-map-page__option-btn"
              style={{ width: '100%', textAlign: 'center' }}
              min={150}
              max={600}
              step={50}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GeoMapPage() {
  useStyles('geo-map-page', pageStyles)

  const { tier, setTier } = useTier()

  // Scroll reveal fallback for browsers without animation-timeline
  useEffect(() => {
    const sections = document.querySelectorAll('.geo-map-page__section')
    if (!sections.length) return
    if (CSS.supports?.('animation-timeline', 'view()')) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            ;(entry.target as HTMLElement).style.opacity = '1'
            ;(entry.target as HTMLElement).style.transform = 'translateY(0) scale(1)'
            ;(entry.target as HTMLElement).style.filter = 'blur(0)'
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    sections.forEach(section => {
      ;(section as HTMLElement).style.opacity = '0'
      ;(section as HTMLElement).style.transform = 'translateY(32px) scale(0.98)'
      ;(section as HTMLElement).style.filter = 'blur(4px)'
      ;(section as HTMLElement).style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
      observer.observe(section)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="geo-map-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="geo-map-page__hero">
        <h1 className="geo-map-page__title">GeoMap</h1>
        <p className="geo-map-page__desc">
          Lightweight SVG world map with geographic point plotting, connection arcs, status indicators,
          and interactive hover/click. Zero dependencies, built-in continent outlines, OKLCH status colors.
        </p>
        <div className="geo-map-page__import-row">
          <code className="geo-map-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Point Statuses ──────────────────────────── */}
      <section className="geo-map-page__section" id="statuses">
        <h2 className="geo-map-page__section-title">
          <a href="#statuses">Status Colors</a>
        </h2>
        <p className="geo-map-page__section-desc">
          Points support four status states: ok (green), warning (amber), critical (red with pulse animation),
          and unknown (gray). Points without a status use the default brand color.
        </p>
        <div className="geo-map-page__preview geo-map-page__preview--col">
          <GeoMap
            points={STATUS_POINTS}
            showLabels
            height={250}
          />
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<GeoMap
  points={[
    { id: 's1', lat: 48.85, lng: 2.35, label: 'Paris', status: 'ok' },
    { id: 's2', lat: 55.75, lng: 37.62, label: 'Moscow', status: 'warning' },
    { id: 's3', lat: 22.31, lng: 114.17, label: 'Hong Kong', status: 'critical' },
    { id: 's4', lat: -23.55, lng: -46.63, label: 'Sao Paulo', status: 'unknown' },
  ]}
  showLabels
/>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 4. Connections ──────────────────────────────── */}
      <section className="geo-map-page__section" id="connections">
        <h2 className="geo-map-page__section-title">
          <a href="#connections">Connection Arcs</a>
        </h2>
        <p className="geo-map-page__section-desc">
          Draw curved connection lines between points to visualize network routes, traffic flows, or relationships.
          Connections animate with dashed stroke when motion is enabled. Each connection inherits status-based coloring.
        </p>
        <div className="geo-map-page__preview geo-map-page__preview--col">
          <GeoMap
            points={SAMPLE_POINTS}
            connections={SAMPLE_CONNECTIONS}
            showLabels
            height={280}
          />
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`const connections: GeoConnection[] = [
  { from: 'nyc', to: 'lon', status: 'ok', value: 850 },
  { from: 'lon', to: 'tok', status: 'warning', value: 340 },
  { from: 'sin', to: 'mum', status: 'critical', value: 210 },
]

<GeoMap points={points} connections={connections} showLabels />`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 5. Interactive Mode ─────────────────────────── */}
      <section className="geo-map-page__section" id="interactive">
        <h2 className="geo-map-page__section-title">
          <a href="#interactive">Interactive Mode</a>
        </h2>
        <p className="geo-map-page__section-desc">
          Enable the <code className="geo-map-page__a11y-key">interactive</code> prop to make points clickable and hoverable.
          Points get cursor pointer styling and brightness boost on hover.
        </p>
        <div className="geo-map-page__preview geo-map-page__preview--col">
          <GeoMap
            points={MINIMAL_POINTS}
            interactive
            showLabels
            onPointClick={(pt) => alert(`Clicked: ${pt.label}`)}
            height={220}
          />
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<GeoMap
  points={points}
  interactive
  showLabels
  onPointClick={(pt) => console.log('Clicked:', pt.label)}
  onPointHover={(pt) => setHovered(pt?.id ?? null)}
/>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 6. Value-based Sizing ──────────────────────── */}
      <section className="geo-map-page__section" id="sizing">
        <h2 className="geo-map-page__section-title">
          <a href="#sizing">Value-based Point Sizing</a>
        </h2>
        <p className="geo-map-page__section-desc">
          When points include a <code className="geo-map-page__a11y-key">value</code> property, the point radius
          scales proportionally. Higher values render larger dots, making it easy to visualize relative magnitudes
          like traffic volume or server load.
        </p>
        <div className="geo-map-page__preview geo-map-page__preview--col">
          <GeoMap
            points={[
              { id: 'v1', lat: 40.7, lng: -74, label: 'High (95)', value: 95, status: 'ok' },
              { id: 'v2', lat: 51.5, lng: -0.1, label: 'Medium (50)', value: 50, status: 'warning' },
              { id: 'v3', lat: 35.7, lng: 139.7, label: 'Low (10)', value: 10, status: 'critical' },
              { id: 'v4', lat: -33.9, lng: 151.2, label: 'None', status: 'unknown' },
            ]}
            showLabels
            height={240}
          />
        </div>
      </section>

      {/* ── 7. Motion Levels ──────────────────────────── */}
      <section className="geo-map-page__section" id="motion">
        <h2 className="geo-map-page__section-title">
          <a href="#motion">Motion Levels</a>
        </h2>
        <p className="geo-map-page__section-desc">
          Control animation intensity with the <code className="geo-map-page__a11y-key">motion</code> prop.
          Level 0 disables all animations (pulse, dash). Higher levels enable increasingly expressive motion.
        </p>
        <div className="geo-map-page__preview" style={{ flexDirection: 'column', gap: '1.5rem', alignItems: 'stretch' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBlockEnd: '0.5rem', fontWeight: 600 }}>motion=0 (no animation)</div>
              <GeoMap
                points={STATUS_POINTS.slice(0, 3)}
                connections={[{ from: 's1', to: 's2', status: 'ok' }]}
                motion={0}
                height={150}
              />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBlockEnd: '0.5rem', fontWeight: 600 }}>motion=3 (cinematic)</div>
              <GeoMap
                points={STATUS_POINTS.slice(0, 3)}
                connections={[{ from: 's1', to: 's2', status: 'ok' }]}
                motion={3}
                height={150}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Weight Tiers ────────────────────────────── */}
      <section className="geo-map-page__section" id="tiers">
        <h2 className="geo-map-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="geo-map-page__section-desc">
          GeoMap is available in the standard tier with full interactive features. The lite tier provides
          a static CSS-only rendering, while premium adds entrance animations and enhanced glow effects.
        </p>

        <div className="geo-map-page__tiers">
          {/* Lite */}
          <div
            className={`geo-map-page__tier-card${tier === 'lite' ? ' geo-map-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="geo-map-page__tier-header">
              <span className="geo-map-page__tier-name">Lite</span>
              <span className="geo-map-page__tier-size">~1.2 KB</span>
            </div>
            <p className="geo-map-page__tier-desc">
              Static SVG map with CSS-only styling. No interactivity, no animations,
              no connection arcs. Points rendered as static circles with status colors.
            </p>
            <div className="geo-map-page__tier-import">
              import {'{'} GeoMap {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="geo-map-page__tier-preview">
              <GeoMap
                points={MINIMAL_POINTS}
                showLabels
                height={120}
                motion={0}
              />
            </div>
            <div className="geo-map-page__size-breakdown">
              <div className="geo-map-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`geo-map-page__tier-card${tier === 'standard' ? ' geo-map-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="geo-map-page__tier-header">
              <span className="geo-map-page__tier-name">Standard</span>
              <span className="geo-map-page__tier-size">~3.8 KB</span>
            </div>
            <p className="geo-map-page__tier-desc">
              Full-featured map with interactive points, click/hover events, connection arcs,
              animated dashes, critical pulse, and value-based point sizing.
            </p>
            <div className="geo-map-page__tier-import">
              import {'{'} GeoMap {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="geo-map-page__tier-preview">
              <GeoMap
                points={MINIMAL_POINTS}
                connections={[{ from: 'a', to: 'b', status: 'ok' }]}
                showLabels
                interactive
                height={120}
              />
            </div>
            <div className="geo-map-page__size-breakdown">
              <div className="geo-map-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>3.8 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.7 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`geo-map-page__tier-card${tier === 'premium' ? ' geo-map-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="geo-map-page__tier-header">
              <span className="geo-map-page__tier-name">Premium</span>
              <span className="geo-map-page__tier-size">~5.2 KB</span>
            </div>
            <p className="geo-map-page__tier-desc">
              Everything in Standard plus entrance fade-in animation, aurora glow overlay,
              smooth point transitions, and enhanced connection trail effects.
            </p>
            <div className="geo-map-page__tier-import">
              import {'{'} GeoMap {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="geo-map-page__tier-preview">
              <GeoMap
                points={MINIMAL_POINTS}
                connections={[{ from: 'a', to: 'b', status: 'ok' }]}
                showLabels
                interactive
                height={120}
                motion={3}
              />
            </div>
            <div className="geo-map-page__size-breakdown">
              <div className="geo-map-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>5.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>6.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Props API ───────────────────────────────── */}
      <section className="geo-map-page__section" id="props">
        <h2 className="geo-map-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="geo-map-page__section-desc">
          All props accepted by GeoMap. It also spreads any native div HTML attributes
          onto the underlying container element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={geoMapProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className="geo-map-page__section" id="accessibility">
        <h2 className="geo-map-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="geo-map-page__section-desc">
          Built with semantic SVG and comprehensive ARIA support for geographic visualizations.
        </p>
        <Card variant="default" padding="md">
          <ul className="geo-map-page__a11y-list">
            <li className="geo-map-page__a11y-item">
              <span className="geo-map-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>SVG role:</strong> Map SVG has <code className="geo-map-page__a11y-key">role="img"</code> with
                a descriptive <code className="geo-map-page__a11y-key">aria-label</code> announcing the point count.
              </span>
            </li>
            <li className="geo-map-page__a11y-item">
              <span className="geo-map-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Interactive points:</strong> Clickable points receive proper cursor styling and hover feedback.
              </span>
            </li>
            <li className="geo-map-page__a11y-item">
              <span className="geo-map-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Status colors:</strong> All status colors use OKLCH values with sufficient contrast against the dark map background.
              </span>
            </li>
            <li className="geo-map-page__a11y-item">
              <span className="geo-map-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> Critical pulse and connection dash animations respect
                <code className="geo-map-page__a11y-key">motion=0</code> and <code className="geo-map-page__a11y-key">prefers-reduced-motion</code>.
              </span>
            </li>
            <li className="geo-map-page__a11y-item">
              <span className="geo-map-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Full <code className="geo-map-page__a11y-key">forced-colors: active</code> support
                with visible borders, Highlight fill for points, and CanvasText for labels.
              </span>
            </li>
            <li className="geo-map-page__a11y-item">
              <span className="geo-map-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print:</strong> Map renders cleanly in print with solid borders and no background fills.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
