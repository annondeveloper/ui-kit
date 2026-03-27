'use client'

import { useState, useMemo, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { StorageBar } from '@ui/domain/storage-bar'
import { StorageBar as LiteStorageBar } from '@ui/lite/storage-bar'
import { StorageBar as PremiumStorageBar } from '@ui/premium/storage-bar'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { Button } from '@ui/components/button'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.storage-bar-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: storage-bar-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .storage-bar-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .storage-bar-page__hero::before {
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
        animation: storage-bar-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes storage-bar-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .storage-bar-page__hero::before { animation: none; }
      }

      .storage-bar-page__title {
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

      .storage-bar-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .storage-bar-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .storage-bar-page__import-code {
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

      .storage-bar-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .storage-bar-page__section {
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
        animation: storage-bar-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes storage-bar-section-reveal {
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
        .storage-bar-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .storage-bar-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .storage-bar-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .storage-bar-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .storage-bar-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .storage-bar-page__preview {
        padding: 2.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        min-block-size: 80px;
      }

      .storage-bar-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .storage-bar-page__preview-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
        position: relative;
      }

      /* ── Playground ─────────────────────────────────── */

      .storage-bar-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @container storage-bar-page (max-width: 680px) {
        .storage-bar-page__playground {
          grid-template-columns: 1fr;
        }
        .storage-bar-page__playground-controls {
          position: static !important;
        }
      }

      @media (max-width: 768px) {
        .storage-bar-page__playground {
          grid-template-columns: 1fr;
        }
        .storage-bar-page__playground-controls {
          position: static !important;
        }
      }

      .storage-bar-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .storage-bar-page__playground-result {
        overflow-x: auto;
        min-block-size: 120px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 2rem 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .storage-bar-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .storage-bar-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .storage-bar-page__playground-controls {
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

      .storage-bar-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .storage-bar-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .storage-bar-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .storage-bar-page__option-btn {
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
      .storage-bar-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .storage-bar-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .storage-bar-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .storage-bar-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .storage-bar-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      .storage-bar-page__slider-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .storage-bar-page__slider {
        flex: 1;
        accent-color: var(--brand);
      }

      .storage-bar-page__slider-value {
        font-size: var(--text-sm, 0.875rem);
        font-variant-numeric: tabular-nums;
        color: var(--text-primary);
        min-inline-size: 3.5rem;
        text-align: end;
        font-weight: 600;
      }

      /* ── Segment editor ────────────────────────────── */

      .storage-bar-page__segment-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .storage-bar-page__segment-row {
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .storage-bar-page__segment-swatch {
        inline-size: 12px;
        block-size: 12px;
        border-radius: 2px;
        flex-shrink: 0;
      }

      .storage-bar-page__segment-name {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        min-inline-size: 4rem;
      }

      .storage-bar-page__segment-slider {
        flex: 1;
        accent-color: var(--brand);
      }

      .storage-bar-page__segment-value {
        font-size: var(--text-xs, 0.75rem);
        font-variant-numeric: tabular-nums;
        color: var(--text-primary);
        min-inline-size: 3rem;
        text-align: end;
      }

      /* ── Labeled row ────────────────────────────────── */

      .storage-bar-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 2rem;
        align-items: flex-end;
      }

      .storage-bar-page__labeled-item {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        flex: 1;
        min-inline-size: 200px;
      }

      .storage-bar-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .storage-bar-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .storage-bar-page__tier-card {
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

      .storage-bar-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .storage-bar-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .storage-bar-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .storage-bar-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .storage-bar-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .storage-bar-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .storage-bar-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .storage-bar-page__tier-import {
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

      .storage-bar-page__tier-preview {
        padding-block-start: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .storage-bar-page__code-tabs {
        margin-block-start: 1rem;
      }

      .storage-bar-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .storage-bar-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .storage-bar-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .storage-bar-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .storage-bar-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .storage-bar-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Source link ─────────────────────────────────── */

      .storage-bar-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .storage-bar-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .storage-bar-page__hero { padding: 2rem 1.25rem; }
        .storage-bar-page__title { font-size: 1.75rem; }
        .storage-bar-page__preview { padding: 1.75rem; }
        .storage-bar-page__playground { grid-template-columns: 1fr; }
        .storage-bar-page__playground-result { padding: 1.5rem 2rem; overflow-x: auto;
        min-block-size: 80px; }
        .storage-bar-page__labeled-row { gap: 1rem; }
        .storage-bar-page__tiers { grid-template-columns: 1fr; }
        .storage-bar-page__section { padding: 1.25rem; }
        .storage-bar-page__labeled-item { min-inline-size: 100%; }
      }

      @media (max-width: 400px) {
        .storage-bar-page__hero { padding: 1.5rem 1rem; }
        .storage-bar-page__title { font-size: 1.5rem; }
        .storage-bar-page__preview { padding: 1rem; }
      }

      /* ── Scrollbar ──────────────────────────────────── */

      .storage-bar-page__import-code,
      .storage-bar-page code,
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

const storageBarProps: PropDef[] = [
  { name: 'segments', type: 'StorageBarSegment[]', description: 'Array of segments with label (string), value (number), and optional color (string).' },
  { name: 'total', type: 'number', description: 'Total capacity in the same unit as segment values.' },
  { name: 'showLabels', type: 'boolean', default: 'false', description: 'Display segment labels inside the bar (hidden at sm size).' },
  { name: 'showLegend', type: 'boolean', default: 'false', description: 'Show a color-coded legend below the bar with segment names and values.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Bar height: sm (8px), md (16px), lg (24px).' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Size = 'sm' | 'md' | 'lg'

const SIZES: Size[] = ['sm', 'md', 'lg']

const DEFAULT_COLORS = [
  'oklch(65% 0.2 270)',
  'oklch(72% 0.19 155)',
  'oklch(78% 0.17 85)',
  'oklch(62% 0.22 25)',
  'oklch(70% 0.16 200)',
  'oklch(68% 0.18 320)',
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { StorageBar } from '@annondeveloper/ui-kit/lite'",
  standard: "import { StorageBar } from '@annondeveloper/ui-kit'",
  premium: "import { StorageBar } from '@annondeveloper/ui-kit/premium'",
}

interface SegmentData {
  label: string
  value: number
  color?: string
}

const DEMO_SEGMENTS_SERVER: SegmentData[] = [
  { label: 'System', value: 120 },
  { label: 'Applications', value: 340 },
  { label: 'Logs', value: 85 },
  { label: 'Backups', value: 200 },
]

const DEMO_SEGMENTS_LAPTOP: SegmentData[] = [
  { label: 'macOS', value: 35 },
  { label: 'Apps', value: 180 },
  { label: 'Photos', value: 95 },
  { label: 'Documents', value: 42 },
  { label: 'Other', value: 28 },
]

const DEMO_SEGMENTS_MINIMAL: SegmentData[] = [
  { label: 'Used', value: 640 },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="storage-bar-page__copy-btn"
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
    <div className="storage-bar-page__control-group">
      <span className="storage-bar-page__control-label">{label}</span>
      <div className="storage-bar-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`storage-bar-page__option-btn${opt === value ? ' storage-bar-page__option-btn--active' : ''}`}
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
    <label className="storage-bar-page__toggle-label">
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

function segmentsToCode(segments: SegmentData[]): string {
  return `[\n${segments.map(s => `  { label: '${s.label}', value: ${s.value} },`).join('\n')}\n]`
}

function generateReactCode(
  tier: Tier,
  segments: SegmentData[],
  total: number,
  size: Size,
  showLabels: boolean,
  showLegend: boolean,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]

  const props: string[] = []
  props.push(`  segments={segments}`)
  props.push(`  total={${total}}`)
  if (size !== 'md') props.push(`  size="${size}"`)
  if (showLabels) props.push('  showLabels')
  if (showLegend) props.push('  showLegend')
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  return `${importStr}

const segments = ${segmentsToCode(segments)}

<StorageBar
${props.join('\n')}
/>`
}

function generateHtmlCode(tier: Tier, segments: SegmentData[], total: number, size: Size): string {
  const tierLabel = tier === 'lite' ? 'lite' : tier === 'premium' ? 'premium' : 'standard'
  const height = size === 'sm' ? '8px' : size === 'lg' ? '24px' : '16px'
  const segDivs = segments.map((s, i) => {
    const pct = ((s.value / total) * 100).toFixed(1)
    const color = DEFAULT_COLORS[i % DEFAULT_COLORS.length]
    return `    <div style="width: ${pct}%; height: 100%; background: ${color};" title="${s.label}: ${s.value}"></div>`
  }).join('\n')

  return `<!-- StorageBar -- @annondeveloper/ui-kit ${tierLabel} tier -->
<div class="ui-storage-bar" data-size="${size}" role="img"
  aria-label="Storage usage">
  <div style="display: flex; height: ${height}; border-radius: 6px; overflow: hidden; background: oklch(100% 0 0 / 0.06);">
${segDivs}
  </div>
</div>

<style>
@import '@annondeveloper/ui-kit/css/components/storage-bar.css';
</style>`
}

function generateVueCode(tier: Tier, segments: SegmentData[], total: number, size: Size, showLabels: boolean, showLegend: boolean): string {
  if (tier === 'lite') {
    return `<template>
  <StorageBar :segments="segments" :total="${total}" ${showLegend ? 'show-legend ' : ''}/>
</template>

<script setup>
import { StorageBar } from '@annondeveloper/ui-kit/lite'

const segments = ${segmentsToCode(segments)}
</script>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = [':segments="segments"', `:total="${total}"`]
  if (size !== 'md') attrs.push(`size="${size}"`)
  if (showLabels) attrs.push('show-labels')
  if (showLegend) attrs.push('show-legend')

  return `<template>
  <StorageBar
    ${attrs.join('\n    ')}
  />
</template>

<script setup>
import { StorageBar } from '${importPath}'

const segments = ${segmentsToCode(segments)}
</script>`
}

function generateAngularCode(tier: Tier, segments: SegmentData[], total: number, size: Size): string {
  if (tier === 'lite') {
    return `<!-- Angular -- Lite tier (CSS-only) -->
<!-- Render segments manually as divs -->
<div class="ui-lite-storage-bar">
  <div style="display: flex; height: 14px; border-radius: 4px; overflow: hidden; background: oklch(100% 0 0 / 0.06);">
    <div *ngFor="let seg of segments; let i = index"
      [title]="seg.label + ': ' + seg.value"
      [style.width.%]="(seg.value / ${total}) * 100"
      [style.background]="colors[i % colors.length]">
    </div>
  </div>
</div>

/* In styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular -- ${tier === 'premium' ? 'Premium' : 'Standard'} tier -->
<div class="ui-storage-bar" data-size="${size}" role="img"
  [attr.aria-label]="'Storage usage'">
  <div class="ui-storage-bar__track">
    <div *ngFor="let seg of segments; let i = index" class="ui-storage-bar__segment"
      [style.inline-size.%]="(seg.value / ${total}) * 100"
      [style.background-color]="colors[i % colors.length]">
    </div>
  </div>
</div>

/* Import component CSS */
@import '${importPath}/css/components/storage-bar.css';`
}

function generateSvelteCode(tier: Tier, segments: SegmentData[], total: number, size: Size, showLabels: boolean, showLegend: boolean): string {
  if (tier === 'lite') {
    return `<!-- Svelte -- Lite tier -->
<script>
  import { StorageBar } from '@annondeveloper/ui-kit/lite';

  const segments = ${segmentsToCode(segments)};
</script>

<StorageBar segments={segments} total={${total}} ${showLegend ? 'showLegend ' : ''}/>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = ['segments={segments}', `total={${total}}`]
  if (size !== 'md') attrs.push(`size="${size}"`)
  if (showLabels) attrs.push('showLabels')
  if (showLegend) attrs.push('showLegend')

  return `<script>
  import { StorageBar } from '${importPath}';

  const segments = ${segmentsToCode(segments)};
</script>

<StorageBar
  ${attrs.join('\n  ')}
/>`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [segments, setSegments] = useState<SegmentData[]>([
    { label: 'System', value: 120 },
    { label: 'Apps', value: 340 },
    { label: 'Logs', value: 85 },
    { label: 'Backups', value: 200 },
  ])
  const [total, setTotal] = useState(1024)
  const [size, setSize] = useState<Size>('md')
  const [showLabels, setShowLabels] = useState(false)
  const [showLegend, setShowLegend] = useState(true)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')

  const BarComponent = tier === 'lite' ? LiteStorageBar : tier === 'premium' ? PremiumStorageBar : StorageBar

  const reactCode = useMemo(
    () => generateReactCode(tier, segments, total, size, showLabels, showLegend, motion),
    [tier, segments, total, size, showLabels, showLegend, motion],
  )
  const htmlCode = useMemo(() => generateHtmlCode(tier, segments, total, size), [tier, segments, total, size])
  const vueCode = useMemo(() => generateVueCode(tier, segments, total, size, showLabels, showLegend), [tier, segments, total, size, showLabels, showLegend])
  const angularCode = useMemo(() => generateAngularCode(tier, segments, total, size), [tier, segments, total, size])
  const svelteCode = useMemo(() => generateSvelteCode(tier, segments, total, size, showLabels, showLegend), [tier, segments, total, size, showLabels, showLegend])

  const [activeCodeTab, setActiveCodeTab] = useState('react')
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

  const updateSegment = (idx: number, value: number) => {
    setSegments(prev => prev.map((s, i) => i === idx ? { ...s, value } : s))
  }

  const barProps: Record<string, unknown> = {
    segments,
    total,
    showLegend,
  }
  if (tier !== 'lite') {
    barProps.size = size
    barProps.showLabels = showLabels
    barProps.motion = motion
  }

  return (
    <section className="storage-bar-page__section" id="playground">
      <h2 className="storage-bar-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="storage-bar-page__section-desc">
        Adjust segment values, total capacity, size, and display options. The generated code updates in real-time.
      </p>

      <div className="storage-bar-page__playground">
        <div className="storage-bar-page__playground-preview">
          <div className="storage-bar-page__playground-result">
            <BarComponent {...barProps as any} />
          </div>

          <div className="storage-bar-page__code-tabs">
            <div className="storage-bar-page__export-row">
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
              {copyStatus && <span className="storage-bar-page__export-status">{copyStatus}</span>}
            </div>
            <Tabs tabs={codeTabs} activeTab={activeCodeTab} onChange={setActiveCodeTab} size="sm" variant="pills">
              <TabPanel tabId="react"><CopyBlock code={reactCode} language="typescript" showLineNumbers /></TabPanel>
              <TabPanel tabId="html"><CopyBlock code={htmlCode} language="html" showLineNumbers /></TabPanel>
              <TabPanel tabId="vue"><CopyBlock code={vueCode} language="html" showLineNumbers /></TabPanel>
              <TabPanel tabId="angular"><CopyBlock code={angularCode} language="html" showLineNumbers /></TabPanel>
              <TabPanel tabId="svelte"><CopyBlock code={svelteCode} language="html" showLineNumbers /></TabPanel>
            </Tabs>
          </div>
        </div>

        <div className="storage-bar-page__playground-controls">
          {/* Segment sliders */}
          <div className="storage-bar-page__control-group">
            <span className="storage-bar-page__control-label">Segments</span>
            <div className="storage-bar-page__segment-list">
              {segments.map((seg, i) => (
                <div key={seg.label} className="storage-bar-page__segment-row">
                  <span
                    className="storage-bar-page__segment-swatch"
                    style={{ backgroundColor: DEFAULT_COLORS[i % DEFAULT_COLORS.length] }}
                  />
                  <span className="storage-bar-page__segment-name">{seg.label}</span>
                  <input
                    type="range"
                    min={0}
                    max={Math.round(total * 0.8)}
                    value={seg.value}
                    onChange={e => updateSegment(i, Number(e.target.value))}
                    className="storage-bar-page__segment-slider"
                  />
                  <span className="storage-bar-page__segment-value">{seg.value} GB</span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="storage-bar-page__control-group">
            <span className="storage-bar-page__control-label">Total Capacity (GB)</span>
            <div className="storage-bar-page__slider-row">
              <input
                type="range"
                min={256}
                max={4096}
                step={256}
                value={total}
                onChange={e => setTotal(Number(e.target.value))}
                className="storage-bar-page__slider"
              />
              <span className="storage-bar-page__slider-value">{total} GB</span>
            </div>
          </div>

          {tier !== 'lite' && (
            <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />
          )}

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="storage-bar-page__control-group">
            <span className="storage-bar-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {tier !== 'lite' && <Toggle label="Show Labels" checked={showLabels} onChange={setShowLabels} />}
              <Toggle label="Show Legend" checked={showLegend} onChange={setShowLegend} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StorageBarPage() {
  useStyles('storage-bar-page', pageStyles)

  const { tier, setTier } = useTier()
  const BarComponent = tier === 'lite' ? LiteStorageBar : tier === 'premium' ? PremiumStorageBar : StorageBar

  // Scroll reveal JS fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.storage-bar-page__section')
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
    <div className="storage-bar-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="storage-bar-page__hero">
        <h1 className="storage-bar-page__title">StorageBar</h1>
        <p className="storage-bar-page__desc">
          Segmented capacity bar for visualizing disk, memory, or resource usage.
          Shows proportional segments with tooltips, labels, and a color-coded legend.
        </p>
        <div className="storage-bar-page__import-row">
          <code className="storage-bar-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Different Data Sets ─────────────────────── */}
      <section className="storage-bar-page__section" id="datasets">
        <h2 className="storage-bar-page__section-title">
          <a href="#datasets">Different Data Sets</a>
        </h2>
        <p className="storage-bar-page__section-desc">
          StorageBar adapts to any number of segments and capacity sizes.
          Segments scale proportionally to the total.
        </p>
        <div className="storage-bar-page__preview">
          <span className="storage-bar-page__preview-label">Server (1 TB, 4 segments)</span>
          <BarComponent
            segments={DEMO_SEGMENTS_SERVER}
            total={1024}
            showLegend
            {...(tier !== 'lite' ? { size: 'md' as const } : {})}
          />

          <span className="storage-bar-page__preview-label">Laptop (512 GB, 5 segments)</span>
          <BarComponent
            segments={DEMO_SEGMENTS_LAPTOP}
            total={512}
            showLegend
            {...(tier !== 'lite' ? { size: 'md' as const } : {})}
          />

          <span className="storage-bar-page__preview-label">Simple (1 TB, single segment)</span>
          <BarComponent
            segments={DEMO_SEGMENTS_MINIMAL}
            total={1024}
            showLegend
            {...(tier !== 'lite' ? { size: 'md' as const } : {})}
          />
        </div>
      </section>

      {/* ── 4. Sizes ───────────────────────────────────── */}
      <section className="storage-bar-page__section" id="sizes">
        <h2 className="storage-bar-page__section-title">
          <a href="#sizes">Size Scale</a>
        </h2>
        <p className="storage-bar-page__section-desc">
          Three bar heights: sm (8px) for compact inline use, md (16px) for standard dashboards,
          and lg (24px) for prominent displays. Labels are hidden at sm size.
        </p>
        <div className="storage-bar-page__preview">
          {SIZES.map(s => (
            <div key={s} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100%', position: 'relative' }}>
              <span className="storage-bar-page__preview-label">{s}</span>
              {tier === 'lite' ? (
                <LiteStorageBar segments={DEMO_SEGMENTS_SERVER} total={1024} />
              ) : (
                <BarComponent
                  segments={DEMO_SEGMENTS_SERVER}
                  total={1024}
                  size={s}
                />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Labels & Legend ──────────────────────────── */}
      <section className="storage-bar-page__section" id="labels">
        <h2 className="storage-bar-page__section-title">
          <a href="#labels">Labels & Legend</a>
        </h2>
        <p className="storage-bar-page__section-desc">
          Enable <code>showLabels</code> to display segment names inside the bar (requires md or lg size).
          Enable <code>showLegend</code> for a detailed breakdown below.
        </p>
        <div className="storage-bar-page__preview">
          <span className="storage-bar-page__preview-label">with labels and legend</span>
          <BarComponent
            segments={DEMO_SEGMENTS_SERVER}
            total={1024}
            showLegend
            {...(tier !== 'lite' ? { showLabels: true, size: 'lg' as const } : {})}
          />

          <span className="storage-bar-page__preview-label">legend only</span>
          <BarComponent
            segments={DEMO_SEGMENTS_SERVER}
            total={1024}
            showLegend
            {...(tier !== 'lite' ? { size: 'md' as const } : {})}
          />

          <span className="storage-bar-page__preview-label">no labels, no legend</span>
          <BarComponent
            segments={DEMO_SEGMENTS_SERVER}
            total={1024}
            {...(tier !== 'lite' ? { size: 'md' as const } : {})}
          />
        </div>
      </section>

      {/* ── 6. Custom Colors ───────────────────────────── */}
      <section className="storage-bar-page__section" id="colors">
        <h2 className="storage-bar-page__section-title">
          <a href="#colors">Custom Colors</a>
        </h2>
        <p className="storage-bar-page__section-desc">
          Pass a <code>color</code> property on each segment to override the default palette.
          Useful for matching brand guidelines or semantic coloring.
        </p>
        <div className="storage-bar-page__preview">
          <BarComponent
            segments={[
              { label: 'Critical', value: 250, color: 'oklch(62% 0.22 25)' },
              { label: 'Warning', value: 180, color: 'oklch(78% 0.17 85)' },
              { label: 'Healthy', value: 420, color: 'oklch(72% 0.19 155)' },
            ]}
            total={1024}
            showLegend
            {...(tier !== 'lite' ? { size: 'lg' as const, showLabels: true } : {})}
          />
        </div>
      </section>

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className="storage-bar-page__section" id="tiers">
        <h2 className="storage-bar-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="storage-bar-page__section-desc">
          Choose the right balance of features and bundle size. Lite renders a simple inline bar.
          Premium adds grow-in animation, hover glow, and shimmer sweep effects.
        </p>

        <div className="storage-bar-page__tiers">
          {/* Lite */}
          <div
            className={`storage-bar-page__tier-card${tier === 'lite' ? ' storage-bar-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="storage-bar-page__tier-header">
              <span className="storage-bar-page__tier-name">Lite</span>
              <span className="storage-bar-page__tier-size">~0.4 KB</span>
            </div>
            <p className="storage-bar-page__tier-desc">
              Simple inline bar with title tooltips. No scoped CSS, no animation,
              no labels, basic legend option.
            </p>
            <div className="storage-bar-page__tier-import">
              import {'{'} StorageBar {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="storage-bar-page__tier-preview">
              <LiteStorageBar segments={DEMO_SEGMENTS_SERVER} total={1024} showLegend />
            </div>
          </div>

          {/* Standard */}
          <div
            className={`storage-bar-page__tier-card${tier === 'standard' ? ' storage-bar-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="storage-bar-page__tier-header">
              <span className="storage-bar-page__tier-name">Standard</span>
              <span className="storage-bar-page__tier-size">~2.0 KB</span>
            </div>
            <p className="storage-bar-page__tier-desc">
              Full-featured with scoped CSS, hover tooltips, segment labels,
              legend, three sizes, motion control, and error boundary.
            </p>
            <div className="storage-bar-page__tier-import">
              import {'{'} StorageBar {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="storage-bar-page__tier-preview">
              <StorageBar segments={DEMO_SEGMENTS_SERVER} total={1024} showLegend size="md" />
            </div>
          </div>

          {/* Premium */}
          <div
            className={`storage-bar-page__tier-card${tier === 'premium' ? ' storage-bar-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="storage-bar-page__tier-header">
              <span className="storage-bar-page__tier-name">Premium</span>
              <span className="storage-bar-page__tier-size">~2.8 KB</span>
            </div>
            <p className="storage-bar-page__tier-desc">
              Everything in Standard plus spring-eased segment grow-in,
              hover brightness glow, and shimmer sweep animation.
            </p>
            <div className="storage-bar-page__tier-import">
              import {'{'} StorageBar {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="storage-bar-page__tier-preview">
              <PremiumStorageBar segments={DEMO_SEGMENTS_SERVER} total={1024} showLegend size="md" />
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Props API ───────────────────────────────── */}
      <section className="storage-bar-page__section" id="props">
        <h2 className="storage-bar-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="storage-bar-page__section-desc">
          All props accepted by StorageBar. It also spreads any native div HTML attributes
          onto the underlying container element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={storageBarProps} />
        </Card>
      </section>

      {/* ── 9. Accessibility ──────────────────────────── */}
      <section className="storage-bar-page__section" id="accessibility">
        <h2 className="storage-bar-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="storage-bar-page__section-desc">
          Built with semantic markup and comprehensive ARIA support for assistive technologies.
        </p>
        <Card variant="default" padding="md">
          <ul className="storage-bar-page__a11y-list">
            <li className="storage-bar-page__a11y-item">
              <span className="storage-bar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Role:</strong> Uses <code className="storage-bar-page__a11y-key">role="img"</code> with descriptive aria-label showing used/total capacity.
              </span>
            </li>
            <li className="storage-bar-page__a11y-item">
              <span className="storage-bar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Tooltips:</strong> Hover tooltips show segment name, value, and percentage.
              </span>
            </li>
            <li className="storage-bar-page__a11y-item">
              <span className="storage-bar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Legend:</strong> Color-coded legend provides text alternatives for segment colors.
              </span>
            </li>
            <li className="storage-bar-page__a11y-item">
              <span className="storage-bar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> Respects <code className="storage-bar-page__a11y-key">prefers-reduced-motion</code> and motion level settings.
              </span>
            </li>
            <li className="storage-bar-page__a11y-item">
              <span className="storage-bar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="storage-bar-page__a11y-key">forced-colors: active</code> with visible segment borders and track outline.
              </span>
            </li>
            <li className="storage-bar-page__a11y-item">
              <span className="storage-bar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Value formatting:</strong> Automatically formats values with TB/GB units for human readability.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 10. Source ─────────────────────────────────── */}
      <section className="storage-bar-page__section" id="source">
        <h2 className="storage-bar-page__section-title">
          <a href="#source">Source</a>
        </h2>
        <p className="storage-bar-page__section-desc">
          View the component source code on GitHub.
        </p>
        <a
          href="https://github.com/annondeveloper/ui-kit/blob/main/src/domain/storage-bar.tsx"
          target="_blank"
          rel="noopener noreferrer"
          className="storage-bar-page__source-link"
        >
          <Icon name="code" size="sm" /> src/domain/storage-bar.tsx
        </a>
      </section>
    </div>
  )
}
