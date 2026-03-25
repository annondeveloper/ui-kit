'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { WavyBackground } from '@ui/domain/wavy-background'
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
    @scope (.wavy-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: wavy-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .wavy-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .wavy-page__hero::before {
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
        animation: wavy-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes wavy-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .wavy-page__hero::before { animation: none; }
      }

      .wavy-page__title {
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

      .wavy-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .wavy-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .wavy-page__import-code {
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

      .wavy-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .wavy-page__section {
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
        animation: wavy-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes wavy-section-reveal {
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
        .wavy-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .wavy-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .wavy-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .wavy-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .wavy-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .wavy-page__preview {
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

      .wavy-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .wavy-page__preview--tall {
        min-block-size: 300px;
      }

      /* ── Playground ─────────────────────────────────── */

      .wavy-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .wavy-page__playground {
          grid-template-columns: 1fr;
        }
        .wavy-page__playground-controls {
          position: static !important;
        }
      }

      @container wavy-page (max-width: 680px) {
        .wavy-page__playground {
          grid-template-columns: 1fr;
        }
        .wavy-page__playground-controls {
          position: static !important;
        }
      }

      .wavy-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .wavy-page__playground-result {
        min-block-size: 280px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .wavy-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .wavy-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .wavy-page__playground-controls {
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

      .wavy-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .wavy-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .wavy-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .wavy-page__option-btn {
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
      .wavy-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .wavy-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .wavy-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .wavy-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .wavy-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .wavy-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .wavy-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .wavy-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .wavy-page__tier-card {
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

      .wavy-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .wavy-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .wavy-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .wavy-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .wavy-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .wavy-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .wavy-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .wavy-page__tier-import {
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

      .wavy-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
        min-block-size: 80px;
        align-items: center;
        overflow: hidden;
        border-radius: var(--radius-sm);
      }

      /* ── Code tabs ─────────────────────────────────── */

      .wavy-page__code-tabs {
        margin-block-start: 1rem;
      }

      .wavy-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .wavy-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .wavy-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .wavy-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .wavy-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .wavy-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Size breakdown ─────────────────────────────── */

      .wavy-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .wavy-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .wavy-page__hero { padding: 2rem 1.25rem; }
        .wavy-page__title { font-size: 1.75rem; }
        .wavy-page__preview { padding: 1.75rem; }
        .wavy-page__playground { grid-template-columns: 1fr; }
        .wavy-page__playground-result { padding: 2rem; min-block-size: 200px; }
        .wavy-page__tiers { grid-template-columns: 1fr; }
        .wavy-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .wavy-page__hero { padding: 1.5rem 1rem; }
        .wavy-page__title { font-size: 1.5rem; }
        .wavy-page__preview { padding: 1rem; }
      }

      @media (min-width: 3000px) {
        :scope { max-inline-size: 1400px; }
        .wavy-page__title { font-size: 4rem; }
        .wavy-page__preview { padding: 3.5rem; }
      }

      /* ── Scrollbar ──────────────────────────────────── */

      .wavy-page__import-code,
      .wavy-page code,
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

const wavyProps: PropDef[] = [
  { name: 'waveCount', type: 'number', default: '5', description: 'Number of layered sine waves rendered as SVG paths.' },
  { name: 'speed', type: 'number', default: '10', description: 'Base animation speed in seconds. Each wave varies slightly around this value.' },
  { name: 'color', type: 'string', description: 'Base color for all waves using OKLCH or any CSS color. Default is a violet hue.' },
  { name: 'children', type: 'ReactNode', description: 'Content rendered above the waves in a z-indexed content layer.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. At 0 waves are static. Cascades from OS > prop > CSS --motion > UIProvider.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'style', type: 'CSSProperties', description: 'Inline style object applied to the root container element.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type MotionLevel = 0 | 1 | 2 | 3
type WaveCount = 2 | 3 | 5 | 7 | 10
type SpeedPreset = 'slow' | 'medium' | 'fast'

const WAVE_COUNTS: WaveCount[] = [2, 3, 5, 7, 10]
const MOTION_LEVELS: MotionLevel[] = [0, 1, 2, 3]
const SPEED_PRESETS: { id: SpeedPreset; label: string; value: number }[] = [
  { id: 'slow', label: 'Slow (20s)', value: 20 },
  { id: 'medium', label: 'Medium (10s)', value: 10 },
  { id: 'fast', label: 'Fast (5s)', value: 5 },
]

const COLOR_PRESETS = [
  { value: '', name: 'Default (Violet)' },
  { value: 'oklch(65% 0.15 210)', name: 'Ocean Blue' },
  { value: 'oklch(70% 0.2 150)', name: 'Emerald' },
  { value: 'oklch(65% 0.22 350)', name: 'Rose' },
  { value: 'oklch(70% 0.18 30)', name: 'Sunset' },
  { value: 'oklch(55% 0.2 300)', name: 'Deep Purple' },
  { value: 'oklch(75% 0.12 180)', name: 'Teal' },
  { value: 'oklch(60% 0.05 270)', name: 'Muted Slate' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "/* CSS-only: @import '@annondeveloper/ui-kit/css/components/wavy-background.css' */",
  standard: "import { WavyBackground } from '@annondeveloper/ui-kit'",
  premium: "import { WavyBackground } from '@annondeveloper/ui-kit'",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="wavy-page__copy-btn"
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
    <div className="wavy-page__control-group">
      <span className="wavy-page__control-label">{label}</span>
      <div className="wavy-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`wavy-page__option-btn${opt === value ? ' wavy-page__option-btn--active' : ''}`}
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

function generateReactCode(tier: Tier, waveCount: number, speed: number, color: string, motion: MotionLevel): string {
  if (tier === 'lite') {
    return `/* Lite tier — CSS-only wavy background */
@import '@annondeveloper/ui-kit/css/components/wavy-background.css';

<div class="ui-wavy-background" data-motion="${motion}">
  <!-- SVG waves must be manually added in lite tier -->
  <div class="ui-wavy-background--content">
    <h2>Your content here</h2>
    <p>Content is rendered above the waves.</p>
  </div>
</div>`
  }

  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  if (waveCount !== 5) props.push(`  waveCount={${waveCount}}`)
  if (speed !== 10) props.push(`  speed={${speed}}`)
  if (color) props.push(`  color="${color}"`)
  if (motion !== 3) props.push(`  motion={${motion}}`)

  const childContent = `  <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
    <h2>Your content here</h2>
    <p>Content floats above animated waves.</p>
  </div>`

  const jsx = props.length === 0
    ? `<WavyBackground>\n${childContent}\n</WavyBackground>`
    : `<WavyBackground\n${props.join('\n')}\n>\n${childContent}\n</WavyBackground>`

  return `${importStr}\n\n${jsx}`
}

function generateHtmlCode(tier: Tier, waveCount: number, speed: number, color: string, motion: MotionLevel): string {
  return `<!-- WavyBackground — @annondeveloper/ui-kit ${tier} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/wavy-background.css">

<div class="ui-wavy-background" data-motion="${motion}">
  <!-- SVG waves are auto-generated in the React component -->
  <!-- For HTML-only usage, add your SVG paths manually -->
  <svg class="ui-wavy-background--svg" viewBox="0 0 800 400" preserveAspectRatio="none" aria-hidden="true">
    <path class="ui-wavy-background--wave"
      d="M 0,200 Q 200,150 400,200 T 800,200 L 800,400 L 0,400 Z"
      fill="${color || 'oklch(75% 0.15 270)'}"
      fill-opacity="0.12"
      style="--wave-speed: ${speed}s"
    />
  </svg>
  <div class="ui-wavy-background--content">
    <h2>Your content here</h2>
  </div>
</div>

<style>
  .ui-wavy-background {
    position: relative;
    overflow: hidden;
    isolation: isolate;
    min-height: 300px;
    background: oklch(15% 0.02 270);
  }
</style>`
}

function generateVueCode(tier: Tier, waveCount: number, speed: number, color: string, motion: MotionLevel): string {
  if (tier === 'lite') {
    return `<template>
  <div class="ui-wavy-background" data-motion="${motion}">
    <div class="ui-wavy-background--content">
      <h2>Your content here</h2>
    </div>
  </div>
</template>

<style>
@import '@annondeveloper/ui-kit/css/components/wavy-background.css';
</style>`
  }

  const props: string[] = []
  if (waveCount !== 5) props.push(`    :wave-count="${waveCount}"`)
  if (speed !== 10) props.push(`    :speed="${speed}"`)
  if (color) props.push(`    color="${color}"`)
  if (motion !== 3) props.push(`    :motion="${motion}"`)
  const propsStr = props.length > 0 ? `\n${props.join('\n')}\n  ` : ''

  return `<template>
  <WavyBackground${propsStr}>
    <div style="padding: 4rem 2rem; text-align: center">
      <h2>Your content here</h2>
      <p>Content floats above animated waves.</p>
    </div>
  </WavyBackground>
</template>

<script setup>
import { WavyBackground } from '@annondeveloper/ui-kit'
</script>`
}

function generateAngularCode(tier: Tier, waveCount: number, speed: number, color: string, motion: MotionLevel): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (CSS-only) -->
<div class="ui-wavy-background" data-motion="${motion}">
  <div class="ui-wavy-background--content">
    <h2>Your content here</h2>
  </div>
</div>

/* In styles.css */
@import '@annondeveloper/ui-kit/css/components/wavy-background.css';`
  }

  return `<!-- Angular — ${tier === 'premium' ? 'Premium' : 'Standard'} tier -->
<div
  class="ui-wavy-background"
  data-motion="${motion}"
>
  <svg class="ui-wavy-background--svg" viewBox="0 0 800 400" preserveAspectRatio="none" aria-hidden="true">
    <!-- Wave paths generated dynamically -->
  </svg>
  <div class="ui-wavy-background--content">
    <h2>Your content here</h2>
    <p>Content floats above animated waves.</p>
  </div>
</div>

/* Import component CSS */
@import '@annondeveloper/ui-kit/css/components/wavy-background.css';`
}

function generateSvelteCode(tier: Tier, waveCount: number, speed: number, color: string, motion: MotionLevel): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->
<div class="ui-wavy-background" data-motion="${motion}">
  <div class="ui-wavy-background--content">
    <h2>Your content here</h2>
  </div>
</div>

<style>
  @import '@annondeveloper/ui-kit/css/components/wavy-background.css';
</style>`
  }

  const props: string[] = []
  if (waveCount !== 5) props.push(`  waveCount={${waveCount}}`)
  if (speed !== 10) props.push(`  speed={${speed}}`)
  if (color) props.push(`  color="${color}"`)
  if (motion !== 3) props.push(`  motion={${motion}}`)
  const propsStr = props.length > 0 ? `\n${props.join('\n')}\n` : ''

  return `<script>
  import { WavyBackground } from '@annondeveloper/ui-kit';
</script>

<WavyBackground${propsStr}>
  <div style="padding: 4rem 2rem; text-align: center">
    <h2>Your content here</h2>
    <p>Content floats above animated waves.</p>
  </div>
</WavyBackground>`
}

// ─── Playground Section ───────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [waveCount, setWaveCount] = useState<WaveCount>(5)
  const [speed, setSpeed] = useState(10)
  const [motion, setMotion] = useState<MotionLevel>(3)
  const [color, setColor] = useState('')
  const [copyStatus, setCopyStatus] = useState('')

  const reactCode = useMemo(() => generateReactCode(tier, waveCount, speed, color, motion), [tier, waveCount, speed, color, motion])
  const htmlCode = useMemo(() => generateHtmlCode(tier, waveCount, speed, color, motion), [tier, waveCount, speed, color, motion])
  const vueCode = useMemo(() => generateVueCode(tier, waveCount, speed, color, motion), [tier, waveCount, speed, color, motion])
  const angularCode = useMemo(() => generateAngularCode(tier, waveCount, speed, color, motion), [tier, waveCount, speed, color, motion])
  const svelteCode = useMemo(() => generateSvelteCode(tier, waveCount, speed, color, motion), [tier, waveCount, speed, color, motion])

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
    <section className="wavy-page__section" id="playground">
      <h2 className="wavy-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="wavy-page__section-desc">
        Adjust wave count, speed, color, and motion level. The live preview and code output update together across all five framework tabs.
      </p>

      <div className="wavy-page__playground">
        <div className="wavy-page__playground-preview">
          <div className="wavy-page__playground-result">
            <WavyBackground
              waveCount={waveCount}
              speed={speed}
              motion={motion}
              color={color || undefined}
              style={{ position: 'absolute', inset: 0, borderRadius: 'inherit' }}
            >
              <div style={{ padding: '3rem 2rem', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>
                  Wavy Background
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {waveCount} waves at {speed}s speed
                </p>
              </div>
            </WavyBackground>
          </div>

          <div className="wavy-page__code-tabs">
            <div className="wavy-page__export-row">
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
              {copyStatus && <span className="wavy-page__export-status">{copyStatus}</span>}
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

        <div className="wavy-page__playground-controls">
          <OptionGroup
            label="Wave Count"
            options={WAVE_COUNTS.map(String) as any}
            value={String(waveCount)}
            onChange={v => setWaveCount(Number(v) as WaveCount)}
          />
          <OptionGroup
            label="Motion Level"
            options={MOTION_LEVELS.map(String) as any}
            value={String(motion)}
            onChange={v => setMotion(Number(v) as MotionLevel)}
          />

          <div className="wavy-page__control-group">
            <span className="wavy-page__control-label">Speed</span>
            <div className="wavy-page__control-options">
              {SPEED_PRESETS.map(p => (
                <button
                  key={p.id}
                  type="button"
                  className={`wavy-page__option-btn${speed === p.value ? ' wavy-page__option-btn--active' : ''}`}
                  onClick={() => setSpeed(p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="wavy-page__control-group">
            <span className="wavy-page__control-label">Wave Color</span>
            <div className="wavy-page__control-options">
              {COLOR_PRESETS.map(p => (
                <button
                  key={p.name}
                  type="button"
                  className={`wavy-page__option-btn${color === p.value ? ' wavy-page__option-btn--active' : ''}`}
                  onClick={() => setColor(p.value)}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="wavy-page__control-group">
            <span className="wavy-page__control-label">Custom Color</span>
            <input
              type="text"
              value={color}
              onChange={e => setColor(e.target.value)}
              className="wavy-page__text-input"
              placeholder="oklch(65% 0.15 210)"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function WavyBackgroundPage() {
  useStyles('wavy-page', pageStyles)

  const { tier, setTier } = useTier()

  // Scroll reveal JS fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.wavy-page__section')
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
    <div className="wavy-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="wavy-page__hero">
        <h1 className="wavy-page__title">WavyBackground</h1>
        <p className="wavy-page__desc">
          Animated SVG sine waves that create a flowing, organic background effect.
          Each wave is generated with unique amplitude, frequency, and speed from
          a seeded random algorithm. Built with SVG paths for crisp rendering at any resolution.
        </p>
        <div className="wavy-page__import-row">
          <code className="wavy-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Wave Count Gallery ─────────────────────────── */}
      <section className="wavy-page__section" id="wave-counts">
        <h2 className="wavy-page__section-title">
          <a href="#wave-counts">Wave Count Variations</a>
        </h2>
        <p className="wavy-page__section-desc">
          Control the number of overlapping wave layers. Fewer waves give a minimal feel while
          more waves create a rich, layered ocean-like effect.
        </p>
        <div className="wavy-page__labeled-row" style={{ gap: '1rem' }}>
          {([2, 5, 7, 10] as const).map(n => (
            <div key={n} className="wavy-page__labeled-item">
              <div style={{
                width: '180px',
                height: '120px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: 'oklch(15% 0.02 270)',
                position: 'relative',
              }}>
                <WavyBackground waveCount={n} speed={10} motion={3} />
              </div>
              <span className="wavy-page__item-label">waveCount={n}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Color Variations ────────────────────────────── */}
      <section className="wavy-page__section" id="colors">
        <h2 className="wavy-page__section-title">
          <a href="#colors">Color Variations</a>
        </h2>
        <p className="wavy-page__section-desc">
          The color prop accepts any CSS color value. Waves are rendered with varying opacity
          to create depth, so your base color produces a natural gradient effect.
        </p>
        <div className="wavy-page__labeled-row" style={{ gap: '1rem' }}>
          {[
            { color: undefined, label: 'Default' },
            { color: 'oklch(65% 0.15 210)', label: 'Ocean' },
            { color: 'oklch(70% 0.2 150)', label: 'Emerald' },
            { color: 'oklch(65% 0.22 350)', label: 'Rose' },
            { color: 'oklch(70% 0.18 30)', label: 'Sunset' },
          ].map(p => (
            <div key={p.label} className="wavy-page__labeled-item">
              <div style={{
                width: '160px',
                height: '100px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: 'oklch(15% 0.02 270)',
                position: 'relative',
              }}>
                <WavyBackground waveCount={5} color={p.color} speed={10} motion={3} />
              </div>
              <span className="wavy-page__item-label">{p.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Speed Comparison ────────────────────────────── */}
      <section className="wavy-page__section" id="speed">
        <h2 className="wavy-page__section-title">
          <a href="#speed">Speed Variations</a>
        </h2>
        <p className="wavy-page__section-desc">
          Control the wave animation speed. Slower waves feel more ambient and meditative while
          faster waves create an energetic, dynamic atmosphere.
        </p>
        <div className="wavy-page__labeled-row" style={{ gap: '1rem' }}>
          {[
            { speed: 20, label: 'Slow (20s)' },
            { speed: 10, label: 'Medium (10s)' },
            { speed: 5, label: 'Fast (5s)' },
          ].map(p => (
            <div key={p.label} className="wavy-page__labeled-item">
              <div style={{
                width: '200px',
                height: '120px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: 'oklch(15% 0.02 270)',
                position: 'relative',
              }}>
                <WavyBackground waveCount={5} speed={p.speed} motion={3} />
              </div>
              <span className="wavy-page__item-label">{p.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. Motion Levels ────────────────────────────── */}
      <section className="wavy-page__section" id="motion">
        <h2 className="wavy-page__section-title">
          <a href="#motion">Motion Levels</a>
        </h2>
        <p className="wavy-page__section-desc">
          Control animation intensity. Level 0 renders static waves with no animation.
          Respects <code className="wavy-page__a11y-key">prefers-reduced-motion</code> automatically.
        </p>
        <div className="wavy-page__labeled-row" style={{ gap: '1rem' }}>
          {MOTION_LEVELS.map(m => (
            <div key={m} className="wavy-page__labeled-item">
              <div style={{
                width: '160px',
                height: '100px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: 'oklch(15% 0.02 270)',
                position: 'relative',
              }}>
                <WavyBackground waveCount={5} speed={10} motion={m}>
                  <div style={{ display: 'grid', placeItems: 'center', height: '100%', position: 'relative', zIndex: 1 }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                      {m === 0 ? 'static' : m === 1 ? 'subtle' : m === 2 ? 'expressive' : 'cinematic'}
                    </span>
                  </div>
                </WavyBackground>
              </div>
              <span className="wavy-page__item-label">motion={m}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 7. Content Overlay ─────────────────────────── */}
      <section className="wavy-page__section" id="content-overlay">
        <h2 className="wavy-page__section-title">
          <a href="#content-overlay">Content Overlay</a>
        </h2>
        <p className="wavy-page__section-desc">
          WavyBackground wraps your content in a z-indexed layer above the SVG waves.
          Ideal for hero sections, pricing pages, and feature showcases.
        </p>
        <div className="wavy-page__preview wavy-page__preview--tall" style={{ padding: 0 }}>
          <WavyBackground waveCount={6} speed={12} color="oklch(65% 0.15 210)" style={{ width: '100%', minHeight: '320px', background: 'oklch(12% 0.03 240)', borderRadius: 'var(--radius-md)' }}>
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
                Ride the wave
              </h3>
              <p style={{ color: 'oklch(70% 0 0)', maxWidth: '40ch', margin: 0, lineHeight: 1.6 }}>
                Flowing SVG waves with zero dependencies. Each wave is uniquely generated with seeded randomness for consistent renders.
              </p>
              <Button variant="primary" size="lg">Dive In</Button>
            </div>
          </WavyBackground>
        </div>
      </section>

      {/* ── 8. Weight Tiers ────────────────────────────── */}
      <section className="wavy-page__section" id="tiers">
        <h2 className="wavy-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="wavy-page__section-desc">
          Choose the right balance of features and bundle size for your project.
          WavyBackground is a domain component with CSS-only and full React options.
        </p>

        <div className="wavy-page__tiers">
          {/* Lite */}
          <div
            className={`wavy-page__tier-card${tier === 'lite' ? ' wavy-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="wavy-page__tier-header">
              <span className="wavy-page__tier-name">Lite</span>
              <span className="wavy-page__tier-size">~0.6 KB</span>
            </div>
            <p className="wavy-page__tier-desc">
              CSS-only wave animation. Import the stylesheet and provide your own SVG paths.
              No JavaScript runtime — waves animate via CSS translateX.
              Requires manual SVG path creation for each wave layer.
            </p>
            <div className="wavy-page__tier-import">
              @import '@annondeveloper/ui-kit/css/components/wavy-background.css'
            </div>
            <div className="wavy-page__tier-preview">
              <div style={{
                width: '100%',
                height: '80px',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                background: 'oklch(15% 0.02 270)',
                position: 'relative',
              }}>
                <WavyBackground waveCount={3} speed={10} motion={2} />
              </div>
            </div>
            <div className="wavy-page__size-breakdown">
              <div className="wavy-page__size-row">
                <span>CSS: <strong style={{ color: 'var(--text-primary)' }}>0.6 KB</strong></span>
                <span>JS: <strong style={{ color: 'var(--text-primary)' }}>0 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>0.6 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`wavy-page__tier-card${tier === 'standard' ? ' wavy-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="wavy-page__tier-header">
              <span className="wavy-page__tier-name">Standard</span>
              <span className="wavy-page__tier-size">~2.2 KB</span>
            </div>
            <p className="wavy-page__tier-desc">
              Full React component with dynamic SVG path generation, seeded random wave parameters,
              configurable speed and color, motion level cascade,
              and automatic content overlay.
            </p>
            <div className="wavy-page__tier-import">
              import {'{'} WavyBackground {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="wavy-page__tier-preview">
              <div style={{
                width: '100%',
                height: '80px',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                background: 'oklch(15% 0.02 270)',
                position: 'relative',
              }}>
                <WavyBackground waveCount={5} speed={10} motion={3} />
              </div>
            </div>
            <div className="wavy-page__size-breakdown">
              <div className="wavy-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`wavy-page__tier-card${tier === 'premium' ? ' wavy-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="wavy-page__tier-header">
              <span className="wavy-page__tier-name">Premium</span>
              <span className="wavy-page__tier-size">~3.5 KB</span>
            </div>
            <p className="wavy-page__tier-desc">
              Everything in Standard plus interactive wave response to cursor movement,
              scroll-driven wave amplitude changes, per-wave color gradients,
              depth-of-field blur on distant waves, and entrance stagger animation.
            </p>
            <div className="wavy-page__tier-import">
              import {'{'} WavyBackground {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="wavy-page__tier-preview">
              <div style={{
                width: '100%',
                height: '80px',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                background: 'oklch(15% 0.02 270)',
                position: 'relative',
              }}>
                <WavyBackground waveCount={7} speed={8} motion={3} color="oklch(65% 0.15 210)" />
              </div>
            </div>
            <div className="wavy-page__size-breakdown">
              <div className="wavy-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>3.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.4 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Props API ───────────────────────────────── */}
      <section className="wavy-page__section" id="props">
        <h2 className="wavy-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="wavy-page__section-desc">
          All props accepted by WavyBackground. It also spreads any native div HTML attributes
          onto the underlying {'<div>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={wavyProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className="wavy-page__section" id="accessibility">
        <h2 className="wavy-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="wavy-page__section-desc">
          Decorative background component with comprehensive accessibility support.
        </p>
        <Card variant="default" padding="md">
          <ul className="wavy-page__a11y-list">
            <li className="wavy-page__a11y-item">
              <span className="wavy-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Decorative:</strong> SVG element is marked with <code className="wavy-page__a11y-key">aria-hidden="true"</code> so screen readers skip the wave graphics.
              </span>
            </li>
            <li className="wavy-page__a11y-item">
              <span className="wavy-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> Waves become static when <code className="wavy-page__a11y-key">prefers-reduced-motion: reduce</code> is active. Motion level 0 also stops animation.
              </span>
            </li>
            <li className="wavy-page__a11y-item">
              <span className="wavy-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Content layer:</strong> Children are rendered in a z-indexed content layer above waves, keeping interactive elements fully accessible.
              </span>
            </li>
            <li className="wavy-page__a11y-item">
              <span className="wavy-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Pointer events:</strong> SVG waves have <code className="wavy-page__a11y-key">pointer-events: none</code> to never block clicks or taps.
              </span>
            </li>
            <li className="wavy-page__a11y-item">
              <span className="wavy-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> SVG is hidden in <code className="wavy-page__a11y-key">forced-colors: active</code> mode so content remains readable.
              </span>
            </li>
            <li className="wavy-page__a11y-item">
              <span className="wavy-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print safe:</strong> SVG waves are hidden in print media via <code className="wavy-page__a11y-key">@media print</code> rules.
              </span>
            </li>
            <li className="wavy-page__a11y-item">
              <span className="wavy-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Resolution independent:</strong> SVG rendering means waves look crisp at any screen density without accessibility-impacting image scaling.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
