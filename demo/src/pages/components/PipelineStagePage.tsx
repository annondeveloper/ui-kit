'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { PipelineStage } from '@ui/domain/pipeline-stage'
import { PipelineStage as LitePipelineStage } from '@ui/lite/pipeline-stage'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Sample Data ──────────────────────────────────────────────────────────────

type StageStatus = 'pending' | 'running' | 'success' | 'failed' | 'skipped'

const CI_PIPELINE = [
  { id: 'lint', label: 'Lint', status: 'success' as const, duration: 12 },
  { id: 'test', label: 'Test', status: 'success' as const, duration: 45 },
  { id: 'build', label: 'Build', status: 'running' as const, duration: 38 },
  { id: 'deploy', label: 'Deploy', status: 'pending' as const },
  { id: 'smoke', label: 'Smoke Test', status: 'pending' as const },
]

const DEPLOY_PIPELINE = [
  { id: 'checkout', label: 'Checkout', status: 'success' as const, duration: 3 },
  { id: 'install', label: 'Install', status: 'success' as const, duration: 22 },
  { id: 'build', label: 'Build', status: 'success' as const, duration: 67 },
  { id: 'test', label: 'Test', status: 'failed' as const, duration: 31 },
  { id: 'deploy', label: 'Deploy', status: 'skipped' as const },
]

const ALL_SUCCESS = [
  { id: 's1', label: 'Validate', status: 'success' as const, duration: 5 },
  { id: 's2', label: 'Transform', status: 'success' as const, duration: 18 },
  { id: 's3', label: 'Load', status: 'success' as const, duration: 42 },
  { id: 's4', label: 'Verify', status: 'success' as const, duration: 8 },
]

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.pipeline-stage-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: pipeline-stage-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .pipeline-stage-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .pipeline-stage-page__hero::before {
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
        animation: ps-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes ps-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .pipeline-stage-page__hero::before { animation: none; }
      }

      .pipeline-stage-page__title {
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

      .pipeline-stage-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .pipeline-stage-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .pipeline-stage-page__import-code {
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

      .pipeline-stage-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .pipeline-stage-page__section {
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
        animation: ps-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes ps-section-reveal {
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
        .pipeline-stage-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .pipeline-stage-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .pipeline-stage-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .pipeline-stage-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .pipeline-stage-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .pipeline-stage-page__preview {
        padding: 2.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow-x: auto;
        overflow-y: hidden;
        display: flex;
        flex-wrap: nowrap;
        align-items: center;
        gap: 1.25rem;
        min-block-size: 80px;
        -webkit-overflow-scrolling: touch;
      }

      .pipeline-stage-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .pipeline-stage-page__preview--col {
        flex-direction: column;
        align-items: flex-start;
      }

      /* ── Playground ─────────────────────────────────── */

      .pipeline-stage-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @container pipeline-stage-page (max-width: 680px) {
        .pipeline-stage-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .pipeline-stage-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .pipeline-stage-page__playground-result {
        min-block-size: 200px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow-x: auto;
        overflow-y: hidden;
      }

      .pipeline-stage-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .pipeline-stage-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .pipeline-stage-page__playground-controls {
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

      .pipeline-stage-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .pipeline-stage-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .pipeline-stage-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .pipeline-stage-page__option-btn {
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
      .pipeline-stage-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .pipeline-stage-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .pipeline-stage-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      /* ── Labeled items ──────────────────────────────── */

      .pipeline-stage-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .pipeline-stage-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .pipeline-stage-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .pipeline-stage-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .pipeline-stage-page__tier-card {
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

      .pipeline-stage-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .pipeline-stage-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .pipeline-stage-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .pipeline-stage-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .pipeline-stage-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .pipeline-stage-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .pipeline-stage-page__tier-import {
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

      .pipeline-stage-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
        overflow-x: auto;
      }

      /* ── Code tabs & exports ────────────────────────── */

      .pipeline-stage-page__code-tabs {
        margin-block-start: 1rem;
      }

      .pipeline-stage-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .pipeline-stage-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      .pipeline-stage-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .pipeline-stage-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── A11y list ──────────────────────────────────── */

      .pipeline-stage-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .pipeline-stage-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .pipeline-stage-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .pipeline-stage-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .pipeline-stage-page__hero { padding: 2rem 1.25rem; }
        .pipeline-stage-page__title { font-size: 1.75rem; }
        .pipeline-stage-page__preview { padding: 1.75rem; }
        .pipeline-stage-page__playground { grid-template-columns: 1fr; }
        .pipeline-stage-page__tiers { grid-template-columns: 1fr; }
        .pipeline-stage-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .pipeline-stage-page__hero { padding: 1.5rem 1rem; }
        .pipeline-stage-page__title { font-size: 1.5rem; }
        .pipeline-stage-page__preview { padding: 1rem; }
      }

      .pipeline-stage-page__import-code,
      .pipeline-stage-page code,
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

const pipelineProps: PropDef[] = [
  { name: 'stages', type: 'Stage[]', required: true, description: 'Array of stage objects with id, label, status (pending/running/success/failed/skipped), and optional duration (seconds).' },
  { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Layout direction. Horizontal for dashboard views, vertical for sidebar or detail panels.' },
  { name: 'onStageClick', type: '(stageId: string) => void', description: 'Click handler for stage labels. When provided, labels become interactive buttons.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. 0 disables the running stage pulse animation.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Orientation = 'horizontal' | 'vertical'
const ORIENTATIONS: Orientation[] = ['horizontal', 'vertical']

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { PipelineStage } from '@annondeveloper/ui-kit/lite'",
  standard: "import { PipelineStage } from '@annondeveloper/ui-kit'",
  premium: "import { PipelineStage } from '@annondeveloper/ui-kit/premium'",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="pipeline-stage-page__copy-btn"
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
    <div className="pipeline-stage-page__control-group">
      <span className="pipeline-stage-page__control-label">{label}</span>
      <div className="pipeline-stage-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`pipeline-stage-page__option-btn${opt === value ? ' pipeline-stage-page__option-btn--active' : ''}`}
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
    <label className="pipeline-stage-page__toggle-label">
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

function generateReactCode(tier: Tier, orientation: Orientation, clickable: boolean, motion: number): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  props.push('  stages={stages}')
  if (orientation !== 'horizontal') props.push(`  orientation="${orientation}"`)
  if (clickable && tier !== 'lite') props.push('  onStageClick={(id) => console.log(id)}')
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  return `${importStr}\nimport type { Stage } from '@annondeveloper/ui-kit'\n\nconst stages: Stage[] = [\n  { id: 'lint', label: 'Lint', status: 'success', duration: 12 },\n  { id: 'test', label: 'Test', status: 'running', duration: 45 },\n  { id: 'build', label: 'Build', status: 'pending' },\n]\n\n<PipelineStage\n${props.join('\n')}\n/>`
}

function generateHtmlCode(tier: Tier, orientation: Orientation): string {
  const cls = tier === 'lite' ? 'ui-lite-pipeline-stage' : 'ui-pipeline-stage'
  return `<!-- PipelineStage — @annondeveloper/ui-kit ${tier} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/${tier === 'lite' ? 'lite/styles.css' : 'css/components/pipeline-stage.css'}">

<div class="${cls}" data-orientation="${orientation}">
  <ol class="${cls}__list">
    <li class="${cls}__item">
      <div class="${cls}__indicator" data-status="success">✓</div>
      <span class="${cls}__label">Lint</span>
    </li>
    <div class="${cls}__connector"></div>
    <li class="${cls}__item">
      <div class="${cls}__indicator" data-status="running">▶</div>
      <span class="${cls}__label">Test</span>
    </li>
    <!-- ... more stages -->
  </ol>
</div>`
}

function generateVueCode(tier: Tier, orientation: Orientation, clickable: boolean): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : tier === 'lite' ? '@annondeveloper/ui-kit/lite' : '@annondeveloper/ui-kit'
  const clickProp = clickable && tier !== 'lite' ? `\n    @stage-click="handleClick"` : ''
  return `<template>\n  <PipelineStage\n    :stages="stages"\n    orientation="${orientation}"${clickProp}\n  />\n</template>\n\n<script setup>\nimport { PipelineStage } from '${importPath}'\nimport { ref } from 'vue'\n\nconst stages = ref([\n  { id: 'lint', label: 'Lint', status: 'success', duration: 12 },\n  { id: 'test', label: 'Test', status: 'running' },\n])\n</script>`
}

function generateAngularCode(tier: Tier, orientation: Orientation): string {
  const importPath = tier === 'lite' ? '@annondeveloper/ui-kit/lite' : tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular — ${tier} tier -->\n<ui-pipeline-stage\n  [stages]="stages"\n  orientation="${orientation}"\n></ui-pipeline-stage>\n\n/* Import CSS */\n@import '${importPath}/css/components/pipeline-stage.css';`
}

function generateSvelteCode(tier: Tier, orientation: Orientation, clickable: boolean): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : tier === 'lite' ? '@annondeveloper/ui-kit/lite' : '@annondeveloper/ui-kit'
  const clickProp = clickable && tier !== 'lite' ? `\n  onStageClick={(id) => console.log(id)}` : ''
  return `<script>\n  import { PipelineStage } from '${importPath}';\n\n  const stages = [\n    { id: 'lint', label: 'Lint', status: 'success', duration: 12 },\n    { id: 'test', label: 'Test', status: 'running' },\n  ];\n</script>\n\n<PipelineStage\n  {stages}\n  orientation="${orientation}"${clickProp}\n/>`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [orientation, setOrientation] = useState<Orientation>('horizontal')
  const [clickable, setClickable] = useState(false)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [pipeline, setPipeline] = useState<'ci' | 'deploy' | 'success'>('ci')
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')
  const [clickedStage, setClickedStage] = useState<string | null>(null)

  const StageComponent = tier === 'lite' ? LitePipelineStage : PipelineStage

  const stages = pipeline === 'ci' ? CI_PIPELINE : pipeline === 'deploy' ? DEPLOY_PIPELINE : ALL_SUCCESS

  const reactCode = useMemo(() => generateReactCode(tier, orientation, clickable, motion), [tier, orientation, clickable, motion])
  const htmlCode = useMemo(() => generateHtmlCode(tier, orientation), [tier, orientation])
  const vueCode = useMemo(() => generateVueCode(tier, orientation, clickable), [tier, orientation, clickable])
  const angularCode = useMemo(() => generateAngularCode(tier, orientation), [tier, orientation])
  const svelteCode = useMemo(() => generateSvelteCode(tier, orientation, clickable), [tier, orientation, clickable])

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

  const previewProps: Record<string, unknown> = { stages, orientation }
  if (clickable && tier !== 'lite') {
    previewProps.onStageClick = (id: string) => {
      setClickedStage(id)
      setTimeout(() => setClickedStage(null), 2000)
    }
  }
  if (tier !== 'lite' && motion !== 3) previewProps.motion = motion

  return (
    <section className="pipeline-stage-page__section" id="playground">
      <h2 className="pipeline-stage-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="pipeline-stage-page__section-desc">
        Switch between pipeline scenarios, orientation, and interactivity.
      </p>

      <div className="pipeline-stage-page__playground">
        <div className="pipeline-stage-page__playground-preview">
          <div className="pipeline-stage-page__playground-result">
            <StageComponent {...previewProps} />
            {clickedStage && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBlockStart: '1rem', position: 'relative', zIndex: 1 }}>
                Clicked: <strong>{clickedStage}</strong>
              </p>
            )}
          </div>

          <div className="pipeline-stage-page__code-tabs">
            <div className="pipeline-stage-page__export-row">
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
              {copyStatus && <span className="pipeline-stage-page__export-status">{copyStatus}</span>}
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

        <div className="pipeline-stage-page__playground-controls">
          <OptionGroup label="Pipeline" options={['ci', 'deploy', 'success'] as const} value={pipeline} onChange={setPipeline} />
          <OptionGroup label="Orientation" options={ORIENTATIONS} value={orientation} onChange={setOrientation} />

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="pipeline-stage-page__control-group">
            <span className="pipeline-stage-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {tier !== 'lite' && <Toggle label="Clickable stages" checked={clickable} onChange={setClickable} />}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PipelineStagePage() {
  useStyles('pipeline-stage-page', pageStyles)

  const { tier, setTier } = useTier()
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sections = document.querySelectorAll('.pipeline-stage-page__section')
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

  const StageComponent = tier === 'lite' ? LitePipelineStage : PipelineStage

  return (
    <div className="pipeline-stage-page" ref={pageRef}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="pipeline-stage-page__hero">
        <h1 className="pipeline-stage-page__title">PipelineStage</h1>
        <p className="pipeline-stage-page__desc">
          CI/CD pipeline visualization with status indicators, connectors, and optional click handlers.
          Supports horizontal and vertical layouts with five stage statuses and pulsing animation for running stages.
        </p>
        <div className="pipeline-stage-page__import-row">
          <code className="pipeline-stage-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. All Statuses ────────────────────────────── */}
      <section className="pipeline-stage-page__section" id="statuses">
        <h2 className="pipeline-stage-page__section-title">
          <a href="#statuses">Stage Statuses</a>
        </h2>
        <p className="pipeline-stage-page__section-desc">
          Five status states with distinct colors and icons. Running stages display a pulsing glow animation.
        </p>
        <div className="pipeline-stage-page__preview">
          <StageComponent stages={[
            { id: 'p', label: 'Pending', status: 'pending' },
            { id: 'r', label: 'Running', status: 'running' },
            { id: 's', label: 'Success', status: 'success' },
            { id: 'f', label: 'Failed', status: 'failed' },
            { id: 'sk', label: 'Skipped', status: 'skipped' },
          ]} />
        </div>
      </section>

      {/* ── 4. Orientation ─────────────────────────────── */}
      <section className="pipeline-stage-page__section" id="orientation">
        <h2 className="pipeline-stage-page__section-title">
          <a href="#orientation">Orientation</a>
        </h2>
        <p className="pipeline-stage-page__section-desc">
          Horizontal layout for dashboard views. Vertical layout for sidebar panels or mobile views.
          Connectors adapt direction automatically.
        </p>
        <div className="pipeline-stage-page__preview pipeline-stage-page__preview--col" style={{ gap: '2rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBlockEnd: '0.75rem' }}>Horizontal</p>
            <StageComponent stages={CI_PIPELINE.slice(0, 4)} orientation="horizontal" />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBlockEnd: '0.75rem' }}>Vertical</p>
            <StageComponent stages={CI_PIPELINE.slice(0, 4)} orientation="vertical" />
          </div>
        </div>
      </section>

      {/* ── 5. Clickable Stages ────────────────────────── */}
      {tier !== 'lite' && (
        <section className="pipeline-stage-page__section" id="clickable">
          <h2 className="pipeline-stage-page__section-title">
            <a href="#clickable">Clickable Stages</a>
          </h2>
          <p className="pipeline-stage-page__section-desc">
            When <code>onStageClick</code> is provided, labels become interactive buttons with hover underline
            and focus-visible outlines. Ideal for linking to stage logs or details.
          </p>
          <div className="pipeline-stage-page__preview">
            <StageComponent
              stages={DEPLOY_PIPELINE}
              onStageClick={(id) => alert(`Clicked stage: ${id}`)}
            />
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`<PipelineStage\n  stages={stages}\n  onStageClick={(stageId) => router.push(\`/builds/\${stageId}\`)}\n/>`}
              language="typescript"
            />
          </div>
        </section>
      )}

      {/* ── 6. Duration Display ────────────────────────── */}
      <section className="pipeline-stage-page__section" id="duration">
        <h2 className="pipeline-stage-page__section-title">
          <a href="#duration">Duration Display</a>
        </h2>
        <p className="pipeline-stage-page__section-desc">
          Stages with a <code>duration</code> property (in seconds) display formatted time below the label.
          Uses tabular-nums for aligned digits.
        </p>
        <div className="pipeline-stage-page__preview">
          <StageComponent stages={ALL_SUCCESS} />
        </div>
      </section>

      {/* ── 7. Real-World Pipelines ────────────────────── */}
      <section className="pipeline-stage-page__section" id="examples">
        <h2 className="pipeline-stage-page__section-title">
          <a href="#examples">Real-World Examples</a>
        </h2>
        <p className="pipeline-stage-page__section-desc">
          Common CI/CD pipeline patterns with mixed statuses and durations.
        </p>
        <div className="pipeline-stage-page__preview pipeline-stage-page__preview--col" style={{ gap: '2rem' }}>
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBlockEnd: '0.75rem' }}>CI Pipeline (in progress)</p>
            <StageComponent stages={CI_PIPELINE} />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBlockEnd: '0.75rem' }}>Deploy Pipeline (failed)</p>
            <StageComponent stages={DEPLOY_PIPELINE} />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBlockEnd: '0.75rem' }}>ETL Pipeline (complete)</p>
            <StageComponent stages={ALL_SUCCESS} />
          </div>
        </div>
      </section>

      {/* ── 8. Weight Tiers ────────────────────────────── */}
      <section className="pipeline-stage-page__section" id="tiers">
        <h2 className="pipeline-stage-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="pipeline-stage-page__section-desc">
          Choose the right balance of features and bundle size. Lite renders simple dots with connectors.
          Standard provides full status indicators with pulse animation and click handlers.
        </p>

        <div className="pipeline-stage-page__tiers">
          {/* Lite */}
          <div
            className={`pipeline-stage-page__tier-card${tier === 'lite' ? ' pipeline-stage-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="pipeline-stage-page__tier-header">
              <span className="pipeline-stage-page__tier-name">Lite</span>
              <span className="pipeline-stage-page__tier-size">~0.3 KB</span>
            </div>
            <p className="pipeline-stage-page__tier-desc">
              CSS-only pipeline with status dots and connectors.
              No click handlers, no pulse animation, no duration display.
            </p>
            <div className="pipeline-stage-page__tier-import">
              import {'{'} PipelineStage {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="pipeline-stage-page__tier-preview">
              <LitePipelineStage stages={CI_PIPELINE.slice(0, 3)} />
            </div>
            <div className="pipeline-stage-page__size-breakdown">
              <div className="pipeline-stage-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.3 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.0 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`pipeline-stage-page__tier-card${tier === 'standard' ? ' pipeline-stage-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="pipeline-stage-page__tier-header">
              <span className="pipeline-stage-page__tier-name">Standard</span>
              <span className="pipeline-stage-page__tier-size">~2.4 KB</span>
            </div>
            <p className="pipeline-stage-page__tier-desc">
              Full pipeline with status icons, pulse animation on running stages,
              clickable labels, duration formatting, and motion-level support.
            </p>
            <div className="pipeline-stage-page__tier-import">
              import {'{'} PipelineStage {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="pipeline-stage-page__tier-preview">
              <PipelineStage stages={CI_PIPELINE.slice(0, 3)} />
            </div>
            <div className="pipeline-stage-page__size-breakdown">
              <div className="pipeline-stage-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.4 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.3 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`pipeline-stage-page__tier-card${tier === 'premium' ? ' pipeline-stage-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="pipeline-stage-page__tier-header">
              <span className="pipeline-stage-page__tier-name">Premium</span>
              <span className="pipeline-stage-page__tier-size">~3.5 KB</span>
            </div>
            <p className="pipeline-stage-page__tier-desc">
              Everything in Standard plus staggered entrance animation,
              spring-physics connector flow, and ambient status glow effects.
            </p>
            <div className="pipeline-stage-page__tier-import">
              import {'{'} PipelineStage {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="pipeline-stage-page__tier-preview">
              <PipelineStage stages={CI_PIPELINE.slice(0, 3)} />
            </div>
            <div className="pipeline-stage-page__size-breakdown">
              <div className="pipeline-stage-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.8 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.3 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>5.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Props API ───────────────────────────────── */}
      <section className="pipeline-stage-page__section" id="props">
        <h2 className="pipeline-stage-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="pipeline-stage-page__section-desc">
          All props accepted by PipelineStage. It also spreads any native div HTML attributes
          onto the underlying container element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={pipelineProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className="pipeline-stage-page__section" id="accessibility">
        <h2 className="pipeline-stage-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="pipeline-stage-page__section-desc">
          Built with semantic ordered list and keyboard-navigable stage labels.
        </p>
        <Card variant="default" padding="md">
          <ul className="pipeline-stage-page__a11y-list">
            <li className="pipeline-stage-page__a11y-item">
              <span className="pipeline-stage-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Ordered list:</strong> Stages render as <code className="pipeline-stage-page__a11y-key">{'<ol>'}</code> items, conveying sequence to screen readers.
              </span>
            </li>
            <li className="pipeline-stage-page__a11y-item">
              <span className="pipeline-stage-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Clickable labels:</strong> When <code className="pipeline-stage-page__a11y-key">onStageClick</code> is provided, labels become <code className="pipeline-stage-page__a11y-key">{'<button>'}</code> elements with <code className="pipeline-stage-page__a11y-key">:focus-visible</code> outlines.
              </span>
            </li>
            <li className="pipeline-stage-page__a11y-item">
              <span className="pipeline-stage-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Connectors:</strong> Decorative connectors are marked <code className="pipeline-stage-page__a11y-key">aria-hidden="true"</code>.
              </span>
            </li>
            <li className="pipeline-stage-page__a11y-item">
              <span className="pipeline-stage-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Status icons:</strong> Unicode status characters (check, cross, play, minus, bullet) provide visual status cues alongside color.
              </span>
            </li>
            <li className="pipeline-stage-page__a11y-item">
              <span className="pipeline-stage-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Motion:</strong> Running pulse animation disables at <code className="pipeline-stage-page__a11y-key">motion="0"</code> and respects <code className="pipeline-stage-page__a11y-key">prefers-reduced-motion</code>.
              </span>
            </li>
            <li className="pipeline-stage-page__a11y-item">
              <span className="pipeline-stage-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="pipeline-stage-page__a11y-key">forced-colors: active</code> with system color borders on indicators and connectors.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
