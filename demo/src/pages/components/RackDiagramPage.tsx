'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { RackDiagram, type RackDevice } from '@ui/domain/rack-diagram'
import { RackDiagram as LiteRackDiagram } from '@ui/lite/rack-diagram'
import { RackDiagram as PremiumRackDiagram } from '@ui/premium/rack-diagram'
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
    @scope (.rack-diagram-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: rack-diagram-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .rack-diagram-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .rack-diagram-page__hero::before {
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
        animation: rack-diagram-page-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes rack-diagram-page-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .rack-diagram-page__hero::before { animation: none; }
      }

      .rack-diagram-page__title {
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

      .rack-diagram-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .rack-diagram-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .rack-diagram-page__import-code {
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

      .rack-diagram-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .rack-diagram-page__section {
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
        animation: rack-diagram-page-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes rack-diagram-page-section-reveal {
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
        .rack-diagram-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .rack-diagram-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .rack-diagram-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .rack-diagram-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .rack-diagram-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .rack-diagram-page__preview {
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

      .rack-diagram-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ─────────────────────────────────── */

      .rack-diagram-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .rack-diagram-page__playground {
          grid-template-columns: 1fr;
        }
        .rack-diagram-page__playground-controls {
          position: static !important;
        }
      }

      @container rack-diagram-page (max-width: 680px) {
        .rack-diagram-page__playground {
          grid-template-columns: 1fr;
        }
        .rack-diagram-page__playground-controls {
          position: static !important;
        }
      }

      .rack-diagram-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .rack-diagram-page__playground-result {
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

      .rack-diagram-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .rack-diagram-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .rack-diagram-page__playground-controls {
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

      .rack-diagram-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .rack-diagram-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .rack-diagram-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .rack-diagram-page__option-btn {
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
      .rack-diagram-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .rack-diagram-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .rack-diagram-page__toggle-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .rack-diagram-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .rack-diagram-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .rack-diagram-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .rack-diagram-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .rack-diagram-page__tier-card {
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

      .rack-diagram-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .rack-diagram-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .rack-diagram-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .rack-diagram-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .rack-diagram-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .rack-diagram-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .rack-diagram-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .rack-diagram-page__tier-import {
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

      .rack-diagram-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .rack-diagram-page__code-tabs {
        margin-block-start: 1rem;
      }

      .rack-diagram-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .rack-diagram-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .rack-diagram-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .rack-diagram-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .rack-diagram-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .rack-diagram-page__a11y-key {
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
        .rack-diagram-page__hero { padding: 2rem 1.25rem; }
        .rack-diagram-page__title { font-size: 1.75rem; }
        .rack-diagram-page__preview { padding: 1.75rem; }
        .rack-diagram-page__playground { grid-template-columns: 1fr; }
        .rack-diagram-page__playground-result { padding: 2rem; overflow-x: auto;
        min-block-size: 120px; }
        .rack-diagram-page__tiers { grid-template-columns: 1fr; }
        .rack-diagram-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .rack-diagram-page__hero { padding: 1.5rem 1rem; }
        .rack-diagram-page__title { font-size: 1.5rem; }
        .rack-diagram-page__preview { padding: 1rem; }
      }

      /* ── Scrollbar ──────────────────────────────── */

      .rack-diagram-page__import-code,
      .rack-diagram-page code,
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

const rackDiagramProps: PropDef[] = [
  { name: 'units', type: 'number', description: 'Total rack units (U) to display. Standard racks are 42U.' },
  { name: 'devices', type: 'RackDevice[]', description: 'Array of devices to render. Each has startU, heightU, label, and optional status.' },
  { name: 'showUnitNumbers', type: 'boolean', default: 'true', description: 'Show unit numbers on the left side of the rack.' },
  { name: 'orientation', type: "'front' | 'rear'", default: "'front'", description: 'Rack viewing orientation. Front shows high U at top.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls rack width and unit height.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Cascades from OS > prop > CSS --motion > UIProvider.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Size = 'sm' | 'md' | 'lg'
type Orientation = 'front' | 'rear'

const SIZES: Size[] = ['sm', 'md', 'lg']
const ORIENTATIONS: Orientation[] = ['front', 'rear']
const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { RackDiagram } from '@annondeveloper/ui-kit/lite'",
  standard: "import { RackDiagram } from '@annondeveloper/ui-kit'",
  premium: "import { RackDiagram } from '@annondeveloper/ui-kit/premium'",
}

const SAMPLE_DEVICES: RackDevice[] = [
  { startU: 1, heightU: 1, label: 'Patch Panel', status: 'ok' },
  { startU: 2, heightU: 1, label: 'TOR Switch', status: 'ok' },
  { startU: 3, heightU: 1, label: 'Firewall', status: 'warning' },
  { startU: 5, heightU: 2, label: 'Server 1', status: 'ok' },
  { startU: 7, heightU: 2, label: 'Server 2', status: 'ok' },
  { startU: 9, heightU: 2, label: 'Server 3', status: 'critical' },
  { startU: 11, heightU: 4, label: 'Storage Array', status: 'ok' },
  { startU: 15, heightU: 1, label: 'KVM', status: 'ok' },
  { startU: 16, heightU: 2, label: 'UPS', status: 'warning' },
  { startU: 20, heightU: 1, label: 'PDU', status: 'ok' },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="rack-diagram-page__copy-btn"
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
    <div className="rack-diagram-page__control-group">
      <span className="rack-diagram-page__control-label">{label}</span>
      <div className="rack-diagram-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`rack-diagram-page__option-btn${opt === value ? ' rack-diagram-page__option-btn--active' : ''}`}
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
    <label className="rack-diagram-page__toggle-label">
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
  units: number,
  orientation: Orientation,
  showUnitNumbers: boolean,
  size: Size,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]

  const props: string[] = [`  units={${units}}`]
  props.push('  devices={devices}')
  if (orientation !== 'front') props.push(`  orientation="${orientation}"`)
  if (!showUnitNumbers) props.push('  showUnitNumbers={false}')
  if (size !== 'md') props.push(`  size="${size}"`)
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  const devicesDef = `const devices = [
  { startU: 1, heightU: 1, label: 'Patch Panel', status: 'ok' },
  { startU: 2, heightU: 1, label: 'TOR Switch', status: 'ok' },
  { startU: 5, heightU: 2, label: 'Server 1', status: 'ok' },
  { startU: 9, heightU: 2, label: 'Server 3', status: 'critical' },
  { startU: 11, heightU: 4, label: 'Storage Array', status: 'ok' },
]`

  return `${importStr}\n\n${devicesDef}\n\n<RackDiagram\n${props.join('\n')}\n/>`
}

function generateHtmlCode(tier: Tier, units: number, size: Size): string {
  const tierLabel = tier === 'lite' ? 'lite' : tier === 'premium' ? 'premium' : 'standard'
  return `<!-- RackDiagram — @annondeveloper/ui-kit ${tierLabel} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/rack-diagram.css">

<!-- RackDiagram is a complex interactive component. -->
<!-- For HTML-only usage, import the CSS and render server-side. -->
<div class="ui-rack-diagram" data-size="${size}" role="img"
     aria-label="Rack diagram: ${units}U">
  <!-- Render unit numbers and device slots server-side -->
</div>`
}

function generateVueCode(tier: Tier, units: number, orientation: Orientation, showUnitNumbers: boolean, size: Size): string {
  if (tier === 'lite') {
    return `<template>
  <RackDiagram
    :units="${units}"
    :devices="devices"
    ${!showUnitNumbers ? ':show-unit-numbers="false"\n    ' : ''}/>
</template>

<script setup>
import { RackDiagram } from '@annondeveloper/ui-kit/lite'

const devices = [
  { startU: 1, heightU: 1, label: 'Patch Panel', status: 'ok' },
  { startU: 5, heightU: 2, label: 'Server 1', status: 'ok' },
]
</script>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = [`:units="${units}"`, ':devices="devices"']
  if (orientation !== 'front') attrs.push(`orientation="${orientation}"`)
  if (!showUnitNumbers) attrs.push(':show-unit-numbers="false"')
  if (size !== 'md') attrs.push(`size="${size}"`)

  return `<template>
  <RackDiagram
    ${attrs.join('\n    ')}
  />
</template>

<script setup>
import { RackDiagram } from '${importPath}'

const devices = [
  { startU: 1, heightU: 1, label: 'Patch Panel', status: 'ok' },
  { startU: 5, heightU: 2, label: 'Server 1', status: 'ok' },
]
</script>`
}

function generateAngularCode(tier: Tier, units: number, size: Size): string {
  const importPath = tier === 'lite' ? '@annondeveloper/ui-kit/lite' : tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular — ${tier} tier -->
<!-- Use the React wrapper or render server-side with CSS -->
<div class="ui-rack-diagram" data-size="${size}" role="img"
     [attr.aria-label]="'Rack: ' + ${units} + 'U'">
  <!-- Server-side render or use React integration -->
</div>

/* Import component CSS */
@import '${importPath}/css/components/rack-diagram.css';`
}

function generateSvelteCode(tier: Tier, units: number, orientation: Orientation, showUnitNumbers: boolean, size: Size): string {
  if (tier === 'lite') {
    return `<script>
  import { RackDiagram } from '@annondeveloper/ui-kit/lite';

  const devices = [
    { startU: 1, heightU: 1, label: 'Patch Panel', status: 'ok' },
    { startU: 5, heightU: 2, label: 'Server 1', status: 'ok' },
  ];
</script>

<RackDiagram units={${units}} {devices} ${!showUnitNumbers ? 'showUnitNumbers={false} ' : ''}/>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs = [`units={${units}}`, '{devices}']
  if (orientation !== 'front') attrs.push(`orientation="${orientation}"`)
  if (!showUnitNumbers) attrs.push('showUnitNumbers={false}')
  if (size !== 'md') attrs.push(`size="${size}"`)

  return `<script>
  import { RackDiagram } from '${importPath}';

  const devices = [
    { startU: 1, heightU: 1, label: 'Patch Panel', status: 'ok' },
    { startU: 5, heightU: 2, label: 'Server 1', status: 'ok' },
  ];
</script>

<RackDiagram
  ${attrs.join('\n  ')}
/>`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [units, setUnits] = useState(20)
  const [orientation, setOrientation] = useState<Orientation>('front')
  const [showUnitNumbers, setShowUnitNumbers] = useState(true)
  const [size, setSize] = useState<Size>('md')
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')

  const RackComponent = tier === 'lite'
    ? (props: any) => <LiteRackDiagram {...props} />
    : tier === 'premium'
    ? PremiumRackDiagram
    : RackDiagram

  const devices = useMemo(() => SAMPLE_DEVICES.filter(d => d.startU + d.heightU - 1 <= units), [units])

  const reactCode = useMemo(
    () => generateReactCode(tier, units, orientation, showUnitNumbers, size, motion),
    [tier, units, orientation, showUnitNumbers, size, motion],
  )

  const htmlCode = useMemo(() => generateHtmlCode(tier, units, size), [tier, units, size])
  const vueCode = useMemo(() => generateVueCode(tier, units, orientation, showUnitNumbers, size), [tier, units, orientation, showUnitNumbers, size])
  const angularCode = useMemo(() => generateAngularCode(tier, units, size), [tier, units, size])
  const svelteCode = useMemo(() => generateSvelteCode(tier, units, orientation, showUnitNumbers, size), [tier, units, orientation, showUnitNumbers, size])

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
    units,
    devices,
    showUnitNumbers,
    orientation,
    size,
  }
  if (tier !== 'lite') {
    previewProps.motion = motion
  }

  return (
    <section className="rack-diagram-page__section" id="playground">
      <h2 className="rack-diagram-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="rack-diagram-page__section-desc">
        Configure the rack diagram in real-time. Adjust unit count, orientation, and size to see how it adapts.
      </p>

      <div className="rack-diagram-page__playground">
        <div className="rack-diagram-page__playground-preview">
          <div className="rack-diagram-page__playground-result">
            <RackComponent {...previewProps} />
          </div>

          <div className="rack-diagram-page__code-tabs">
            <div className="rack-diagram-page__export-row">
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
              {copyStatus && <span className="rack-diagram-page__export-status">{copyStatus}</span>}
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

        <div className="rack-diagram-page__playground-controls">
          <div className="rack-diagram-page__control-group">
            <span className="rack-diagram-page__control-label">Units (U)</span>
            <input
              type="range"
              min={10}
              max={48}
              value={units}
              onChange={e => setUnits(Number(e.target.value))}
              style={{ accentColor: 'var(--brand)' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{units}U</span>
          </div>

          <OptionGroup label="Orientation" options={ORIENTATIONS} value={orientation} onChange={setOrientation} />
          <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="rack-diagram-page__control-group">
            <span className="rack-diagram-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Unit numbers" checked={showUnitNumbers} onChange={setShowUnitNumbers} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RackDiagramPage() {
  useStyles('rack-diagram-page', pageStyles)

  const { tier, setTier } = useTier()

  // Scroll reveal for sections — JS fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.rack-diagram-page__section')
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

  const RackComponent = tier === 'lite'
    ? (props: any) => <LiteRackDiagram {...props} />
    : tier === 'premium'
    ? PremiumRackDiagram
    : RackDiagram

  return (
    <div className="rack-diagram-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="rack-diagram-page__hero">
        <h1 className="rack-diagram-page__title">RackDiagram</h1>
        <p className="rack-diagram-page__desc">
          Visual representation of server rack hardware. Displays devices at specific U positions
          with status indicators, tooltips, and front/rear orientation. Ships in three weight tiers.
        </p>
        <div className="rack-diagram-page__import-row">
          <code className="rack-diagram-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Device Statuses ──────────────────────────── */}
      <section className="rack-diagram-page__section" id="statuses">
        <h2 className="rack-diagram-page__section-title">
          <a href="#statuses">Device Statuses</a>
        </h2>
        <p className="rack-diagram-page__section-desc">
          Devices support four status values that control color coding: ok (green), warning (amber),
          critical (red), and empty (muted). Hover over devices to see tooltips with details.
        </p>
        <div className="rack-diagram-page__preview">
          <RackComponent
            units={12}
            size="lg"
            devices={[
              { startU: 1, heightU: 2, label: 'Healthy Server', status: 'ok' },
              { startU: 4, heightU: 2, label: 'High Temp', status: 'warning' },
              { startU: 7, heightU: 2, label: 'Disk Failure', status: 'critical' },
              { startU: 10, heightU: 2, label: 'Empty Slot', status: 'empty' },
            ]}
          />
        </div>
      </section>

      {/* ── 4. Orientations ──────────────────────────────── */}
      <section className="rack-diagram-page__section" id="orientations">
        <h2 className="rack-diagram-page__section-title">
          <a href="#orientations">Front vs. Rear</a>
        </h2>
        <p className="rack-diagram-page__section-desc">
          Toggle between front and rear views. Front shows high U numbers at the top (standard),
          rear inverts the ordering for cable management views.
        </p>
        <div className="rack-diagram-page__preview" style={{ gap: '3rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <RackComponent
              units={12}
              orientation="front"
              devices={[
                { startU: 1, heightU: 1, label: 'Switch', status: 'ok' },
                { startU: 3, heightU: 2, label: 'Server A', status: 'ok' },
                { startU: 6, heightU: 4, label: 'Storage', status: 'warning' },
              ]}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Front</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <RackComponent
              units={12}
              orientation="rear"
              devices={[
                { startU: 1, heightU: 1, label: 'Switch', status: 'ok' },
                { startU: 3, heightU: 2, label: 'Server A', status: 'ok' },
                { startU: 6, heightU: 4, label: 'Storage', status: 'warning' },
              ]}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Rear</span>
          </div>
        </div>
      </section>

      {/* ── 5. Sizes ──────────────────────────────────────── */}
      <section className="rack-diagram-page__section" id="sizes">
        <h2 className="rack-diagram-page__section-title">
          <a href="#sizes">Size Scale</a>
        </h2>
        <p className="rack-diagram-page__section-desc">
          Three sizes control rack width and unit height. Use sm for dense dashboards,
          md for standard views, and lg for detailed inspection.
        </p>
        <div className="rack-diagram-page__preview" style={{ gap: '2rem', alignItems: 'flex-start' }}>
          {SIZES.map(s => (
            <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <RackComponent
                units={8}
                size={s}
                devices={[
                  { startU: 1, heightU: 1, label: 'SW', status: 'ok' },
                  { startU: 3, heightU: 2, label: 'SRV', status: 'ok' },
                  { startU: 6, heightU: 2, label: 'NAS', status: 'warning' },
                ]}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>{s}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. Weight Tiers ────────────────────────────── */}
      <section className="rack-diagram-page__section" id="tiers">
        <h2 className="rack-diagram-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="rack-diagram-page__section-desc">
          Choose the right balance of features and bundle size. Lite has no animation or tooltips,
          Standard adds motion and hover tooltips, Premium adds glow effects and staggered entry animation.
        </p>

        <div className="rack-diagram-page__tiers">
          {/* Lite */}
          <div
            className={`rack-diagram-page__tier-card${tier === 'lite' ? ' rack-diagram-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="rack-diagram-page__tier-header">
              <span className="rack-diagram-page__tier-name">Lite</span>
              <span className="rack-diagram-page__tier-size">~0.5 KB</span>
            </div>
            <p className="rack-diagram-page__tier-desc">
              Inline-style rendering. No animation, no tooltips, no hover effects. Static rack visualization.
            </p>
            <div className="rack-diagram-page__tier-import">
              import {'{'} RackDiagram {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="rack-diagram-page__tier-preview">
              <LiteRackDiagram
                units={6}
                devices={[
                  { startU: 1, heightU: 1, label: 'SW', status: 'ok' },
                  { startU: 3, heightU: 2, label: 'SRV', status: 'critical' },
                ]}
              />
            </div>
          </div>

          {/* Standard */}
          <div
            className={`rack-diagram-page__tier-card${tier === 'standard' ? ' rack-diagram-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="rack-diagram-page__tier-header">
              <span className="rack-diagram-page__tier-name">Standard</span>
              <span className="rack-diagram-page__tier-size">~2.5 KB</span>
            </div>
            <p className="rack-diagram-page__tier-desc">
              Full-featured with hover tooltips, status colors, motion levels, and device brightness hover.
            </p>
            <div className="rack-diagram-page__tier-import">
              import {'{'} RackDiagram {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="rack-diagram-page__tier-preview">
              <RackDiagram
                units={6}
                size="sm"
                devices={[
                  { startU: 1, heightU: 1, label: 'SW', status: 'ok' },
                  { startU: 3, heightU: 2, label: 'SRV', status: 'critical' },
                ]}
              />
            </div>
          </div>

          {/* Premium */}
          <div
            className={`rack-diagram-page__tier-card${tier === 'premium' ? ' rack-diagram-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="rack-diagram-page__tier-header">
              <span className="rack-diagram-page__tier-name">Premium</span>
              <span className="rack-diagram-page__tier-size">~3.5 KB</span>
            </div>
            <p className="rack-diagram-page__tier-desc">
              Everything in Standard plus status glow effects, critical device pulse animation,
              staggered slide-in entrance, and frame glow.
            </p>
            <div className="rack-diagram-page__tier-import">
              import {'{'} RackDiagram {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="rack-diagram-page__tier-preview">
              <PremiumRackDiagram
                units={6}
                size="sm"
                devices={[
                  { startU: 1, heightU: 1, label: 'SW', status: 'ok' },
                  { startU: 3, heightU: 2, label: 'SRV', status: 'critical' },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Props API ───────────────────────────────── */}
      <section className="rack-diagram-page__section" id="props">
        <h2 className="rack-diagram-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="rack-diagram-page__section-desc">
          All props accepted by RackDiagram. It also spreads any native div HTML attributes
          onto the underlying container element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={rackDiagramProps} />
        </Card>
      </section>

      {/* ── 8. Accessibility ──────────────────────────── */}
      <section className="rack-diagram-page__section" id="accessibility">
        <h2 className="rack-diagram-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="rack-diagram-page__section-desc">
          Built with semantic markup and ARIA attributes for screen reader support.
        </p>
        <Card variant="default" padding="md">
          <ul className="rack-diagram-page__a11y-list">
            <li className="rack-diagram-page__a11y-item">
              <span className="rack-diagram-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Role:</strong> Uses <code className="rack-diagram-page__a11y-key">role="img"</code> with descriptive aria-label including unit count and device count.
              </span>
            </li>
            <li className="rack-diagram-page__a11y-item">
              <span className="rack-diagram-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Tooltips:</strong> Device details shown on hover with status, position, and label information.
              </span>
            </li>
            <li className="rack-diagram-page__a11y-item">
              <span className="rack-diagram-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Motion:</strong> Respects <code className="rack-diagram-page__a11y-key">prefers-reduced-motion</code> — disables all animations when enabled.
              </span>
            </li>
            <li className="rack-diagram-page__a11y-item">
              <span className="rack-diagram-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="rack-diagram-page__a11y-key">forced-colors: active</code> with visible borders on frame and devices.
              </span>
            </li>
            <li className="rack-diagram-page__a11y-item">
              <span className="rack-diagram-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Status colors:</strong> Uses distinct hues (green/amber/red/muted) meeting WCAG contrast requirements.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
