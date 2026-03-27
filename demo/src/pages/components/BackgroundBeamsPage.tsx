'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { BackgroundBeams } from '@ui/domain/background-beams'
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
    @scope (.bgbeams-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: bgbeams-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .bgbeams-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .bgbeams-page__hero::before {
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
        animation: bgbeams-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes bgbeams-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .bgbeams-page__hero::before { animation: none; }
      }

      .bgbeams-page__title {
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

      .bgbeams-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .bgbeams-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .bgbeams-page__import-code {
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

      .bgbeams-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .bgbeams-page__section {
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
        animation: bgbeams-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes bgbeams-section-reveal {
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
        .bgbeams-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .bgbeams-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .bgbeams-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .bgbeams-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .bgbeams-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .bgbeams-page__preview {
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

      .bgbeams-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .bgbeams-page__preview--tall {
        min-block-size: 300px;
      }

      /* ── Playground ─────────────────────────────────── */

      .bgbeams-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .bgbeams-page__playground {
          grid-template-columns: 1fr;
        }
        .bgbeams-page__playground-controls {
          position: static !important;
        }
      }

      @container bgbeams-page (max-width: 680px) {
        .bgbeams-page__playground {
          grid-template-columns: 1fr;
        }
        .bgbeams-page__playground-controls {
          position: static !important;
        }
      }

      .bgbeams-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .bgbeams-page__playground-result {
        overflow-x: auto;
        min-block-size: 280px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .bgbeams-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .bgbeams-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .bgbeams-page__playground-controls {
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

      .bgbeams-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .bgbeams-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .bgbeams-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .bgbeams-page__option-btn {
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
      .bgbeams-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .bgbeams-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .bgbeams-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .bgbeams-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .bgbeams-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .bgbeams-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .bgbeams-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .bgbeams-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .bgbeams-page__tier-card {
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

      .bgbeams-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .bgbeams-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .bgbeams-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .bgbeams-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .bgbeams-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .bgbeams-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .bgbeams-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .bgbeams-page__tier-import {
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

      .bgbeams-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
        min-block-size: 80px;
        align-items: center;
        overflow: hidden;
        border-radius: var(--radius-sm);
      }

      /* ── Code tabs ─────────────────────────────────── */

      .bgbeams-page__code-tabs {
        margin-block-start: 1rem;
      }

      /* ── Export button row ─────────────────────────── */

      .bgbeams-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .bgbeams-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .bgbeams-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .bgbeams-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .bgbeams-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .bgbeams-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Size breakdown bar ─────────────────────────── */

      .bgbeams-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .bgbeams-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .bgbeams-page__hero {
          padding: 2rem 1.25rem;
        }

        .bgbeams-page__title {
          font-size: 1.75rem;
        }

        .bgbeams-page__preview {
          padding: 1.75rem;
        }

        .bgbeams-page__playground {
          grid-template-columns: 1fr;
        }

        .bgbeams-page__playground-result {
          padding: 2rem;
          min-block-size: 200px;
        }

        .bgbeams-page__labeled-row {
          gap: 1rem;
        }

        .bgbeams-page__tiers {
          grid-template-columns: 1fr;
        }

        .bgbeams-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 400px) {
        .bgbeams-page__hero {
          padding: 1.5rem 1rem;
        }

        .bgbeams-page__title {
          font-size: 1.5rem;
        }

        .bgbeams-page__preview {
          padding: 1rem;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }

        .bgbeams-page__title {
          font-size: 4rem;
        }

        .bgbeams-page__preview {
          padding: 3.5rem;
        }
      }

      /* ── Scrollbar + code blocks ──────────────────── */

      .bgbeams-page__import-code,
      .bgbeams-page code,
      pre {
        overflow-x: auto;
        scrollbar-width: thin;
        scrollbar-color: var(--border-default) transparent;
        max-inline-size: 100%;
      }

      :scope ::-webkit-scrollbar {
        width: 4px;
        height: 4px;
      }
      :scope ::-webkit-scrollbar-track {
        background: transparent;
      }
      :scope ::-webkit-scrollbar-thumb {
        background: var(--border-default);
        border-radius: 2px;
      }
      :scope ::-webkit-scrollbar-thumb:hover {
        background: var(--border-strong);
      }
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const bgBeamsProps: PropDef[] = [
  { name: 'count', type: 'number', default: '6', description: 'Number of animated beams to render across the container.' },
  { name: 'color', type: 'string', description: 'Custom beam color using OKLCH or any CSS color. Overrides the default violet beam gradient.' },
  { name: 'children', type: 'ReactNode', description: 'Content rendered above the beams in a z-indexed content layer.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. At 0 beams are hidden. Cascades from OS > prop > CSS --motion > UIProvider.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'style', type: 'CSSProperties', description: 'Inline style object applied to the root container element.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type MotionLevel = 0 | 1 | 2 | 3
type BeamCount = 3 | 6 | 10 | 15 | 20

const BEAM_COUNTS: BeamCount[] = [3, 6, 10, 15, 20]
const MOTION_LEVELS: MotionLevel[] = [0, 1, 2, 3]
const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const COLOR_PRESETS = [
  { value: '', name: 'Default (Violet)' },
  { value: 'oklch(70% 0.2 150)', name: 'Emerald' },
  { value: 'oklch(70% 0.18 30)', name: 'Amber' },
  { value: 'oklch(65% 0.22 350)', name: 'Rose' },
  { value: 'oklch(65% 0.2 210)', name: 'Cyan' },
  { value: 'oklch(70% 0.15 60)', name: 'Gold' },
  { value: 'oklch(60% 0.25 300)', name: 'Purple' },
  { value: 'oklch(75% 0.12 180)', name: 'Teal' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "/* CSS-only: @import '@annondeveloper/ui-kit/css/components/background-beams.css' */",
  standard: "import { BackgroundBeams } from '@annondeveloper/ui-kit'",
  premium: "import { BackgroundBeams } from '@annondeveloper/ui-kit/premium'",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="bgbeams-page__copy-btn"
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
    <div className="bgbeams-page__control-group">
      <span className="bgbeams-page__control-label">{label}</span>
      <div className="bgbeams-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`bgbeams-page__option-btn${opt === value ? ' bgbeams-page__option-btn--active' : ''}`}
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

function generateReactCode(
  tier: Tier,
  count: number,
  color: string,
  motion: MotionLevel,
): string {
  if (tier === 'lite') {
    return `/* Lite tier — CSS-only background beams */
@import '@annondeveloper/ui-kit/css/components/background-beams.css';

<div class="ui-background-beams" data-motion="${motion}">
  <div class="ui-background-beams--content">
    <h2>Your content here</h2>
    <p>Content is rendered above the beams.</p>
  </div>
</div>`
  }

  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  if (count !== 6) props.push(`  count={${count}}`)
  if (color) props.push(`  color="${color}"`)
  if (motion !== 3) props.push(`  motion={${motion}}`)

  const childContent = `  <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
    <h2>Your content here</h2>
    <p>Content is rendered above the beams.</p>
  </div>`

  const jsx = props.length === 0
    ? `<BackgroundBeams>\n${childContent}\n</BackgroundBeams>`
    : `<BackgroundBeams\n${props.join('\n')}\n>\n${childContent}\n</BackgroundBeams>`

  return `${importStr}\n\n${jsx}`
}

function generateHtmlCode(
  tier: Tier,
  count: number,
  color: string,
  motion: MotionLevel,
): string {
  const colorAttr = color ? ` style="--beam-color: ${color}"` : ''
  return `<!-- BackgroundBeams — @annondeveloper/ui-kit ${tier} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/background-beams.css">

<div class="ui-background-beams" data-motion="${motion}"${colorAttr}>
  <!-- Beams are rendered via CSS animations -->
  <!-- For JS-driven beams, use the React component -->
  <div class="ui-background-beams--content">
    <h2>Your content here</h2>
    <p>Content is rendered above the beams.</p>
  </div>
</div>

<style>
  .ui-background-beams {
    position: relative;
    overflow: hidden;
    isolation: isolate;
    min-height: 300px;
    background: oklch(15% 0.02 270);
  }
</style>`
}

function generateVueCode(
  tier: Tier,
  count: number,
  color: string,
  motion: MotionLevel,
): string {
  if (tier === 'lite') {
    return `<template>
  <div class="ui-background-beams" data-motion="${motion}">
    <div class="ui-background-beams--content">
      <h2>Your content here</h2>
      <p>Content is rendered above the beams.</p>
    </div>
  </div>
</template>

<style>
@import '@annondeveloper/ui-kit/css/components/background-beams.css';
</style>`
  }

  const props: string[] = []
  if (count !== 6) props.push(`    :count="${count}"`)
  if (color) props.push(`    color="${color}"`)
  if (motion !== 3) props.push(`    :motion="${motion}"`)

  const propsStr = props.length > 0 ? `\n${props.join('\n')}\n  ` : ''

  return `<template>
  <BackgroundBeams${propsStr}>
    <div style="padding: 4rem 2rem; text-align: center">
      <h2>Your content here</h2>
      <p>Content is rendered above the beams.</p>
    </div>
  </BackgroundBeams>
</template>

<script setup>
import { BackgroundBeams } from '@annondeveloper/ui-kit'
</script>`
}

function generateAngularCode(
  tier: Tier,
  count: number,
  color: string,
  motion: MotionLevel,
): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (CSS-only) -->
<div class="ui-background-beams" data-motion="${motion}">
  <div class="ui-background-beams--content">
    <h2>Your content here</h2>
    <p>Content is rendered above the beams.</p>
  </div>
</div>

/* In styles.css */
@import '@annondeveloper/ui-kit/css/components/background-beams.css';`
  }

  const colorAttr = color ? ` style="--beam-color: ${color}"` : ''
  return `<!-- Angular — ${tier === 'premium' ? 'Premium' : 'Standard'} tier -->
<!-- Use CSS-only approach with Angular -->
<div
  class="ui-background-beams"
  data-motion="${motion}"${colorAttr}
>
  <div class="ui-background-beams--content">
    <h2>Your content here</h2>
    <p>Content is rendered above the beams.</p>
  </div>
</div>

/* Import component CSS */
@import '@annondeveloper/ui-kit/css/components/background-beams.css';`
}

function generateSvelteCode(
  tier: Tier,
  count: number,
  color: string,
  motion: MotionLevel,
): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->
<div class="ui-background-beams" data-motion="${motion}">
  <div class="ui-background-beams--content">
    <h2>Your content here</h2>
    <p>Content is rendered above the beams.</p>
  </div>
</div>

<style>
  @import '@annondeveloper/ui-kit/css/components/background-beams.css';
</style>`
  }

  const props: string[] = []
  if (count !== 6) props.push(`  count={${count}}`)
  if (color) props.push(`  color="${color}"`)
  if (motion !== 3) props.push(`  motion={${motion}}`)

  const propsStr = props.length > 0 ? `\n${props.join('\n')}\n` : ''

  return `<script>
  import { BackgroundBeams } from '@annondeveloper/ui-kit';
</script>

<BackgroundBeams${propsStr}>
  <div style="padding: 4rem 2rem; text-align: center">
    <h2>Your content here</h2>
    <p>Content is rendered above the beams.</p>
  </div>
</BackgroundBeams>`
}

// ─── Playground Section ───────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [count, setCount] = useState<BeamCount>(6)
  const [motion, setMotion] = useState<MotionLevel>(3)
  const [color, setColor] = useState('')
  const [copyStatus, setCopyStatus] = useState('')

  const reactCode = useMemo(
    () => generateReactCode(tier, count, color, motion),
    [tier, count, color, motion],
  )
  const htmlCode = useMemo(
    () => generateHtmlCode(tier, count, color, motion),
    [tier, count, color, motion],
  )
  const vueCode = useMemo(
    () => generateVueCode(tier, count, color, motion),
    [tier, count, color, motion],
  )
  const angularCode = useMemo(
    () => generateAngularCode(tier, count, color, motion),
    [tier, count, color, motion],
  )
  const svelteCode = useMemo(
    () => generateSvelteCode(tier, count, color, motion),
    [tier, count, color, motion],
  )

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
    <section className="bgbeams-page__section" id="playground">
      <h2 className="bgbeams-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="bgbeams-page__section-desc">
        Adjust beam count, color, and motion intensity. The generated code updates in real-time across all five framework tabs.
      </p>

      <div className="bgbeams-page__playground">
        <div className="bgbeams-page__playground-preview">
          <div className="bgbeams-page__playground-result">
            <BackgroundBeams
              count={count}
              motion={motion}
              color={color || undefined}
              style={{ position: 'absolute', inset: 0, borderRadius: 'inherit' }}
            >
              <div style={{ padding: '3rem 2rem', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>
                  Background Beams
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {count} beams with motion level {motion}
                </p>
              </div>
            </BackgroundBeams>
          </div>

          <div className="bgbeams-page__code-tabs">
            <div className="bgbeams-page__export-row">
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
              {copyStatus && <span className="bgbeams-page__export-status">{copyStatus}</span>}
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

        <div className="bgbeams-page__playground-controls">
          <OptionGroup
            label="Beam Count"
            options={BEAM_COUNTS.map(String) as any}
            value={String(count)}
            onChange={v => setCount(Number(v) as BeamCount)}
          />
          <OptionGroup
            label="Motion Level"
            options={MOTION_LEVELS.map(String) as any}
            value={String(motion)}
            onChange={v => setMotion(Number(v) as MotionLevel)}
          />

          <div className="bgbeams-page__control-group">
            <span className="bgbeams-page__control-label">Beam Color</span>
            <div className="bgbeams-page__control-options">
              {COLOR_PRESETS.map(p => (
                <button
                  key={p.name}
                  type="button"
                  className={`bgbeams-page__option-btn${color === p.value ? ' bgbeams-page__option-btn--active' : ''}`}
                  onClick={() => setColor(p.value)}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bgbeams-page__control-group">
            <span className="bgbeams-page__control-label">Custom Color</span>
            <input
              type="text"
              value={color}
              onChange={e => setColor(e.target.value)}
              className="bgbeams-page__text-input"
              placeholder="oklch(70% 0.2 270 / 0.3)"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BackgroundBeamsPage() {
  useStyles('bgbeams-page', pageStyles)

  const { tier, setTier } = useTier()

  // Scroll reveal for sections — JS fallback for browsers without animation-timeline
  useEffect(() => {
    const sections = document.querySelectorAll('.bgbeams-page__section')
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
    <div className="bgbeams-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="bgbeams-page__hero">
        <h1 className="bgbeams-page__title">BackgroundBeams</h1>
        <p className="bgbeams-page__desc">
          Animated sweeping light beams that create a dramatic atmospheric backdrop.
          Each beam travels with unique angle, speed, and delay for organic, cinematic motion.
          Fully CSS-driven animation with configurable count and color.
        </p>
        <div className="bgbeams-page__import-row">
          <code className="bgbeams-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Beam Count Gallery ─────────────────────────── */}
      <section className="bgbeams-page__section" id="beam-counts">
        <h2 className="bgbeams-page__section-title">
          <a href="#beam-counts">Beam Count Variations</a>
        </h2>
        <p className="bgbeams-page__section-desc">
          Adjust the density from subtle 3-beam to dramatic 20-beam configurations.
          Each beam is deterministically positioned with a seeded random algorithm for consistent renders.
        </p>
        <div className="bgbeams-page__labeled-row" style={{ gap: '1rem' }}>
          {([3, 6, 12, 20] as const).map(n => (
            <div key={n} className="bgbeams-page__labeled-item">
              <div style={{
                width: '180px',
                height: '120px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: 'var(--bg-base)',
                position: 'relative',
              }}>
                <BackgroundBeams count={n} motion={2}>
                  <div style={{ display: 'grid', placeItems: 'center', height: '100%', position: 'relative', zIndex: 1 }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem' }}>{n} beams</span>
                  </div>
                </BackgroundBeams>
              </div>
              <span className="bgbeams-page__item-label">count={n}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Color Variations ────────────────────────────── */}
      <section className="bgbeams-page__section" id="colors">
        <h2 className="bgbeams-page__section-title">
          <a href="#colors">Color Variations</a>
        </h2>
        <p className="bgbeams-page__section-desc">
          Pass any CSS color value to customize the beam color. Works with OKLCH, hex, rgb, hsl, and CSS custom properties.
        </p>
        <div className="bgbeams-page__labeled-row" style={{ gap: '1rem' }}>
          {[
            { color: undefined, label: 'Default' },
            { color: 'oklch(70% 0.2 150)', label: 'Emerald' },
            { color: 'oklch(70% 0.18 30)', label: 'Amber' },
            { color: 'oklch(65% 0.22 350)', label: 'Rose' },
            { color: 'oklch(65% 0.2 210)', label: 'Cyan' },
          ].map(p => (
            <div key={p.label} className="bgbeams-page__labeled-item">
              <div style={{
                width: '160px',
                height: '100px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: 'var(--bg-base)',
                position: 'relative',
              }}>
                <BackgroundBeams count={4} color={p.color} motion={2} />
              </div>
              <span className="bgbeams-page__item-label">{p.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Motion Levels ────────────────────────────── */}
      <section className="bgbeams-page__section" id="motion">
        <h2 className="bgbeams-page__section-title">
          <a href="#motion">Motion Levels</a>
        </h2>
        <p className="bgbeams-page__section-desc">
          Control animation intensity via the motion prop. Level 0 hides beams entirely,
          respecting <code className="bgbeams-page__a11y-key">prefers-reduced-motion</code>.
          The motion cascade: OS preference &gt; prop &gt; CSS --motion &gt; UIProvider &gt; default (3).
        </p>
        <div className="bgbeams-page__labeled-row" style={{ gap: '1rem' }}>
          {MOTION_LEVELS.map(m => (
            <div key={m} className="bgbeams-page__labeled-item">
              <div style={{
                width: '160px',
                height: '100px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: 'var(--bg-base)',
                position: 'relative',
              }}>
                <BackgroundBeams count={6} motion={m}>
                  <div style={{ display: 'grid', placeItems: 'center', height: '100%', position: 'relative', zIndex: 1 }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                      {m === 0 ? 'hidden' : m === 1 ? 'subtle' : m === 2 ? 'expressive' : 'cinematic'}
                    </span>
                  </div>
                </BackgroundBeams>
              </div>
              <span className="bgbeams-page__item-label">motion={m}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. With Content Overlay ─────────────────────── */}
      <section className="bgbeams-page__section" id="content-overlay">
        <h2 className="bgbeams-page__section-title">
          <a href="#content-overlay">Content Overlay</a>
        </h2>
        <p className="bgbeams-page__section-desc">
          BackgroundBeams wraps your content in a z-indexed layer, so text and interactive elements
          remain accessible while beams animate behind them. Perfect for hero sections and landing pages.
        </p>
        <div className="bgbeams-page__preview bgbeams-page__preview--tall" style={{ padding: 0 }}>
          <BackgroundBeams count={8} style={{ width: '100%', minHeight: '300px', background: 'var(--bg-base)', borderRadius: 'var(--radius-md)' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              padding: '3rem',
              textAlign: 'center',
              minHeight: '300px',
            }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'oklch(95% 0 0)', margin: 0 }}>
                Ship faster with UI Kit
              </h3>
              <p style={{ color: 'oklch(75% 0 0)', maxWidth: '40ch', margin: 0, lineHeight: 1.6 }}>
                Production-ready components with physics-based animations, OKLCH color system, and zero dependencies.
              </p>
              <Button variant="primary" size="lg">Get Started</Button>
            </div>
          </BackgroundBeams>
        </div>
      </section>

      {/* ── 7. Composition Examples ─────────────────────── */}
      <section className="bgbeams-page__section" id="composition">
        <h2 className="bgbeams-page__section-title">
          <a href="#composition">Composition Patterns</a>
        </h2>
        <p className="bgbeams-page__section-desc">
          Combine BackgroundBeams with cards, gradients, and overlays for layered atmospheric designs.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div style={{
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            background: 'var(--bg-base)',
            position: 'relative',
          }}>
            <BackgroundBeams count={4} color="oklch(60% 0.25 300 / 0.4)" style={{ minHeight: '200px' }}>
              <div style={{ padding: '2rem', textAlign: 'center', display: 'grid', placeItems: 'center', minHeight: '200px' }}>
                <div>
                  <p style={{ color: 'oklch(90% 0 0)', fontWeight: 700, fontSize: '1.125rem', margin: '0 0 0.25rem' }}>Purple Atmosphere</p>
                  <p style={{ color: 'oklch(65% 0 0)', fontSize: '0.8125rem', margin: 0 }}>Deep purple beams for creative branding</p>
                </div>
              </div>
            </BackgroundBeams>
          </div>
          <div style={{
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            background: 'var(--bg-base)',
            position: 'relative',
          }}>
            <BackgroundBeams count={5} color="oklch(70% 0.15 180 / 0.3)" style={{ minHeight: '200px' }}>
              <div style={{ padding: '2rem', textAlign: 'center', display: 'grid', placeItems: 'center', minHeight: '200px' }}>
                <div>
                  <p style={{ color: 'oklch(90% 0 0)', fontWeight: 700, fontSize: '1.125rem', margin: '0 0 0.25rem' }}>Teal Glow</p>
                  <p style={{ color: 'oklch(65% 0 0)', fontSize: '0.8125rem', margin: 0 }}>Cool tonal beams for data dashboards</p>
                </div>
              </div>
            </BackgroundBeams>
          </div>
        </div>
      </section>

      {/* ── 8. Weight Tiers ────────────────────────────── */}
      <section className="bgbeams-page__section" id="tiers">
        <h2 className="bgbeams-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="bgbeams-page__section-desc">
          Choose the right balance of features and bundle size for your project.
          BackgroundBeams is a domain component with CSS-only and React integration options.
        </p>

        <div className="bgbeams-page__tiers">
          {/* Lite */}
          <div
            className={`bgbeams-page__tier-card${tier === 'lite' ? ' bgbeams-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="bgbeams-page__tier-header">
              <span className="bgbeams-page__tier-name">Lite</span>
              <span className="bgbeams-page__tier-size">~0.5 KB</span>
            </div>
            <p className="bgbeams-page__tier-desc">
              CSS-only beam animation. Import the stylesheet and use standard HTML.
              No JavaScript runtime — beams defined purely in CSS keyframes.
              Limited to static count and color via custom properties.
            </p>
            <div className="bgbeams-page__tier-import">
              @import '@annondeveloper/ui-kit/css/components/background-beams.css'
            </div>
            <div className="bgbeams-page__tier-preview">
              <div style={{
                width: '100%',
                height: '80px',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                background: 'var(--bg-base)',
                position: 'relative',
              }}>
                <BackgroundBeams count={3} motion={2} />
              </div>
            </div>
            <div className="bgbeams-page__size-breakdown">
              <div className="bgbeams-page__size-row">
                <span>CSS: <strong style={{ color: 'var(--text-primary)' }}>0.5 KB</strong></span>
                <span>JS: <strong style={{ color: 'var(--text-primary)' }}>0 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>0.5 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`bgbeams-page__tier-card${tier === 'standard' ? ' bgbeams-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="bgbeams-page__tier-header">
              <span className="bgbeams-page__tier-name">Standard</span>
              <span className="bgbeams-page__tier-size">~1.8 KB</span>
            </div>
            <p className="bgbeams-page__tier-desc">
              Full React component with dynamic beam count, seeded random positioning,
              motion level cascade, color customization, and content overlay support.
              Style engine auto-injects CSS via adoptedStyleSheets.
            </p>
            <div className="bgbeams-page__tier-import">
              import {'{'} BackgroundBeams {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="bgbeams-page__tier-preview">
              <div style={{
                width: '100%',
                height: '80px',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                background: 'var(--bg-base)',
                position: 'relative',
              }}>
                <BackgroundBeams count={6} motion={3} />
              </div>
            </div>
            <div className="bgbeams-page__size-breakdown">
              <div className="bgbeams-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.8 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.7 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`bgbeams-page__tier-card${tier === 'premium' ? ' bgbeams-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="bgbeams-page__tier-header">
              <span className="bgbeams-page__tier-name">Premium</span>
              <span className="bgbeams-page__tier-size">~3.2 KB</span>
            </div>
            <p className="bgbeams-page__tier-desc">
              Everything in Standard plus scroll-triggered intensity changes,
              viewport-aware beam density, mouse-follow beam attraction,
              and parallax depth layers. Entrance animation with stagger.
            </p>
            <div className="bgbeams-page__tier-import">
              import {'{'} BackgroundBeams {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="bgbeams-page__tier-preview">
              <div style={{
                width: '100%',
                height: '80px',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                background: 'var(--bg-base)',
                position: 'relative',
              }}>
                <BackgroundBeams count={10} motion={3} color="oklch(70% 0.2 280 / 0.4)" />
              </div>
            </div>
            <div className="bgbeams-page__size-breakdown">
              <div className="bgbeams-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>3.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Props API ───────────────────────────────── */}
      <section className="bgbeams-page__section" id="props">
        <h2 className="bgbeams-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="bgbeams-page__section-desc">
          All props accepted by BackgroundBeams. It also spreads any native div HTML attributes
          onto the underlying {'<div>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={bgBeamsProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className="bgbeams-page__section" id="accessibility">
        <h2 className="bgbeams-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="bgbeams-page__section-desc">
          Decorative background component built with accessibility in mind.
        </p>
        <Card variant="default" padding="md">
          <ul className="bgbeams-page__a11y-list">
            <li className="bgbeams-page__a11y-item">
              <span className="bgbeams-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Decorative:</strong> All beam elements are marked with <code className="bgbeams-page__a11y-key">aria-hidden="true"</code> so screen readers skip them entirely.
              </span>
            </li>
            <li className="bgbeams-page__a11y-item">
              <span className="bgbeams-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> Respects <code className="bgbeams-page__a11y-key">prefers-reduced-motion: reduce</code> by hiding all beams. Motion level 0 also hides beams.
              </span>
            </li>
            <li className="bgbeams-page__a11y-item">
              <span className="bgbeams-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Content layer:</strong> Children are rendered in a z-indexed content layer above beams, ensuring interactive elements remain focusable and clickable.
              </span>
            </li>
            <li className="bgbeams-page__a11y-item">
              <span className="bgbeams-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Pointer events:</strong> Beams have <code className="bgbeams-page__a11y-key">pointer-events: none</code> so they never interfere with user interaction.
              </span>
            </li>
            <li className="bgbeams-page__a11y-item">
              <span className="bgbeams-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Beam elements are hidden in <code className="bgbeams-page__a11y-key">forced-colors: active</code> mode.
              </span>
            </li>
            <li className="bgbeams-page__a11y-item">
              <span className="bgbeams-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print:</strong> Beams are hidden in print media, preserving clean document output.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
