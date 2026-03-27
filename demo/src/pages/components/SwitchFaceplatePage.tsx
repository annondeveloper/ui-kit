'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { SwitchFaceplate, type SwitchPort } from '@ui/domain/switch-faceplate'
import { SwitchFaceplate as LiteSwitchFaceplate } from '@ui/lite/switch-faceplate'
import { SwitchFaceplate as PremiumSwitchFaceplate } from '@ui/premium/switch-faceplate'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Sample Data ──────────────────────────────────────────────────────────────

function generatePorts(count: number): SwitchPort[] {
  const statuses: SwitchPort['status'][] = ['up', 'up', 'up', 'down', 'up', 'admin-down', 'up', 'unused', 'up', 'up', 'down', 'up']
  const speeds = ['1GbE', '1GbE', '10GbE', '1GbE', '25GbE', '1GbE', '10GbE', '', '1GbE', '1GbE', '10GbE', '1GbE']
  const vlans = [100, 100, 200, 100, 300, 100, 200, undefined, 100, 100, 200, 100]

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    label: i < 2 ? `uplink-${i + 1}` : i === count - 1 ? 'mgmt' : undefined,
    status: statuses[i % statuses.length],
    speed: speeds[i % speeds.length] || undefined,
    type: (i === count - 1 ? 'management' : i >= count - 3 ? 'sfp' : 'ethernet') as SwitchPort['type'],
    vlan: vlans[i % vlans.length],
  }))
}

const MIXED_PORTS: SwitchPort[] = [
  { id: 1, label: 'uplink-1', status: 'up', speed: '10GbE', type: 'sfp', vlan: 100 },
  { id: 2, label: 'uplink-2', status: 'up', speed: '10GbE', type: 'sfp', vlan: 100 },
  { id: 3, status: 'up', speed: '1GbE', type: 'ethernet', vlan: 200 },
  { id: 4, status: 'up', speed: '1GbE', type: 'ethernet', vlan: 200 },
  { id: 5, status: 'down', speed: '1GbE', type: 'ethernet', vlan: 200 },
  { id: 6, status: 'up', speed: '1GbE', type: 'ethernet', vlan: 300 },
  { id: 7, status: 'admin-down', speed: '1GbE', type: 'ethernet' },
  { id: 8, status: 'up', speed: '1GbE', type: 'ethernet', vlan: 300 },
  { id: 9, status: 'unused', type: 'ethernet' },
  { id: 10, status: 'unused', type: 'ethernet' },
  { id: 11, status: 'up', speed: '25GbE', type: 'qsfp', vlan: 400 },
  { id: 12, label: 'mgmt', status: 'up', speed: '1GbE', type: 'management' },
]

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.switch-faceplate-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: switch-faceplate-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .switch-faceplate-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .switch-faceplate-page__hero::before {
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
        animation: sfp-page-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes sfp-page-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .switch-faceplate-page__hero::before { animation: none; }
      }

      .switch-faceplate-page__title {
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

      .switch-faceplate-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .switch-faceplate-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .switch-faceplate-page__import-code {
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

      .switch-faceplate-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .switch-faceplate-page__section {
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
        animation: sfp-page-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes sfp-page-section-reveal {
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
        .switch-faceplate-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .switch-faceplate-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .switch-faceplate-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .switch-faceplate-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .switch-faceplate-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .switch-faceplate-page__preview {
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

      .switch-faceplate-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ─────────────────────────────────── */

      .switch-faceplate-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .switch-faceplate-page__playground {
          grid-template-columns: 1fr;
        }
        .switch-faceplate-page__playground-controls {
          position: static !important;
        }
      }

      @container switch-faceplate-page (max-width: 680px) {
        .switch-faceplate-page__playground {
          grid-template-columns: 1fr;
        }
        .switch-faceplate-page__playground-controls {
          position: static !important;
        }
      }

      .switch-faceplate-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .switch-faceplate-page__playground-result {
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

      .switch-faceplate-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .switch-faceplate-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .switch-faceplate-page__playground-controls {
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

      .switch-faceplate-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .switch-faceplate-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .switch-faceplate-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .switch-faceplate-page__option-btn {
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
      .switch-faceplate-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .switch-faceplate-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .switch-faceplate-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      /* ── Status legend ─────────────────────────────── */

      .switch-faceplate-page__status-legend {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin-block-start: 1rem;
      }

      .switch-faceplate-page__status-item {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
      }

      .switch-faceplate-page__status-dot {
        inline-size: 0.625rem;
        block-size: 0.625rem;
        border-radius: 50%;
        flex-shrink: 0;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .switch-faceplate-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .switch-faceplate-page__tier-card {
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

      .switch-faceplate-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .switch-faceplate-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .switch-faceplate-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .switch-faceplate-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .switch-faceplate-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .switch-faceplate-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .switch-faceplate-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .switch-faceplate-page__tier-import {
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

      .switch-faceplate-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .switch-faceplate-page__code-tabs {
        margin-block-start: 1rem;
      }

      .switch-faceplate-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .switch-faceplate-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .switch-faceplate-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .switch-faceplate-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .switch-faceplate-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .switch-faceplate-page__a11y-key {
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
        .switch-faceplate-page__hero { padding: 2rem 1.25rem; }
        .switch-faceplate-page__title { font-size: 1.75rem; }
        .switch-faceplate-page__preview { padding: 1.75rem; }
        .switch-faceplate-page__playground { grid-template-columns: 1fr; }
        .switch-faceplate-page__playground-result { padding: 2rem; overflow-x: auto;
        min-block-size: 120px; }
        .switch-faceplate-page__tiers { grid-template-columns: 1fr; }
        .switch-faceplate-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .switch-faceplate-page__hero { padding: 1.5rem 1rem; }
        .switch-faceplate-page__title { font-size: 1.5rem; }
        .switch-faceplate-page__preview { padding: 1rem; }
      }

      /* ── Scrollbar ──────────────────────────────── */

      .switch-faceplate-page__import-code,
      .switch-faceplate-page code,
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

const switchFaceplateProps: PropDef[] = [
  { name: 'ports', type: 'SwitchPort[]', description: 'Array of port definitions. Each has id, status, optional label, speed, type, and VLAN.' },
  { name: 'rows', type: 'number', default: '2', description: 'Number of rows to arrange ports in. Ports alternate between rows.' },
  { name: 'label', type: 'string', description: 'Optional switch name/model shown as a header above the ports.' },
  { name: 'showLabels', type: 'boolean', default: 'false', description: 'Show port labels below the grid.' },
  { name: 'onPortClick', type: '(port: SwitchPort) => void', description: 'Click handler for ports. Renders ports as buttons when provided.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls port size and gap spacing.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Controls hover scale and LED blinking.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Size = 'sm' | 'md' | 'lg'

const SIZES: Size[] = ['sm', 'md', 'lg']
const ROW_OPTIONS = ['1', '2', '3'] as const
const PORT_COUNTS = ['8', '12', '24', '48'] as const
const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { SwitchFaceplate } from '@annondeveloper/ui-kit/lite'",
  standard: "import { SwitchFaceplate } from '@annondeveloper/ui-kit'",
  premium: "import { SwitchFaceplate } from '@annondeveloper/ui-kit/premium'",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="switch-faceplate-page__copy-btn"
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
    <div className="switch-faceplate-page__control-group">
      <span className="switch-faceplate-page__control-label">{label}</span>
      <div className="switch-faceplate-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`switch-faceplate-page__option-btn${opt === value ? ' switch-faceplate-page__option-btn--active' : ''}`}
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
    <label className="switch-faceplate-page__toggle-label">
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
  rows: number,
  size: Size,
  showLabels: boolean,
  portCount: number,
): string {
  const importStr = IMPORT_STRINGS[tier]

  const portsDef = `const ports = [
  { id: 1, label: 'uplink-1', status: 'up', speed: '10GbE', type: 'sfp', vlan: 100 },
  { id: 2, label: 'uplink-2', status: 'up', speed: '10GbE', type: 'sfp', vlan: 100 },
  { id: 3, status: 'up', speed: '1GbE', type: 'ethernet', vlan: 200 },
  { id: 4, status: 'down', speed: '1GbE', type: 'ethernet' },
  // ... ${portCount} ports total
]`

  const props: string[] = ['  ports={ports}', '  label="TOR-SW-01"']
  if (rows !== 2) props.push(`  rows={${rows}}`)
  if (size !== 'md') props.push(`  size="${size}"`)
  if (showLabels) props.push('  showLabels')

  return `${importStr}\n\n${portsDef}\n\n<SwitchFaceplate\n${props.join('\n')}\n/>`
}

function generateHtmlCode(tier: Tier, size: Size): string {
  const tierLabel = tier === 'lite' ? 'lite' : tier === 'premium' ? 'premium' : 'standard'
  return `<!-- SwitchFaceplate — @annondeveloper/ui-kit ${tierLabel} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/switch-faceplate.css">

<div class="ui-switch-faceplate" data-size="${size}" role="group"
     aria-label="Network switch faceplate">
  <div class="ui-switch-faceplate__header">TOR-SW-01</div>
  <div class="ui-switch-faceplate__grid">
    <div class="ui-switch-faceplate__row">
      <div class="ui-switch-faceplate__port" data-status="up" data-type="ethernet">1</div>
      <div class="ui-switch-faceplate__port" data-status="down" data-type="ethernet">2</div>
      <!-- More ports... -->
    </div>
  </div>
</div>`
}

function generateVueCode(tier: Tier, rows: number, size: Size, showLabels: boolean): string {
  const importPath = tier === 'lite' ? '@annondeveloper/ui-kit/lite' : tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = [':ports="ports"', 'label="TOR-SW-01"']
  if (rows !== 2) attrs.push(`:rows="${rows}"`)
  if (size !== 'md') attrs.push(`size="${size}"`)
  if (showLabels) attrs.push('show-labels')

  return `<template>
  <SwitchFaceplate
    ${attrs.join('\n    ')}
  />
</template>

<script setup>
import { SwitchFaceplate } from '${importPath}'

const ports = [
  { id: 1, label: 'uplink-1', status: 'up', speed: '10GbE', type: 'sfp' },
  { id: 2, status: 'down', speed: '1GbE', type: 'ethernet' },
  { id: 3, status: 'up', speed: '1GbE', type: 'ethernet' },
]
</script>`
}

function generateAngularCode(tier: Tier, size: Size): string {
  const importPath = tier === 'lite' ? '@annondeveloper/ui-kit/lite' : tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular — ${tier} tier -->
<div class="ui-switch-faceplate" data-size="${size}" role="group"
     aria-label="Network switch faceplate">
  <div class="ui-switch-faceplate__header">TOR-SW-01</div>
  <div class="ui-switch-faceplate__grid">
    <div class="ui-switch-faceplate__row" *ngFor="let row of portRows">
      <div *ngFor="let port of row"
           class="ui-switch-faceplate__port"
           [attr.data-status]="port.status"
           [attr.data-type]="port.type">
        {{ port.id }}
      </div>
    </div>
  </div>
</div>

/* Import component CSS */
@import '${importPath}/css/components/switch-faceplate.css';`
}

function generateSvelteCode(tier: Tier, rows: number, size: Size, showLabels: boolean): string {
  const importPath = tier === 'lite' ? '@annondeveloper/ui-kit/lite' : tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs = ['{ports}', 'label="TOR-SW-01"']
  if (rows !== 2) attrs.push(`rows={${rows}}`)
  if (size !== 'md') attrs.push(`size="${size}"`)
  if (showLabels) attrs.push('showLabels')

  return `<script>
  import { SwitchFaceplate } from '${importPath}';

  const ports = [
    { id: 1, label: 'uplink-1', status: 'up', speed: '10GbE', type: 'sfp' },
    { id: 2, status: 'down', speed: '1GbE', type: 'ethernet' },
    { id: 3, status: 'up', speed: '1GbE', type: 'ethernet' },
  ];
</script>

<SwitchFaceplate
  ${attrs.join('\n  ')}
/>`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [rows, setRows] = useState(2)
  const [size, setSize] = useState<Size>('md')
  const [showLabels, setShowLabels] = useState(false)
  const [portCount, setPortCount] = useState(24)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')

  const ports = useMemo(() => generatePorts(portCount), [portCount])

  const SwitchComponent = tier === 'lite'
    ? (props: any) => <LiteSwitchFaceplate {...props} />
    : tier === 'premium'
    ? PremiumSwitchFaceplate
    : SwitchFaceplate

  const reactCode = useMemo(
    () => generateReactCode(tier, rows, size, showLabels, portCount),
    [tier, rows, size, showLabels, portCount],
  )

  const htmlCode = useMemo(() => generateHtmlCode(tier, size), [tier, size])
  const vueCode = useMemo(() => generateVueCode(tier, rows, size, showLabels), [tier, rows, size, showLabels])
  const angularCode = useMemo(() => generateAngularCode(tier, size), [tier, size])
  const svelteCode = useMemo(() => generateSvelteCode(tier, rows, size, showLabels), [tier, rows, size, showLabels])

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

  const previewProps: Record<string, unknown> = {
    ports,
    rows,
    size,
    label: 'TOR-SW-01',
    showLabels,
  }
  if (tier !== 'lite') {
    previewProps.motion = motion
  }

  return (
    <section className="switch-faceplate-page__section" id="playground">
      <h2 className="switch-faceplate-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="switch-faceplate-page__section-desc">
        Configure the switch faceplate in real-time. Adjust port count, row layout, and size to match your hardware.
      </p>

      <div className="switch-faceplate-page__playground">
        <div className="switch-faceplate-page__playground-preview">
          <div className="switch-faceplate-page__playground-result">
            <SwitchComponent {...previewProps} />
          </div>

          <div className="switch-faceplate-page__code-tabs">
            <div className="switch-faceplate-page__export-row">
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
              {copyStatus && <span className="switch-faceplate-page__export-status">{copyStatus}</span>}
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

        <div className="switch-faceplate-page__playground-controls">
          <OptionGroup label="Port Count" options={PORT_COUNTS} value={String(portCount) as typeof PORT_COUNTS[number]} onChange={v => setPortCount(Number(v))} />
          <OptionGroup label="Rows" options={ROW_OPTIONS} value={String(rows) as typeof ROW_OPTIONS[number]} onChange={v => setRows(Number(v))} />
          <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="switch-faceplate-page__control-group">
            <span className="switch-faceplate-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Show labels" checked={showLabels} onChange={setShowLabels} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SwitchFaceplatePage() {
  useStyles('switch-faceplate-page', pageStyles)

  const { tier, setTier } = useTier()

  // Scroll reveal for sections — JS fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.switch-faceplate-page__section')
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

  const SwitchComponent = tier === 'lite'
    ? (props: any) => <LiteSwitchFaceplate {...props} />
    : tier === 'premium'
    ? PremiumSwitchFaceplate
    : SwitchFaceplate

  const smallPorts: SwitchPort[] = [
    { id: 1, status: 'up', type: 'sfp', speed: '10GbE' },
    { id: 2, status: 'up', type: 'sfp', speed: '10GbE' },
    { id: 3, status: 'up', type: 'ethernet', speed: '1GbE' },
    { id: 4, status: 'down', type: 'ethernet', speed: '1GbE' },
    { id: 5, status: 'up', type: 'ethernet', speed: '1GbE' },
    { id: 6, status: 'admin-down', type: 'ethernet' },
    { id: 7, status: 'unused', type: 'ethernet' },
    { id: 8, label: 'mgmt', status: 'up', type: 'management', speed: '1GbE' },
  ]

  return (
    <div className="switch-faceplate-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="switch-faceplate-page__hero">
        <h1 className="switch-faceplate-page__title">SwitchFaceplate</h1>
        <p className="switch-faceplate-page__desc">
          Network switch port visualization with status indicators, port type differentiation,
          hover tooltips, and activity LEDs. Shows mixed port types across configurable row layouts.
        </p>
        <div className="switch-faceplate-page__import-row">
          <code className="switch-faceplate-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Port Statuses ───────────────────────────── */}
      <section className="switch-faceplate-page__section" id="statuses">
        <h2 className="switch-faceplate-page__section-title">
          <a href="#statuses">Port Statuses</a>
        </h2>
        <p className="switch-faceplate-page__section-desc">
          Four port statuses with distinct color coding. Active ports show a blinking LED indicator.
          Hover over ports to see detailed tooltips with speed, VLAN, and type information.
        </p>
        <div className="switch-faceplate-page__preview">
          <SwitchComponent
            ports={[
              { id: 1, label: 'Port Up', status: 'up', speed: '1GbE', type: 'ethernet', vlan: 100 },
              { id: 2, label: 'Port Down', status: 'down', speed: '1GbE', type: 'ethernet' },
              { id: 3, label: 'Admin Down', status: 'admin-down', speed: '1GbE', type: 'ethernet' },
              { id: 4, label: 'Unused', status: 'unused', type: 'ethernet' },
            ]}
            rows={1}
            size="lg"
            showLabels
          />
        </div>
        <div className="switch-faceplate-page__status-legend">
          <div className="switch-faceplate-page__status-item">
            <span className="switch-faceplate-page__status-dot" style={{ background: 'oklch(72% 0.19 155)' }} />
            Up (active)
          </div>
          <div className="switch-faceplate-page__status-item">
            <span className="switch-faceplate-page__status-dot" style={{ background: 'oklch(62% 0.22 25)' }} />
            Down (error)
          </div>
          <div className="switch-faceplate-page__status-item">
            <span className="switch-faceplate-page__status-dot" style={{ background: 'oklch(80% 0.18 85)' }} />
            Admin-down (disabled)
          </div>
          <div className="switch-faceplate-page__status-item">
            <span className="switch-faceplate-page__status-dot" style={{ background: 'oklch(50% 0 0)' }} />
            Unused (empty)
          </div>
        </div>
      </section>

      {/* ── 4. Port Types ──────────────────────────────── */}
      <section className="switch-faceplate-page__section" id="port-types">
        <h2 className="switch-faceplate-page__section-title">
          <a href="#port-types">Port Types</a>
        </h2>
        <p className="switch-faceplate-page__section-desc">
          Four port types with distinct visual shapes: ethernet (rounded), SFP (square),
          QSFP (wide), and management (circle). Mix them freely in the same faceplate.
        </p>
        <div className="switch-faceplate-page__preview">
          <SwitchComponent ports={MIXED_PORTS} rows={2} size="lg" label="MX960-01" />
        </div>
      </section>

      {/* ── 5. Sizes ──────────────────────────────────────── */}
      <section className="switch-faceplate-page__section" id="sizes">
        <h2 className="switch-faceplate-page__section-title">
          <a href="#sizes">Size Scale</a>
        </h2>
        <p className="switch-faceplate-page__section-desc">
          Three sizes control port dimensions and gap spacing. Use sm for dense NOC dashboards,
          md for standard views, and lg for detailed port inspection.
        </p>
        <div className="switch-faceplate-page__preview" style={{ gap: '2rem', alignItems: 'flex-start' }}>
          {SIZES.map(s => (
            <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <SwitchComponent ports={smallPorts} rows={2} size={s} label={`Size: ${s}`} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>{s}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. Row Layouts ────────────────────────────── */}
      <section className="switch-faceplate-page__section" id="rows">
        <h2 className="switch-faceplate-page__section-title">
          <a href="#rows">Row Layouts</a>
        </h2>
        <p className="switch-faceplate-page__section-desc">
          Ports can be arranged in 1, 2, or 3 rows. Ports alternate between rows (odd ports in row 1, even in row 2, etc.).
        </p>
        <div className="switch-faceplate-page__preview" style={{ gap: '2rem', flexDirection: 'column' }}>
          {[1, 2, 3].map(r => (
            <div key={r} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <SwitchComponent
                ports={smallPorts}
                rows={r}
                label={`${r} row${r > 1 ? 's' : ''}`}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className="switch-faceplate-page__section" id="tiers">
        <h2 className="switch-faceplate-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="switch-faceplate-page__section-desc">
          Choose between three weight tiers. Lite is inline-style static rendering, Standard adds hover tooltips
          and LED animation, Premium adds status glow, spring-pulse entry, and breathing effects for down ports.
        </p>

        <div className="switch-faceplate-page__tiers">
          {/* Lite */}
          <div
            className={`switch-faceplate-page__tier-card${tier === 'lite' ? ' switch-faceplate-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="switch-faceplate-page__tier-header">
              <span className="switch-faceplate-page__tier-name">Lite</span>
              <span className="switch-faceplate-page__tier-size">~0.6 KB</span>
            </div>
            <p className="switch-faceplate-page__tier-desc">
              Inline-style rendering. No animation, no tooltips, no hover effects. Static port grid with status colors.
            </p>
            <div className="switch-faceplate-page__tier-import">
              import {'{'} SwitchFaceplate {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="switch-faceplate-page__tier-preview">
              <LiteSwitchFaceplate
                ports={smallPorts.slice(0, 6)}
                rows={2}
                label="Lite"
              />
            </div>
          </div>

          {/* Standard */}
          <div
            className={`switch-faceplate-page__tier-card${tier === 'standard' ? ' switch-faceplate-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="switch-faceplate-page__tier-header">
              <span className="switch-faceplate-page__tier-name">Standard</span>
              <span className="switch-faceplate-page__tier-size">~3 KB</span>
            </div>
            <p className="switch-faceplate-page__tier-desc">
              Full-featured with hover tooltips, activity LEDs, port type shapes, hover scale,
              motion levels, and clickable port buttons.
            </p>
            <div className="switch-faceplate-page__tier-import">
              import {'{'} SwitchFaceplate {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="switch-faceplate-page__tier-preview">
              <SwitchFaceplate
                ports={smallPorts.slice(0, 6)}
                rows={2}
                size="sm"
                label="Standard"
              />
            </div>
          </div>

          {/* Premium */}
          <div
            className={`switch-faceplate-page__tier-card${tier === 'premium' ? ' switch-faceplate-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="switch-faceplate-page__tier-header">
              <span className="switch-faceplate-page__tier-name">Premium</span>
              <span className="switch-faceplate-page__tier-size">~4 KB</span>
            </div>
            <p className="switch-faceplate-page__tier-desc">
              Everything in Standard plus aurora glow per status, spring-pulse entry animation,
              breathing effect for down ports, enhanced LED glow, and frosted tooltip.
            </p>
            <div className="switch-faceplate-page__tier-import">
              import {'{'} SwitchFaceplate {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="switch-faceplate-page__tier-preview">
              <PremiumSwitchFaceplate
                ports={smallPorts.slice(0, 6)}
                rows={2}
                size="sm"
                label="Premium"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Props API ───────────────────────────────── */}
      <section className="switch-faceplate-page__section" id="props">
        <h2 className="switch-faceplate-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="switch-faceplate-page__section-desc">
          All props accepted by SwitchFaceplate. It also spreads any native div HTML attributes
          onto the underlying container element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={switchFaceplateProps} />
        </Card>
      </section>

      {/* ── 9. Accessibility ──────────────────────────── */}
      <section className="switch-faceplate-page__section" id="accessibility">
        <h2 className="switch-faceplate-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="switch-faceplate-page__section-desc">
          Built with semantic markup, ARIA attributes, and keyboard support.
        </p>
        <Card variant="default" padding="md">
          <ul className="switch-faceplate-page__a11y-list">
            <li className="switch-faceplate-page__a11y-item">
              <span className="switch-faceplate-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Role:</strong> Uses <code className="switch-faceplate-page__a11y-key">role="group"</code> with descriptive aria-label including switch name.
              </span>
            </li>
            <li className="switch-faceplate-page__a11y-item">
              <span className="switch-faceplate-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> When onPortClick is provided, ports render as {'<button>'} elements with <code className="switch-faceplate-page__a11y-key">focus-visible</code> outline.
              </span>
            </li>
            <li className="switch-faceplate-page__a11y-item">
              <span className="switch-faceplate-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Labels:</strong> Each port button has a descriptive aria-label including port number, label, status, and speed.
              </span>
            </li>
            <li className="switch-faceplate-page__a11y-item">
              <span className="switch-faceplate-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Motion:</strong> Respects <code className="switch-faceplate-page__a11y-key">prefers-reduced-motion</code> — disables LED blink, hover scale, and entry animations.
              </span>
            </li>
            <li className="switch-faceplate-page__a11y-item">
              <span className="switch-faceplate-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="switch-faceplate-page__a11y-key">forced-colors: active</code> with ButtonText borders and LinkText for down ports.
              </span>
            </li>
            <li className="switch-faceplate-page__a11y-item">
              <span className="switch-faceplate-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Status colors:</strong> Uses four distinct OKLCH hues (green/red/amber/muted) for maximum differentiation.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
