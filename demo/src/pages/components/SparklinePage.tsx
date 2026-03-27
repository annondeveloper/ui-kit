'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Sparkline } from '@ui/domain/sparkline'
import { Sparkline as LiteSparkline } from '@ui/lite/sparkline'
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
    @scope (.sparkline-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: sparkline-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .sparkline-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .sparkline-page__hero::before {
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
        animation: sparkline-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes sparkline-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .sparkline-page__hero::before { animation: none; }
      }

      .sparkline-page__title {
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

      .sparkline-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .sparkline-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .sparkline-page__import-code {
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

      .sparkline-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .sparkline-page__section {
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
        animation: sparkline-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes sparkline-section-reveal {
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
        .sparkline-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .sparkline-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .sparkline-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .sparkline-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .sparkline-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .sparkline-page__preview {
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

      .sparkline-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .sparkline-page__preview--col {
        flex-direction: column;
        align-items: stretch;
      }

      /* ── Playground ─────────────────────────────────── */

      .sparkline-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @container sparkline-page (max-width: 680px) {
        .sparkline-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .sparkline-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .sparkline-page__playground-result {
        min-block-size: 200px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .sparkline-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .sparkline-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .sparkline-page__playground-controls {
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

      .sparkline-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .sparkline-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .sparkline-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .sparkline-page__option-btn {
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
      .sparkline-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .sparkline-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .sparkline-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .sparkline-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .sparkline-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .sparkline-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .sparkline-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .sparkline-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .sparkline-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .sparkline-page__tier-card {
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

      .sparkline-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .sparkline-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .sparkline-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .sparkline-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .sparkline-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .sparkline-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .sparkline-page__tier-import {
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

      .sparkline-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      .sparkline-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .sparkline-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .sparkline-page__code-tabs {
        margin-block-start: 1rem;
      }

      .sparkline-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .sparkline-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .sparkline-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .sparkline-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .sparkline-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .sparkline-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Source link ─────────────────────────────────── */

      .sparkline-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .sparkline-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Color grid ────────────────────────────────── */

      .sparkline-page__color-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
      }

      .sparkline-page__color-card {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 1rem;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        background: var(--bg-base);
      }

      .sparkline-page__color-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .sparkline-page__hero { padding: 2rem 1.25rem; }
        .sparkline-page__title { font-size: 1.75rem; }
        .sparkline-page__preview { padding: 1.75rem; }
        .sparkline-page__playground { grid-template-columns: 1fr; }
        .sparkline-page__playground-result { padding: 2rem; min-block-size: 120px; }
        .sparkline-page__tiers { grid-template-columns: 1fr; }
        .sparkline-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .sparkline-page__hero { padding: 1.5rem 1rem; }
        .sparkline-page__title { font-size: 1.5rem; }
        .sparkline-page__preview { padding: 1rem; }
      }

      /* ── Scrollbar ──────────────────────────────────── */

      .sparkline-page__import-code,
      .sparkline-page code,
      pre {
        overflow-x: auto;
        scrollbar-width: thin;
        scrollbar-color: var(--border-default) transparent;
        max-inline-size: 100%;
      }

      :scope ::-webkit-scrollbar { width: 4px; height: 4px; }
      :scope ::-webkit-scrollbar-track { background: transparent; }
      :scope ::-webkit-scrollbar-thumb { background: var(--border-default); border-radius: 2px; }
      :scope ::-webkit-scrollbar-thumb:hover { background: var(--border-strong); }
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const sparklineProps: PropDef[] = [
  { name: 'data', type: 'number[]', required: true, description: 'Array of numeric values to render as the sparkline.' },
  { name: 'width', type: "number | string", default: "'100%'", description: 'Width of the sparkline container. Number is px, string allows any CSS unit.' },
  { name: 'height', type: 'number', default: '32', description: 'Height of the SVG in pixels.' },
  { name: 'color', type: 'string', default: "'oklch(65% 0.2 270)'", description: 'Stroke color. Accepts any CSS color value.' },
  { name: 'gradient', type: 'boolean', default: 'true', description: 'Show a gradient fill beneath the line (standard tier only).' },
  { name: 'showTooltip', type: 'boolean', default: 'false', description: 'Show value tooltip on hover (standard tier only).' },
  { name: 'animate', type: 'boolean', default: 'true', description: 'Animate the sparkline drawing (standard tier only).' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Cascades from OS > prop > CSS --motion > UIProvider.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { Sparkline } from '@annondeveloper/ui-kit/lite'",
  standard: "import { Sparkline } from '@annondeveloper/ui-kit'",
  premium: "import { Sparkline } from '@annondeveloper/ui-kit'",
}

const SAMPLE_DATA = [4, 8, 15, 16, 23, 42, 38, 35, 30, 25, 28, 33, 40, 45, 50, 48, 42, 38, 35, 40]
const UPTREND_DATA = [10, 12, 15, 18, 22, 28, 35, 40, 48, 55, 60, 68, 75, 80, 85, 90, 92, 95, 97, 100]
const DOWNTREND_DATA = [100, 95, 90, 82, 78, 70, 65, 58, 50, 45, 42, 38, 30, 25, 22, 18, 15, 12, 10, 8]
const VOLATILE_DATA = [50, 80, 20, 90, 10, 75, 35, 95, 5, 60, 40, 85, 15, 70, 30, 88, 12, 65, 45, 55]
const FLAT_DATA = [50, 51, 49, 50, 52, 48, 51, 50, 49, 51, 50, 48, 52, 50, 51, 49, 50, 51, 50, 49]

const COLOR_OPTIONS = [
  { value: 'oklch(65% 0.2 270)', label: 'Brand (default)' },
  { value: 'oklch(72% 0.19 155)', label: 'Green' },
  { value: 'oklch(62% 0.22 25)', label: 'Red' },
  { value: 'oklch(80% 0.18 85)', label: 'Amber' },
  { value: 'oklch(65% 0.15 220)', label: 'Cyan' },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="sparkline-page__copy-btn"
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
    <div className="sparkline-page__control-group">
      <span className="sparkline-page__control-label">{label}</span>
      <div className="sparkline-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`sparkline-page__option-btn${opt === value ? ' sparkline-page__option-btn--active' : ''}`}
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
    <label className="sparkline-page__toggle-label">
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

type DatasetName = 'sample' | 'uptrend' | 'downtrend' | 'volatile' | 'flat'

function generateReactCode(
  tier: Tier,
  height: number,
  color: string,
  gradient: boolean,
  showTooltip: boolean,
  motion: number,
  dataset: DatasetName,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const dataVar = `const data = [${dataset === 'sample' ? '4, 8, 15, 16, 23, 42, 38, 35, 30, 25' : dataset === 'uptrend' ? '10, 12, 15, 18, 22, 28, 35, 40, 48, 55' : dataset === 'downtrend' ? '100, 95, 90, 82, 78, 70, 65, 58, 50, 45' : dataset === 'volatile' ? '50, 80, 20, 90, 10, 75, 35, 95, 5, 60' : '50, 51, 49, 50, 52, 48, 51, 50, 49, 51'}]`

  const props: string[] = ['  data={data}']
  if (height !== 32) props.push(`  height={${height}}`)
  if (color !== 'oklch(65% 0.2 270)') props.push(`  color="${color}"`)
  if (tier !== 'lite') {
    if (!gradient) props.push('  gradient={false}')
    if (showTooltip) props.push('  showTooltip')
    if (motion !== 3) props.push(`  motion={${motion}}`)
  }

  return `${importStr}\n\n${dataVar}\n\n<Sparkline\n${props.join('\n')}\n/>`
}

function generateHtmlCode(tier: Tier, height: number, color: string): string {
  return `<!-- Sparkline — @annondeveloper/ui-kit ${tier} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/sparkline.css">

<div class="${tier === 'lite' ? 'ui-lite-sparkline' : 'ui-sparkline'}">
  <svg viewBox="0 0 100 ${height}" preserveAspectRatio="none"
       style="width: 100%; height: ${height}px">
    <polyline
      points="0,80 10,60 20,40 30,35 40,20 50,0 60,8 70,15 80,25 90,35"
      fill="none"
      stroke="${color}"
      stroke-width="2"
      vector-effect="non-scaling-stroke"
    />
  </svg>
</div>`
}

function generateVueCode(tier: Tier, height: number, showTooltip: boolean): string {
  if (tier === 'lite') {
    return `<template>
  <div class="ui-lite-sparkline">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none"
         :width="'100%'" :height="${height}">
      <polyline :points="points" fill="none" stroke="var(--brand)"
                stroke-width="2" vector-effect="non-scaling-stroke" />
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const data = [4, 8, 15, 16, 23, 42, 38, 35, 30, 25]
const points = computed(() => /* map data to SVG points */)
</script>`
  }
  return `<template>
  <Sparkline
    :data="data"
    :height="${height}"
    ${showTooltip ? 'show-tooltip' : ''}
  />
</template>

<script setup>
import { Sparkline } from '@annondeveloper/ui-kit'
const data = [4, 8, 15, 16, 23, 42, 38, 35, 30, 25]
</script>`
}

function generateAngularCode(tier: Tier, height: number): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (CSS-only SVG) -->
<div class="ui-lite-sparkline">
  <svg viewBox="0 0 100 100" preserveAspectRatio="none"
       width="100%" [attr.height]="${height}">
    <polyline [attr.points]="points" fill="none"
              stroke="var(--brand)" stroke-width="2" />
  </svg>
</div>

/* styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }
  return `<!-- Angular — use the CSS-only approach or React wrapper -->
<div class="ui-sparkline">
  <svg viewBox="0 0 100 ${height}" preserveAspectRatio="none">
    <polyline [attr.points]="points" fill="none"
              stroke="var(--brand)" stroke-width="2" />
  </svg>
</div>

/* Import component CSS */
@import '@annondeveloper/ui-kit/css/components/sparkline.css';`
}

function generateSvelteCode(tier: Tier, height: number, showTooltip: boolean): string {
  if (tier === 'lite') {
    return `<div class="ui-lite-sparkline">
  <svg viewBox="0 0 100 100" preserveAspectRatio="none"
       width="100%" height="${height}">
    <polyline points={points} fill="none" stroke="var(--brand)"
              stroke-width="2" vector-effect="non-scaling-stroke" />
  </svg>
</div>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }
  return `<script>
  import { Sparkline } from '@annondeveloper/ui-kit';
  const data = [4, 8, 15, 16, 23, 42, 38, 35, 30, 25];
</script>

<Sparkline
  {data}
  height={${height}}
  ${showTooltip ? 'showTooltip' : ''}
/>`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier }: { tier: Tier }) {
  const [height, setHeight] = useState(32)
  const [colorIdx, setColorIdx] = useState(0)
  const [gradient, setGradient] = useState(true)
  const [showTooltip, setShowTooltip] = useState(false)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [dataset, setDataset] = useState<DatasetName>('sample')
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const color = COLOR_OPTIONS[colorIdx].value
  const dataMap: Record<DatasetName, number[]> = {
    sample: SAMPLE_DATA,
    uptrend: UPTREND_DATA,
    downtrend: DOWNTREND_DATA,
    volatile: VOLATILE_DATA,
    flat: FLAT_DATA,
  }

  const reactCode = useMemo(() => generateReactCode(tier, height, color, gradient, showTooltip, motion, dataset), [tier, height, color, gradient, showTooltip, motion, dataset])
  const htmlCode = useMemo(() => generateHtmlCode(tier, height, color), [tier, height, color])
  const vueCode = useMemo(() => generateVueCode(tier, height, showTooltip), [tier, height, showTooltip])
  const angularCode = useMemo(() => generateAngularCode(tier, height), [tier, height])
  const svelteCode = useMemo(() => generateSvelteCode(tier, height, showTooltip), [tier, height, showTooltip])

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

  const SparkComponent = tier === 'lite' ? LiteSparkline : Sparkline

  const sparkProps: Record<string, unknown> = {
    data: dataMap[dataset],
    height,
    color,
    width: '100%',
  }
  if (tier !== 'lite') {
    sparkProps.gradient = gradient
    sparkProps.showTooltip = showTooltip
    sparkProps.motion = motion
  }

  return (
    <section className="sparkline-page__section" id="playground">
      <h2 className="sparkline-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="sparkline-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="sparkline-page__playground">
        <div className="sparkline-page__playground-preview">
          <div className="sparkline-page__playground-result">
            <div style={{ width: '100%', position: 'relative', zIndex: 1 }}>
              <SparkComponent {...sparkProps as any} />
            </div>
          </div>

          <div className="sparkline-page__code-tabs">
            <div className="sparkline-page__export-row">
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
              {copyStatus && <span className="sparkline-page__export-status">{copyStatus}</span>}
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

        <div className="sparkline-page__playground-controls">
          <OptionGroup
            label="Dataset"
            options={['sample', 'uptrend', 'downtrend', 'volatile', 'flat'] as const}
            value={dataset}
            onChange={setDataset}
          />
          <OptionGroup
            label="Height"
            options={['24', '32', '48', '64'] as const}
            value={String(height)}
            onChange={v => setHeight(Number(v))}
          />
          <OptionGroup
            label="Color"
            options={COLOR_OPTIONS.map(c => c.label) as any}
            value={COLOR_OPTIONS[colorIdx].label}
            onChange={v => setColorIdx(COLOR_OPTIONS.findIndex(c => c.label === v))}
          />
          {tier !== 'lite' && (
            <>
              <OptionGroup
                label="Motion"
                options={['0', '1', '2', '3'] as const}
                value={String(motion) as '0' | '1' | '2' | '3'}
                onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
              />
              <div className="sparkline-page__control-group">
                <span className="sparkline-page__control-label">Toggles</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <Toggle label="Gradient fill" checked={gradient} onChange={setGradient} />
                  <Toggle label="Show tooltip" checked={showTooltip} onChange={setShowTooltip} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SparklinePage() {
  useStyles('sparkline-page', pageStyles)

  const { tier, setTier } = useTier()
  const pageRef = useRef<HTMLDivElement>(null)

  // Scroll reveal for sections — JS fallback for browsers without animation-timeline
  useEffect(() => {
    const sections = document.querySelectorAll('.sparkline-page__section')
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

  const SparkComponent = tier === 'lite' ? LiteSparkline : Sparkline

  return (
    <div className="sparkline-page" ref={pageRef}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="sparkline-page__hero">
        <h1 className="sparkline-page__title">Sparkline</h1>
        <p className="sparkline-page__desc">
          Inline micro-chart for visualizing trends and data patterns. Renders as an SVG
          with smooth bezier curves, optional gradient fill, hover tooltips, and animation.
        </p>
        <div className="sparkline-page__import-row">
          <code className="sparkline-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Data Patterns ───────────────────────────── */}
      <section className="sparkline-page__section" id="patterns">
        <h2 className="sparkline-page__section-title">
          <a href="#patterns">Data Patterns</a>
        </h2>
        <p className="sparkline-page__section-desc">
          Sparklines adapt gracefully to different data shapes — uptrends, downtrends, volatility, and flat lines.
        </p>
        <div className="sparkline-page__preview sparkline-page__preview--col" style={{ gap: '2rem' }}>
          <div className="sparkline-page__labeled-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1.25rem' }}>
            {[
              { label: 'Sample', data: SAMPLE_DATA },
              { label: 'Uptrend', data: UPTREND_DATA },
              { label: 'Downtrend', data: DOWNTREND_DATA },
              { label: 'Volatile', data: VOLATILE_DATA },
              { label: 'Flat', data: FLAT_DATA },
            ].map(({ label, data }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="sparkline-page__item-label" style={{ minInlineSize: '5rem', textAlign: 'end' }}>{label}</span>
                <div style={{ flex: 1 }}>
                  <SparkComponent
                    data={data}
                    height={32}
                    width="100%"
                    {...(tier !== 'lite' ? { gradient: true, showTooltip: true } : {})}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Heights ─────────────────────────────────── */}
      <section className="sparkline-page__section" id="heights">
        <h2 className="sparkline-page__section-title">
          <a href="#heights">Height Variations</a>
        </h2>
        <p className="sparkline-page__section-desc">
          Adjust height from compact 24px inline indicators to taller 64px detail views.
        </p>
        <div className="sparkline-page__preview sparkline-page__preview--col" style={{ gap: '1.5rem' }}>
          {[24, 32, 48, 64].map(h => (
            <div key={h} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span className="sparkline-page__item-label" style={{ minInlineSize: '3rem', textAlign: 'end' }}>{h}px</span>
              <div style={{ flex: 1 }}>
                <SparkComponent data={SAMPLE_DATA} height={h} width="100%" {...(tier !== 'lite' ? { gradient: true } : {})} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Colors ──────────────────────────────────── */}
      <section className="sparkline-page__section" id="colors">
        <h2 className="sparkline-page__section-title">
          <a href="#colors">Color Options</a>
        </h2>
        <p className="sparkline-page__section-desc">
          Customize the stroke color to match your brand or convey semantic meaning — green for positive trends, red for negative.
        </p>
        <div className="sparkline-page__color-grid">
          {COLOR_OPTIONS.map(({ value, label }) => (
            <div key={label} className="sparkline-page__color-card">
              <span className="sparkline-page__color-label">{label}</span>
              <SparkComponent
                data={UPTREND_DATA}
                height={40}
                width="100%"
                color={value}
                {...(tier !== 'lite' ? { gradient: true } : {})}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. Tooltip (Standard only) ────────────────── */}
      {tier !== 'lite' && (
        <section className="sparkline-page__section" id="tooltip">
          <h2 className="sparkline-page__section-title">
            <a href="#tooltip">Hover Tooltip</a>
          </h2>
          <p className="sparkline-page__section-desc">
            Enable <code>showTooltip</code> for an interactive crosshair that reveals exact values on hover.
            A dot indicator marks the active data point.
          </p>
          <div className="sparkline-page__preview">
            <div style={{ width: '100%', maxWidth: '400px' }}>
              <Sparkline
                data={SAMPLE_DATA}
                height={48}
                width="100%"
                showTooltip
                gradient
              />
            </div>
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`<Sparkline\n  data={[4, 8, 15, 16, 23, 42, 38, 35]}\n  height={48}\n  showTooltip\n  gradient\n/>`}
              language="typescript"
            />
          </div>
        </section>
      )}

      {/* ── 7. Inline Usage ────────────────────────────── */}
      <section className="sparkline-page__section" id="inline">
        <h2 className="sparkline-page__section-title">
          <a href="#inline">Inline Usage</a>
        </h2>
        <p className="sparkline-page__section-desc">
          Sparklines are inline-block by default, making them perfect for embedding in text, tables, or dashboards alongside numbers.
        </p>
        <div className="sparkline-page__preview" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: 'var(--text-sm)' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Revenue</span>
            <SparkComponent data={UPTREND_DATA} height={20} width={80} color="oklch(72% 0.19 155)" {...(tier !== 'lite' ? { gradient: false } : {})} />
            <span style={{ color: 'oklch(72% 0.19 155)', fontWeight: 700 }}>+24%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: 'var(--text-sm)' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Errors</span>
            <SparkComponent data={DOWNTREND_DATA} height={20} width={80} color="oklch(62% 0.22 25)" {...(tier !== 'lite' ? { gradient: false } : {})} />
            <span style={{ color: 'oklch(62% 0.22 25)', fontWeight: 700 }}>-18%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: 'var(--text-sm)' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Latency</span>
            <SparkComponent data={VOLATILE_DATA} height={20} width={80} color="oklch(80% 0.18 85)" {...(tier !== 'lite' ? { gradient: false } : {})} />
            <span style={{ color: 'oklch(80% 0.18 85)', fontWeight: 700 }}>~42ms</span>
          </div>
        </div>
      </section>

      {/* ── 8. Weight Tiers ────────────────────────────── */}
      <section className="sparkline-page__section" id="tiers">
        <h2 className="sparkline-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="sparkline-page__section-desc">
          Choose the right balance of features and bundle size. Lite is a zero-JS SVG polyline,
          Standard adds bezier curves, gradient, tooltip, and animation.
        </p>

        <div className="sparkline-page__tiers">
          {/* Lite */}
          <div
            className={`sparkline-page__tier-card${tier === 'lite' ? ' sparkline-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="sparkline-page__tier-header">
              <span className="sparkline-page__tier-name">Lite</span>
              <span className="sparkline-page__tier-size">~0.2 KB</span>
            </div>
            <p className="sparkline-page__tier-desc">
              Simple SVG polyline with no JavaScript logic beyond the forwardRef wrapper.
              No gradient, no tooltip, no animation. Pure data visualization.
            </p>
            <div className="sparkline-page__tier-import">
              import {'{'} Sparkline {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="sparkline-page__tier-preview">
              <LiteSparkline data={SAMPLE_DATA} height={32} width={160} />
            </div>
            <div className="sparkline-page__size-breakdown">
              <div className="sparkline-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`sparkline-page__tier-card${tier === 'standard' ? ' sparkline-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="sparkline-page__tier-header">
              <span className="sparkline-page__tier-name">Standard</span>
              <span className="sparkline-page__tier-size">~1.2 KB</span>
            </div>
            <p className="sparkline-page__tier-desc">
              Full-featured sparkline with smooth bezier curves, gradient fill,
              hover tooltip with crosshair, animation support, and motion levels.
            </p>
            <div className="sparkline-page__tier-import">
              import {'{'} Sparkline {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="sparkline-page__tier-preview">
              <Sparkline data={SAMPLE_DATA} height={32} width={160} showTooltip gradient />
            </div>
            <div className="sparkline-page__size-breakdown">
              <div className="sparkline-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`sparkline-page__tier-card${tier === 'premium' ? ' sparkline-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="sparkline-page__tier-header">
              <span className="sparkline-page__tier-name">Premium</span>
              <span className="sparkline-page__tier-size">~1.2 KB</span>
            </div>
            <p className="sparkline-page__tier-desc">
              Same as Standard — Sparkline is a data visualization component where additional
              premium effects (glow, particles) are not applicable. Use Standard tier.
            </p>
            <div className="sparkline-page__tier-import">
              import {'{'} Sparkline {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="sparkline-page__tier-preview">
              <Sparkline data={SAMPLE_DATA} height={32} width={160} showTooltip gradient />
            </div>
            <div className="sparkline-page__size-breakdown">
              <div className="sparkline-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Props API ───────────────────────────────── */}
      <section className="sparkline-page__section" id="props">
        <h2 className="sparkline-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="sparkline-page__section-desc">
          All props accepted by Sparkline. It also spreads any native div HTML attributes
          onto the underlying wrapper element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={sparklineProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className="sparkline-page__section" id="accessibility">
        <h2 className="sparkline-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="sparkline-page__section-desc">
          Sparklines are decorative data visualizations with appropriate ARIA handling.
        </p>
        <Card variant="default" padding="md">
          <ul className="sparkline-page__a11y-list">
            <li className="sparkline-page__a11y-item">
              <span className="sparkline-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Decorative:</strong> SVG has <code className="sparkline-page__a11y-key">aria-hidden="true"</code> since sparklines supplement text data.
              </span>
            </li>
            <li className="sparkline-page__a11y-item">
              <span className="sparkline-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Color independence:</strong> Never relies solely on color — always pair with text values or labels.
              </span>
            </li>
            <li className="sparkline-page__a11y-item">
              <span className="sparkline-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Tooltip:</strong> Hover tooltip shows exact values for precision, not just visual trends.
              </span>
            </li>
            <li className="sparkline-page__a11y-item">
              <span className="sparkline-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="sparkline-page__a11y-key">forced-colors: active</code> with CanvasText stroke.
              </span>
            </li>
            <li className="sparkline-page__a11y-item">
              <span className="sparkline-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Motion:</strong> Respects <code className="sparkline-page__a11y-key">prefers-reduced-motion</code> — animations disabled at motion level 0.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
