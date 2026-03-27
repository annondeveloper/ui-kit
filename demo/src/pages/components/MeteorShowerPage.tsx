'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { MeteorShower } from '@ui/domain/meteor-shower'
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
    @scope (.meteor-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: meteor-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .meteor-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .meteor-page__hero::before {
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
        animation: meteor-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes meteor-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .meteor-page__hero::before { animation: none; }
      }

      .meteor-page__title {
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

      .meteor-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .meteor-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .meteor-page__import-code {
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

      .meteor-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .meteor-page__section {
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
        animation: meteor-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes meteor-section-reveal {
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
        .meteor-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .meteor-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .meteor-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .meteor-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .meteor-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .meteor-page__preview {
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

      .meteor-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .meteor-page__preview--tall {
        min-block-size: 300px;
      }

      /* ── Playground ─────────────────────────────────── */

      .meteor-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .meteor-page__playground {
          grid-template-columns: 1fr;
        }
        .meteor-page__playground-controls {
          position: static !important;
        }
      }

      @container meteor-page (max-width: 680px) {
        .meteor-page__playground {
          grid-template-columns: 1fr;
        }
        .meteor-page__playground-controls {
          position: static !important;
        }
      }

      .meteor-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .meteor-page__playground-result {
        min-block-size: 280px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .meteor-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .meteor-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .meteor-page__playground-controls {
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

      .meteor-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .meteor-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .meteor-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .meteor-page__option-btn {
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
      .meteor-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .meteor-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .meteor-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .meteor-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .meteor-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .meteor-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .meteor-page__tier-card {
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

      .meteor-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .meteor-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .meteor-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .meteor-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .meteor-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .meteor-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .meteor-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .meteor-page__tier-import {
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

      .meteor-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
        min-block-size: 80px;
        align-items: center;
        overflow: hidden;
        border-radius: var(--radius-sm);
      }

      /* ── Code tabs ─────────────────────────────────── */

      .meteor-page__code-tabs {
        margin-block-start: 1rem;
      }

      .meteor-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .meteor-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .meteor-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .meteor-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .meteor-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .meteor-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Size breakdown ─────────────────────────────── */

      .meteor-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .meteor-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .meteor-page__hero { padding: 2rem 1.25rem; }
        .meteor-page__title { font-size: 1.75rem; }
        .meteor-page__preview { padding: 1.75rem; }
        .meteor-page__playground { grid-template-columns: 1fr; }
        .meteor-page__playground-result { padding: 2rem; min-block-size: 200px; }
        .meteor-page__tiers { grid-template-columns: 1fr; }
        .meteor-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .meteor-page__hero { padding: 1.5rem 1rem; }
        .meteor-page__title { font-size: 1.5rem; }
        .meteor-page__preview { padding: 1rem; }
      }

      @media (min-width: 3000px) {
        :scope { max-inline-size: 1400px; }
        .meteor-page__title { font-size: 4rem; }
        .meteor-page__preview { padding: 3.5rem; }
      }

      /* ── Scrollbar ──────────────────────────────────── */

      .meteor-page__import-code,
      .meteor-page code,
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

const meteorProps: PropDef[] = [
  { name: 'count', type: 'number', default: '20', description: 'Number of meteor streaks to render. Higher counts create denser showers.' },
  { name: 'children', type: 'ReactNode', description: 'Content rendered above the meteors in a z-indexed content layer.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. At 0 meteors are hidden. Cascades from OS > prop > CSS --motion > UIProvider.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'style', type: 'CSSProperties', description: 'Inline style object applied to the root container.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type MotionLevel = 0 | 1 | 2 | 3
type MeteorCount = 5 | 10 | 20 | 30 | 50

const METEOR_COUNTS: MeteorCount[] = [5, 10, 20, 30, 50]
const MOTION_LEVELS: MotionLevel[] = [0, 1, 2, 3]
const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "/* CSS-only: @import '@annondeveloper/ui-kit/css/components/meteor-shower.css' */",
  standard: "import { MeteorShower } from '@annondeveloper/ui-kit'",
  premium: "import { MeteorShower } from '@annondeveloper/ui-kit/premium'",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="meteor-page__copy-btn"
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
    <div className="meteor-page__control-group">
      <span className="meteor-page__control-label">{label}</span>
      <div className="meteor-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`meteor-page__option-btn${opt === value ? ' meteor-page__option-btn--active' : ''}`}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Code Generation ─────────────────────────────────────────────────────────

function generateReactCode(tier: Tier, count: number, motion: MotionLevel): string {
  if (tier === 'lite') {
    return `/* Lite tier — CSS-only meteor shower */
@import '@annondeveloper/ui-kit/css/components/meteor-shower.css';

<div class="ui-meteor-shower" data-motion="${motion}">
  <div class="ui-meteor-shower--content">
    <h2>Your content here</h2>
  </div>
</div>`
  }

  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  if (count !== 20) props.push(`  count={${count}}`)
  if (motion !== 3) props.push(`  motion={${motion}}`)

  const childContent = `  <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
    <h2>Your content here</h2>
    <p>Meteors fall behind your content.</p>
  </div>`

  const jsx = props.length === 0
    ? `<MeteorShower>\n${childContent}\n</MeteorShower>`
    : `<MeteorShower\n${props.join('\n')}\n>\n${childContent}\n</MeteorShower>`

  return `${importStr}\n\n${jsx}`
}

function generateHtmlCode(tier: Tier, count: number, motion: MotionLevel): string {
  return `<!-- MeteorShower — @annondeveloper/ui-kit ${tier} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/meteor-shower.css">

<div class="ui-meteor-shower" data-motion="${motion}" aria-hidden="true">
  <!-- Meteors are rendered via CSS animations -->
  <div class="ui-meteor-shower--content">
    <h2>Your content here</h2>
    <p>Meteors fall behind your content.</p>
  </div>
</div>

<style>
  .ui-meteor-shower {
    position: relative;
    overflow: hidden;
    min-height: 300px;
    background: oklch(8% 0.02 270);
  }
</style>`
}

function generateVueCode(tier: Tier, count: number, motion: MotionLevel): string {
  if (tier === 'lite') {
    return `<template>
  <div class="ui-meteor-shower" data-motion="${motion}" aria-hidden="true">
    <div class="ui-meteor-shower--content">
      <h2>Your content here</h2>
    </div>
  </div>
</template>

<style>
@import '@annondeveloper/ui-kit/css/components/meteor-shower.css';
</style>`
  }

  const props: string[] = []
  if (count !== 20) props.push(`    :count="${count}"`)
  if (motion !== 3) props.push(`    :motion="${motion}"`)
  const propsStr = props.length > 0 ? `\n${props.join('\n')}\n  ` : ''

  return `<template>
  <MeteorShower${propsStr}>
    <div style="padding: 4rem 2rem; text-align: center">
      <h2>Your content here</h2>
    </div>
  </MeteorShower>
</template>

<script setup>
import { MeteorShower } from '@annondeveloper/ui-kit'
</script>`
}

function generateAngularCode(tier: Tier, count: number, motion: MotionLevel): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (CSS-only) -->
<div class="ui-meteor-shower" data-motion="${motion}" aria-hidden="true">
  <div class="ui-meteor-shower--content">
    <h2>Your content here</h2>
  </div>
</div>

/* In styles.css */
@import '@annondeveloper/ui-kit/css/components/meteor-shower.css';`
  }

  return `<!-- Angular — ${tier === 'premium' ? 'Premium' : 'Standard'} tier -->
<div
  class="ui-meteor-shower"
  data-motion="${motion}"
  aria-hidden="true"
>
  <div class="ui-meteor-shower--content">
    <h2>Your content here</h2>
    <p>Meteors fall behind your content.</p>
  </div>
</div>

/* Import component CSS */
@import '@annondeveloper/ui-kit/css/components/meteor-shower.css';`
}

function generateSvelteCode(tier: Tier, count: number, motion: MotionLevel): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->
<div class="ui-meteor-shower" data-motion="${motion}" aria-hidden="true">
  <div class="ui-meteor-shower--content">
    <h2>Your content here</h2>
  </div>
</div>

<style>
  @import '@annondeveloper/ui-kit/css/components/meteor-shower.css';
</style>`
  }

  const props: string[] = []
  if (count !== 20) props.push(`  count={${count}}`)
  if (motion !== 3) props.push(`  motion={${motion}}`)
  const propsStr = props.length > 0 ? `\n${props.join('\n')}\n` : ''

  return `<script>
  import { MeteorShower } from '@annondeveloper/ui-kit';
</script>

<MeteorShower${propsStr}>
  <div style="padding: 4rem 2rem; text-align: center">
    <h2>Your content here</h2>
  </div>
</MeteorShower>`
}

// ─── Playground Section ───────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [count, setCount] = useState<MeteorCount>(20)
  const [motion, setMotion] = useState<MotionLevel>(3)
  const [copyStatus, setCopyStatus] = useState('')

  const reactCode = useMemo(() => generateReactCode(tier, count, motion), [tier, count, motion])
  const htmlCode = useMemo(() => generateHtmlCode(tier, count, motion), [tier, count, motion])
  const vueCode = useMemo(() => generateVueCode(tier, count, motion), [tier, count, motion])
  const angularCode = useMemo(() => generateAngularCode(tier, count, motion), [tier, count, motion])
  const svelteCode = useMemo(() => generateSvelteCode(tier, count, motion), [tier, count, motion])

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

  return (
    <section className="meteor-page__section" id="playground">
      <h2 className="meteor-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="meteor-page__section-desc">
        Adjust meteor count and motion intensity. Watch the shower respond in real-time.
        Code output updates across all five framework tabs.
      </p>

      <div className="meteor-page__playground">
        <div className="meteor-page__playground-preview">
          <div className="meteor-page__playground-result">
            <MeteorShower
              count={count}
              motion={motion}
              style={{ position: 'absolute', inset: 0, borderRadius: 'inherit' }}
            >
              <div style={{ padding: '3rem 2rem', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'oklch(95% 0 0)', margin: '0 0 0.5rem' }}>
                  Meteor Shower
                </h3>
                <p style={{ color: 'oklch(70% 0 0)', fontSize: '0.875rem' }}>
                  {count} meteors at motion level {motion}
                </p>
              </div>
            </MeteorShower>
          </div>

          <div className="meteor-page__code-tabs">
            <div className="meteor-page__export-row">
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
              {copyStatus && <span className="meteor-page__export-status">{copyStatus}</span>}
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

        <div className="meteor-page__playground-controls">
          <OptionGroup
            label="Meteor Count"
            options={METEOR_COUNTS.map(String) as any}
            value={String(count)}
            onChange={v => setCount(Number(v) as MeteorCount)}
          />
          <OptionGroup
            label="Motion Level"
            options={MOTION_LEVELS.map(String) as any}
            value={String(motion)}
            onChange={v => setMotion(Number(v) as MotionLevel)}
          />
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MeteorShowerPage() {
  useStyles('meteor-page', pageStyles)

  const { tier, setTier } = useTier()

  // Scroll reveal JS fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.meteor-page__section')
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
    <div className="meteor-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="meteor-page__hero">
        <h1 className="meteor-page__title">MeteorShower</h1>
        <p className="meteor-page__desc">
          Animated falling meteor streaks with glowing tails that create a dramatic night-sky effect.
          Each meteor has unique speed, position, and delay from a seeded random algorithm.
          Perfect for dark hero sections and cosmic-themed landing pages.
        </p>
        <div className="meteor-page__import-row">
          <code className="meteor-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Meteor Count Gallery ───────────────────────── */}
      <section className="meteor-page__section" id="meteor-counts">
        <h2 className="meteor-page__section-title">
          <a href="#meteor-counts">Meteor Count Variations</a>
        </h2>
        <p className="meteor-page__section-desc">
          Control meteor density from sparse 5-meteor gentle rain to dense 50-meteor cosmic storm.
          Each meteor is deterministically positioned using a seeded pseudo-random function.
        </p>
        <div className="meteor-page__labeled-row" style={{ gap: '1rem' }}>
          {([5, 15, 30, 50] as const).map(n => (
            <div key={n} className="meteor-page__labeled-item">
              <div style={{
                width: '180px',
                height: '140px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: 'oklch(8% 0.02 270)',
                position: 'relative',
              }}>
                <MeteorShower count={n} motion={3}>
                  <div style={{ display: 'grid', placeItems: 'center', height: '100%', position: 'relative', zIndex: 1 }}>
                    <span style={{ color: 'oklch(90% 0 0)', fontWeight: 600, fontSize: '0.875rem' }}>{n} meteors</span>
                  </div>
                </MeteorShower>
              </div>
              <span className="meteor-page__item-label">count={n}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Motion Levels ────────────────────────────── */}
      <section className="meteor-page__section" id="motion">
        <h2 className="meteor-page__section-title">
          <a href="#motion">Motion Levels</a>
        </h2>
        <p className="meteor-page__section-desc">
          Control animation intensity. Level 0 disables all meteors, respecting
          <code className="meteor-page__a11y-key">prefers-reduced-motion</code>.
          The motion cascade: OS preference &gt; prop &gt; CSS --motion &gt; UIProvider &gt; default (3).
        </p>
        <div className="meteor-page__labeled-row" style={{ gap: '1rem' }}>
          {MOTION_LEVELS.map(m => (
            <div key={m} className="meteor-page__labeled-item">
              <div style={{
                width: '160px',
                height: '120px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: 'oklch(8% 0.02 270)',
                position: 'relative',
              }}>
                <MeteorShower count={20} motion={m}>
                  <div style={{ display: 'grid', placeItems: 'center', height: '100%', position: 'relative', zIndex: 1 }}>
                    <span style={{ color: 'oklch(70% 0 0)', fontSize: '0.75rem' }}>
                      {m === 0 ? 'hidden' : m === 1 ? 'subtle' : m === 2 ? 'expressive' : 'cinematic'}
                    </span>
                  </div>
                </MeteorShower>
              </div>
              <span className="meteor-page__item-label">motion={m}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. With Content Overlay ─────────────────────── */}
      <section className="meteor-page__section" id="content-overlay">
        <h2 className="meteor-page__section-title">
          <a href="#content-overlay">Content Overlay</a>
        </h2>
        <p className="meteor-page__section-desc">
          MeteorShower wraps child content in a z-indexed layer. Text and buttons remain
          fully interactive while meteors streak behind them. Ideal for hero sections.
        </p>
        <div className="meteor-page__preview meteor-page__preview--tall" style={{ padding: 0 }}>
          <MeteorShower count={30} style={{ width: '100%', minHeight: '320px', background: 'oklch(8% 0.02 270)', borderRadius: 'var(--radius-md)' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              padding: '3rem',
              textAlign: 'center',
              minHeight: '320px',
            }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'oklch(95% 0 0)', margin: 0 }}>
                Reach for the stars
              </h3>
              <p style={{ color: 'oklch(70% 0 0)', maxWidth: '40ch', margin: 0, lineHeight: 1.6 }}>
                Create stunning cosmic backgrounds with zero dependencies. Each meteor is uniquely generated with seeded randomness.
              </p>
              <Button variant="primary" size="lg">Launch Project</Button>
            </div>
          </MeteorShower>
        </div>
      </section>

      {/* ── 6. Dark Theme Compositions ──────────────────── */}
      <section className="meteor-page__section" id="compositions">
        <h2 className="meteor-page__section-title">
          <a href="#compositions">Composition Patterns</a>
        </h2>
        <p className="meteor-page__section-desc">
          MeteorShower works best on dark backgrounds. Combine with gradient overlays and cards
          for layered cosmic designs.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div style={{
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            background: 'var(--bg-base)',
            position: 'relative',
          }}>
            <MeteorShower count={15} style={{ minHeight: '200px' }}>
              <div style={{ padding: '2rem', textAlign: 'center', display: 'grid', placeItems: 'center', minHeight: '200px' }}>
                <div>
                  <p style={{ color: 'oklch(90% 0 0)', fontWeight: 700, fontSize: '1.125rem', margin: '0 0 0.25rem' }}>Cosmic Night</p>
                  <p style={{ color: 'oklch(60% 0 0)', fontSize: '0.8125rem', margin: 0 }}>Gradient backdrop with gentle meteor rain</p>
                </div>
              </div>
            </MeteorShower>
          </div>
          <div style={{
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            background: 'oklch(5% 0.01 240)',
            position: 'relative',
          }}>
            <MeteorShower count={40} style={{ minHeight: '200px' }}>
              <div style={{ padding: '2rem', textAlign: 'center', display: 'grid', placeItems: 'center', minHeight: '200px' }}>
                <div>
                  <p style={{ color: 'oklch(90% 0 0)', fontWeight: 700, fontSize: '1.125rem', margin: '0 0 0.25rem' }}>Dense Storm</p>
                  <p style={{ color: 'oklch(60% 0 0)', fontSize: '0.8125rem', margin: 0 }}>High-density shower for dramatic impact</p>
                </div>
              </div>
            </MeteorShower>
          </div>
        </div>
      </section>

      {/* ── 7. Code Example ─────────────────────────────── */}
      <section className="meteor-page__section" id="code-example">
        <h2 className="meteor-page__section-title">
          <a href="#code-example">Quick Start</a>
        </h2>
        <p className="meteor-page__section-desc">
          Drop MeteorShower into any container. It fills the parent with absolute-positioned meteors and
          renders children above them.
        </p>
        <CopyBlock
          code={`import { MeteorShower } from '@annondeveloper/ui-kit'

function HeroSection() {
  return (
    <MeteorShower
      count={30}
      motion={3}
      style={{ minHeight: '400px', background: 'oklch(8% 0.02 270)' }}
    >
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <h1>Welcome to the cosmos</h1>
        <p>Beautiful meteor effects with zero dependencies.</p>
      </div>
    </MeteorShower>
  )
}`}
          language="typescript"
          showLineNumbers
        />
      </section>

      {/* ── 8. Weight Tiers ────────────────────────────── */}
      <section className="meteor-page__section" id="tiers">
        <h2 className="meteor-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="meteor-page__section-desc">
          Choose the right balance of features and bundle size for your project.
          MeteorShower is a domain component with CSS-only and React integration options.
        </p>

        <div className="meteor-page__tiers">
          {/* Lite */}
          <div
            className={`meteor-page__tier-card${tier === 'lite' ? ' meteor-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="meteor-page__tier-header">
              <span className="meteor-page__tier-name">Lite</span>
              <span className="meteor-page__tier-size">~0.4 KB</span>
            </div>
            <p className="meteor-page__tier-desc">
              CSS-only meteor streaks. Import the stylesheet and use HTML with data attributes.
              No JavaScript runtime — fixed meteor count defined in CSS.
              Limited customization through CSS custom properties.
            </p>
            <div className="meteor-page__tier-import">
              @import '@annondeveloper/ui-kit/css/components/meteor-shower.css'
            </div>
            <div className="meteor-page__tier-preview">
              <div style={{
                width: '100%',
                height: '80px',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                background: 'oklch(8% 0.02 270)',
                position: 'relative',
              }}>
                <MeteorShower count={8} motion={2} />
              </div>
            </div>
            <div className="meteor-page__size-breakdown">
              <div className="meteor-page__size-row">
                <span>CSS: <strong style={{ color: 'var(--text-primary)' }}>0.4 KB</strong></span>
                <span>JS: <strong style={{ color: 'var(--text-primary)' }}>0 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>0.4 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`meteor-page__tier-card${tier === 'standard' ? ' meteor-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="meteor-page__tier-header">
              <span className="meteor-page__tier-name">Standard</span>
              <span className="meteor-page__tier-size">~1.5 KB</span>
            </div>
            <p className="meteor-page__tier-desc">
              Full React component with dynamic count, seeded random positioning,
              motion level cascade, tail glow effect, and content overlay support.
              Auto-injects CSS via adoptedStyleSheets.
            </p>
            <div className="meteor-page__tier-import">
              import {'{'} MeteorShower {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="meteor-page__tier-preview">
              <div style={{
                width: '100%',
                height: '80px',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                background: 'oklch(8% 0.02 270)',
                position: 'relative',
              }}>
                <MeteorShower count={20} motion={3} />
              </div>
            </div>
            <div className="meteor-page__size-breakdown">
              <div className="meteor-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.4 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`meteor-page__tier-card${tier === 'premium' ? ' meteor-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="meteor-page__tier-header">
              <span className="meteor-page__tier-name">Premium</span>
              <span className="meteor-page__tier-size">~2.8 KB</span>
            </div>
            <p className="meteor-page__tier-desc">
              Everything in Standard plus variable-width trails,
              color gradients per meteor, scroll-triggered density bursts,
              impact flash effects, and viewport-aware culling for performance.
            </p>
            <div className="meteor-page__tier-import">
              import {'{'} MeteorShower {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="meteor-page__tier-preview">
              <div style={{
                width: '100%',
                height: '80px',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                background: 'oklch(8% 0.02 270)',
                position: 'relative',
              }}>
                <MeteorShower count={25} motion={3} />
              </div>
            </div>
            <div className="meteor-page__size-breakdown">
              <div className="meteor-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.8 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.7 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Props API ───────────────────────────────── */}
      <section className="meteor-page__section" id="props">
        <h2 className="meteor-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="meteor-page__section-desc">
          All props accepted by MeteorShower. It also spreads any native div HTML attributes
          onto the underlying {'<div>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={meteorProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className="meteor-page__section" id="accessibility">
        <h2 className="meteor-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="meteor-page__section-desc">
          Decorative animation component designed with accessibility as a priority.
        </p>
        <Card variant="default" padding="md">
          <ul className="meteor-page__a11y-list">
            <li className="meteor-page__a11y-item">
              <span className="meteor-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Decorative:</strong> Root container marked with <code className="meteor-page__a11y-key">aria-hidden="true"</code> — screen readers skip all meteor elements.
              </span>
            </li>
            <li className="meteor-page__a11y-item">
              <span className="meteor-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> Respects <code className="meteor-page__a11y-key">prefers-reduced-motion: reduce</code> by hiding all meteors. Motion level 0 also hides them.
              </span>
            </li>
            <li className="meteor-page__a11y-item">
              <span className="meteor-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Content layer:</strong> Children are rendered in a z-indexed content layer above meteors, keeping interactive elements fully accessible.
              </span>
            </li>
            <li className="meteor-page__a11y-item">
              <span className="meteor-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Pointer events:</strong> Meteor elements have <code className="meteor-page__a11y-key">pointer-events: none</code> to never block user clicks.
              </span>
            </li>
            <li className="meteor-page__a11y-item">
              <span className="meteor-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print safe:</strong> Meteors are hidden in print media via <code className="meteor-page__a11y-key">@media print</code> rules.
              </span>
            </li>
            <li className="meteor-page__a11y-item">
              <span className="meteor-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Performance:</strong> Uses CSS animations exclusively — no requestAnimationFrame loops or JavaScript timers that could impact device battery.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
