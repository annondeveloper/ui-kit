'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { UpstreamDashboard, type UpstreamLink } from '@ui/domain/upstream-dashboard'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { useToast } from '@ui/domain/toast'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Mock Data ───────────────────────────────────────────────────────────────

const SIMPLE_LINKS: UpstreamLink[] = [
  { id: '1', vendor: 'Telia Carrier', location: 'Frankfurt', inbound: 12.5e9, outbound: 8.3e9, capacity: 100e9, burstCapacity: 150e9, status: 'ok', trend: [10, 11, 12, 11.5, 12.5] },
  { id: '2', vendor: 'Lumen', location: 'London', inbound: 15.2e9, outbound: 11.8e9, capacity: 100e9, burstCapacity: 200e9, status: 'warning', trend: [12, 13, 14, 15, 15.2] },
  { id: '3', vendor: 'Cogent', location: 'Paris', inbound: 5.6e9, outbound: 3.2e9, capacity: 40e9, burstCapacity: 60e9, status: 'ok', trend: [4, 5, 5.5, 5.6] },
]

const MODERATE_LINKS: UpstreamLink[] = [
  ...SIMPLE_LINKS,
  { id: '4', vendor: 'Telia Carrier', location: 'Amsterdam', inbound: 8.7e9, outbound: 6.1e9, capacity: 100e9, burstCapacity: 150e9, status: 'ok', trend: [8, 7.5, 8, 8.5, 9, 8.7] },
  { id: '5', vendor: 'Lumen', location: 'New York', inbound: 22.1e9, outbound: 18.4e9, capacity: 100e9, burstCapacity: 200e9, status: 'ok', trend: [18, 19, 20, 21, 22] },
  { id: '6', vendor: 'Cogent', location: 'Chicago', inbound: 9.8e9, outbound: 7.1e9, capacity: 40e9, burstCapacity: 80e9, status: 'critical', trend: [6, 7, 8, 9, 9.8] },
]

const COMPLEX_LINKS: UpstreamLink[] = [
  ...MODERATE_LINKS,
  { id: '7', vendor: 'GTT', location: 'Singapore', inbound: 3.4e9, outbound: 2.1e9, capacity: 40e9, burstCapacity: 60e9, status: 'ok', trend: [3, 3.2, 3.4] },
  { id: '8', vendor: 'GTT', location: 'Tokyo', inbound: 4.7e9, outbound: 3.9e9, capacity: 40e9, burstCapacity: 60e9, status: 'ok', trend: [4, 4.2, 4.5, 4.7] },
  { id: '9', vendor: 'Zayo', location: 'Los Angeles', inbound: 18.9e9, outbound: 14.2e9, capacity: 100e9, burstCapacity: 150e9, status: 'warning', trend: [15, 16, 17, 18, 18.9] },
  { id: '10', vendor: 'Zayo', location: 'Dallas', inbound: 7.3e9, outbound: 5.8e9, capacity: 100e9, burstCapacity: 200e9, status: 'ok', trend: [6, 6.5, 7, 7.3] },
]

type DataConfig = 'simple' | 'moderate' | 'complex'

const DATA_CONFIGS: Record<DataConfig, { links: UpstreamLink[]; label: string; desc: string }> = {
  simple: { links: SIMPLE_LINKS, label: '3 links', desc: 'Minimal NOC with 3 transit providers' },
  moderate: { links: MODERATE_LINKS, label: '6 links', desc: 'Mid-size NOC across 3 vendors' },
  complex: { links: COMPLEX_LINKS, label: '10 links', desc: 'Full NOC with 5 vendors, 10 locations' },
}

// ─── Props Data ──────────────────────────────────────────────────────────────

const PROPS: PropDef[] = [
  { name: 'links', type: 'UpstreamLink[]', required: true, description: 'Array of upstream link objects that drive the entire dashboard.' },
  { name: 'title', type: 'ReactNode', default: '\u2014', description: 'Dashboard title rendered as an h2.' },
  { name: 'mode', type: "'hero' | 'compact' | 'table'", default: "'hero'", description: 'Visualization mode. Hero shows aggregated metrics, compact shows dense grid, table shows tabular rows.' },
  { name: 'showSummary', type: 'boolean', default: 'false', description: 'Show aggregated summary card with total inbound/outbound traffic at the top.' },
  { name: 'groupBy', type: "'vendor' | 'location' | 'none'", default: "'none'", description: 'Group upstream links by vendor name or geographic location.' },
  { name: 'lastUpdated', type: 'number | Date', default: '\u2014', description: 'Timestamp shown in the summary footer as relative time (e.g. "5s ago").' },
  { name: 'motion', type: '0 | 1 | 2 | 3', default: '3', description: 'Motion level override. 0 disables all animation.' },
  { name: 'showCapacity', type: 'boolean', default: 'true', description: 'Show committed capacity in hero footer and table columns.' },
  { name: 'showBurstCapacity', type: 'boolean', default: 'false', description: 'Show burstable capacity when available.' },
  { name: 'showUtilization', type: 'boolean', default: 'true', description: 'Show utilization percentage in hero footer and table.' },
  { name: 'utilizationDisplay', type: "'bar' | 'meter' | 'ambient'", default: "'bar'", description: 'How to render utilization. Bar shows a thin progress bar, meter shows an SVG arc gauge, ambient shifts card background.' },
  { name: 'onLinkClick', type: '(link: UpstreamLink) => void', default: '\u2014', description: 'Called when a link card or table row is clicked.' },
  { name: 'onGroupClick', type: '(groupName: string, links: UpstreamLink[]) => void', default: '\u2014', description: 'Called when a group header is clicked.' },
  { name: 'onSummaryClick', type: '() => void', default: '\u2014', description: 'Called when the hero card or summary area is clicked.' },
]

// ─── Constants ──────────────────────────────────────────────────────────────

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { UpstreamDashboard } from '@annondeveloper/ui-kit/lite'",
  standard: "import { UpstreamDashboard } from '@annondeveloper/ui-kit'",
  premium: "import { UpstreamDashboard } from '@annondeveloper/ui-kit/premium'",
}

// ─── Page Styles ─────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.ud-page) {
      :scope {
        max-inline-size: min(1100px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: ud-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .ud-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .ud-page__hero::before {
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
        animation: ud-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes ud-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .ud-page__hero::before { animation: none; }
      }

      .ud-page__title {
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

      .ud-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .ud-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .ud-page__import-code {
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

      .ud-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .ud-page__section {
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
        animation: ud-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes ud-section-reveal {
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
        .ud-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .ud-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .ud-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .ud-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .ud-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .ud-page__preview {
        padding: 1.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: visible;
      }

      .ud-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ──────────────────────────────────── */

      .ud-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @container ud-page (max-width: 720px) {
        .ud-page__playground {
          grid-template-columns: 1fr;
        }
        .ud-page__controls {
          position: static !important;
        }
      }

      .ud-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .ud-page__playground-result {
        overflow-x: auto;
        min-block-size: 200px;
        padding: 1.5rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .ud-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .ud-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .ud-page__controls {
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

      .ud-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .ud-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .ud-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .ud-page__option-btn {
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
      .ud-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .ud-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .ud-page__toggle-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .ud-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .ud-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .ud-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Code tabs ──────────────────────────────────── */

      .ud-page__code-tabs {
        margin-block-start: 1rem;
      }

      .ud-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .ud-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .ud-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .ud-page__tier-card {
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

      .ud-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .ud-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .ud-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .ud-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .ud-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .ud-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .ud-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .ud-page__tier-import {
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

      .ud-page__tier-features {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.6875rem;
        color: var(--text-secondary);
      }

      .ud-page__tier-feature {
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .ud-page__tier-feature-icon {
        color: var(--brand);
        flex-shrink: 0;
      }

      .ud-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .ud-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Modes grid ─────────────────────────────────── */

      .ud-page__modes-grid {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .ud-page__mode-item {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .ud-page__mode-label {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 600;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      /* ── A11y ────────────────────────────────────────── */

      .ud-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .ud-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .ud-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .ud-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Source link ────────────────────────────────── */

      .ud-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .ud-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Scrollbar ─────────────────────────────────── */

      .ud-page__import-code,
      .ud-page code,
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

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .ud-page__hero {
          padding: 2rem 1.25rem;
        }
        .ud-page__title {
          font-size: 1.75rem;
        }
        .ud-page__playground {
          grid-template-columns: 1fr;
        }
        .ud-page__section {
          padding: 1.5rem;
        }
        .ud-page__tiers {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 400px) {
        .ud-page__hero {
          padding: 1.5rem 1rem;
        }
        .ud-page__title {
          font-size: 1.5rem;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }
        .ud-page__title {
          font-size: 4rem;
        }
      }
    }
  }
`

// ─── Helpers ─────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="ud-page__copy-btn"
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
    <div className="ud-page__control-group">
      <span className="ud-page__control-label">{label}</span>
      <div className="ud-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`ud-page__option-btn${opt === value ? ' ud-page__option-btn--active' : ''}`}
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
    <label className="ud-page__toggle-label">
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
  tier: Tier,
  mode: string,
  groupBy: string,
  showSummary: boolean,
  showCapacity: boolean,
  showBurstCapacity: boolean,
  showUtilization: boolean,
  utilizationDisplay: string,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = ['  links={links}']

  if (mode !== 'hero') props.push(`  mode="${mode}"`)
  if (groupBy !== 'none') props.push(`  groupBy="${groupBy}"`)
  if (showSummary) props.push('  showSummary')
  if (!showCapacity) props.push('  showCapacity={false}')
  if (showBurstCapacity) props.push('  showBurstCapacity')
  if (!showUtilization) props.push('  showUtilization={false}')
  if (utilizationDisplay !== 'bar') props.push(`  utilizationDisplay="${utilizationDisplay}"`)
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)
  if (tier === 'premium') {
    props.push('  // Premium: glass morphism cards, aurora glow on status, spring-scale entrance')
  }
  props.push('  onLinkClick={(link) => console.log(link)}')

  return `${importStr}\nimport type { UpstreamLink } from '@annondeveloper/ui-kit'\n\nconst links: UpstreamLink[] = [\n  { id: '1', vendor: 'Telia', location: 'Frankfurt',\n    inbound: 12.5e9, outbound: 8.3e9,\n    capacity: 100e9, status: 'ok', trend: [10, 11, 12] },\n  // ... more links\n]\n\n<UpstreamDashboard\n${props.join('\n')}\n/>`
}

function generateHtmlCode(
  tier: Tier,
  mode: string,
  groupBy: string,
): string {
  const tierLabel = tier === 'lite' ? 'lite' : tier === 'premium' ? 'premium' : 'standard'
  const cssPath = tier === 'lite'
    ? '@annondeveloper/ui-kit/lite/styles.css'
    : '@annondeveloper/ui-kit/css/components/upstream-dashboard.css'

  return `<!-- UpstreamDashboard \u2014 @annondeveloper/ui-kit ${tierLabel} tier -->
<link rel="stylesheet" href="https://unpkg.com/${cssPath}">

<div class="ui-upstream-dashboard" data-mode="${mode}" data-group-by="${groupBy}">
  <div class="ui-upstream-dashboard__summary">
    <h2>Upstream Traffic</h2>
    <div class="ui-upstream-dashboard__metrics">
      <!-- Populate with JS or server-rendered HTML -->
    </div>
  </div>
  <div class="ui-upstream-dashboard__links">
    <!-- Link cards rendered here -->
  </div>
</div>

<script>
  // Populate dashboard from JSON API
  fetch('/api/upstream-links')
    .then(r => r.json())
    .then(links => renderDashboard(links))
</script>`
}

function generateVueCode(
  tier: Tier,
  mode: string,
  groupBy: string,
  showSummary: boolean,
): string {
  if (tier === 'lite') {
    return `<template>
  <div class="ui-upstream-dashboard" data-mode="${mode}" data-group-by="${groupBy}">
    <!-- Lite: CSS-only layout, populate with v-for -->
    <div v-for="link in links" :key="link.id" class="ui-upstream-dashboard__card">
      {{ link.vendor }} - {{ link.location }}
    </div>
  </div>
</template>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const props: string[] = [':links="links"']
  if (mode !== 'hero') props.push(`:mode="'${mode}'"`)
  if (groupBy !== 'none') props.push(`:group-by="'${groupBy}'"`)
  if (showSummary) props.push(':show-summary="true"')

  return `<template>
  <UpstreamDashboard
    ${props.join('\n    ')}
    @link-click="handleLinkClick"
  />
</template>

<script setup>
import { UpstreamDashboard } from '${importPath}'
import { ref } from 'vue'

const links = ref([
  { id: '1', vendor: 'Telia', location: 'Frankfurt',
    inbound: 12.5e9, outbound: 8.3e9, capacity: 100e9, status: 'ok' },
])

function handleLinkClick(link) {
  console.log('Clicked:', link.vendor)
}
</script>`
}

function generateAngularCode(
  tier: Tier,
  mode: string,
  groupBy: string,
): string {
  if (tier === 'lite') {
    return `<!-- Angular \u2014 Lite tier (CSS-only) -->
<div class="ui-upstream-dashboard" data-mode="${mode}" data-group-by="${groupBy}">
  <div *ngFor="let link of links" class="ui-upstream-dashboard__card">
    {{ link.vendor }} - {{ link.location }}
  </div>
</div>

/* In styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular \u2014 ${tier === 'premium' ? 'Premium' : 'Standard'} tier -->
<!-- Use React wrapper or CSS-only approach -->
<div
  class="ui-upstream-dashboard"
  data-mode="${mode}"
  data-group-by="${groupBy}"
>
  <!-- Render links with *ngFor -->
  <div *ngFor="let link of links" class="ui-upstream-dashboard__card"
    [attr.data-status]="link.status">
    {{ link.vendor }} \u2014 {{ link.location }}
  </div>
</div>

/* Import component CSS */
@import '${importPath}/css/components/upstream-dashboard.css';`
}

function generateSvelteCode(
  tier: Tier,
  mode: string,
  groupBy: string,
  showSummary: boolean,
): string {
  if (tier === 'lite') {
    return `<!-- Svelte \u2014 Lite tier (CSS-only) -->
<div class="ui-upstream-dashboard" data-mode="${mode}" data-group-by="${groupBy}">
  {#each links as link (link.id)}
    <div class="ui-upstream-dashboard__card">
      {link.vendor} - {link.location}
    </div>
  {/each}
</div>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const props: string[] = ['{links}']
  if (mode !== 'hero') props.push(`mode="${mode}"`)
  if (groupBy !== 'none') props.push(`groupBy="${groupBy}"`)
  if (showSummary) props.push('showSummary')

  return `<script>
  import { UpstreamDashboard } from '${importPath}';

  let links = [
    { id: '1', vendor: 'Telia', location: 'Frankfurt',
      inbound: 12.5e9, outbound: 8.3e9, capacity: 100e9, status: 'ok' },
  ];

  function handleLinkClick(link) {
    console.log('Clicked:', link.vendor);
  }
</script>

<UpstreamDashboard
  ${props.join('\n  ')}
  on:linkClick={handleLinkClick}
/>`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier

  const [mode, setMode] = useState<'hero' | 'compact' | 'table'>('hero')
  const [groupBy, setGroupBy] = useState<'none' | 'vendor' | 'location'>('none')
  const [dataConfig, setDataConfig] = useState<DataConfig>('moderate')
  const [showSummary, setShowSummary] = useState(false)
  const [showCapacity, setShowCapacity] = useState(true)
  const [showBurstCapacity, setShowBurstCapacity] = useState(false)
  const [showUtilization, setShowUtilization] = useState(true)
  const [utilizationDisplay, setUtilizationDisplay] = useState<'bar' | 'meter' | 'ambient'>('bar')
  const [title, setTitle] = useState('Network Operations Center')
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')

  const toast = useToast()
  const links = DATA_CONFIGS[dataConfig].links

  const handleLinkClick = useCallback((link: UpstreamLink) => {
    toast.toast({ title: 'Link clicked', description: `${link.vendor} ${link.location} (${link.status})` })
  }, [toast])

  const handleGroupClick = useCallback((groupName: string) => {
    toast.toast({ title: 'Group clicked', description: groupName })
  }, [toast])

  const handleSummaryClick = useCallback(() => {
    toast.toast({ title: 'Summary clicked', description: 'Aggregated traffic view' })
  }, [toast])

  const reactCode = useMemo(
    () => generateReactCode(tier, mode, groupBy, showSummary, showCapacity, showBurstCapacity, showUtilization, utilizationDisplay, motion),
    [tier, mode, groupBy, showSummary, showCapacity, showBurstCapacity, showUtilization, utilizationDisplay, motion],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(tier, mode, groupBy),
    [tier, mode, groupBy],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, mode, groupBy, showSummary),
    [tier, mode, groupBy, showSummary],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, mode, groupBy),
    [tier, mode, groupBy],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, mode, groupBy, showSummary),
    [tier, mode, groupBy, showSummary],
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

  // Build tier-specific props
  const dashProps: Record<string, unknown> = {
    links,
    title,
    mode,
    groupBy,
    showSummary,
    showCapacity,
    showBurstCapacity,
    showUtilization,
    utilizationDisplay,
    lastUpdated: Date.now() - 5000,
    onLinkClick: handleLinkClick,
    onGroupClick: handleGroupClick,
    onSummaryClick: handleSummaryClick,
  }

  if (tier !== 'lite') {
    dashProps.motion = motion
  }

  return (
    <section className="ud-page__section" id="playground">
      <h2 className="ud-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="ud-page__section-desc">
        Configure every prop and see the dashboard update in real-time. Generated code updates as you change settings.
      </p>

      <div className="ud-page__playground">
        <div className="ud-page__playground-preview">
          <div className="ud-page__playground-result">
            <UpstreamDashboard {...dashProps as any} />
          </div>

          <div className="ud-page__code-tabs">
            <div className="ud-page__export-row">
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
              {copyStatus && <span className="ud-page__export-status">{copyStatus}</span>}
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

        <div className="ud-page__controls">
          <OptionGroup label="Data" options={['simple', 'moderate', 'complex'] as const} value={dataConfig} onChange={setDataConfig} />
          <OptionGroup label="Mode" options={['hero', 'compact', 'table'] as const} value={mode} onChange={setMode} />
          <OptionGroup label="Group By" options={['none', 'vendor', 'location'] as const} value={groupBy} onChange={setGroupBy} />
          <OptionGroup label="Utilization" options={['bar', 'meter', 'ambient'] as const} value={utilizationDisplay} onChange={setUtilizationDisplay} />

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="ud-page__control-group">
            <span className="ud-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Show Summary" checked={showSummary} onChange={setShowSummary} />
              <Toggle label="Show Capacity" checked={showCapacity} onChange={setShowCapacity} />
              <Toggle label="Burst Capacity" checked={showBurstCapacity} onChange={setShowBurstCapacity} />
              <Toggle label="Utilization" checked={showUtilization} onChange={setShowUtilization} />
            </div>
          </div>

          <div className="ud-page__control-group">
            <span className="ud-page__control-label">Title</span>
            <input
              type="text"
              className="ud-page__text-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Dashboard title..."
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function UpstreamDashboardPage() {
  useStyles('ud-page', pageStyles)

  const { tier, setTier } = useTier()

  // Scroll reveal fallback for browsers without animation-timeline
  useEffect(() => {
    const sections = document.querySelectorAll('.ud-page__section')
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
    <div className="ud-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="ud-page__hero">
        <h1 className="ud-page__title">UpstreamDashboard</h1>
        <p className="ud-page__desc">
          A metrics-dominant NOC dashboard for upstream transit monitoring. Three visualization
          modes (hero, compact, table), nested group cards with utilization bars, capacity markers,
          and burst ceiling indicators. Ships in three weight tiers.
        </p>
        <div className="ud-page__import-row">
          <code className="ud-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Weight Tiers ────────────────────────────── */}
      <section className="ud-page__section" id="tiers">
        <h2 className="ud-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="ud-page__section-desc">
          Choose the right balance of features and bundle size. Lite gives you a static
          dashboard, Standard adds full interactivity, Premium adds cinematic effects.
        </p>

        <div className="ud-page__tiers">
          {/* Lite */}
          <div
            className={`ud-page__tier-card${tier === 'lite' ? ' ud-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="ud-page__tier-header">
              <span className="ud-page__tier-name">Lite</span>
              <span className="ud-page__tier-size">~2 KB</span>
            </div>
            <p className="ud-page__tier-desc">
              Static dashboard with basic metric cards. No interactivity,
              no animations, no click handlers. CSS-only layout.
            </p>
            <div className="ud-page__tier-import">
              {IMPORT_STRINGS.lite}
            </div>
            <ul className="ud-page__tier-features">
              <li className="ud-page__tier-feature">
                <span className="ud-page__tier-feature-icon"><Icon name="check" size={12} /></span>
                3-4 simple metric cards with traffic values
              </li>
              <li className="ud-page__tier-feature">
                <span className="ud-page__tier-feature-icon"><Icon name="check" size={12} /></span>
                Hero/compact/table layout modes
              </li>
              <li className="ud-page__tier-feature">
                <span className="ud-page__tier-feature-icon"><Icon name="check" size={12} /></span>
                Status dot indicators (ok/warning/critical)
              </li>
            </ul>
            <div className="ud-page__size-breakdown">
              <div className="ud-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.0 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>5.7 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`ud-page__tier-card${tier === 'standard' ? ' ud-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="ud-page__tier-header">
              <span className="ud-page__tier-name">Standard</span>
              <span className="ud-page__tier-size">~5 KB</span>
            </div>
            <p className="ud-page__tier-desc">
              Full-featured dashboard with all MetricCards, Sparklines,
              interactive filters, click handlers, and status indicators.
            </p>
            <div className="ud-page__tier-import">
              {IMPORT_STRINGS.standard}
            </div>
            <ul className="ud-page__tier-features">
              <li className="ud-page__tier-feature">
                <span className="ud-page__tier-feature-icon"><Icon name="check" size={12} /></span>
                All metric cards with sparkline trends
              </li>
              <li className="ud-page__tier-feature">
                <span className="ud-page__tier-feature-icon"><Icon name="check" size={12} /></span>
                Interactive filters and click handlers
              </li>
              <li className="ud-page__tier-feature">
                <span className="ud-page__tier-feature-icon"><Icon name="check" size={12} /></span>
                Utilization bars with capacity/burst markers
              </li>
              <li className="ud-page__tier-feature">
                <span className="ud-page__tier-feature-icon"><Icon name="check" size={12} /></span>
                Vendor/location grouping with collapsible headers
              </li>
            </ul>
            <div className="ud-page__size-breakdown">
              <div className="ud-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>5.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>6.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`ud-page__tier-card${tier === 'premium' ? ' ud-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="ud-page__tier-header">
              <span className="ud-page__tier-name">Premium</span>
              <span className="ud-page__tier-size">~7 KB</span>
            </div>
            <p className="ud-page__tier-desc">
              Everything in Standard plus glass morphism cards, aurora glow on status indicators, spring-pulse on status dot, and spring-scale card entrance animation.
            </p>
            <div className="ud-page__tier-import">
              {IMPORT_STRINGS.premium}
            </div>
            <ul className="ud-page__tier-features">
              <li className="ud-page__tier-feature">
                <span className="ud-page__tier-feature-icon"><Icon name="check" size={12} /></span>
                Aurora glow effects on metric cards
              </li>
              <li className="ud-page__tier-feature">
                <span className="ud-page__tier-feature-icon"><Icon name="check" size={12} /></span>
                Spring animations on data value changes
              </li>
              <li className="ud-page__tier-feature">
                <span className="ud-page__tier-feature-icon"><Icon name="check" size={12} /></span>
                Particle burst effects on threshold breaches
              </li>
              <li className="ud-page__tier-feature">
                <span className="ud-page__tier-feature-icon"><Icon name="check" size={12} /></span>
                Ambient glow pulsing on critical status
              </li>
              <li className="ud-page__tier-feature">
                <span className="ud-page__tier-feature-icon"><Icon name="check" size={12} /></span>
                Cinematic entrance/exit transitions
              </li>
            </ul>
            <div className="ud-page__size-breakdown">
              <div className="ud-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>3.8 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.3 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>7.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Three Visualization Modes ──────────────── */}
      <section className="ud-page__section" id="modes">
        <h2 className="ud-page__section-title">
          <a href="#modes">Visualization Modes</a>
        </h2>
        <p className="ud-page__section-desc">
          Hero mode dominates with massive aggregated metrics and a trendline background.
          Compact mode packs dense cards. Table mode shows aggregated metrics at the top
          followed by ultra-dense rows with inline sparklines.
        </p>

        <div className="ud-page__modes-grid">
          <div className="ud-page__mode-item">
            <span className="ud-page__mode-label">Hero Mode (grouped by vendor)</span>
            <div className="ud-page__preview">
              <UpstreamDashboard
                links={MODERATE_LINKS}
                mode="hero"
                groupBy="vendor"
                showCapacity
                showBurstCapacity
                showUtilization
              />
            </div>
          </div>

          <div className="ud-page__mode-item">
            <span className="ud-page__mode-label">Compact Mode</span>
            <div className="ud-page__preview">
              <UpstreamDashboard
                links={MODERATE_LINKS}
                mode="compact"
              />
            </div>
          </div>

          <div className="ud-page__mode-item">
            <span className="ud-page__mode-label">Table Mode</span>
            <div className="ud-page__preview">
              <UpstreamDashboard
                links={MODERATE_LINKS}
                mode="table"
                showCapacity
                showBurstCapacity
                showUtilization
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Grouping Modes ──────────────────────────── */}
      <section className="ud-page__section" id="grouping">
        <h2 className="ud-page__section-title">
          <a href="#grouping">Grouping</a>
        </h2>
        <p className="ud-page__section-desc">
          Group upstream links by vendor or location. Each group header shows
          aggregated traffic and is collapsible. Works across all three modes.
        </p>

        <div className="ud-page__modes-grid">
          <div className="ud-page__mode-item">
            <span className="ud-page__mode-label">Grouped by Vendor</span>
            <div className="ud-page__preview">
              <UpstreamDashboard
                links={MODERATE_LINKS}
                mode="hero"
                groupBy="vendor"
                showCapacity
                showUtilization
              />
            </div>
          </div>

          <div className="ud-page__mode-item">
            <span className="ud-page__mode-label">Grouped by Location</span>
            <div className="ud-page__preview">
              <UpstreamDashboard
                links={MODERATE_LINKS}
                mode="hero"
                groupBy="location"
                showCapacity
                showUtilization
              />
            </div>
          </div>

          <div className="ud-page__mode-item">
            <span className="ud-page__mode-label">No Grouping (flat)</span>
            <div className="ud-page__preview">
              <UpstreamDashboard
                links={SIMPLE_LINKS}
                mode="hero"
                groupBy="none"
                showCapacity
                showUtilization
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Data Format ─────────────────────────────── */}
      <section className="ud-page__section" id="data-format">
        <h2 className="ud-page__section-title">
          <a href="#data-format">Data Format</a>
        </h2>
        <p className="ud-page__section-desc">
          The dashboard is driven by a simple JSON array. Here is the complete
          interface and a sample payload including burstCapacity for burst billing support.
        </p>
        <CopyBlock
          code={`interface UpstreamLink {
  id: string
  vendor: string
  location: string
  inbound: number        // bytes per second
  outbound: number       // bytes per second
  capacity?: number      // committed capacity (bytes/sec)
  burstCapacity?: number // burstable max (bytes/sec)
  status: 'ok' | 'warning' | 'critical' | 'unknown'
  trend?: number[]       // historical data points
}

// Example: 10 Gbps link with 80% inbound utilization
{
  id: 'link-01',
  vendor: 'Telia Carrier',
  location: 'Frankfurt, DE',
  inbound: 1_000_000_000,       // 1 GB/s = 8 Gbps
  outbound: 625_000_000,        // 625 MB/s = 5 Gbps
  capacity: 1_250_000_000,      // 10 Gbps committed
  burstCapacity: 2_500_000_000, // 20 Gbps burst ceiling
  status: 'ok',
  trend: [7.2, 7.5, 7.8, 8.0, 8.1, 7.9, 8.0]
}`}
          language="typescript"
        />
      </section>

      {/* ── 7. Props API ──────────────────────────────── */}
      <section className="ud-page__section" id="props">
        <h2 className="ud-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="ud-page__section-desc">
          All props accepted by UpstreamDashboard. It also spreads any native div
          HTML attributes onto the root element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={PROPS} />
        </Card>
      </section>

      {/* ── 8. Accessibility ──────────────────────────── */}
      <section className="ud-page__section" id="accessibility">
        <h2 className="ud-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="ud-page__section-desc">
          Built for NOC operators who rely on screen readers and keyboard navigation during
          high-pressure incidents.
        </p>
        <Card variant="default" padding="md">
          <ul className="ud-page__a11y-list">
            <li className="ud-page__a11y-item">
              <span className="ud-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Region:</strong> Dashboard root uses <code className="ud-page__a11y-key">role="region"</code> with <code className="ud-page__a11y-key">aria-label</code> from the title prop.
              </span>
            </li>
            <li className="ud-page__a11y-item">
              <span className="ud-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Summary:</strong> Summary card uses <code className="ud-page__a11y-key">role="region"</code> with <code className="ud-page__a11y-key">aria-label="Upstream Traffic Summary"</code>.
              </span>
            </li>
            <li className="ud-page__a11y-item">
              <span className="ud-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Cards:</strong> Each link card uses <code className="ud-page__a11y-key">role="group"</code> with a descriptive <code className="ud-page__a11y-key">aria-label</code>.
              </span>
            </li>
            <li className="ud-page__a11y-item">
              <span className="ud-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Status:</strong> Status dots include <code className="ud-page__a11y-key">role="status"</code> and <code className="ud-page__a11y-key">aria-label</code> announcing current status.
              </span>
            </li>
            <li className="ud-page__a11y-item">
              <span className="ud-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Groups:</strong> Group headers are focusable buttons with <code className="ud-page__a11y-key">aria-expanded</code> for collapse state.
              </span>
            </li>
            <li className="ud-page__a11y-item">
              <span className="ud-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Motion:</strong> Respects <code className="ud-page__a11y-key">prefers-reduced-motion</code> — disables pulse animations and hover transitions.
              </span>
            </li>
            <li className="ud-page__a11y-item">
              <span className="ud-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High Contrast:</strong> Full <code className="ud-page__a11y-key">forced-colors</code> (Windows High Contrast) support with system color tokens.
              </span>
            </li>
            <li className="ud-page__a11y-item">
              <span className="ud-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Decorative:</strong> SVG arrows and sparklines are <code className="ud-page__a11y-key">aria-hidden="true"</code>.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 9. Source ────────────────────────────────── */}
      <section className="ud-page__section" id="source">
        <h2 className="ud-page__section-title">
          <a href="#source">Source</a>
        </h2>
        <a
          className="ud-page__source-link"
          href="https://github.com/annondeveloper/ui-kit/blob/v2/src/domain/upstream-dashboard.tsx"
          target="_blank"
          rel="noopener noreferrer"
        >
          View source on GitHub &rarr;
        </a>
      </section>
    </div>
  )
}
