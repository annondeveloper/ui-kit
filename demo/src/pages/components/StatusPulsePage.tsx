'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { StatusPulse } from '@ui/components/status-pulse'
import { StatusPulse as LiteStatusPulse } from '@ui/lite/status-pulse'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { generateTheme } from '@ui/core/tokens/generator'
import { TOKEN_TO_CSS, type ThemeTokens } from '@ui/core/tokens/tokens'
import { useTheme } from '@ui/core/tokens/theme-context'
import { ColorInput } from '@ui/components/color-input'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.status-pulse-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: status-pulse-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .status-pulse-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .status-pulse-page__hero::before {
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
        animation: aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .status-pulse-page__hero::before { animation: none; }
      }

      .status-pulse-page__title {
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

      .status-pulse-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .status-pulse-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .status-pulse-page__import-code {
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

      .status-pulse-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .status-pulse-page__section {
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
        animation: section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes section-reveal {
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
        .status-pulse-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .status-pulse-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .status-pulse-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .status-pulse-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .status-pulse-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .status-pulse-page__preview {
        padding: 2.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 2rem;
        min-block-size: 80px;
      }

      .status-pulse-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ─────────────────────────────────── */

      .status-pulse-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @container status-pulse-page (max-width: 680px) {
        .status-pulse-page__playground {
          grid-template-columns: 1fr;
        }
        .status-pulse-page__playground-controls {
          position: static !important;
        }
      }

      @media (max-width: 768px) {
        .status-pulse-page__playground {
          grid-template-columns: 1fr;
        }
        .status-pulse-page__playground-controls {
          position: static !important;
        }
      }

      .status-pulse-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .status-pulse-page__playground-result {
        overflow-x: auto;
        min-block-size: 200px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .status-pulse-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .status-pulse-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .status-pulse-page__playground-controls {
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

      .status-pulse-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .status-pulse-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .status-pulse-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .status-pulse-page__option-btn {
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
      .status-pulse-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .status-pulse-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .status-pulse-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .status-pulse-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .status-pulse-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 2rem;
        align-items: center;
      }

      .status-pulse-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .status-pulse-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── States grid ────────────────────────────────── */

      .status-pulse-page__states-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 1rem;
      }

      .status-pulse-page__state-cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        padding: 1.5rem 0.75rem;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        background: var(--bg-base);
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .status-pulse-page__state-cell:hover {
        border-color: var(--border-default);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.05);
      }

      .status-pulse-page__state-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .status-pulse-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .status-pulse-page__tier-card {
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

      .status-pulse-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .status-pulse-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .status-pulse-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .status-pulse-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .status-pulse-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .status-pulse-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .status-pulse-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .status-pulse-page__tier-import {
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

      .status-pulse-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
        gap: 1rem;
      }

      .status-pulse-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .status-pulse-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .status-pulse-page__code-tabs {
        margin-block-start: 1rem;
      }

      .status-pulse-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .status-pulse-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .status-pulse-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .status-pulse-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .status-pulse-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .status-pulse-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Inline pulse demo ──────────────────────────── */

      .status-pulse-page__inline-demo {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
      }

      /* ── Color presets ──────────────────────────────── */

      .status-pulse-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .status-pulse-page__color-preset {
        inline-size: 24px;
        block-size: 24px;
        border-radius: 50%;
        border: 2px solid transparent;
        cursor: pointer;
        padding: 0;
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
                    border-color 0.15s,
                    box-shadow 0.15s;
        box-shadow: 0 1px 3px oklch(0% 0 0 / 0.2);
      }
      .status-pulse-page__color-preset:hover {
        transform: scale(1.2);
      }
      .status-pulse-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .status-pulse-page__hero { padding: 2rem 1.25rem; }
        .status-pulse-page__title { font-size: 1.75rem; }
        .status-pulse-page__preview { padding: 1.75rem; }
        .status-pulse-page__playground { grid-template-columns: 1fr; }
        .status-pulse-page__playground-result { padding: 2rem; overflow-x: auto;
        min-block-size: 120px; }
        .status-pulse-page__labeled-row { gap: 1rem; }
        .status-pulse-page__states-grid { grid-template-columns: repeat(2, 1fr); }
        .status-pulse-page__tiers { grid-template-columns: 1fr; }
        .status-pulse-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .status-pulse-page__hero { padding: 1.5rem 1rem; }
        .status-pulse-page__title { font-size: 1.5rem; }
        .status-pulse-page__preview { padding: 1rem; }
        .status-pulse-page__states-grid { grid-template-columns: 1fr; }
        .status-pulse-page__labeled-row { gap: 0.5rem; justify-content: center; }
      }

      @media (min-width: 3000px) {
        :scope { max-inline-size: 1400px; }
        .status-pulse-page__title { font-size: 4rem; }
        .status-pulse-page__preview { padding: 3.5rem; }
        .status-pulse-page__labeled-row { gap: 2.5rem; }
      }

      .status-pulse-page__import-code,
      .status-pulse-page code,
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

const statusPulseProps: PropDef[] = [
  { name: 'status', type: "'ok' | 'warning' | 'critical' | 'info'", required: true, description: 'The operational status. Controls dot color and radiating ring color.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls the overall bounding box and dot size.' },
  { name: 'label', type: 'string', description: 'Accessible label for the status indicator. Used as aria-label.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity. 0 = static, 1 = opacity pulse, 2+ = radiating rings.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'ref', type: 'Ref<HTMLSpanElement>', description: 'Forwarded ref to the underlying <span> element.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Status = 'ok' | 'warning' | 'critical' | 'info'
type Size = 'sm' | 'md' | 'lg'

const STATUSES: Status[] = ['ok', 'warning', 'critical', 'info']
const SIZES: Size[] = ['sm', 'md', 'lg']

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { StatusPulse } from '@annondeveloper/ui-kit/lite'",
  standard: "import { StatusPulse } from '@annondeveloper/ui-kit'",
  premium: "import { StatusPulse } from '@annondeveloper/ui-kit/premium'",
}

const COLOR_PRESETS = [
  { hex: '#6366f1', name: 'Indigo' },
  { hex: '#f97316', name: 'Orange' },
  { hex: '#f43f5e', name: 'Rose' },
  { hex: '#0ea5e9', name: 'Sky' },
  { hex: '#10b981', name: 'Emerald' },
  { hex: '#8b5cf6', name: 'Violet' },
  { hex: '#d946ef', name: 'Fuchsia' },
  { hex: '#f59e0b', name: 'Amber' },
  { hex: '#06b6d4', name: 'Cyan' },
  { hex: '#64748b', name: 'Slate' },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="status-pulse-page__copy-btn"
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
    <div className="status-pulse-page__control-group">
      <span className="status-pulse-page__control-label">{label}</span>
      <div className="status-pulse-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`status-pulse-page__option-btn${opt === value ? ' status-pulse-page__option-btn--active' : ''}`}
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

function generateReactCode(tier: Tier, status: Status, size: Size, label: string, motion: number): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = [`  status="${status}"`]
  if (size !== 'md') props.push(`  size="${size}"`)
  if (label) props.push(`  label="${label}"`)
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  return `${importStr}\n\n<StatusPulse\n${props.join('\n')}\n/>`
}

function generateHtmlCode(tier: Tier, status: Status, size: Size, label: string): string {
  const cls = tier === 'lite' ? 'ui-lite-status-pulse' : 'ui-status-pulse'
  return `<!-- StatusPulse -- @annondeveloper/ui-kit ${tier} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/status-pulse.css">

<span class="${cls}" data-status="${status}" data-size="${size}" role="img"${label ? ` aria-label="${label}"` : ''}>
  <span class="${cls}__dot"></span>
  <span class="${cls}__ring"></span>
  <span class="${cls}__ring"></span>
  <span class="${cls}__ring"></span>
</span>`
}

function generateVueCode(tier: Tier, status: Status, size: Size, label: string): string {
  if (tier === 'lite') {
    return `<template>
  <span class="ui-lite-status-pulse" data-status="${status}" data-size="${size}"${label ? ` aria-label="${label}"` : ''} />
</template>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }
  const props = [`status="${status}"`]
  if (size !== 'md') props.push(`size="${size}"`)
  if (label) props.push(`label="${label}"`)
  return `<template>
  <StatusPulse ${props.join(' ')} />
</template>

<script setup>
import { StatusPulse } from '@annondeveloper/ui-kit'
</script>`
}

function generateAngularCode(tier: Tier, status: Status, size: Size, label: string): string {
  if (tier === 'lite') {
    return `<!-- Angular -- Lite tier (CSS-only) -->
<span class="ui-lite-status-pulse" data-status="${status}" data-size="${size}"${label ? ` aria-label="${label}"` : ''}>
</span>

/* In styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }
  return `<!-- Angular -- Standard tier -->
<span
  class="ui-status-pulse"
  data-status="${status}"
  data-size="${size}"
  role="img"
  ${label ? `aria-label="${label}"` : ''}
>
  <span class="ui-status-pulse__dot"></span>
  <span class="ui-status-pulse__ring"></span>
  <span class="ui-status-pulse__ring"></span>
  <span class="ui-status-pulse__ring"></span>
</span>

/* Import component CSS */
@import '@annondeveloper/ui-kit/css/components/status-pulse.css';`
}

function generateSvelteCode(tier: Tier, status: Status, size: Size, label: string): string {
  if (tier === 'lite') {
    return `<!-- Svelte -- Lite tier (CSS-only) -->
<span class="ui-lite-status-pulse" data-status="${status}" data-size="${size}"${label ? ` aria-label="${label}"` : ''}>
</span>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }
  const props = [`status="${status}"`]
  if (size !== 'md') props.push(`size="${size}"`)
  if (label) props.push(`label="${label}"`)
  return `<script>
  import { StatusPulse } from '@annondeveloper/ui-kit';
</script>

<StatusPulse ${props.join(' ')} />`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [status, setStatus] = useState<Status>('ok')
  const [size, setSize] = useState<Size>('md')
  const [label, setLabel] = useState('System operational')
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const PulseComponent = tier === 'lite' ? LiteStatusPulse : StatusPulse

  const reactCode = useMemo(
    () => generateReactCode(tier, status, size, label, motion),
    [tier, status, size, label, motion],
  )
  const htmlCode = useMemo(() => generateHtmlCode(tier, status, size, label), [tier, status, size, label])
  const vueCode = useMemo(() => generateVueCode(tier, status, size, label), [tier, status, size, label])
  const angularCode = useMemo(() => generateAngularCode(tier, status, size, label), [tier, status, size, label])
  const svelteCode = useMemo(() => generateSvelteCode(tier, status, size, label), [tier, status, size, label])

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

  const previewProps: Record<string, unknown> = { status, size }
  if (label) previewProps.label = label
  if (tier !== 'lite') previewProps.motion = motion

  return (
    <section className="status-pulse-page__section" id="playground">
      <h2 className="status-pulse-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="status-pulse-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="status-pulse-page__playground">
        <div className="status-pulse-page__playground-preview">
          <div className="status-pulse-page__playground-result">
            <PulseComponent {...previewProps as any} />
          </div>

          <div className="status-pulse-page__code-tabs">
            <div className="status-pulse-page__export-row">
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
              {copyStatus && <span className="status-pulse-page__export-status">{copyStatus}</span>}
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

        <div className="status-pulse-page__playground-controls">
          <OptionGroup label="Status" options={STATUSES} value={status} onChange={setStatus} />
          <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="status-pulse-page__control-group">
            <span className="status-pulse-page__control-label">Label</span>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              className="status-pulse-page__text-input"
              placeholder="Accessible label..."
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StatusPulsePage() {
  useStyles('status-pulse-page', pageStyles)

  const { tier, setTier } = useTier()
  const [brandColor, setBrandColor] = useState('#6366f1')
  const { mode } = useTheme()

  const themeTokens = useMemo(() => {
    try { return generateTheme(brandColor, mode) } catch { return null }
  }, [brandColor, mode])

  const BRAND_ONLY_KEYS: (keyof ThemeTokens)[] = [
    'brand', 'brandLight', 'brandDark', 'brandSubtle', 'brandGlow',
    'borderGlow', 'aurora1', 'aurora2',
  ]

  const themeStyle = useMemo(() => {
    if (!themeTokens || brandColor === '#6366f1') return undefined
    const style: Record<string, string> = {}
    for (const key of BRAND_ONLY_KEYS) {
      const cssVar = TOKEN_TO_CSS[key]
      const value = themeTokens[key]
      if (cssVar && value) style[cssVar] = value
    }
    return style as React.CSSProperties
  }, [themeTokens, brandColor])

  // Scroll reveal for sections -- JS fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.status-pulse-page__section')
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

  const PulseComponent = tier === 'lite' ? LiteStatusPulse : StatusPulse

  return (
    <div className="status-pulse-page" style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="status-pulse-page__hero">
        <h1 className="status-pulse-page__title">StatusPulse</h1>
        <p className="status-pulse-page__desc">
          Animated status dot with radiating rings for real-time monitoring.
          Supports four status types, three sizes, and motion-aware animation from static dot to full radiate.
        </p>
        <div className="status-pulse-page__import-row">
          <code className="status-pulse-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. All Statuses ────────────────────────────── */}
      <section className="status-pulse-page__section" id="statuses">
        <h2 className="status-pulse-page__section-title">
          <a href="#statuses">Status Variants</a>
        </h2>
        <p className="status-pulse-page__section-desc">
          Four built-in status types with distinct OKLCH colors for clear visual differentiation.
        </p>
        <div className="status-pulse-page__preview">
          <div className="status-pulse-page__labeled-row">
            {STATUSES.map(s => (
              <div key={s} className="status-pulse-page__labeled-item">
                <PulseComponent status={s} label={s} />
                <span className="status-pulse-page__item-label">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. All Sizes ───────────────────────────────── */}
      <section className="status-pulse-page__section" id="sizes">
        <h2 className="status-pulse-page__section-title">
          <a href="#sizes">Size Scale</a>
        </h2>
        <p className="status-pulse-page__section-desc">
          Three sizes for different contexts: compact inline indicators (sm), standard display (md),
          and prominent dashboard use (lg).
        </p>
        <div className="status-pulse-page__preview">
          <div className="status-pulse-page__labeled-row">
            {SIZES.map(s => (
              <div key={s} className="status-pulse-page__labeled-item">
                <PulseComponent status="ok" label={`Size ${s}`} size={s} />
                <span className="status-pulse-page__item-label">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Motion Levels ──────────────────────────── */}
      {tier !== 'lite' ? (
        <section className="status-pulse-page__section" id="motion">
          <h2 className="status-pulse-page__section-title">
            <a href="#motion">Motion Levels</a>
          </h2>
          <p className="status-pulse-page__section-desc">
            Control animation intensity with the <code>motion</code> prop. Level 0 shows a static dot,
            level 1 adds a subtle opacity pulse, and levels 2-3 enable the full radiating ring effect.
          </p>
          <div className="status-pulse-page__states-grid">
            {([0, 1, 2, 3] as const).map(m => (
              <div key={m} className="status-pulse-page__state-cell">
                <StatusPulse status="ok" label={`Motion ${m}`} motion={m} size="lg" />
                <span className="status-pulse-page__state-label">Motion {m}</span>
              </div>
            ))}
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`<StatusPulse status="ok" motion={0} /> {/* Static dot */}\n<StatusPulse status="ok" motion={1} /> {/* Opacity pulse */}\n<StatusPulse status="ok" motion={2} /> {/* Radiating rings */}\n<StatusPulse status="ok" motion={3} /> {/* Full cinematic */}`}
              language="typescript"
            />
          </div>
        </section>
      ) : (
        <section className="status-pulse-page__section" id="motion">
          <h2 className="status-pulse-page__section-title">
            <a href="#motion">Motion Levels</a>
          </h2>
          <p className="status-pulse-page__section-desc">
            Motion control allows adjusting animation intensity from static to full radiating rings.
          </p>
          <p className="status-pulse-page__section-desc" style={{ fontStyle: 'italic', color: 'var(--text-tertiary)' }}>
            Motion control requires Standard tier.
          </p>
        </section>
      )}

      {/* ── 6. Inline Usage ──────────────────────────── */}
      <section className="status-pulse-page__section" id="inline">
        <h2 className="status-pulse-page__section-title">
          <a href="#inline">Inline Usage</a>
        </h2>
        <p className="status-pulse-page__section-desc">
          StatusPulse is an inline element -- use it alongside text or within other components
          for live status indicators.
        </p>
        <div className="status-pulse-page__preview status-pulse-page__preview--col" style={{ flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}>
          <div className="status-pulse-page__inline-demo">
            <PulseComponent status="ok" label="System online" size="sm" /> All systems operational
          </div>
          <div className="status-pulse-page__inline-demo">
            <PulseComponent status="warning" label="Degraded" size="sm" /> Partial degradation detected
          </div>
          <div className="status-pulse-page__inline-demo">
            <PulseComponent status="critical" label="Outage" size="sm" /> Service outage in progress
          </div>
          <div className="status-pulse-page__inline-demo">
            <PulseComponent status="info" label="Deploying" size="sm" /> Deployment in progress
          </div>
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>\n  <StatusPulse status="ok" label="Online" size="sm" />\n  All systems operational\n</span>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 7. Status Dashboard ─────────────────────── */}
      <section className="status-pulse-page__section" id="dashboard">
        <h2 className="status-pulse-page__section-title">
          <a href="#dashboard">Status Dashboard Example</a>
        </h2>
        <p className="status-pulse-page__section-desc">
          Combine multiple StatusPulse indicators to create a real-time monitoring dashboard.
        </p>
        <div className="status-pulse-page__states-grid">
          <div className="status-pulse-page__state-cell">
            <PulseComponent status="ok" label="API" size="lg" />
            <span className="status-pulse-page__state-label">API Server</span>
          </div>
          <div className="status-pulse-page__state-cell">
            <PulseComponent status="ok" label="Database" size="lg" />
            <span className="status-pulse-page__state-label">Database</span>
          </div>
          <div className="status-pulse-page__state-cell">
            <PulseComponent status="warning" label="CDN" size="lg" />
            <span className="status-pulse-page__state-label">CDN</span>
          </div>
          <div className="status-pulse-page__state-cell">
            <PulseComponent status="critical" label="Queue" size="lg" />
            <span className="status-pulse-page__state-label">Queue Worker</span>
          </div>
          <div className="status-pulse-page__state-cell">
            <PulseComponent status="info" label="Deploy" size="lg" />
            <span className="status-pulse-page__state-label">Deploying</span>
          </div>
          <div className="status-pulse-page__state-cell">
            <PulseComponent status="ok" label="Cache" size="lg" />
            <span className="status-pulse-page__state-label">Cache Layer</span>
          </div>
        </div>
      </section>

      {/* ── 8. Weight Tiers ────────────────────────────── */}
      <section className="status-pulse-page__section" id="tiers">
        <h2 className="status-pulse-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="status-pulse-page__section-desc">
          Choose the right balance of features and bundle size. Lite provides a static indicator,
          Standard adds radiating ring animations and motion control.
        </p>

        <div className="status-pulse-page__tiers">
          {/* Lite */}
          <div
            className={`status-pulse-page__tier-card${tier === 'lite' ? ' status-pulse-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="status-pulse-page__tier-header">
              <span className="status-pulse-page__tier-name">Lite</span>
              <span className="status-pulse-page__tier-size">~0.15 KB</span>
            </div>
            <p className="status-pulse-page__tier-desc">
              CSS-only status dot. Zero JavaScript beyond the forwardRef wrapper.
              No radiating rings, no motion control. Static colored indicator.
            </p>
            <div className="status-pulse-page__tier-import">
              import {'{'} StatusPulse {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="status-pulse-page__tier-preview">
              <LiteStatusPulse status="ok" label="Lite OK" />
              <LiteStatusPulse status="critical" label="Lite Critical" />
            </div>
            <div className="status-pulse-page__size-breakdown">
              <div className="status-pulse-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.15 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.85 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`status-pulse-page__tier-card${tier === 'standard' ? ' status-pulse-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="status-pulse-page__tier-header">
              <span className="status-pulse-page__tier-name">Standard</span>
              <span className="status-pulse-page__tier-size">~1 KB</span>
            </div>
            <p className="status-pulse-page__tier-desc">
              Full-featured pulse with radiating ring animation, motion levels,
              ARIA role="img" with label, and reduced-motion support.
            </p>
            <div className="status-pulse-page__tier-import">
              import {'{'} StatusPulse {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="status-pulse-page__tier-preview">
              <StatusPulse status="ok" label="OK" />
              <StatusPulse status="warning" label="Warning" />
              <StatusPulse status="critical" label="Critical" />
            </div>
            <div className="status-pulse-page__size-breakdown">
              <div className="status-pulse-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>1.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`status-pulse-page__tier-card${tier === 'premium' ? ' status-pulse-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="status-pulse-page__tier-header">
              <span className="status-pulse-page__tier-name">Premium</span>
              <span className="status-pulse-page__tier-size">~3-5 KB</span>
            </div>
            <p className="status-pulse-page__tier-desc">
              Spring-scale entrance, ambient aurora glow behind the dot, multi-ring pulse, and glow breathing effect.
            </p>
            <div className="status-pulse-page__tier-import">
              import {'{'} StatusPulse {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="status-pulse-page__tier-preview">
              <StatusPulse status="ok" label="OK" size="lg" />
              <StatusPulse status="info" label="Info" size="lg" />
            </div>
            <div className="status-pulse-page__size-breakdown">
              <div className="status-pulse-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>3.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.4 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Brand Color ───────────────────────────────── */}
      <section className="status-pulse-page__section" id="brand-color">
        <h2 className="status-pulse-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="status-pulse-page__section-desc">
          Pick a brand color to see page accents update. Status colors use semantic tokens (ok, warning,
          critical, info) and are independent of brand color.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ColorInput
            name="brand-color"
            value={brandColor}
            onChange={setBrandColor}
            size="sm"
            swatches={['#6366f1','#f97316','#f43f5e','#0ea5e9','#10b981','#8b5cf6','#d946ef','#f59e0b','#06b6d4','#64748b']}
          />
          <div className="status-pulse-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`status-pulse-page__color-preset${brandColor === p.hex ? ' status-pulse-page__color-preset--active' : ''}`}
                style={{ background: p.hex }}
                onClick={() => setBrandColor(p.hex)}
                title={p.name}
                aria-label={`Set brand color to ${p.name}`}
              />
            ))}
          </div>
          {brandColor !== '#6366f1' && (
            <Button size="xs" variant="ghost" onClick={() => setBrandColor('#6366f1')}>
              <Icon name="refresh" size="sm" /> Reset to default
            </Button>
          )}
        </div>
      </section>

      {/* ── 9. Props API ───────────────────────────────── */}
      <section className="status-pulse-page__section" id="props">
        <h2 className="status-pulse-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="status-pulse-page__section-desc">
          All props accepted by StatusPulse. It also spreads any native HTML span attributes
          onto the underlying {'<span>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={statusPulseProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className="status-pulse-page__section" id="accessibility">
        <h2 className="status-pulse-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="status-pulse-page__section-desc">
          Built with semantic ARIA attributes for screen reader compatibility.
        </p>
        <Card variant="default" padding="md">
          <ul className="status-pulse-page__a11y-list">
            <li className="status-pulse-page__a11y-item">
              <span className="status-pulse-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Role:</strong> Uses <code className="status-pulse-page__a11y-key">role="img"</code> with <code className="status-pulse-page__a11y-key">aria-label</code> for screen reader description.
              </span>
            </li>
            <li className="status-pulse-page__a11y-item">
              <span className="status-pulse-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Semantic colors:</strong> Each status uses a distinct OKLCH color for visual differentiation.
              </span>
            </li>
            <li className="status-pulse-page__a11y-item">
              <span className="status-pulse-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Decorative elements:</strong> Dot and rings marked with <code className="status-pulse-page__a11y-key">aria-hidden="true"</code>.
              </span>
            </li>
            <li className="status-pulse-page__a11y-item">
              <span className="status-pulse-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="status-pulse-page__a11y-key">forced-colors: active</code> with ButtonText color.
              </span>
            </li>
            <li className="status-pulse-page__a11y-item">
              <span className="status-pulse-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> All animations disabled via <code className="status-pulse-page__a11y-key">prefers-reduced-motion: reduce</code>. Rings hidden entirely.
              </span>
            </li>
            <li className="status-pulse-page__a11y-item">
              <span className="status-pulse-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Motion cascade:</strong> Respects OS preference {'>'} component prop {'>'} CSS --motion {'>'} UIProvider context.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
