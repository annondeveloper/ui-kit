'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { TracingBeam } from '@ui/domain/tracing-beam'
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
    @scope (.tracing-beam-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: tracing-beam-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .tracing-beam-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .tracing-beam-page__hero::before {
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
        animation: tracing-beam-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes tracing-beam-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .tracing-beam-page__hero::before { animation: none; }
      }

      .tracing-beam-page__title {
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

      .tracing-beam-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .tracing-beam-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .tracing-beam-page__import-code {
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

      .tracing-beam-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .tracing-beam-page__section {
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
        animation: tracing-beam-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes tracing-beam-section-reveal {
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
        .tracing-beam-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .tracing-beam-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .tracing-beam-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .tracing-beam-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .tracing-beam-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .tracing-beam-page__preview {
        padding: 2.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: center;
        gap: 1.25rem;
        min-block-size: 200px;
      }

      .tracing-beam-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Demo content blocks ──────────────────────────── */

      .tracing-beam-page__content-block {
        margin-block-end: 2rem;
      }

      .tracing-beam-page__content-block h3 {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.5rem;
      }

      .tracing-beam-page__content-block p {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.7;
        margin: 0 0 1rem;
      }

      .tracing-beam-page__step-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: 1.5rem;
        block-size: 1.5rem;
        border-radius: 50%;
        background: var(--brand, oklch(65% 0.2 270));
        color: oklch(100% 0 0);
        font-size: 0.75rem;
        font-weight: 700;
        margin-inline-end: 0.5rem;
        flex-shrink: 0;
      }

      /* ── Playground ─────────────────────────────────── */

      .tracing-beam-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .tracing-beam-page__playground {
          grid-template-columns: 1fr;
        }
        .tracing-beam-page__playground-controls {
          position: static !important;
        }
      }

      @container tracing-beam-page (max-width: 680px) {
        .tracing-beam-page__playground {
          grid-template-columns: 1fr;
        }
        .tracing-beam-page__playground-controls {
          position: static !important;
        }
      }

      .tracing-beam-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .tracing-beam-page__playground-result {
        overflow-x: auto;
        min-block-size: 300px;
        padding: 2rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .tracing-beam-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .tracing-beam-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .tracing-beam-page__playground-controls {
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

      .tracing-beam-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .tracing-beam-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .tracing-beam-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .tracing-beam-page__option-btn {
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
      .tracing-beam-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .tracing-beam-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .tracing-beam-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .tracing-beam-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .tracing-beam-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 2rem;
        align-items: flex-start;
        justify-content: center;
      }

      .tracing-beam-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        max-inline-size: 300px;
      }

      .tracing-beam-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .tracing-beam-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .tracing-beam-page__tier-card {
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

      .tracing-beam-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .tracing-beam-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .tracing-beam-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .tracing-beam-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .tracing-beam-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .tracing-beam-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .tracing-beam-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .tracing-beam-page__tier-import {
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

      .tracing-beam-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
        min-block-size: 80px;
      }

      /* ── Color picker ──────────────────────────────── */

      .tracing-beam-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .tracing-beam-page__color-preset {
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
      .tracing-beam-page__color-preset:hover {
        transform: scale(1.2);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
      }
      .tracing-beam-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── Code tabs ─────────────────────────────────── */

      .tracing-beam-page__code-tabs {
        margin-block-start: 1rem;
      }

      .tracing-beam-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .tracing-beam-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .tracing-beam-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .tracing-beam-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .tracing-beam-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .tracing-beam-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Size breakdown ─────────────────────────────── */

      .tracing-beam-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .tracing-beam-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .tracing-beam-page__hero {
          padding: 2rem 1.25rem;
        }
        .tracing-beam-page__title {
          font-size: 1.75rem;
        }
        .tracing-beam-page__preview {
          padding: 1.75rem;
        }
        .tracing-beam-page__playground {
          grid-template-columns: 1fr;
        }
        .tracing-beam-page__playground-result {
          padding: 1.5rem;
          min-block-size: 250px;
        }
        .tracing-beam-page__tiers {
          grid-template-columns: 1fr;
        }
        .tracing-beam-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 400px) {
        .tracing-beam-page__hero {
          padding: 1.5rem 1rem;
        }
        .tracing-beam-page__title {
          font-size: 1.5rem;
        }
        .tracing-beam-page__preview {
          padding: 1rem;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }
        .tracing-beam-page__title {
          font-size: 4rem;
        }
        .tracing-beam-page__preview {
          padding: 3.5rem;
        }
      }

      /* ── Scrollbar + code blocks ──────────────────── */

      .tracing-beam-page__import-code,
      .tracing-beam-page code,
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

const tracingBeamProps: PropDef[] = [
  { name: 'color', type: 'string', description: 'Beam color override. Accepts any CSS color. Defaults to brand purple (oklch(75% 0.15 270)).' },
  { name: 'children', type: 'ReactNode', description: 'Content rendered beside the tracing beam track.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. 0 shows the full beam statically without scroll tracking.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'style', type: 'CSSProperties', description: 'Inline styles applied to the root element.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { TracingBeam } from '@annondeveloper/ui-kit/domain'",
  standard: "import { TracingBeam } from '@annondeveloper/ui-kit'",
  premium: "import { TracingBeam } from '@annondeveloper/ui-kit/premium'",
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

const BEAM_COLORS = [
  { value: '', label: 'Default (purple)' },
  { value: 'oklch(70% 0.2 150)', label: 'Green' },
  { value: 'oklch(65% 0.22 25)', label: 'Red' },
  { value: 'oklch(70% 0.18 200)', label: 'Cyan' },
  { value: 'oklch(75% 0.2 85)', label: 'Yellow' },
  { value: 'oklch(65% 0.25 310)', label: 'Fuchsia' },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="tracing-beam-page__copy-btn"
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
    <div className="tracing-beam-page__control-group">
      <span className="tracing-beam-page__control-label">{label}</span>
      <div className="tracing-beam-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`tracing-beam-page__option-btn${opt === value ? ' tracing-beam-page__option-btn--active' : ''}`}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Sample Content ──────────────────────────────────────────────────────────

function SampleContent({ steps }: { steps: number }) {
  const content = [
    { title: 'Initialize Project', text: 'Set up your development environment with the UI Kit CLI. Run the init command to scaffold your project with the Aurora Fluid theme and all design tokens configured automatically.' },
    { title: 'Add Components', text: 'Import individual components as needed. Each component is tree-shakeable and ships with embedded scoped CSS that auto-injects via adoptedStyleSheets. Zero configuration required.' },
    { title: 'Configure Theme', text: 'Customize your brand color and the theme generator derives a complete OKLCH color system. All surface colors, borders, and accents update harmoniously from a single input.' },
    { title: 'Build & Ship', text: 'Run the production build with automatic CSS extraction, bundle size validation, and accessibility auditing. The CLI validates your component usage and reports any issues.' },
    { title: 'Monitor & Iterate', text: 'Use the built-in performance budgets to keep your bundle lean. The library enforces size limits per component and tracks shared dependency costs across your app.' },
  ]

  return (
    <>
      {content.slice(0, steps).map((item, i) => (
        <div key={i} className="tracing-beam-page__content-block">
          <h3>
            <span className="tracing-beam-page__step-badge">{i + 1}</span>
            {item.title}
          </h3>
          <p>{item.text}</p>
        </div>
      ))}
    </>
  )
}

// ─── Code Generation ─────────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier,
  beamColor: string,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  if (beamColor) props.push(`  color="${beamColor}"`)
  if (motion !== 3) props.push(`  motion={${motion}}`)

  const childContent = `\n  <div>\n    <h3>Step 1: Initialize</h3>\n    <p>Set up your project...</p>\n  </div>\n  <div>\n    <h3>Step 2: Build</h3>\n    <p>Add components...</p>\n  </div>\n`

  if (props.length === 0) {
    return `${importStr}\n\n<TracingBeam>${childContent}</TracingBeam>`
  }

  return `${importStr}\n\n<TracingBeam\n${props.join('\n')}\n>${childContent}</TracingBeam>`
}

function generateHtmlCode(beamColor: string): string {
  const colorVar = beamColor ? `\n  --tracing-beam-color: ${beamColor};` : ''
  return `<!-- TracingBeam — @annondeveloper/ui-kit -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/tracing-beam.css">

<div class="ui-tracing-beam"${colorVar ? ` style="${colorVar.trim()}"` : ''}>
  <div class="ui-tracing-beam--track" aria-hidden="true">
    <div class="ui-tracing-beam--progress" style="--beam-progress: 50%;"></div>
    <div class="ui-tracing-beam--dot" style="--beam-progress: 50%;"></div>
  </div>
  <div class="ui-tracing-beam--content">
    <h3>Step 1: Initialize</h3>
    <p>Set up your project...</p>
    <h3>Step 2: Build</h3>
    <p>Add components...</p>
  </div>
</div>

<script>
// Scroll-based progress tracking
const beam = document.querySelector('.ui-tracing-beam');
window.addEventListener('scroll', () => {
  const rect = beam.getBoundingClientRect();
  const scrolled = window.innerHeight - rect.top;
  const total = window.innerHeight + rect.height;
  const pct = Math.min(100, Math.max(0, (scrolled / total) * 100));
  beam.querySelector('.ui-tracing-beam--progress').style.setProperty('--beam-progress', pct + '%');
  beam.querySelector('.ui-tracing-beam--dot').style.setProperty('--beam-progress', pct + '%');
});
</script>`
}

function generateVueCode(tier: Tier, beamColor: string): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const props: string[] = []
  if (beamColor) props.push(`  color="${beamColor}"`)

  const propsStr = props.length > 0 ? `\n${props.join('\n')}\n` : ''
  return `<template>
  <TracingBeam${propsStr}>
    <div>
      <h3>Step 1: Initialize</h3>
      <p>Set up your project...</p>
    </div>
    <div>
      <h3>Step 2: Build</h3>
      <p>Add components...</p>
    </div>
  </TracingBeam>
</template>

<script setup>
import { TracingBeam } from '${importPath}'
</script>`
}

function generateAngularCode(beamColor: string): string {
  const colorVar = beamColor ? ` --tracing-beam-color: ${beamColor};` : ''
  return `<!-- Angular — Use CSS + JS approach -->
<div class="ui-tracing-beam"${colorVar ? ` style="${colorVar.trim()}"` : ''}
  #tracingBeam>
  <div class="ui-tracing-beam--track" aria-hidden="true">
    <div class="ui-tracing-beam--progress"
      [style.--beam-progress]="progress + '%'"></div>
    <div class="ui-tracing-beam--dot"
      [style.--beam-progress]="progress + '%'"></div>
  </div>
  <div class="ui-tracing-beam--content">
    <h3>Step 1: Initialize</h3>
    <p>Set up your project...</p>
    <h3>Step 2: Build</h3>
    <p>Add components...</p>
  </div>
</div>

/* In styles.css */
@import '@annondeveloper/ui-kit/css/components/tracing-beam.css';

// In component.ts: track scroll progress with @HostListener('window:scroll')`
}

function generateSvelteCode(tier: Tier, beamColor: string): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const props: string[] = []
  if (beamColor) props.push(`  color="${beamColor}"`)

  const propsStr = props.length > 0 ? `\n${props.join('\n')}\n` : ''
  return `<script>
  import { TracingBeam } from '${importPath}';
</script>

<TracingBeam${propsStr}>
  <div>
    <h3>Step 1: Initialize</h3>
    <p>Set up your project...</p>
  </div>
  <div>
    <h3>Step 2: Build</h3>
    <p>Add components...</p>
  </div>
</TracingBeam>`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp, brandColor }: { tier: Tier; brandColor: string }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [beamColor, setBeamColor] = useState('')
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [steps, setSteps] = useState(3)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const reactCode = useMemo(
    () => generateReactCode(tier, beamColor, motion),
    [tier, beamColor, motion],
  )

  const htmlCode = useMemo(() => generateHtmlCode(beamColor), [beamColor])
  const vueCode = useMemo(() => generateVueCode(tier, beamColor), [tier, beamColor])
  const angularCode = useMemo(() => generateAngularCode(beamColor), [beamColor])
  const svelteCode = useMemo(() => generateSvelteCode(tier, beamColor), [tier, beamColor])

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
    <section className="tracing-beam-page__section" id="playground">
      <h2 className="tracing-beam-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="tracing-beam-page__section-desc">
        Scroll through the content to see the tracing beam progress. Adjust beam color, motion, and content length.
      </p>

      <div className="tracing-beam-page__playground">
        <div className="tracing-beam-page__playground-preview">
          <div className="tracing-beam-page__playground-result">
            <TracingBeam
              color={beamColor || undefined}
              motion={motion}
            >
              <SampleContent steps={steps} />
            </TracingBeam>
          </div>

          <div className="tracing-beam-page__code-tabs">
            <div className="tracing-beam-page__export-row">
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
              {copyStatus && <span className="tracing-beam-page__export-status">{copyStatus}</span>}
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

        <div className="tracing-beam-page__playground-controls">
          <div className="tracing-beam-page__control-group">
            <span className="tracing-beam-page__control-label">Beam Color</span>
            <div className="tracing-beam-page__control-options">
              {BEAM_COLORS.map(c => (
                <button
                  key={c.value}
                  type="button"
                  className={`tracing-beam-page__option-btn${beamColor === c.value ? ' tracing-beam-page__option-btn--active' : ''}`}
                  onClick={() => setBeamColor(c.value)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <OptionGroup
            label="Motion"
            options={['0', '1', '2', '3'] as const}
            value={String(motion) as '0' | '1' | '2' | '3'}
            onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
          />
          <OptionGroup
            label="Steps"
            options={['2', '3', '4', '5'] as const}
            value={String(steps)}
            onChange={v => setSteps(Number(v))}
          />
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TracingBeamPage() {
  useStyles('tracing-beam-page', pageStyles)

  const { tier, setTier } = useTier()
  const [brandColor, setBrandColor] = useState('#6366f1')
  const pageRef = useRef<HTMLDivElement>(null)
  const { mode } = useTheme()

  const BRAND_ONLY_KEYS: (keyof ThemeTokens)[] = [
    'brand', 'brandLight', 'brandDark', 'brandSubtle', 'brandGlow',
    'borderGlow', 'aurora1', 'aurora2',
  ]

  const themeTokens = useMemo(() => {
    try {
      return generateTheme(brandColor, mode)
    } catch {
      return null
    }
  }, [brandColor, mode])

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

  // Scroll reveal fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.tracing-beam-page__section')
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
    <div className="tracing-beam-page" ref={pageRef} style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="tracing-beam-page__hero">
        <h1 className="tracing-beam-page__title">TracingBeam</h1>
        <p className="tracing-beam-page__desc">
          A scroll-driven progress beam that traces alongside content as the user scrolls.
          Features a glowing dot indicator, gradient fill, and smooth transitions. Ideal for
          timelines, step-by-step guides, and long-form content navigation.
        </p>
        <div className="tracing-beam-page__import-row">
          <code className="tracing-beam-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} brandColor={brandColor} />

      {/* ── 3. Beam Colors ─────────────────────────────── */}
      <section className="tracing-beam-page__section" id="colors">
        <h2 className="tracing-beam-page__section-title">
          <a href="#colors">Beam Colors</a>
        </h2>
        <p className="tracing-beam-page__section-desc">
          The beam color can be customized with any CSS color. The gradient automatically
          generates a hue-shifted variant for visual depth. OKLCH colors produce the
          most consistent perceptual results.
        </p>
        <div className="tracing-beam-page__labeled-row">
          <div className="tracing-beam-page__labeled-item">
            <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.5rem', maxWidth: 260 }}>
              <TracingBeam motion={0}>
                <div className="tracing-beam-page__content-block">
                  <h3><span className="tracing-beam-page__step-badge">1</span> Default</h3>
                  <p>The default purple beam.</p>
                </div>
              </TracingBeam>
            </div>
            <span className="tracing-beam-page__item-label">default</span>
          </div>
          <div className="tracing-beam-page__labeled-item">
            <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.5rem', maxWidth: 260 }}>
              <TracingBeam color="oklch(70% 0.2 150)" motion={0}>
                <div className="tracing-beam-page__content-block">
                  <h3><span className="tracing-beam-page__step-badge" style={{ background: 'oklch(70% 0.2 150)' }}>1</span> Green</h3>
                  <p>A green beam for success flows.</p>
                </div>
              </TracingBeam>
            </div>
            <span className="tracing-beam-page__item-label">green</span>
          </div>
          <div className="tracing-beam-page__labeled-item">
            <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.5rem', maxWidth: 260 }}>
              <TracingBeam color="oklch(70% 0.18 200)" motion={0}>
                <div className="tracing-beam-page__content-block">
                  <h3><span className="tracing-beam-page__step-badge" style={{ background: 'oklch(70% 0.18 200)' }}>1</span> Cyan</h3>
                  <p>A cyan beam for technical docs.</p>
                </div>
              </TracingBeam>
            </div>
            <span className="tracing-beam-page__item-label">cyan</span>
          </div>
        </div>
      </section>

      {/* ── 4. Motion Levels ────────────────────────────── */}
      <section className="tracing-beam-page__section" id="motion">
        <h2 className="tracing-beam-page__section-title">
          <a href="#motion">Motion Levels</a>
        </h2>
        <p className="tracing-beam-page__section-desc">
          Motion level 0 shows the full beam statically without scroll tracking, which is perfect
          for print and reduced-motion preferences. Level 3 provides the full scroll-driven experience
          with smooth progress transitions and the glowing dot indicator.
        </p>
        <div className="tracing-beam-page__labeled-row">
          <div className="tracing-beam-page__labeled-item">
            <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.5rem', maxWidth: 260 }}>
              <TracingBeam motion={0}>
                <div className="tracing-beam-page__content-block">
                  <h3><span className="tracing-beam-page__step-badge">1</span> Static</h3>
                  <p>Full beam, no dot, no scroll.</p>
                </div>
              </TracingBeam>
            </div>
            <span className="tracing-beam-page__item-label">motion=0</span>
          </div>
          <div className="tracing-beam-page__labeled-item">
            <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.5rem', maxWidth: 260 }}>
              <TracingBeam motion={3}>
                <div className="tracing-beam-page__content-block">
                  <h3><span className="tracing-beam-page__step-badge">1</span> Animated</h3>
                  <p>Scroll to see the beam trace.</p>
                </div>
              </TracingBeam>
            </div>
            <span className="tracing-beam-page__item-label">motion=3</span>
          </div>
        </div>
      </section>

      {/* ── 5. Timeline Use Case ────────────────────────── */}
      <section className="tracing-beam-page__section" id="timeline">
        <h2 className="tracing-beam-page__section-title">
          <a href="#timeline">Timeline Use Case</a>
        </h2>
        <p className="tracing-beam-page__section-desc">
          TracingBeam is ideal for step-by-step guides, project timelines, and changelog displays.
          The beam visually connects sequential content blocks and shows reading progress.
        </p>
        <div className="tracing-beam-page__preview" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <TracingBeam>
            <div className="tracing-beam-page__content-block">
              <h3><span className="tracing-beam-page__step-badge">1</span> Install the package</h3>
              <p>Add @annondeveloper/ui-kit to your project with npm, yarn, or pnpm. The package includes TypeScript declarations and zero external dependencies.</p>
            </div>
            <div className="tracing-beam-page__content-block">
              <h3><span className="tracing-beam-page__step-badge">2</span> Initialize your theme</h3>
              <p>Run the CLI init command or wrap your app with UIProvider. This sets up the OKLCH color system, motion defaults, and responsive tokens.</p>
            </div>
            <div className="tracing-beam-page__content-block">
              <h3><span className="tracing-beam-page__step-badge">3</span> Import components</h3>
              <p>Import only what you need. Each component is tree-shakeable with embedded scoped CSS. No global stylesheet required.</p>
            </div>
            <div className="tracing-beam-page__content-block">
              <h3><span className="tracing-beam-page__step-badge">4</span> Ship to production</h3>
              <p>Build with confidence. Automatic bundle size validation, accessibility audits, and CSS extraction ensure a polished output.</p>
            </div>
          </TracingBeam>
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<TracingBeam>
  <div>
    <h3>Step 1: Install</h3>
    <p>Add the package to your project...</p>
  </div>
  <div>
    <h3>Step 2: Configure</h3>
    <p>Set up your theme...</p>
  </div>
  <div>
    <h3>Step 3: Build</h3>
    <p>Import and use components...</p>
  </div>
</TracingBeam>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 6. Weight Tiers ────────────────────────────── */}
      <section className="tracing-beam-page__section" id="tiers">
        <h2 className="tracing-beam-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="tracing-beam-page__section-desc">
          TracingBeam ships with three weight tiers. The Lite tier provides a CSS-only progress bar.
          Standard adds scroll-driven tracking with the glowing dot. Premium adds smooth spring
          physics and color-shifting gradients.
        </p>

        <div className="tracing-beam-page__tiers">
          {/* Lite */}
          <div
            className={`tracing-beam-page__tier-card${tier === 'lite' ? ' tracing-beam-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="tracing-beam-page__tier-header">
              <span className="tracing-beam-page__tier-name">Lite</span>
              <span className="tracing-beam-page__tier-size">~0.4 KB</span>
            </div>
            <p className="tracing-beam-page__tier-desc">
              CSS-only vertical line with gradient fill. No JavaScript scroll tracking.
              The full beam is shown statically beside content.
            </p>
            <div className="tracing-beam-page__tier-import">
              import {'{'} TracingBeam {'}'} from '@annondeveloper/ui-kit/domain'
            </div>
            <div className="tracing-beam-page__tier-preview">
              <TracingBeam motion={0}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
                  <p>Static beam preview</p>
                </div>
              </TracingBeam>
            </div>
            <div className="tracing-beam-page__size-breakdown">
              <div className="tracing-beam-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.4 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>1.3 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`tracing-beam-page__tier-card${tier === 'standard' ? ' tracing-beam-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="tracing-beam-page__tier-header">
              <span className="tracing-beam-page__tier-name">Standard</span>
              <span className="tracing-beam-page__tier-size">~1.8 KB</span>
            </div>
            <p className="tracing-beam-page__tier-desc">
              Full scroll-driven progress tracking with glowing dot indicator,
              gradient beam, and motion level support with smooth transitions.
            </p>
            <div className="tracing-beam-page__tier-import">
              import {'{'} TracingBeam {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="tracing-beam-page__tier-preview">
              <TracingBeam>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
                  <p>Scroll-tracked beam</p>
                </div>
              </TracingBeam>
            </div>
            <div className="tracing-beam-page__size-breakdown">
              <div className="tracing-beam-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.8 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.7 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`tracing-beam-page__tier-card${tier === 'premium' ? ' tracing-beam-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="tracing-beam-page__tier-header">
              <span className="tracing-beam-page__tier-name">Premium</span>
              <span className="tracing-beam-page__tier-size">~3.0 KB</span>
            </div>
            <p className="tracing-beam-page__tier-desc">
              Everything in Standard plus spring-physics smoothing, enhanced
              glow effects, and hue-shifting gradient that cycles as you scroll.
            </p>
            <div className="tracing-beam-page__tier-import">
              import {'{'} TracingBeam {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="tracing-beam-page__tier-preview">
              <TracingBeam>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
                  <p>Physics-smoothed beam</p>
                </div>
              </TracingBeam>
            </div>
            <div className="tracing-beam-page__size-breakdown">
              <div className="tracing-beam-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>3.0 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Brand Color ───────────────────────────────── */}
      <section className="tracing-beam-page__section" id="brand-color">
        <h2 className="tracing-beam-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="tracing-beam-page__section-desc">
          Pick a brand color to see the page theme update in real-time. The aurora
          gradients and accent colors derive automatically from your choice.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ColorInput
            name="brand-color"
            value={brandColor}
            onChange={setBrandColor}
            size="sm"
            swatches={['#6366f1','#f97316','#f43f5e','#0ea5e9','#10b981','#8b5cf6','#d946ef','#f59e0b','#06b6d4','#64748b']}
          />
          <div className="tracing-beam-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`tracing-beam-page__color-preset${brandColor === p.hex ? ' tracing-beam-page__color-preset--active' : ''}`}
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

      {/* ── 8. Props API ───────────────────────────────── */}
      <section className="tracing-beam-page__section" id="props">
        <h2 className="tracing-beam-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="tracing-beam-page__section-desc">
          All props accepted by TracingBeam. It also spreads any native div HTML attributes
          onto the underlying {'<div>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={tracingBeamProps} />
        </Card>
      </section>

      {/* ── 9. Accessibility ──────────────────────────── */}
      <section className="tracing-beam-page__section" id="accessibility">
        <h2 className="tracing-beam-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="tracing-beam-page__section-desc">
          TracingBeam is a decorative enhancement that does not affect content accessibility.
        </p>
        <Card variant="default" padding="md">
          <ul className="tracing-beam-page__a11y-list">
            <li className="tracing-beam-page__a11y-item">
              <span className="tracing-beam-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Decorative:</strong> The beam track is marked with <code className="tracing-beam-page__a11y-key">aria-hidden="true"</code> so screen readers skip it.
              </span>
            </li>
            <li className="tracing-beam-page__a11y-item">
              <span className="tracing-beam-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> Respects <code className="tracing-beam-page__a11y-key">prefers-reduced-motion</code> by showing the full beam statically with no transitions.
              </span>
            </li>
            <li className="tracing-beam-page__a11y-item">
              <span className="tracing-beam-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> In <code className="tracing-beam-page__a11y-key">forced-colors: active</code> mode, the track uses CanvasText and the progress uses Highlight for system visibility.
              </span>
            </li>
            <li className="tracing-beam-page__a11y-item">
              <span className="tracing-beam-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Content order:</strong> The grid layout ensures content comes after the track in DOM order, maintaining natural reading flow.
              </span>
            </li>
            <li className="tracing-beam-page__a11y-item">
              <span className="tracing-beam-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print:</strong> The beam shows fully with no animation in print media, providing a clean vertical guide for printed content.
              </span>
            </li>
            <li className="tracing-beam-page__a11y-item">
              <span className="tracing-beam-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Passive listeners:</strong> Scroll and resize event listeners use <code className="tracing-beam-page__a11y-key">{'{ passive: true }'}</code> for optimal performance.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
