'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { BorderBeam } from '@ui/domain/border-beam'
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
    @scope (.borderbeam-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: borderbeam-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .borderbeam-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .borderbeam-page__hero::before {
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
        animation: borderbeam-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes borderbeam-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .borderbeam-page__hero::before { animation: none; }
      }

      .borderbeam-page__title {
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

      .borderbeam-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .borderbeam-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .borderbeam-page__import-code {
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

      .borderbeam-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .borderbeam-page__section {
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
        animation: borderbeam-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes borderbeam-section-reveal {
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
        .borderbeam-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .borderbeam-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .borderbeam-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .borderbeam-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .borderbeam-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .borderbeam-page__preview {
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

      .borderbeam-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ─────────────────────────────────── */

      .borderbeam-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .borderbeam-page__playground {
          grid-template-columns: 1fr;
        }
        .borderbeam-page__playground-controls {
          position: static !important;
        }
      }

      @container borderbeam-page (max-width: 680px) {
        .borderbeam-page__playground {
          grid-template-columns: 1fr;
        }
        .borderbeam-page__playground-controls {
          position: static !important;
        }
      }

      .borderbeam-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .borderbeam-page__playground-result {
        min-block-size: 250px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .borderbeam-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .borderbeam-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .borderbeam-page__playground-controls {
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

      .borderbeam-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .borderbeam-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .borderbeam-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .borderbeam-page__option-btn {
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
      .borderbeam-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .borderbeam-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .borderbeam-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .borderbeam-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .borderbeam-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .borderbeam-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .borderbeam-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .borderbeam-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .borderbeam-page__tier-card {
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

      .borderbeam-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .borderbeam-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .borderbeam-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .borderbeam-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .borderbeam-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .borderbeam-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .borderbeam-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .borderbeam-page__tier-import {
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

      .borderbeam-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
        min-block-size: 60px;
        align-items: center;
        overflow: hidden;
        border-radius: var(--radius-sm);
      }

      /* ── Code tabs ─────────────────────────────────── */

      .borderbeam-page__code-tabs {
        margin-block-start: 1rem;
      }

      .borderbeam-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .borderbeam-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .borderbeam-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .borderbeam-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .borderbeam-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .borderbeam-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Size breakdown ─────────────────────────────── */

      .borderbeam-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .borderbeam-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .borderbeam-page__hero { padding: 2rem 1.25rem; }
        .borderbeam-page__title { font-size: 1.75rem; }
        .borderbeam-page__preview { padding: 1.75rem; }
        .borderbeam-page__playground { grid-template-columns: 1fr; }
        .borderbeam-page__playground-result { padding: 2rem; min-block-size: 180px; }
        .borderbeam-page__tiers { grid-template-columns: 1fr; }
        .borderbeam-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .borderbeam-page__hero { padding: 1.5rem 1rem; }
        .borderbeam-page__title { font-size: 1.5rem; }
        .borderbeam-page__preview { padding: 1rem; }
      }

      @media (min-width: 3000px) {
        :scope { max-inline-size: 1400px; }
        .borderbeam-page__title { font-size: 4rem; }
        .borderbeam-page__preview { padding: 3.5rem; }
      }

      /* ── Scrollbar ──────────────────────────────────── */

      .borderbeam-page__import-code,
      .borderbeam-page code,
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

const borderBeamProps: PropDef[] = [
  { name: 'duration', type: 'number', default: '5', description: 'Beam rotation speed in seconds per full revolution around the border.' },
  { name: 'color', type: 'string', description: 'Beam color using OKLCH or any CSS color. Overrides the default violet beam.' },
  { name: 'size', type: 'number', default: '80', description: 'Beam arc size in pixels. Larger values create a wider visible beam segment.' },
  { name: 'children', type: 'ReactNode', description: 'Content rendered inside the bordered container above the beam animation.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. At 0 beam becomes a static border highlight. Cascades from OS > prop > CSS --motion > UIProvider.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'style', type: 'CSSProperties', description: 'Inline style object applied to the root container element.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type MotionLevel = 0 | 1 | 2 | 3
type DurationPreset = 2 | 3 | 5 | 8 | 12
type SizePreset = 40 | 80 | 120 | 200

const DURATION_PRESETS: DurationPreset[] = [2, 3, 5, 8, 12]
const SIZE_PRESETS: SizePreset[] = [40, 80, 120, 200]
const MOTION_LEVELS: MotionLevel[] = [0, 1, 2, 3]

const COLOR_PRESETS = [
  { value: '', name: 'Default (Violet)' },
  { value: 'oklch(70% 0.2 150)', name: 'Emerald' },
  { value: 'oklch(70% 0.18 30)', name: 'Amber' },
  { value: 'oklch(65% 0.22 350)', name: 'Rose' },
  { value: 'oklch(65% 0.2 210)', name: 'Cyan' },
  { value: 'oklch(60% 0.25 300)', name: 'Purple' },
  { value: 'oklch(75% 0.12 180)', name: 'Teal' },
  { value: 'oklch(70% 0.15 60)', name: 'Gold' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "/* CSS-only: @import '@annondeveloper/ui-kit/css/components/border-beam.css' */",
  standard: "import { BorderBeam } from '@annondeveloper/ui-kit'",
  premium: "import { BorderBeam } from '@annondeveloper/ui-kit'",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="borderbeam-page__copy-btn"
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
    <div className="borderbeam-page__control-group">
      <span className="borderbeam-page__control-label">{label}</span>
      <div className="borderbeam-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`borderbeam-page__option-btn${opt === value ? ' borderbeam-page__option-btn--active' : ''}`}
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

function generateReactCode(tier: Tier, duration: number, size: number, color: string, motion: MotionLevel): string {
  if (tier === 'lite') {
    const colorVar = color ? ` style="--border-beam-color: ${color}; --border-beam-duration: ${duration}s; --border-beam-size: ${size}px"` : ` style="--border-beam-duration: ${duration}s; --border-beam-size: ${size}px"`
    return `/* Lite tier — CSS-only border beam */
@import '@annondeveloper/ui-kit/css/components/border-beam.css';

<div class="ui-border-beam" data-motion="${motion}"${colorVar}>
  <div class="ui-border-beam--content">
    <h3>Featured Card</h3>
    <p>A rotating beam traces the border of this card.</p>
  </div>
</div>`
  }

  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  if (duration !== 5) props.push(`  duration={${duration}}`)
  if (size !== 80) props.push(`  size={${size}}`)
  if (color) props.push(`  color="${color}"`)
  if (motion !== 3) props.push(`  motion={${motion}}`)

  const childContent = `  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h3>Featured Card</h3>
    <p>A rotating beam traces the border of this card.</p>
  </div>`

  const jsx = props.length === 0
    ? `<BorderBeam>\n${childContent}\n</BorderBeam>`
    : `<BorderBeam\n${props.join('\n')}\n>\n${childContent}\n</BorderBeam>`

  return `${importStr}\n\n${jsx}`
}

function generateHtmlCode(tier: Tier, duration: number, size: number, color: string, motion: MotionLevel): string {
  const colorVar = color ? `--border-beam-color: ${color}; ` : ''
  return `<!-- BorderBeam — @annondeveloper/ui-kit ${tier} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/border-beam.css">

<div
  class="ui-border-beam"
  data-motion="${motion}"
  style="${colorVar}--border-beam-duration: ${duration}s; --border-beam-size: ${size}px"
>
  <div class="ui-border-beam--content">
    <h3>Featured Card</h3>
    <p>A rotating beam traces the border of this card.</p>
  </div>
</div>

<style>
  .ui-border-beam {
    max-width: 400px;
  }
</style>`
}

function generateVueCode(tier: Tier, duration: number, size: number, color: string, motion: MotionLevel): string {
  if (tier === 'lite') {
    const colorVar = color ? `--border-beam-color: ${color}; ` : ''
    return `<template>
  <div
    class="ui-border-beam"
    data-motion="${motion}"
    :style="{ '${colorVar}--border-beam-duration': '${duration}s', '--border-beam-size': '${size}px' }"
  >
    <div class="ui-border-beam--content">
      <h3>Featured Card</h3>
      <p>A rotating beam traces the border.</p>
    </div>
  </div>
</template>

<style>
@import '@annondeveloper/ui-kit/css/components/border-beam.css';
</style>`
  }

  const props: string[] = []
  if (duration !== 5) props.push(`    :duration="${duration}"`)
  if (size !== 80) props.push(`    :size="${size}"`)
  if (color) props.push(`    color="${color}"`)
  if (motion !== 3) props.push(`    :motion="${motion}"`)
  const propsStr = props.length > 0 ? `\n${props.join('\n')}\n  ` : ''

  return `<template>
  <BorderBeam${propsStr}>
    <div style="padding: 2rem; text-align: center">
      <h3>Featured Card</h3>
      <p>A rotating beam traces the border.</p>
    </div>
  </BorderBeam>
</template>

<script setup>
import { BorderBeam } from '@annondeveloper/ui-kit'
</script>`
}

function generateAngularCode(tier: Tier, duration: number, size: number, color: string, motion: MotionLevel): string {
  const colorVar = color ? `--border-beam-color: ${color}; ` : ''
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (CSS-only) -->
<div
  class="ui-border-beam"
  data-motion="${motion}"
  style="${colorVar}--border-beam-duration: ${duration}s; --border-beam-size: ${size}px"
>
  <div class="ui-border-beam--content">
    <h3>Featured Card</h3>
    <p>A rotating beam traces the border.</p>
  </div>
</div>

/* In styles.css */
@import '@annondeveloper/ui-kit/css/components/border-beam.css';`
  }

  return `<!-- Angular — ${tier === 'premium' ? 'Premium' : 'Standard'} tier -->
<div
  class="ui-border-beam"
  data-motion="${motion}"
  style="${colorVar}--border-beam-duration: ${duration}s; --border-beam-size: ${size}px"
>
  <div class="ui-border-beam--content">
    <h3>Featured Card</h3>
    <p>A rotating beam traces the border.</p>
  </div>
</div>

/* Import component CSS */
@import '@annondeveloper/ui-kit/css/components/border-beam.css';`
}

function generateSvelteCode(tier: Tier, duration: number, size: number, color: string, motion: MotionLevel): string {
  if (tier === 'lite') {
    const colorVar = color ? `--border-beam-color: ${color}; ` : ''
    return `<!-- Svelte — Lite tier (CSS-only) -->
<div
  class="ui-border-beam"
  data-motion="${motion}"
  style="${colorVar}--border-beam-duration: ${duration}s; --border-beam-size: ${size}px"
>
  <div class="ui-border-beam--content">
    <h3>Featured Card</h3>
    <p>A rotating beam traces the border.</p>
  </div>
</div>

<style>
  @import '@annondeveloper/ui-kit/css/components/border-beam.css';
</style>`
  }

  const props: string[] = []
  if (duration !== 5) props.push(`  duration={${duration}}`)
  if (size !== 80) props.push(`  size={${size}}`)
  if (color) props.push(`  color="${color}"`)
  if (motion !== 3) props.push(`  motion={${motion}}`)
  const propsStr = props.length > 0 ? `\n${props.join('\n')}\n` : ''

  return `<script>
  import { BorderBeam } from '@annondeveloper/ui-kit';
</script>

<BorderBeam${propsStr}>
  <div style="padding: 2rem; text-align: center">
    <h3>Featured Card</h3>
    <p>A rotating beam traces the border.</p>
  </div>
</BorderBeam>`
}

// ─── Playground Section ───────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [duration, setDuration] = useState<DurationPreset>(5)
  const [size, setSize] = useState<SizePreset>(80)
  const [motion, setMotion] = useState<MotionLevel>(3)
  const [color, setColor] = useState('')
  const [copyStatus, setCopyStatus] = useState('')

  const reactCode = useMemo(() => generateReactCode(tier, duration, size, color, motion), [tier, duration, size, color, motion])
  const htmlCode = useMemo(() => generateHtmlCode(tier, duration, size, color, motion), [tier, duration, size, color, motion])
  const vueCode = useMemo(() => generateVueCode(tier, duration, size, color, motion), [tier, duration, size, color, motion])
  const angularCode = useMemo(() => generateAngularCode(tier, duration, size, color, motion), [tier, duration, size, color, motion])
  const svelteCode = useMemo(() => generateSvelteCode(tier, duration, size, color, motion), [tier, duration, size, color, motion])

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
    <section className="borderbeam-page__section" id="playground">
      <h2 className="borderbeam-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="borderbeam-page__section-desc">
        Adjust duration, beam size, color, and motion level. Watch the beam respond in real-time.
        Code updates across all five framework tabs.
      </p>

      <div className="borderbeam-page__playground">
        <div className="borderbeam-page__playground-preview">
          <div className="borderbeam-page__playground-result">
            <BorderBeam
              duration={duration}
              size={size}
              motion={motion}
              color={color || undefined}
            >
              <div style={{ padding: '2rem 2.5rem', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>
                  Border Beam
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                  {duration}s rotation, {size}px arc
                </p>
              </div>
            </BorderBeam>
          </div>

          <div className="borderbeam-page__code-tabs">
            <div className="borderbeam-page__export-row">
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
              {copyStatus && <span className="borderbeam-page__export-status">{copyStatus}</span>}
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

        <div className="borderbeam-page__playground-controls">
          <OptionGroup
            label="Duration (seconds)"
            options={DURATION_PRESETS.map(String) as any}
            value={String(duration)}
            onChange={v => setDuration(Number(v) as DurationPreset)}
          />
          <OptionGroup
            label="Beam Size (px)"
            options={SIZE_PRESETS.map(String) as any}
            value={String(size)}
            onChange={v => setSize(Number(v) as SizePreset)}
          />
          <OptionGroup
            label="Motion Level"
            options={MOTION_LEVELS.map(String) as any}
            value={String(motion)}
            onChange={v => setMotion(Number(v) as MotionLevel)}
          />

          <div className="borderbeam-page__control-group">
            <span className="borderbeam-page__control-label">Beam Color</span>
            <div className="borderbeam-page__control-options">
              {COLOR_PRESETS.map(p => (
                <button
                  key={p.name}
                  type="button"
                  className={`borderbeam-page__option-btn${color === p.value ? ' borderbeam-page__option-btn--active' : ''}`}
                  onClick={() => setColor(p.value)}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="borderbeam-page__control-group">
            <span className="borderbeam-page__control-label">Custom Color</span>
            <input
              type="text"
              value={color}
              onChange={e => setColor(e.target.value)}
              className="borderbeam-page__text-input"
              placeholder="oklch(70% 0.2 270)"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BorderBeamPage() {
  useStyles('borderbeam-page', pageStyles)

  const { tier, setTier } = useTier()

  // Scroll reveal JS fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.borderbeam-page__section')
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
    <div className="borderbeam-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="borderbeam-page__hero">
        <h1 className="borderbeam-page__title">BorderBeam</h1>
        <p className="borderbeam-page__desc">
          An animated conic gradient beam that rotates around the border of a container.
          Creates a premium, eye-catching highlight effect for cards, panels, and CTAs.
          Uses CSS mask-composite for clean beam rendering with configurable color, speed, and size.
        </p>
        <div className="borderbeam-page__import-row">
          <code className="borderbeam-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Duration Gallery ───────────────────────────── */}
      <section className="borderbeam-page__section" id="durations">
        <h2 className="borderbeam-page__section-title">
          <a href="#durations">Speed Variations</a>
        </h2>
        <p className="borderbeam-page__section-desc">
          The duration prop controls how fast the beam completes a full revolution.
          Fast beams (2s) feel energetic while slow beams (12s) feel premium and subtle.
        </p>
        <div className="borderbeam-page__labeled-row" style={{ gap: '1rem' }}>
          {([2, 5, 8, 12] as const).map(d => (
            <div key={d} className="borderbeam-page__labeled-item">
              <BorderBeam duration={d} size={80}>
                <div style={{ padding: '1.25rem 1.5rem', textAlign: 'center', minWidth: '140px' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{d}s</span>
                </div>
              </BorderBeam>
              <span className="borderbeam-page__item-label">duration={d}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Size Variations ────────────────────────────── */}
      <section className="borderbeam-page__section" id="sizes">
        <h2 className="borderbeam-page__section-title">
          <a href="#sizes">Beam Size Variations</a>
        </h2>
        <p className="borderbeam-page__section-desc">
          The size prop controls the arc length of the visible beam segment.
          Smaller values create a tight spotlight effect while larger values produce a wide glow.
        </p>
        <div className="borderbeam-page__labeled-row" style={{ gap: '1rem' }}>
          {([40, 80, 120, 200] as const).map(s => (
            <div key={s} className="borderbeam-page__labeled-item">
              <BorderBeam duration={5} size={s}>
                <div style={{ padding: '1.25rem 1.5rem', textAlign: 'center', minWidth: '140px' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{s}px</span>
                </div>
              </BorderBeam>
              <span className="borderbeam-page__item-label">size={s}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Color Variations ────────────────────────────── */}
      <section className="borderbeam-page__section" id="colors">
        <h2 className="borderbeam-page__section-title">
          <a href="#colors">Color Variations</a>
        </h2>
        <p className="borderbeam-page__section-desc">
          Pass any CSS color value to customize the beam. The conic gradient uses your color
          for the visible beam segment with transparent fade on both sides.
        </p>
        <div className="borderbeam-page__labeled-row" style={{ gap: '1rem' }}>
          {[
            { color: undefined, label: 'Default' },
            { color: 'oklch(70% 0.2 150)', label: 'Emerald' },
            { color: 'oklch(65% 0.22 350)', label: 'Rose' },
            { color: 'oklch(65% 0.2 210)', label: 'Cyan' },
            { color: 'oklch(70% 0.15 60)', label: 'Gold' },
          ].map(p => (
            <div key={p.label} className="borderbeam-page__labeled-item">
              <BorderBeam duration={5} color={p.color}>
                <div style={{ padding: '1rem 1.25rem', textAlign: 'center', minWidth: '120px' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{p.label}</span>
                </div>
              </BorderBeam>
              <span className="borderbeam-page__item-label">{p.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. Motion Levels ────────────────────────────── */}
      <section className="borderbeam-page__section" id="motion">
        <h2 className="borderbeam-page__section-title">
          <a href="#motion">Motion Levels</a>
        </h2>
        <p className="borderbeam-page__section-desc">
          At motion level 0 the beam becomes a static border highlight with reduced opacity.
          Respects <code className="borderbeam-page__a11y-key">prefers-reduced-motion</code> automatically.
        </p>
        <div className="borderbeam-page__labeled-row" style={{ gap: '1rem' }}>
          {MOTION_LEVELS.map(m => (
            <div key={m} className="borderbeam-page__labeled-item">
              <BorderBeam duration={5} motion={m}>
                <div style={{ padding: '1rem 1.25rem', textAlign: 'center', minWidth: '120px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {m === 0 ? 'static' : m === 1 ? 'subtle' : m === 2 ? 'expressive' : 'cinematic'}
                  </span>
                </div>
              </BorderBeam>
              <span className="borderbeam-page__item-label">motion={m}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 7. Real-world Examples ─────────────────────── */}
      <section className="borderbeam-page__section" id="examples">
        <h2 className="borderbeam-page__section-title">
          <a href="#examples">Real-World Examples</a>
        </h2>
        <p className="borderbeam-page__section-desc">
          BorderBeam is ideal for highlighting featured content, pricing cards, call-to-action panels, and notification areas.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          <BorderBeam duration={6} color="oklch(70% 0.2 150)">
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBlockEnd: '0.5rem' }}>Pro Plan</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBlockEnd: '0.5rem' }}>$29/mo</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginBlockEnd: '1rem' }}>Everything you need to ship faster.</p>
              <Button variant="primary" size="md">Get Started</Button>
            </div>
          </BorderBeam>
          <BorderBeam duration={8} color="oklch(65% 0.2 210)">
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBlockEnd: '0.5rem' }}>New Feature</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginBlockEnd: '1rem' }}>
                Physics-based animations with real spring solver. Zero dependencies. Silky smooth 120fps.
              </p>
              <Button variant="secondary" size="sm">Learn More</Button>
            </div>
          </BorderBeam>
        </div>
      </section>

      {/* ── 8. Weight Tiers ────────────────────────────── */}
      <section className="borderbeam-page__section" id="tiers">
        <h2 className="borderbeam-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="borderbeam-page__section-desc">
          Choose the right balance of features and bundle size. BorderBeam works as pure CSS
          or as a full React component with dynamic configuration.
        </p>

        <div className="borderbeam-page__tiers">
          {/* Lite */}
          <div
            className={`borderbeam-page__tier-card${tier === 'lite' ? ' borderbeam-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="borderbeam-page__tier-header">
              <span className="borderbeam-page__tier-name">Lite</span>
              <span className="borderbeam-page__tier-size">~0.5 KB</span>
            </div>
            <p className="borderbeam-page__tier-desc">
              CSS-only rotating beam via conic-gradient and mask-composite.
              No JavaScript — configure via CSS custom properties.
              Duration, color, and size all controllable through --border-beam-* variables.
            </p>
            <div className="borderbeam-page__tier-import">
              @import '@annondeveloper/ui-kit/css/components/border-beam.css'
            </div>
            <div className="borderbeam-page__tier-preview">
              <BorderBeam duration={5} size={60}>
                <div style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  CSS-only beam
                </div>
              </BorderBeam>
            </div>
            <div className="borderbeam-page__size-breakdown">
              <div className="borderbeam-page__size-row">
                <span>CSS: <strong style={{ color: 'var(--text-primary)' }}>0.5 KB</strong></span>
                <span>JS: <strong style={{ color: 'var(--text-primary)' }}>0 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>0.5 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`borderbeam-page__tier-card${tier === 'standard' ? ' borderbeam-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="borderbeam-page__tier-header">
              <span className="borderbeam-page__tier-name">Standard</span>
              <span className="borderbeam-page__tier-size">~1.4 KB</span>
            </div>
            <p className="borderbeam-page__tier-desc">
              Full React component with dynamic props for duration, size, and color.
              Motion level cascade, auto-injected CSS via adoptedStyleSheets,
              and content wrapper with proper z-indexing.
            </p>
            <div className="borderbeam-page__tier-import">
              import {'{'} BorderBeam {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="borderbeam-page__tier-preview">
              <BorderBeam duration={5} size={80}>
                <div style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Standard beam
                </div>
              </BorderBeam>
            </div>
            <div className="borderbeam-page__size-breakdown">
              <div className="borderbeam-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.4 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.3 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`borderbeam-page__tier-card${tier === 'premium' ? ' borderbeam-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="borderbeam-page__tier-header">
              <span className="borderbeam-page__tier-name">Premium</span>
              <span className="borderbeam-page__tier-size">~2.6 KB</span>
            </div>
            <p className="borderbeam-page__tier-desc">
              Everything in Standard plus multi-color gradient beam,
              hover-triggered speed burst, glow trail effect,
              entrance fade-in animation, and customizable beam width.
            </p>
            <div className="borderbeam-page__tier-import">
              import {'{'} BorderBeam {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="borderbeam-page__tier-preview">
              <BorderBeam duration={4} size={100} color="oklch(70% 0.2 280)">
                <div style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Premium beam
                </div>
              </BorderBeam>
            </div>
            <div className="borderbeam-page__size-breakdown">
              <div className="borderbeam-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.6 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.5 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Props API ───────────────────────────────── */}
      <section className="borderbeam-page__section" id="props">
        <h2 className="borderbeam-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="borderbeam-page__section-desc">
          All props accepted by BorderBeam. It also spreads any native div HTML attributes
          onto the underlying {'<div>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={borderBeamProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className="borderbeam-page__section" id="accessibility">
        <h2 className="borderbeam-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="borderbeam-page__section-desc">
          Decorative border effect with comprehensive accessibility support.
        </p>
        <Card variant="default" padding="md">
          <ul className="borderbeam-page__a11y-list">
            <li className="borderbeam-page__a11y-item">
              <span className="borderbeam-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Decorative:</strong> The beam is rendered via <code className="borderbeam-page__a11y-key">::before</code> pseudo-element with <code className="borderbeam-page__a11y-key">pointer-events: none</code>, invisible to assistive technology.
              </span>
            </li>
            <li className="borderbeam-page__a11y-item">
              <span className="borderbeam-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> Beam stops rotating with <code className="borderbeam-page__a11y-key">prefers-reduced-motion: reduce</code>, falling back to a static semi-transparent border.
              </span>
            </li>
            <li className="borderbeam-page__a11y-item">
              <span className="borderbeam-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Content layer:</strong> Children are rendered in a z-indexed content layer above the beam, keeping all interactive elements accessible.
              </span>
            </li>
            <li className="borderbeam-page__a11y-item">
              <span className="borderbeam-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> In <code className="borderbeam-page__a11y-key">forced-colors: active</code> mode the beam is replaced with a solid 2px CanvasText border.
              </span>
            </li>
            <li className="borderbeam-page__a11y-item">
              <span className="borderbeam-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print safe:</strong> Beam pseudo-element is hidden in print media, preserving clean document output.
              </span>
            </li>
            <li className="borderbeam-page__a11y-item">
              <span className="borderbeam-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Motion cascade:</strong> OS preference &gt; component prop &gt; CSS --motion &gt; UIProvider setting &gt; default level 3 (cinematic).
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
