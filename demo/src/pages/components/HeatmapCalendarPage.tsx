'use client'

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { HeatmapCalendar, type HeatmapData } from '@ui/domain/heatmap-calendar'
import { HeatmapCalendar as LiteHeatmapCalendar } from '@ui/lite/heatmap-calendar'
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
    @scope (.heatmap-calendar-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: heatmap-calendar-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .heatmap-calendar-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .heatmap-calendar-page__hero::before {
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
        animation: hc-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes hc-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .heatmap-calendar-page__hero::before { animation: none; }
      }

      .heatmap-calendar-page__title {
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

      .heatmap-calendar-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .heatmap-calendar-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .heatmap-calendar-page__import-code {
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

      .heatmap-calendar-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .heatmap-calendar-page__section {
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
        animation: hc-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes hc-section-reveal {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .heatmap-calendar-page__section {
          opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); animation: none;
        }
      }

      .heatmap-calendar-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .heatmap-calendar-page__section-title a { color: inherit; text-decoration: none; }
      .heatmap-calendar-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .heatmap-calendar-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .heatmap-calendar-page__preview {
        padding: 2.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.25rem;
        min-block-size: 80px;
      }

      .heatmap-calendar-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ─────────────────────────────────── */

      .heatmap-calendar-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @container heatmap-calendar-page (max-width: 680px) {
        .heatmap-calendar-page__playground { grid-template-columns: 1fr; }
      }

      .heatmap-calendar-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .heatmap-calendar-page__playground-result {
        min-block-size: 180px;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 2rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: auto;
      }

      .heatmap-calendar-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .heatmap-calendar-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .heatmap-calendar-page__playground-controls {
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

      .heatmap-calendar-page__control-group { display: flex; flex-direction: column; gap: 0.375rem; }

      .heatmap-calendar-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .heatmap-calendar-page__control-options { display: flex; flex-wrap: wrap; gap: 0.375rem; }

      .heatmap-calendar-page__option-btn {
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
      .heatmap-calendar-page__option-btn:hover { border-color: var(--border-strong); color: var(--text-primary); }
      .heatmap-calendar-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .heatmap-calendar-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .heatmap-calendar-page__code-tabs { margin-block-start: 1rem; }

      .heatmap-calendar-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .heatmap-calendar-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Labeled row ────────────────────────────────── */

      .heatmap-calendar-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .heatmap-calendar-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .heatmap-calendar-page__tiers { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }

      .heatmap-calendar-page__tier-card {
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

      .heatmap-calendar-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .heatmap-calendar-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .heatmap-calendar-page__tier-header { display: flex; align-items: center; justify-content: space-between; }
      .heatmap-calendar-page__tier-name { font-size: var(--text-sm, 0.875rem); font-weight: 700; color: var(--text-primary); }
      .heatmap-calendar-page__tier-size { font-size: var(--text-xs, 0.75rem); color: var(--text-tertiary); font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace; }

      .heatmap-calendar-page__tier-desc { font-size: var(--text-xs, 0.75rem); color: var(--text-secondary); line-height: 1.5; text-align: start; }

      .heatmap-calendar-page__tier-import {
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

      .heatmap-calendar-page__tier-preview { display: flex; justify-content: center; padding-block-start: 0.5rem; overflow: hidden; }
      .heatmap-calendar-page__size-breakdown { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.75rem; color: var(--text-tertiary); }
      .heatmap-calendar-page__size-row { display: flex; align-items: center; gap: 0.5rem; }

      /* ── A11y list ──────────────────────────────────── */

      .heatmap-calendar-page__a11y-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.625rem; }
      .heatmap-calendar-page__a11y-item { display: flex; align-items: flex-start; gap: 0.5rem; font-size: var(--text-sm, 0.875rem); color: var(--text-secondary); line-height: 1.5; }
      .heatmap-calendar-page__a11y-icon { color: var(--brand); flex-shrink: 0; margin-block-start: 0.125rem; }
      .heatmap-calendar-page__a11y-key { font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace; font-size: var(--text-xs, 0.75rem); background: var(--border-subtle); padding: 0.125rem 0.375rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); color: var(--text-primary); }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .heatmap-calendar-page__hero { padding: 2rem 1.25rem; }
        .heatmap-calendar-page__title { font-size: 1.75rem; }
        .heatmap-calendar-page__preview { padding: 1.25rem; }
        .heatmap-calendar-page__playground { grid-template-columns: 1fr; }
        .heatmap-calendar-page__tiers { grid-template-columns: 1fr; }
        .heatmap-calendar-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .heatmap-calendar-page__hero { padding: 1.5rem 1rem; }
        .heatmap-calendar-page__title { font-size: 1.5rem; }
        .heatmap-calendar-page__preview { padding: 1rem; }
      }

      /* ── Scrollbar ──────────────────────────────── */

      .heatmap-calendar-page__import-code, .heatmap-calendar-page code, pre {
        overflow-x: auto; scrollbar-width: thin; scrollbar-color: var(--border-default) transparent; max-inline-size: 100%;
      }
      :scope ::-webkit-scrollbar { width: 4px; height: 4px; }
      :scope ::-webkit-scrollbar-track { background: transparent; }
      :scope ::-webkit-scrollbar-thumb { background: var(--border-default); border-radius: 2px; }
      :scope ::-webkit-scrollbar-thumb:hover { background: var(--border-strong); }
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const heatmapProps: PropDef[] = [
  { name: 'data', type: 'HeatmapData[]', required: true, description: 'Array of { date: "YYYY-MM-DD", value: number } objects.' },
  { name: 'colorScale', type: '[string, string]', default: "['oklch(22% 0.02 270)', 'oklch(65% 0.2 155)']", description: 'Low and high colors for the heatmap intensity scale.' },
  { name: 'startDate', type: 'string', description: 'Override start date (YYYY-MM-DD). Defaults to earliest date in data.' },
  { name: 'endDate', type: 'string', description: 'Override end date (YYYY-MM-DD). Defaults to latest date in data.' },
  { name: 'showTooltip', type: 'boolean', default: 'false', description: 'Show date and value tooltip on cell hover (standard tier only).' },
  { name: 'onDateClick', type: '(date: string) => void', description: 'Handler called when a cell is clicked. Makes cells interactive with pointer cursor.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
]

// ─── Sample Data Generators ──────────────────────────────────────────────────

function generateYearData(year: number, intensity: 'low' | 'medium' | 'high'): HeatmapData[] {
  const data: HeatmapData[] = []
  const start = new Date(year, 0, 1)
  const end = new Date(year, 11, 31)
  const maxMap = { low: 5, medium: 15, high: 30 }
  const max = maxMap[intensity]

  const current = new Date(start)
  while (current <= end) {
    const pad = (n: number) => String(n).padStart(2, '0')
    const dateStr = `${current.getFullYear()}-${pad(current.getMonth() + 1)}-${pad(current.getDate())}`
    const dow = current.getDay()
    const isWeekday = dow > 0 && dow < 6
    const base = isWeekday ? max * 0.4 : max * 0.1
    const value = Math.round(Math.max(0, base + (Math.random() - 0.3) * max))
    data.push({ date: dateStr, value })
    current.setDate(current.getDate() + 1)
  }
  return data
}

function generateQuarterData(): HeatmapData[] {
  const data: HeatmapData[] = []
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - 3, 1)
  const current = new Date(start)
  while (current <= now) {
    const pad = (n: number) => String(n).padStart(2, '0')
    const dateStr = `${current.getFullYear()}-${pad(current.getMonth() + 1)}-${pad(current.getDate())}`
    data.push({ date: dateStr, value: Math.round(Math.random() * 20) })
    current.setDate(current.getDate() + 1)
  }
  return data
}

type ColorTheme = 'green' | 'brand' | 'amber' | 'red' | 'blue'

const COLOR_THEMES: Record<ColorTheme, [string, string]> = {
  green: ['oklch(22% 0.02 270)', 'oklch(65% 0.2 155)'],
  brand: ['oklch(22% 0.02 270)', 'oklch(65% 0.2 270)'],
  amber: ['oklch(22% 0.02 270)', 'oklch(75% 0.18 85)'],
  red: ['oklch(22% 0.02 270)', 'oklch(62% 0.22 25)'],
  blue: ['oklch(22% 0.02 270)', 'oklch(60% 0.18 240)'],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { HeatmapCalendar } from '@annondeveloper/ui-kit/lite'",
  standard: "import { HeatmapCalendar } from '@annondeveloper/ui-kit'",
  premium: "import { HeatmapCalendar } from '@annondeveloper/ui-kit'",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="heatmap-calendar-page__copy-btn"
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

function OptionGroup<T extends string>({ label, options, value, onChange }: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="heatmap-calendar-page__control-group">
      <span className="heatmap-calendar-page__control-label">{label}</span>
      <div className="heatmap-calendar-page__control-options">
        {options.map(opt => (
          <button key={opt} type="button" className={`heatmap-calendar-page__option-btn${opt === value ? ' heatmap-calendar-page__option-btn--active' : ''}`} onClick={() => onChange(opt)}>{opt}</button>
        ))}
      </div>
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="heatmap-calendar-page__toggle-label">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ accentColor: 'var(--brand)' }} />
      {label}
    </label>
  )
}

// ─── Code Generation ─────────────────────────────────────────────────────────

function generateReactCode(tier: Tier, colorTheme: ColorTheme, showTooltip: boolean, hasClickHandler: boolean): string {
  const importStr = IMPORT_STRINGS[tier]
  const colors = COLOR_THEMES[colorTheme]

  if (tier === 'lite') {
    return `${importStr}\n\nconst data = [\n  { date: '2026-01-01', value: 5 },\n  { date: '2026-01-02', value: 12 },\n  // ... daily activity data\n]\n\n<HeatmapCalendar\n  data={data}\n  colorScale={['${colors[0]}', '${colors[1]}']}\n/>`
  }

  const props: string[] = ['  data={data}']
  if (colorTheme !== 'green') props.push(`  colorScale={['${colors[0]}', '${colors[1]}']}`)
  if (showTooltip) props.push('  showTooltip')
  if (hasClickHandler) props.push('  onDateClick={(date) => console.log(date)}')

  return `${importStr}\n\nconst data = [\n  { date: '2026-01-01', value: 5 },\n  { date: '2026-01-02', value: 12 },\n  // ... daily activity data\n]\n\n<HeatmapCalendar\n${props.join('\n')}\n/>`
}

function generateHtmlCode(tier: Tier): string {
  const cls = tier === 'lite' ? 'ui-lite-heatmap-calendar' : 'ui-heatmap-calendar'
  return `<!-- HeatmapCalendar — @annondeveloper/ui-kit ${tier} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/heatmap-calendar.css">

<div class="${cls}">
  <div class="${cls}__wrapper">
    <div class="${cls}__grid">
      <!-- Weeks rendered as columns of day cells -->
      <div class="${cls}__week">
        <div class="${cls}__cell" style="background: oklch(65% 0.2 155 / 0.2)"></div>
        <div class="${cls}__cell" style="background: oklch(65% 0.2 155 / 0.6)"></div>
        <div class="${cls}__cell" style="background: oklch(65% 0.2 155 / 1.0)"></div>
        <!-- ... 7 cells per week -->
      </div>
    </div>
  </div>
</div>`
}

function generateVueCode(tier: Tier, showTooltip: boolean): string {
  if (tier === 'lite') {
    return `<template>
  <HeatmapCalendar :data="data" />
</template>

<script setup>
import { HeatmapCalendar } from '@annondeveloper/ui-kit/lite'
const data = [
  { date: '2026-01-01', value: 5 },
  { date: '2026-01-02', value: 12 },
]
</script>`
  }
  return `<template>
  <HeatmapCalendar
    :data="data"
    ${showTooltip ? 'show-tooltip' : ''}
    @date-click="handleClick"
  />
</template>

<script setup>
import { HeatmapCalendar } from '@annondeveloper/ui-kit'
const data = [{ date: '2026-01-01', value: 5 }]
const handleClick = (date) => console.log(date)
</script>`
}

function generateAngularCode(tier: Tier): string {
  return `<!-- Angular — ${tier === 'lite' ? 'Lite' : 'Standard'} tier (CSS approach) -->
<div class="${tier === 'lite' ? 'ui-lite-heatmap-calendar' : 'ui-heatmap-calendar'}">
  <div class="${tier === 'lite' ? 'ui-lite-heatmap-calendar' : 'ui-heatmap-calendar'}__wrapper">
    <!-- Build grid from data in component logic -->
    <div *ngFor="let week of weeks" class="${tier === 'lite' ? 'ui-lite-heatmap-calendar' : 'ui-heatmap-calendar'}__week">
      <div *ngFor="let day of week.days"
           class="${tier === 'lite' ? 'ui-lite-heatmap-calendar' : 'ui-heatmap-calendar'}__cell"
           [style.background]="getColor(day.value)">
      </div>
    </div>
  </div>
</div>

@import '@annondeveloper/ui-kit/${tier === 'lite' ? 'lite/styles' : 'css/components/heatmap-calendar'}.css';`
}

function generateSvelteCode(tier: Tier, showTooltip: boolean): string {
  if (tier === 'lite') {
    return `<script>
  import { HeatmapCalendar } from '@annondeveloper/ui-kit/lite';
  const data = [{ date: '2026-01-01', value: 5 }, { date: '2026-01-02', value: 12 }];
</script>

<HeatmapCalendar {data} />`
  }
  return `<script>
  import { HeatmapCalendar } from '@annondeveloper/ui-kit';
  const data = [{ date: '2026-01-01', value: 5 }];
</script>

<HeatmapCalendar {data} ${showTooltip ? 'showTooltip' : ''} on:dateClick={(e) => console.log(e.detail)} />`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier }: { tier: Tier }) {
  const [colorTheme, setColorTheme] = useState<ColorTheme>('green')
  const [showTooltip, setShowTooltip] = useState(false)
  const [hasClickHandler, setHasClickHandler] = useState(false)
  const [intensity, setIntensity] = useState<'low' | 'medium' | 'high'>('medium')
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')
  const [clickedDate, setClickedDate] = useState<string | null>(null)

  const data = useMemo(() => generateYearData(2025, intensity), [intensity])
  const colors = COLOR_THEMES[colorTheme]

  const reactCode = useMemo(() => generateReactCode(tier, colorTheme, showTooltip, hasClickHandler), [tier, colorTheme, showTooltip, hasClickHandler])
  const htmlCode = useMemo(() => generateHtmlCode(tier), [tier])
  const vueCode = useMemo(() => generateVueCode(tier, showTooltip), [tier, showTooltip])
  const angularCode = useMemo(() => generateAngularCode(tier), [tier])
  const svelteCode = useMemo(() => generateSvelteCode(tier, showTooltip), [tier, showTooltip])

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

  const handleDateClick = useCallback((date: string) => {
    setClickedDate(date)
    setTimeout(() => setClickedDate(null), 2000)
  }, [])

  return (
    <section className="heatmap-calendar-page__section" id="playground">
      <h2 className="heatmap-calendar-page__section-title"><a href="#playground">Live Playground</a></h2>
      <p className="heatmap-calendar-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="heatmap-calendar-page__playground">
        <div className="heatmap-calendar-page__playground-preview">
          <div className="heatmap-calendar-page__playground-result">
            <div style={{ position: 'relative', zIndex: 1 }}>
              {tier === 'lite' ? (
                <LiteHeatmapCalendar data={data} colorScale={colors} />
              ) : (
                <HeatmapCalendar
                  data={data}
                  colorScale={colors}
                  showTooltip={showTooltip}
                  onDateClick={hasClickHandler ? handleDateClick : undefined}
                />
              )}
              {clickedDate && <div style={{ marginBlockStart: '0.5rem', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Clicked: {clickedDate}</div>}
            </div>
          </div>

          <div className="heatmap-calendar-page__code-tabs">
            <div className="heatmap-calendar-page__export-row">
              <Button size="xs" variant="secondary" icon={<Icon name="copy" size="sm" />}
                onClick={() => { navigator.clipboard?.writeText(activeCode).then(() => { setCopyStatus(`Copied ${codeTabs.find(t => t.id === activeCodeTab)?.label}!`); setTimeout(() => setCopyStatus(''), 2000) }) }}>
                Copy {codeTabs.find(t => t.id === activeCodeTab)?.label}
              </Button>
              {copyStatus && <span className="heatmap-calendar-page__export-status">{copyStatus}</span>}
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

        <div className="heatmap-calendar-page__playground-controls">
          <OptionGroup label="Color Theme" options={['green', 'brand', 'amber', 'red', 'blue'] as const} value={colorTheme} onChange={setColorTheme} />
          <OptionGroup label="Intensity" options={['low', 'medium', 'high'] as const} value={intensity} onChange={setIntensity} />
          {tier !== 'lite' && (
            <div className="heatmap-calendar-page__control-group">
              <span className="heatmap-calendar-page__control-label">Toggles</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <Toggle label="Show tooltip" checked={showTooltip} onChange={setShowTooltip} />
                <Toggle label="Click handler" checked={hasClickHandler} onChange={setHasClickHandler} />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HeatmapCalendarPage() {
  useStyles('heatmap-calendar-page', pageStyles)

  const { tier, setTier } = useTier()
  const pageRef = useRef<HTMLDivElement>(null)

  const yearData = useMemo(() => generateYearData(2025, 'medium'), [])
  const quarterData = useMemo(() => generateQuarterData(), [])

  // Scroll reveal fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.heatmap-calendar-page__section')
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
    <div className="heatmap-calendar-page" ref={pageRef}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="heatmap-calendar-page__hero">
        <h1 className="heatmap-calendar-page__title">HeatmapCalendar</h1>
        <p className="heatmap-calendar-page__desc">
          GitHub-style contribution heatmap with customizable color scales, month/day labels,
          tooltips, and click handlers. Renders a year of daily data in a compact grid.
        </p>
        <div className="heatmap-calendar-page__import-row">
          <code className="heatmap-calendar-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Color Scales ────────────────────────────── */}
      <section className="heatmap-calendar-page__section" id="colors">
        <h2 className="heatmap-calendar-page__section-title"><a href="#colors">Color Scales</a></h2>
        <p className="heatmap-calendar-page__section-desc">
          Customize the low-to-high color gradient. The heatmap uses OKLCH color mixing
          to create smooth, perceptually uniform intensity transitions.
        </p>
        <div className="heatmap-calendar-page__preview" style={{ gap: '2rem' }}>
          {(Object.entries(COLOR_THEMES) as [ColorTheme, [string, string]][]).map(([name, scale]) => (
            <div key={name} className="heatmap-calendar-page__labeled-item" style={{ width: '100%' }}>
              <span className="heatmap-calendar-page__item-label">{name}</span>
              {tier === 'lite' ? (
                <LiteHeatmapCalendar data={quarterData} colorScale={scale} />
              ) : (
                <HeatmapCalendar data={quarterData} colorScale={scale} showTooltip />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Tooltip ─────────────────────────────────── */}
      {tier !== 'lite' ? (
        <section className="heatmap-calendar-page__section" id="tooltip">
          <h2 className="heatmap-calendar-page__section-title"><a href="#tooltip">Hover Tooltip</a></h2>
          <p className="heatmap-calendar-page__section-desc">
            Enable <code>showTooltip</code> to reveal exact date and value on cell hover.
            The tooltip positions itself above the cell to avoid overlap.
          </p>
          <div className="heatmap-calendar-page__preview">
            <HeatmapCalendar data={yearData} showTooltip />
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock code={`<HeatmapCalendar data={data} showTooltip />`} language="typescript" />
          </div>
        </section>
      ) : (
        <section className="heatmap-calendar-page__section" id="tooltip">
          <h2 className="heatmap-calendar-page__section-title"><a href="#tooltip">Hover Tooltip</a></h2>
          <p className="heatmap-calendar-page__section-desc">Show date and value on hover.</p>
          <p className="heatmap-calendar-page__section-desc" style={{ fontStyle: 'italic', color: 'var(--text-tertiary)' }}>
            Hover tooltips require Standard tier. Lite uses the native title attribute.
          </p>
        </section>
      )}

      {/* ── 5. Click Handler ───────────────────────────── */}
      {tier !== 'lite' ? (
        <section className="heatmap-calendar-page__section" id="click">
          <h2 className="heatmap-calendar-page__section-title"><a href="#click">Interactive Cells</a></h2>
          <p className="heatmap-calendar-page__section-desc">
            Pass <code>onDateClick</code> to make cells interactive. Clicking a cell returns
            its date string, useful for filtering data or navigating to a detail view.
          </p>
          <div className="heatmap-calendar-page__preview">
            <HeatmapCalendar
              data={quarterData}
              showTooltip
              onDateClick={(date) => console.log('Clicked:', date)}
            />
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock code={`<HeatmapCalendar\n  data={data}\n  onDateClick={(date) => showDayDetail(date)}\n/>`} language="typescript" />
          </div>
        </section>
      ) : (
        <section className="heatmap-calendar-page__section" id="click">
          <h2 className="heatmap-calendar-page__section-title"><a href="#click">Interactive Cells</a></h2>
          <p className="heatmap-calendar-page__section-desc">Click handler for cell interaction.</p>
          <p className="heatmap-calendar-page__section-desc" style={{ fontStyle: 'italic', color: 'var(--text-tertiary)' }}>
            Click handlers require Standard tier.
          </p>
        </section>
      )}

      {/* ── 6. Full Year View ──────────────────────────── */}
      <section className="heatmap-calendar-page__section" id="full-year">
        <h2 className="heatmap-calendar-page__section-title"><a href="#full-year">Full Year View</a></h2>
        <p className="heatmap-calendar-page__section-desc">
          Render a complete year of data showing contribution patterns, activity trends,
          and seasonal variations. Day-of-week labels and month labels provide context.
        </p>
        <div className="heatmap-calendar-page__preview" style={{ overflowX: 'auto' }}>
          {tier === 'lite' ? (
            <LiteHeatmapCalendar data={yearData} />
          ) : (
            <HeatmapCalendar data={yearData} showTooltip />
          )}
        </div>
      </section>

      {/* ── 7. Custom Date Range ───────────────────────── */}
      {tier !== 'lite' && (
        <section className="heatmap-calendar-page__section" id="date-range">
          <h2 className="heatmap-calendar-page__section-title"><a href="#date-range">Custom Date Range</a></h2>
          <p className="heatmap-calendar-page__section-desc">
            Override the start and end dates to focus on a specific time window.
            The calendar aligns to the nearest Sunday for consistent week columns.
          </p>
          <div className="heatmap-calendar-page__preview">
            <HeatmapCalendar
              data={yearData}
              startDate="2025-06-01"
              endDate="2025-09-30"
              showTooltip
              colorScale={COLOR_THEMES.amber}
            />
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock code={`<HeatmapCalendar\n  data={data}\n  startDate="2025-06-01"\n  endDate="2025-09-30"\n  colorScale={['oklch(22% 0.02 270)', 'oklch(75% 0.18 85)']}\n/>`} language="typescript" />
          </div>
        </section>
      )}

      {/* ── 8. Weight Tiers ────────────────────────────── */}
      <section className="heatmap-calendar-page__section" id="tiers">
        <h2 className="heatmap-calendar-page__section-title"><a href="#tiers">Weight Tiers</a></h2>
        <p className="heatmap-calendar-page__section-desc">
          Lite renders a flat grid of colored cells. Standard adds proper calendar layout with
          month/day labels, tooltips, click handlers, date range control, and OKLCH color mixing.
        </p>

        <div className="heatmap-calendar-page__tiers">
          {/* Lite */}
          <div
            className={`heatmap-calendar-page__tier-card${tier === 'lite' ? ' heatmap-calendar-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="heatmap-calendar-page__tier-header">
              <span className="heatmap-calendar-page__tier-name">Lite</span>
              <span className="heatmap-calendar-page__tier-size">~0.3 KB</span>
            </div>
            <p className="heatmap-calendar-page__tier-desc">
              Simple flat grid with opacity-based coloring. No calendar layout, no month labels,
              no tooltips, no date range. Uses native title attribute.
            </p>
            <div className="heatmap-calendar-page__tier-import">
              import {'{'} HeatmapCalendar {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="heatmap-calendar-page__tier-preview">
              <LiteHeatmapCalendar data={quarterData.slice(0, 30)} />
            </div>
            <div className="heatmap-calendar-page__size-breakdown">
              <div className="heatmap-calendar-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.3 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.0 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`heatmap-calendar-page__tier-card${tier === 'standard' ? ' heatmap-calendar-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="heatmap-calendar-page__tier-header">
              <span className="heatmap-calendar-page__tier-name">Standard</span>
              <span className="heatmap-calendar-page__tier-size">~2.4 KB</span>
            </div>
            <p className="heatmap-calendar-page__tier-desc">
              Full calendar layout with week columns, month/day-of-week labels,
              OKLCH color mixing, tooltips, click handlers, and date range control.
            </p>
            <div className="heatmap-calendar-page__tier-import">
              import {'{'} HeatmapCalendar {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="heatmap-calendar-page__tier-preview">
              <HeatmapCalendar data={quarterData.slice(0, 60)} showTooltip />
            </div>
            <div className="heatmap-calendar-page__size-breakdown">
              <div className="heatmap-calendar-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.4 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.3 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`heatmap-calendar-page__tier-card${tier === 'premium' ? ' heatmap-calendar-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="heatmap-calendar-page__tier-header">
              <span className="heatmap-calendar-page__tier-name">Premium</span>
              <span className="heatmap-calendar-page__tier-size">~2.4 KB</span>
            </div>
            <p className="heatmap-calendar-page__tier-desc">
              Same as Standard — HeatmapCalendar is a data visualization component where additional
              premium effects are not applicable. Use Standard tier.
            </p>
            <div className="heatmap-calendar-page__tier-import">
              import {'{'} HeatmapCalendar {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="heatmap-calendar-page__tier-preview">
              <HeatmapCalendar data={quarterData.slice(0, 60)} showTooltip />
            </div>
            <div className="heatmap-calendar-page__size-breakdown">
              <div className="heatmap-calendar-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.4 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.3 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Props API ───────────────────────────────── */}
      <section className="heatmap-calendar-page__section" id="props">
        <h2 className="heatmap-calendar-page__section-title"><a href="#props">Props API</a></h2>
        <p className="heatmap-calendar-page__section-desc">
          All props accepted by HeatmapCalendar. It also spreads any native div HTML attributes
          onto the underlying wrapper element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={heatmapProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className="heatmap-calendar-page__section" id="accessibility">
        <h2 className="heatmap-calendar-page__section-title"><a href="#accessibility">Accessibility</a></h2>
        <p className="heatmap-calendar-page__section-desc">
          Built with semantic markup and screen reader support for data visualization.
        </p>
        <Card variant="default" padding="md">
          <ul className="heatmap-calendar-page__a11y-list">
            <li className="heatmap-calendar-page__a11y-item">
              <span className="heatmap-calendar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Group role:</strong> Container uses <code className="heatmap-calendar-page__a11y-key">role="group"</code> with <code className="heatmap-calendar-page__a11y-key">aria-label="Activity heatmap"</code>.
              </span>
            </li>
            <li className="heatmap-calendar-page__a11y-item">
              <span className="heatmap-calendar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Cell labels:</strong> Each cell has <code className="heatmap-calendar-page__a11y-key">role="img"</code> and <code className="heatmap-calendar-page__a11y-key">aria-label</code> with date and value.
              </span>
            </li>
            <li className="heatmap-calendar-page__a11y-item">
              <span className="heatmap-calendar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Color independence:</strong> Values are accessible via aria-label and tooltip, not just color intensity.
              </span>
            </li>
            <li className="heatmap-calendar-page__a11y-item">
              <span className="heatmap-calendar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="heatmap-calendar-page__a11y-key">forced-colors: active</code> with visible cell borders.
              </span>
            </li>
            <li className="heatmap-calendar-page__a11y-item">
              <span className="heatmap-calendar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Container queries:</strong> Uses <code className="heatmap-calendar-page__a11y-key">container-type: inline-size</code> for responsive layout.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
