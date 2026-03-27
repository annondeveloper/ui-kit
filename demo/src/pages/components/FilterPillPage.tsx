'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { FilterPill, FilterPillGroup } from '@ui/components/filter-pill'
import { FilterPill as LiteFilterPill } from '@ui/lite/filter-pill'
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
    @scope (.filter-pill-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: filter-pill-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .filter-pill-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .filter-pill-page__hero::before {
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
        .filter-pill-page__hero::before { animation: none; }
      }

      .filter-pill-page__title {
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

      .filter-pill-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .filter-pill-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .filter-pill-page__import-code {
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

      .filter-pill-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .filter-pill-page__section {
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
        .filter-pill-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .filter-pill-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .filter-pill-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .filter-pill-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .filter-pill-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .filter-pill-page__preview {
        padding: 2.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        min-block-size: 80px;
      }

      .filter-pill-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .filter-pill-page__preview--col {
        flex-direction: column;
        align-items: flex-start;
      }

      /* ── Playground ─────────────────────────────────── */

      .filter-pill-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @container filter-pill-page (max-width: 680px) {
        .filter-pill-page__playground {
          grid-template-columns: 1fr;
        }
        .filter-pill-page__playground-controls {
          position: static !important;
        }
      }

      @media (max-width: 768px) {
        .filter-pill-page__playground {
          grid-template-columns: 1fr;
        }
        .filter-pill-page__playground-controls {
          position: static !important;
        }
      }

      .filter-pill-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .filter-pill-page__playground-result {
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

      .filter-pill-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .filter-pill-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .filter-pill-page__playground-controls {
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

      .filter-pill-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .filter-pill-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .filter-pill-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .filter-pill-page__option-btn {
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
      .filter-pill-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .filter-pill-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .filter-pill-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .filter-pill-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .filter-pill-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .filter-pill-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .filter-pill-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .filter-pill-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── States grid ────────────────────────────────── */

      .filter-pill-page__states-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 1rem;
      }

      .filter-pill-page__state-cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 1.25rem 0.75rem;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        background: var(--bg-base);
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .filter-pill-page__state-cell:hover {
        border-color: var(--border-default);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.05);
      }

      .filter-pill-page__state-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
      }

      .filter-pill-page__state-hint {
        font-size: 0.625rem;
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .filter-pill-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .filter-pill-page__tier-card {
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

      .filter-pill-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .filter-pill-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .filter-pill-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .filter-pill-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .filter-pill-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .filter-pill-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .filter-pill-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .filter-pill-page__tier-import {
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

      .filter-pill-page__tier-preview {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 0.375rem;
        padding-block-start: 0.5rem;
      }

      .filter-pill-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .filter-pill-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .filter-pill-page__code-tabs {
        margin-block-start: 1rem;
      }

      .filter-pill-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .filter-pill-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .filter-pill-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .filter-pill-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .filter-pill-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .filter-pill-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Color presets ──────────────────────────────── */

      .filter-pill-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .filter-pill-page__color-preset {
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
      .filter-pill-page__color-preset:hover {
        transform: scale(1.2);
      }
      .filter-pill-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .filter-pill-page__hero { padding: 2rem 1.25rem; }
        .filter-pill-page__title { font-size: 1.75rem; }
        .filter-pill-page__preview { padding: 1.75rem; }
        .filter-pill-page__playground { grid-template-columns: 1fr; }
        .filter-pill-page__playground-result { padding: 2rem; overflow-x: auto;
        min-block-size: 120px; }
        .filter-pill-page__labeled-row { gap: 1rem; }
        .filter-pill-page__states-grid { grid-template-columns: repeat(2, 1fr); }
        .filter-pill-page__tiers { grid-template-columns: 1fr; }
        .filter-pill-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .filter-pill-page__hero { padding: 1.5rem 1rem; }
        .filter-pill-page__title { font-size: 1.5rem; }
        .filter-pill-page__preview { padding: 1rem; }
        .filter-pill-page__states-grid { grid-template-columns: 1fr; }
        .filter-pill-page__labeled-row { gap: 0.5rem; justify-content: center; }
      }

      @media (min-width: 3000px) {
        :scope { max-inline-size: 1400px; }
        .filter-pill-page__title { font-size: 4rem; }
        .filter-pill-page__preview { padding: 3.5rem; }
        .filter-pill-page__labeled-row { gap: 2.5rem; }
      }

      .filter-pill-page__import-code,
      .filter-pill-page code,
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

const filterPillProps: PropDef[] = [
  { name: 'label', type: 'string', required: true, description: 'The filter label text displayed inside the pill.' },
  { name: 'active', type: 'boolean', default: 'false', description: 'Whether the pill is in the active/selected state. Uses brand color styling.' },
  { name: 'onRemove', type: '() => void', description: 'Callback when the remove button is clicked. Renders a close button when provided.' },
  { name: 'count', type: 'number', description: 'Optional count badge displayed after the label.' },
  { name: 'icon', type: 'ReactNode', description: 'Optional leading icon element.' },
  { name: 'size', type: "'sm' | 'md'", default: "'md'", description: 'Controls padding and font-size.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity. 2+ enables entry animation.' },
  { name: 'onClick', type: '(e: MouseEvent) => void', description: 'Click handler for toggling the filter.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'ref', type: 'Ref<HTMLButtonElement>', description: 'Forwarded ref to the underlying <button> element.' },
]

const filterPillGroupProps: PropDef[] = [
  { name: 'children', type: 'ReactNode', required: true, description: 'FilterPill elements to display in the group.' },
  { name: 'onClearAll', type: '() => void', description: 'Callback to clear all filters. Renders a "Clear all" button when provided.' },
  { name: 'clearLabel', type: 'string', default: "'Clear all'", description: 'Custom text for the clear all button.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name.' },
  { name: 'ref', type: 'Ref<HTMLDivElement>', description: 'Forwarded ref to the underlying <div> element.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Size = 'sm' | 'md'

const SIZES: Size[] = ['sm', 'md']

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { FilterPill } from '@annondeveloper/ui-kit/lite'",
  standard: "import { FilterPill, FilterPillGroup } from '@annondeveloper/ui-kit'",
  premium: "import { FilterPill, FilterPillGroup } from '@annondeveloper/ui-kit/premium'",
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

const DEMO_FILTERS = ['React', 'TypeScript', 'Tailwind', 'Next.js', 'Vite', 'Node.js']
const DEMO_CATEGORIES = [
  { label: 'Status', icon: 'activity' as const, filters: ['Active', 'Pending', 'Closed'] },
  { label: 'Priority', icon: 'alert-circle' as const, filters: ['Critical', 'High', 'Medium', 'Low'] },
  { label: 'Type', icon: 'code' as const, filters: ['Bug', 'Feature', 'Enhancement', 'Docs'] },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="filter-pill-page__copy-btn"
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
    <div className="filter-pill-page__control-group">
      <span className="filter-pill-page__control-label">{label}</span>
      <div className="filter-pill-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`filter-pill-page__option-btn${opt === value ? ' filter-pill-page__option-btn--active' : ''}`}
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
    <label className="filter-pill-page__toggle-label">
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

function generateReactCode(
  tier: Tier, label: string, active: boolean, showRemove: boolean,
  count: number | undefined, showIcon: boolean, size: Size, motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const iconImport = showIcon && tier !== 'lite' ? "\nimport { Icon } from '@annondeveloper/ui-kit'" : ''

  const props: string[] = [`  label="${label}"`]
  if (active) props.push('  active')
  if (showRemove) props.push('  onRemove={() => handleRemove()}')
  if (count !== undefined && tier !== 'lite') props.push(`  count={${count}}`)
  if (showIcon && tier !== 'lite') props.push('  icon={<Icon name="code" size="sm" />}')
  if (size !== 'md') props.push(`  size="${size}"`)
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)
  props.push('  onClick={() => toggle()}')

  return `${importStr}${iconImport}\n\n<FilterPill\n${props.join('\n')}\n/>`
}

function generateHtmlCode(tier: Tier, label: string, active: boolean, size: Size): string {
  const cls = tier === 'lite' ? 'ui-lite-filter-pill' : 'ui-filter-pill'
  return `<!-- FilterPill -- @annondeveloper/ui-kit ${tier} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/filter-pill.css">

<button
  class="${cls}"
  data-size="${size}"
  ${active ? 'data-active' : ''}
  aria-pressed="${active}"
>
  <span class="${cls}__label">${label}</span>
</button>`
}

function generateVueCode(tier: Tier, label: string, active: boolean, size: Size): string {
  if (tier === 'lite') {
    return `<template>
  <button
    class="ui-lite-filter-pill"
    :data-active="active ? '' : undefined"
    data-size="${size}"
    @click="active = !active"
  >
    ${label}
  </button>
</template>

<script setup>
import { ref } from 'vue'
const active = ref(${active})
</script>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }
  return `<template>
  <FilterPill
    label="${label}"
    :active="active"
    size="${size}"
    @click="active = !active"
  />
</template>

<script setup>
import { ref } from 'vue'
import { FilterPill } from '@annondeveloper/ui-kit'
const active = ref(${active})
</script>`
}

function generateAngularCode(tier: Tier, label: string, active: boolean, size: Size): string {
  if (tier === 'lite') {
    return `<!-- Angular -- Lite tier (CSS-only) -->
<button
  class="ui-lite-filter-pill"
  [attr.data-active]="active ? '' : null"
  data-size="${size}"
  (click)="active = !active"
>
  ${label}
</button>

/* In styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }
  return `<!-- Angular -- Standard tier -->
<button
  class="ui-filter-pill"
  [attr.data-active]="active ? '' : null"
  data-size="${size}"
  [attr.aria-pressed]="active"
  (click)="active = !active"
>
  <span class="ui-filter-pill__label">${label}</span>
</button>

/* Import component CSS */
@import '@annondeveloper/ui-kit/css/components/filter-pill.css';`
}

function generateSvelteCode(tier: Tier, label: string, active: boolean, size: Size): string {
  if (tier === 'lite') {
    return `<!-- Svelte -- Lite tier (CSS-only) -->
<script>
  let active = ${active};
</script>

<button
  class="ui-lite-filter-pill"
  data-active={active ? '' : undefined}
  data-size="${size}"
  on:click={() => active = !active}
>
  ${label}
</button>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }
  return `<script>
  import { FilterPill } from '@annondeveloper/ui-kit';
  let active = ${active};
</script>

<FilterPill
  label="${label}"
  {active}
  size="${size}"
  on:click={() => active = !active}
/>`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [label, setLabel] = useState('TypeScript')
  const [active, setActive] = useState(false)
  const [showRemove, setShowRemove] = useState(false)
  const [showCount, setShowCount] = useState(false)
  const [count, setCount] = useState(12)
  const [showIcon, setShowIcon] = useState(false)
  const [size, setSize] = useState<Size>('md')
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const PillComponent = tier === 'lite' ? LiteFilterPill : FilterPill

  const reactCode = useMemo(
    () => generateReactCode(tier, label, active, showRemove, showCount ? count : undefined, showIcon, size, motion),
    [tier, label, active, showRemove, showCount, count, showIcon, size, motion],
  )
  const htmlCode = useMemo(() => generateHtmlCode(tier, label, active, size), [tier, label, active, size])
  const vueCode = useMemo(() => generateVueCode(tier, label, active, size), [tier, label, active, size])
  const angularCode = useMemo(() => generateAngularCode(tier, label, active, size), [tier, label, active, size])
  const svelteCode = useMemo(() => generateSvelteCode(tier, label, active, size), [tier, label, active, size])

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

  const previewProps: Record<string, unknown> = {
    label,
    active,
    size,
    onClick: () => setActive(a => !a),
  }
  if (tier !== 'lite') {
    if (showRemove) previewProps.onRemove = () => setActive(false)
    if (showCount) previewProps.count = count
    if (showIcon) previewProps.icon = <Icon name="code" size="sm" />
    previewProps.motion = motion
  } else {
    // Lite uses children not label
    delete previewProps.label
  }

  return (
    <section className="filter-pill-page__section" id="playground">
      <h2 className="filter-pill-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="filter-pill-page__section-desc">
        Tweak every prop and see the result in real-time. Click the pill to toggle its active state.
      </p>

      <div className="filter-pill-page__playground">
        <div className="filter-pill-page__playground-preview">
          <div className="filter-pill-page__playground-result">
            {tier === 'lite' ? (
              <LiteFilterPill
                active={active}
                removable={showRemove}
                onRemove={() => setActive(false)}
                onClick={() => setActive(a => !a)}
              >
                {label}
              </LiteFilterPill>
            ) : (
              <FilterPill {...previewProps as any} />
            )}
          </div>

          <div className="filter-pill-page__code-tabs">
            <div className="filter-pill-page__export-row">
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
              {copyStatus && <span className="filter-pill-page__export-status">{copyStatus}</span>}
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

        <div className="filter-pill-page__playground-controls">
          <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="filter-pill-page__control-group">
            <span className="filter-pill-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Active" checked={active} onChange={setActive} />
              <Toggle label="Removable" checked={showRemove} onChange={setShowRemove} />
              {tier !== 'lite' && <Toggle label="Show count" checked={showCount} onChange={setShowCount} />}
              {tier !== 'lite' && <Toggle label="Show icon" checked={showIcon} onChange={setShowIcon} />}
            </div>
          </div>

          <div className="filter-pill-page__control-group">
            <span className="filter-pill-page__control-label">Label</span>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              className="filter-pill-page__text-input"
              placeholder="Filter label..."
            />
          </div>

          {showCount && tier !== 'lite' && (
            <div className="filter-pill-page__control-group">
              <span className="filter-pill-page__control-label">Count</span>
              <input
                type="number"
                value={count}
                onChange={e => setCount(Number(e.target.value) || 0)}
                className="filter-pill-page__text-input"
                min={0}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FilterPillPage() {
  useStyles('filter-pill-page', pageStyles)

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
    const sections = document.querySelectorAll('.filter-pill-page__section')
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
    <div className="filter-pill-page" style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="filter-pill-page__hero">
        <h1 className="filter-pill-page__title">FilterPill</h1>
        <p className="filter-pill-page__desc">
          Toggleable filter pill with active state, optional remove button, count badge,
          and icon support. Includes FilterPillGroup for managing multiple filters with a clear-all action.
        </p>
        <div className="filter-pill-page__import-row">
          <code className="filter-pill-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Sizes ───────────────────────────────────── */}
      <section className="filter-pill-page__section" id="sizes">
        <h2 className="filter-pill-page__section-title">
          <a href="#sizes">Sizes</a>
        </h2>
        <p className="filter-pill-page__section-desc">
          Two sizes for different contexts. Small is compact for dense filter bars, medium is the default.
        </p>
        <div className="filter-pill-page__preview">
          <div className="filter-pill-page__labeled-row">
            {SIZES.map(s => (
              <div key={s} className="filter-pill-page__labeled-item">
                {tier === 'lite'
                  ? <LiteFilterPill active>{s}</LiteFilterPill>
                  : <FilterPill label={`Size ${s}`} size={s} active />}
                <span className="filter-pill-page__item-label">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. States ──────────────────────────────────── */}
      <section className="filter-pill-page__section" id="states">
        <h2 className="filter-pill-page__section-title">
          <a href="#states">States</a>
        </h2>
        <p className="filter-pill-page__section-desc">
          FilterPill handles all interaction states with clear visual feedback.
        </p>
        <div className="filter-pill-page__states-grid">
          <div className="filter-pill-page__state-cell">
            {tier === 'lite'
              ? <LiteFilterPill>Default</LiteFilterPill>
              : <FilterPill label="Default" />}
            <span className="filter-pill-page__state-label">Default</span>
          </div>
          <div className="filter-pill-page__state-cell">
            {tier === 'lite'
              ? <LiteFilterPill>Hover me</LiteFilterPill>
              : <FilterPill label="Hover me" />}
            <span className="filter-pill-page__state-label">Hover</span>
            <span className="filter-pill-page__state-hint">move cursor over</span>
          </div>
          <div className="filter-pill-page__state-cell">
            {tier === 'lite'
              ? <LiteFilterPill active>Active</LiteFilterPill>
              : <FilterPill label="Active" active />}
            <span className="filter-pill-page__state-label">Active</span>
          </div>
          <div className="filter-pill-page__state-cell">
            {tier === 'lite'
              ? <LiteFilterPill>Focus me</LiteFilterPill>
              : <FilterPill label="Focus me" />}
            <span className="filter-pill-page__state-label">Focus</span>
            <span className="filter-pill-page__state-hint">press Tab key</span>
          </div>
          {tier !== 'lite' && (
            <div className="filter-pill-page__state-cell">
              <FilterPill label="With count" count={42} active />
              <span className="filter-pill-page__state-label">With Count</span>
            </div>
          )}
          {tier !== 'lite' && (
            <div className="filter-pill-page__state-cell">
              <FilterPill label="Removable" active onRemove={() => {}} />
              <span className="filter-pill-page__state-label">Removable</span>
            </div>
          )}
        </div>
      </section>

      {/* ── 5. With Icons & Count ────────────────────── */}
      {tier !== 'lite' ? (
        <section className="filter-pill-page__section" id="features">
          <h2 className="filter-pill-page__section-title">
            <a href="#features">Icons and Count Badge</a>
          </h2>
          <p className="filter-pill-page__section-desc">
            FilterPill supports a leading icon and a count badge for showing filter result counts.
          </p>
          <div className="filter-pill-page__preview">
            <FilterPill label="React" icon={<Icon name="code" size="sm" />} active count={24} />
            <FilterPill label="Open" icon={<Icon name="check-circle" size="sm" />} count={156} />
            <FilterPill label="Bugs" icon={<Icon name="alert-circle" size="sm" />} active count={7} onRemove={() => {}} />
            <FilterPill label="Docs" icon={<Icon name="file" size="sm" />} count={89} />
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`<FilterPill label="React" icon={<Icon name="code" size="sm" />} active count={24} />\n<FilterPill label="Bugs" icon={<Icon name="alert-circle" size="sm" />} count={7} onRemove={() => remove('bugs')} />`}
              language="typescript"
            />
          </div>
        </section>
      ) : (
        <section className="filter-pill-page__section" id="features">
          <h2 className="filter-pill-page__section-title">
            <a href="#features">Icons and Count Badge</a>
          </h2>
          <p className="filter-pill-page__section-desc">
            Icons and count badges can be added to filter pills for richer filter UIs.
          </p>
          <p className="filter-pill-page__section-desc" style={{ fontStyle: 'italic', color: 'var(--text-tertiary)' }}>
            Icon and count badge support requires Standard tier.
          </p>
        </section>
      )}

      {/* ── 6. FilterPillGroup ────────────────────────── */}
      {tier !== 'lite' ? (
        <section className="filter-pill-page__section" id="group">
          <h2 className="filter-pill-page__section-title">
            <a href="#group">FilterPillGroup</a>
          </h2>
          <p className="filter-pill-page__section-desc">
            Use FilterPillGroup to wrap multiple pills with automatic layout and a "Clear all" action.
          </p>
          <InteractiveFilterGroup />
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`<FilterPillGroup onClearAll={() => setFilters([])}>
  {filters.map(f => (
    <FilterPill
      key={f}
      label={f}
      active
      onRemove={() => removeFilter(f)}
    />
  ))}
</FilterPillGroup>`}
              language="typescript"
            />
          </div>
        </section>
      ) : (
        <section className="filter-pill-page__section" id="group">
          <h2 className="filter-pill-page__section-title">
            <a href="#group">FilterPillGroup</a>
          </h2>
          <p className="filter-pill-page__section-desc">
            FilterPillGroup provides automatic layout and a clear-all button for managing multiple filters.
          </p>
          <p className="filter-pill-page__section-desc" style={{ fontStyle: 'italic', color: 'var(--text-tertiary)' }}>
            FilterPillGroup requires Standard tier.
          </p>
        </section>
      )}

      {/* ── 7. Real-world Example ────────────────────── */}
      <section className="filter-pill-page__section" id="example">
        <h2 className="filter-pill-page__section-title">
          <a href="#example">Real-world Filter Bar</a>
        </h2>
        <p className="filter-pill-page__section-desc">
          A complete filter bar example with categorized filters, toggleable state,
          and remove functionality.
        </p>
        <FilterBarExample tier={tier} />
      </section>

      {/* ── 8. Weight Tiers ────────────────────────────── */}
      <section className="filter-pill-page__section" id="tiers">
        <h2 className="filter-pill-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="filter-pill-page__section-desc">
          Choose the right balance of features and bundle size. Lite provides basic toggle pills,
          Standard adds icons, counts, remove buttons, motion, and FilterPillGroup.
        </p>

        <div className="filter-pill-page__tiers">
          {/* Lite */}
          <div
            className={`filter-pill-page__tier-card${tier === 'lite' ? ' filter-pill-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="filter-pill-page__tier-header">
              <span className="filter-pill-page__tier-name">Lite</span>
              <span className="filter-pill-page__tier-size">~0.2 KB</span>
            </div>
            <p className="filter-pill-page__tier-desc">
              Basic toggle pill with active state and optional remove.
              No icon, no count badge, no motion, no FilterPillGroup.
            </p>
            <div className="filter-pill-page__tier-import">
              import {'{'} FilterPill {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="filter-pill-page__tier-preview">
              <LiteFilterPill active>Lite</LiteFilterPill>
              <LiteFilterPill>Inactive</LiteFilterPill>
            </div>
            <div className="filter-pill-page__size-breakdown">
              <div className="filter-pill-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`filter-pill-page__tier-card${tier === 'standard' ? ' filter-pill-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="filter-pill-page__tier-header">
              <span className="filter-pill-page__tier-name">Standard</span>
              <span className="filter-pill-page__tier-size">~1.8 KB</span>
            </div>
            <p className="filter-pill-page__tier-desc">
              Full-featured with icon, count badge, remove button, motion entry animation,
              aria-pressed, focus-visible, and FilterPillGroup with clear-all.
            </p>
            <div className="filter-pill-page__tier-import">
              import {'{'} FilterPill, FilterPillGroup {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="filter-pill-page__tier-preview">
              <FilterPill label="React" active count={12} icon={<Icon name="code" size="sm" />} />
              <FilterPill label="Bugs" onRemove={() => {}} active />
            </div>
            <div className="filter-pill-page__size-breakdown">
              <div className="filter-pill-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.8 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.7 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`filter-pill-page__tier-card${tier === 'premium' ? ' filter-pill-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="filter-pill-page__tier-header">
              <span className="filter-pill-page__tier-name">Premium</span>
              <span className="filter-pill-page__tier-size">~3-5 KB</span>
            </div>
            <p className="filter-pill-page__tier-desc">
              Spring-scale on select/deselect, aurora glow on active pill, and shimmer sweep on active state.
            </p>
            <div className="filter-pill-page__tier-import">
              import {'{'} FilterPill, FilterPillGroup {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="filter-pill-page__tier-preview">
              <FilterPill label="Premium" active icon={<Icon name="zap" size="sm" />} count={99} />
            </div>
            <div className="filter-pill-page__size-breakdown">
              <div className="filter-pill-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>3.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.4 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Brand Color ───────────────────────────────── */}
      <section className="filter-pill-page__section" id="brand-color">
        <h2 className="filter-pill-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="filter-pill-page__section-desc">
          Pick a brand color. Active pills use the brand color for their background tint and text.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ColorInput
            name="brand-color"
            value={brandColor}
            onChange={setBrandColor}
            size="sm"
            swatches={['#6366f1','#f97316','#f43f5e','#0ea5e9','#10b981','#8b5cf6','#d946ef','#f59e0b','#06b6d4','#64748b']}
          />
          <div className="filter-pill-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`filter-pill-page__color-preset${brandColor === p.hex ? ' filter-pill-page__color-preset--active' : ''}`}
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
      <section className="filter-pill-page__section" id="props">
        <h2 className="filter-pill-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="filter-pill-page__section-desc">
          All props accepted by FilterPill and FilterPillGroup.
        </p>
        <Card variant="default" padding="md">
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBlockEnd: '0.5rem' }}>FilterPill</h3>
          <PropsTable props={filterPillProps} />
        </Card>
        <div style={{ marginBlockStart: '1rem' }}>
          <Card variant="default" padding="md">
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBlockEnd: '0.5rem' }}>FilterPillGroup</h3>
            <PropsTable props={filterPillGroupProps} />
          </Card>
        </div>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className="filter-pill-page__section" id="accessibility">
        <h2 className="filter-pill-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="filter-pill-page__section-desc">
          Built on native {'<button>'} elements with comprehensive ARIA support.
        </p>
        <Card variant="default" padding="md">
          <ul className="filter-pill-page__a11y-list">
            <li className="filter-pill-page__a11y-item">
              <span className="filter-pill-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Toggle state:</strong> Uses <code className="filter-pill-page__a11y-key">aria-pressed</code> to announce active/inactive state.
              </span>
            </li>
            <li className="filter-pill-page__a11y-item">
              <span className="filter-pill-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus visible:</strong> Brand-colored focus ring with glow via <code className="filter-pill-page__a11y-key">:focus-visible</code>.
              </span>
            </li>
            <li className="filter-pill-page__a11y-item">
              <span className="filter-pill-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Remove button:</strong> Separate focusable button with <code className="filter-pill-page__a11y-key">aria-label="Remove {'{'}label{'}'}"</code>.
              </span>
            </li>
            <li className="filter-pill-page__a11y-item">
              <span className="filter-pill-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Group role:</strong> FilterPillGroup uses <code className="filter-pill-page__a11y-key">role="group"</code> with <code className="filter-pill-page__a11y-key">aria-label="Active filters"</code>.
              </span>
            </li>
            <li className="filter-pill-page__a11y-item">
              <span className="filter-pill-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> Minimum 36px on coarse pointer devices via <code className="filter-pill-page__a11y-key">@media (pointer: coarse)</code>.
              </span>
            </li>
            <li className="filter-pill-page__a11y-item">
              <span className="filter-pill-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="filter-pill-page__a11y-key">forced-colors: active</code> with visible borders and Highlight color.
              </span>
            </li>
            <li className="filter-pill-page__a11y-item">
              <span className="filter-pill-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print:</strong> Remove buttons hidden in print via <code className="filter-pill-page__a11y-key">@media print</code>.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InteractiveFilterGroup() {
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(['React', 'TypeScript']))

  const toggleFilter = useCallback((filter: string) => {
    setActiveFilters(prev => {
      const next = new Set(prev)
      if (next.has(filter)) next.delete(filter)
      else next.add(filter)
      return next
    })
  }, [])

  const removeFilter = useCallback((filter: string) => {
    setActiveFilters(prev => {
      const next = new Set(prev)
      next.delete(filter)
      return next
    })
  }, [])

  return (
    <div className="filter-pill-page__preview filter-pill-page__preview--col" style={{ gap: '1rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {DEMO_FILTERS.map(f => (
          <FilterPill
            key={f}
            label={f}
            active={activeFilters.has(f)}
            onClick={() => toggleFilter(f)}
            onRemove={activeFilters.has(f) ? () => removeFilter(f) : undefined}
          />
        ))}
      </div>
      {activeFilters.size > 0 && (
        <FilterPillGroup onClearAll={() => setActiveFilters(new Set())}>
          {Array.from(activeFilters).map(f => (
            <FilterPill key={f} label={f} active onRemove={() => removeFilter(f)} />
          ))}
        </FilterPillGroup>
      )}
      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0 }}>
        Active: {activeFilters.size === 0 ? 'None' : Array.from(activeFilters).join(', ')}
      </p>
    </div>
  )
}

function FilterBarExample({ tier }: { tier: Tier }) {
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(['Active', 'High', 'Bug']))

  const toggleFilter = useCallback((filter: string) => {
    setActiveFilters(prev => {
      const next = new Set(prev)
      if (next.has(filter)) next.delete(filter)
      else next.add(filter)
      return next
    })
  }, [])

  return (
    <div className="filter-pill-page__preview filter-pill-page__preview--col" style={{ gap: '1.25rem' }}>
      {DEMO_CATEGORIES.map(cat => (
        <div key={cat.label} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Icon name={cat.icon} size="sm" /> {cat.label}
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            {cat.filters.map(f => (
              tier === 'lite' ? (
                <LiteFilterPill
                  key={f}
                  active={activeFilters.has(f)}
                  onClick={() => toggleFilter(f)}
                >
                  {f}
                </LiteFilterPill>
              ) : (
                <FilterPill
                  key={f}
                  label={f}
                  active={activeFilters.has(f)}
                  onClick={() => toggleFilter(f)}
                  size="sm"
                />
              )
            ))}
          </div>
        </div>
      ))}
      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0, borderBlockStart: '1px solid var(--border-subtle)', paddingBlockStart: '0.75rem', width: '100%' }}>
        {activeFilters.size} filter{activeFilters.size !== 1 ? 's' : ''} active: {Array.from(activeFilters).join(', ') || 'None'}
      </p>
    </div>
  )
}
