'use client'

import { useState, useMemo, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { NetworkInterfaceGrid, type NetworkInterface } from '@ui/domain/network-interface-grid'
import { NetworkInterfaceGrid as LiteNetworkInterfaceGrid } from '@ui/lite/network-interface-grid'
import { NetworkInterfaceGrid as PremiumNetworkInterfaceGrid } from '@ui/premium/network-interface-grid'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Sample Data ──────────────────────────────────────────────────────────────

const sampleInterfaces: NetworkInterface[] = [
  { name: 'eth0', status: 'up', speed: '10Gbps', type: 'ethernet', duplex: 'full', txRate: 524288000, rxRate: 134217728, mac: '00:1a:2b:3c:4d:5e', ipv4: '10.0.0.1', mtu: 9000 },
  { name: 'eth1', status: 'down', speed: '1Gbps', type: 'ethernet', duplex: 'full', txErrors: 12, rxErrors: 3, mac: '00:1a:2b:3c:4d:5f', ipv4: '10.0.0.2', mtu: 1500 },
  { name: 'bond0', status: 'up', speed: '25Gbps', type: 'bond', duplex: 'full', txRate: 1073741824, rxRate: 536870912, ipv4: '10.0.1.1', mtu: 9000 },
  { name: 'br0', status: 'dormant', speed: '1Gbps', type: 'bridge', ipv4: '192.168.1.1', mtu: 1500 },
  { name: 'vlan100', status: 'up', speed: '10Gbps', type: 'vlan', txRate: 262144000, rxRate: 131072000, ipv4: '10.100.0.1' },
  { name: 'lo', status: 'up', type: 'loopback', ipv4: '127.0.0.1', mtu: 65536 },
]

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.nig-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: nig-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .nig-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .nig-page__hero::before {
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
        animation: nig-page-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes nig-page-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .nig-page__hero::before { animation: none; }
      }

      .nig-page__title {
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

      .nig-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .nig-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .nig-page__import-code {
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

      .nig-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .nig-page__section {
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
        animation: nig-page-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes nig-page-section-reveal {
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
        .nig-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .nig-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .nig-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .nig-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .nig-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .nig-page__preview {
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

      .nig-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ─────────────────────────────────── */

      .nig-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .nig-page__playground {
          grid-template-columns: 1fr;
        }
        .nig-page__playground-controls {
          position: static !important;
        }
      }

      @container nig-page (max-width: 680px) {
        .nig-page__playground {
          grid-template-columns: 1fr;
        }
        .nig-page__playground-controls {
          position: static !important;
        }
      }

      .nig-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .nig-page__playground-result {
        overflow-x: auto;
        min-block-size: 200px;
        display: grid;
        place-items: center;
        padding: 2rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .nig-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .nig-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .nig-page__playground-controls {
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

      .nig-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .nig-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .nig-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .nig-page__option-btn {
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
      .nig-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .nig-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .nig-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      /* ── Status legend ─────────────────────────────── */

      .nig-page__status-legend {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin-block-start: 1rem;
      }

      .nig-page__status-item {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
      }

      .nig-page__status-dot {
        inline-size: 0.625rem;
        block-size: 0.625rem;
        border-radius: 50%;
        flex-shrink: 0;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .nig-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .nig-page__tier-card {
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

      .nig-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .nig-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .nig-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .nig-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .nig-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .nig-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .nig-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .nig-page__tier-import {
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

      .nig-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .nig-page__code-tabs {
        margin-block-start: 1rem;
      }

      .nig-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .nig-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .nig-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .nig-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .nig-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .nig-page__a11y-key {
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
        .nig-page__hero { padding: 2rem 1.25rem; }
        .nig-page__title { font-size: 1.75rem; }
        .nig-page__preview { padding: 1.75rem; }
        .nig-page__playground { grid-template-columns: 1fr; }
        .nig-page__playground-result { padding: 1.5rem; overflow-x: auto; min-block-size: 120px; }
        .nig-page__tiers { grid-template-columns: 1fr; }
        .nig-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .nig-page__hero { padding: 1.5rem 1rem; }
        .nig-page__title { font-size: 1.5rem; }
        .nig-page__preview { padding: 1rem; }
      }

      /* ── Scrollbar ──────────────────────────────── */

      .nig-page__import-code,
      .nig-page code,
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

const networkInterfaceGridProps: PropDef[] = [
  { name: 'interfaces', type: 'NetworkInterface[]', required: true, description: 'Array of network interface objects to display in the grid.' },
  { name: 'columns', type: 'number', description: 'Fixed number of columns. Defaults to responsive auto-fit.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls card sizing and typography scale.' },
  { name: 'showTraffic', type: 'boolean', default: 'false', description: 'Show TX/RX traffic rates with formatted byte values.' },
  { name: 'showErrors', type: 'boolean', default: 'false', description: 'Show TX/RX error counts, highlighted in red when non-zero.' },
  { name: 'onInterfaceClick', type: '(iface: NetworkInterface) => void', description: 'Click handler. Renders cards as buttons when provided.' },
  { name: 'compact', type: 'boolean', default: 'false', description: 'Minimal view for sidebars with reduced padding and hidden details.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Controls LED pulse and hover effects.' },
]

const networkInterfaceProps: PropDef[] = [
  { name: 'name', type: 'string', required: true, description: 'Interface name (e.g. "eth0", "bond0", "ens192").' },
  { name: 'status', type: "'up' | 'down' | 'dormant' | 'unknown'", required: true, description: 'Interface status controlling LED color and border accent.' },
  { name: 'speed', type: 'string', description: 'Link speed string (e.g. "1Gbps", "10Gbps", "25Gbps").' },
  { name: 'duplex', type: "'full' | 'half' | 'unknown'", description: 'Duplex mode shown alongside speed.' },
  { name: 'mac', type: 'string', description: 'MAC address.' },
  { name: 'ipv4', type: 'string', description: 'IPv4 address.' },
  { name: 'ipv6', type: 'string', description: 'IPv6 address.' },
  { name: 'mtu', type: 'number', description: 'Maximum transmission unit.' },
  { name: 'txRate', type: 'number', description: 'Transmit rate in bytes/sec. Formatted with K/M/G suffixes.' },
  { name: 'rxRate', type: 'number', description: 'Receive rate in bytes/sec. Formatted with K/M/G suffixes.' },
  { name: 'txErrors', type: 'number', description: 'Transmit error count. Highlighted in red when > 0.' },
  { name: 'rxErrors', type: 'number', description: 'Receive error count. Highlighted in red when > 0.' },
  { name: 'type', type: "'ethernet' | 'bond' | 'bridge' | 'vlan' | 'loopback' | 'wireless'", description: 'Interface type shown as a badge.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Size = 'sm' | 'md' | 'lg'

const SIZES: Size[] = ['sm', 'md', 'lg']
const COLUMN_OPTIONS = ['auto', '2', '3', '4'] as const
const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { NetworkInterfaceGrid } from '@annondeveloper/ui-kit/lite'",
  standard: "import { NetworkInterfaceGrid } from '@annondeveloper/ui-kit'",
  premium: "import { NetworkInterfaceGrid } from '@annondeveloper/ui-kit/premium'",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="nig-page__copy-btn"
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
    <div className="nig-page__control-group">
      <span className="nig-page__control-label">{label}</span>
      <div className="nig-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`nig-page__option-btn${opt === value ? ' nig-page__option-btn--active' : ''}`}
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
    <label className="nig-page__toggle-label">
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
  size: Size,
  compact: boolean,
  showTraffic: boolean,
  showErrors: boolean,
  columns: string,
): string {
  const importStr = IMPORT_STRINGS[tier]

  const ifacesDef = `const interfaces = [
  { name: 'eth0', status: 'up', speed: '10Gbps', type: 'ethernet', txRate: 524288000, rxRate: 134217728 },
  { name: 'eth1', status: 'down', speed: '1Gbps', type: 'ethernet', txErrors: 12, rxErrors: 3 },
  { name: 'bond0', status: 'up', speed: '25Gbps', type: 'bond', txRate: 1073741824, rxRate: 536870912 },
  { name: 'br0', status: 'dormant', speed: '1Gbps', type: 'bridge' },
  { name: 'vlan100', status: 'up', speed: '10Gbps', type: 'vlan' },
  { name: 'lo', status: 'up', type: 'loopback' },
]`

  const props: string[] = ['  interfaces={interfaces}']
  if (size !== 'md') props.push(`  size="${size}"`)
  if (columns !== 'auto') props.push(`  columns={${columns}}`)
  if (compact) props.push('  compact')
  if (showTraffic) props.push('  showTraffic')
  if (showErrors) props.push('  showErrors')

  return `${importStr}\n\n${ifacesDef}\n\n<NetworkInterfaceGrid\n${props.join('\n')}\n/>`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [size, setSize] = useState<Size>('md')
  const [columns, setColumns] = useState<string>('auto')
  const [compact, setCompact] = useState(false)
  const [showTraffic, setShowTraffic] = useState(true)
  const [showErrors, setShowErrors] = useState(true)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')

  const GridComponent = tier === 'lite'
    ? (props: any) => <LiteNetworkInterfaceGrid {...props} />
    : tier === 'premium'
    ? PremiumNetworkInterfaceGrid
    : NetworkInterfaceGrid

  const reactCode = useMemo(
    () => generateReactCode(tier, size, compact, showTraffic, showErrors, columns),
    [tier, size, compact, showTraffic, showErrors, columns],
  )

  const [activeCodeTab, setActiveCodeTab] = useState('react')
  const codeTabs = [
    { id: 'react', label: 'React' },
  ]

  const previewProps: Record<string, unknown> = {
    interfaces: sampleInterfaces,
    size,
    showTraffic,
    showErrors,
    compact,
  }
  if (columns !== 'auto') previewProps.columns = Number(columns)
  if (tier !== 'lite') previewProps.motion = motion

  return (
    <section className="nig-page__section" id="playground">
      <h2 className="nig-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="nig-page__section-desc">
        Configure the network interface grid in real-time. Toggle traffic rates, error counts, and adjust layout.
      </p>

      <div className="nig-page__playground">
        <div className="nig-page__playground-preview">
          <div className="nig-page__playground-result">
            <GridComponent {...previewProps} />
          </div>

          <div className="nig-page__code-tabs">
            <div className="nig-page__export-row">
              <Button
                size="xs"
                variant="secondary"
                icon={<Icon name="copy" size="sm" />}
                onClick={() => {
                  navigator.clipboard?.writeText(reactCode).then(() => {
                    setCopyStatus('Copied React!')
                    setTimeout(() => setCopyStatus(''), 2000)
                  })
                }}
              >
                Copy React
              </Button>
              {copyStatus && <span className="nig-page__export-status">{copyStatus}</span>}
            </div>
            <Tabs tabs={codeTabs} activeTab={activeCodeTab} onChange={setActiveCodeTab} size="sm" variant="pills">
              <TabPanel tabId="react">
                <CopyBlock code={reactCode} language="typescript" showLineNumbers />
              </TabPanel>
            </Tabs>
          </div>
        </div>

        <div className="nig-page__playground-controls">
          <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />
          <OptionGroup
            label="Columns"
            options={COLUMN_OPTIONS}
            value={columns as typeof COLUMN_OPTIONS[number]}
            onChange={setColumns}
          />

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="nig-page__control-group">
            <span className="nig-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Show traffic" checked={showTraffic} onChange={setShowTraffic} />
              <Toggle label="Show errors" checked={showErrors} onChange={setShowErrors} />
              <Toggle label="Compact" checked={compact} onChange={setCompact} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NetworkInterfaceGridPage() {
  useStyles('nig-page', pageStyles)

  const { tier, setTier } = useTier()

  // Scroll reveal for sections — JS fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.nig-page__section')
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

  const GridComponent = tier === 'lite'
    ? (props: any) => <LiteNetworkInterfaceGrid {...props} />
    : tier === 'premium'
    ? PremiumNetworkInterfaceGrid
    : NetworkInterfaceGrid

  const liteInterfaces = sampleInterfaces.slice(0, 4).map(({ name, status, speed, txRate, rxRate }) => ({
    name, status, speed, txRate, rxRate,
  }))

  return (
    <div className="nig-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="nig-page__hero">
        <h1 className="nig-page__title">NetworkInterfaceGrid</h1>
        <p className="nig-page__desc">
          Grid visualization of network interfaces (NICs) showing status LEDs, speed badges,
          type labels, traffic rates, and error counts. Adapts responsively via CSS auto-fit.
        </p>
        <div className="nig-page__import-row">
          <code className="nig-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Interface Statuses ─────────────────────────── */}
      <section className="nig-page__section" id="statuses">
        <h2 className="nig-page__section-title">
          <a href="#statuses">Interface Statuses</a>
        </h2>
        <p className="nig-page__section-desc">
          Four status states with distinct LED colors and border accents. Up interfaces show a pulsing LED indicator.
        </p>
        <div className="nig-page__preview">
          <GridComponent
            interfaces={[
              { name: 'eth0', status: 'up', speed: '10Gbps', type: 'ethernet' },
              { name: 'eth1', status: 'down', speed: '1Gbps', type: 'ethernet' },
              { name: 'br0', status: 'dormant', speed: '1Gbps', type: 'bridge' },
              { name: 'tap0', status: 'unknown', type: 'ethernet' },
            ]}
            columns={4}
            size="md"
          />
        </div>
        <div className="nig-page__status-legend">
          <div className="nig-page__status-item">
            <span className="nig-page__status-dot" style={{ background: 'oklch(72% 0.19 155)' }} />
            Up (active)
          </div>
          <div className="nig-page__status-item">
            <span className="nig-page__status-dot" style={{ background: 'oklch(62% 0.22 25)' }} />
            Down (error)
          </div>
          <div className="nig-page__status-item">
            <span className="nig-page__status-dot" style={{ background: 'oklch(80% 0.18 85)' }} />
            Dormant (waiting)
          </div>
          <div className="nig-page__status-item">
            <span className="nig-page__status-dot" style={{ background: 'oklch(55% 0 0)' }} />
            Unknown
          </div>
        </div>
      </section>

      {/* ── 4. Sizes ──────────────────────────────────────── */}
      <section className="nig-page__section" id="sizes">
        <h2 className="nig-page__section-title">
          <a href="#sizes">Size Scale</a>
        </h2>
        <p className="nig-page__section-desc">
          Three sizes control card padding, typography, and minimum column width. Use sm for dense dashboards,
          md for standard views, and lg for detailed inspection.
        </p>
        <div className="nig-page__preview" style={{ gap: '2rem', flexDirection: 'column', alignItems: 'stretch' }}>
          {SIZES.map(s => (
            <div key={s} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>size="{s}"</span>
              <GridComponent
                interfaces={sampleInterfaces.slice(0, 3)}
                size={s}
                columns={3}
                showTraffic
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Weight Tiers ────────────────────────────── */}
      <section className="nig-page__section" id="tiers">
        <h2 className="nig-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="nig-page__section-desc">
          Choose between three weight tiers. Lite uses inline styles only, Standard adds scoped CSS with LED animation
          and hover effects, Premium adds aurora glow, spring entry, and breathing effects for down interfaces.
        </p>

        <div className="nig-page__tiers">
          {/* Lite */}
          <div
            className={`nig-page__tier-card${tier === 'lite' ? ' nig-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="nig-page__tier-header">
              <span className="nig-page__tier-name">Lite</span>
              <span className="nig-page__tier-size">~0.8 KB</span>
            </div>
            <p className="nig-page__tier-desc">
              Inline-style rendering. No animation, no hover effects. Static grid with status colors and traffic display.
            </p>
            <div className="nig-page__tier-import">
              import {'{'} NetworkInterfaceGrid {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="nig-page__tier-preview">
              <LiteNetworkInterfaceGrid
                interfaces={liteInterfaces}
                columns={2}
              />
            </div>
          </div>

          {/* Standard */}
          <div
            className={`nig-page__tier-card${tier === 'standard' ? ' nig-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="nig-page__tier-header">
              <span className="nig-page__tier-name">Standard</span>
              <span className="nig-page__tier-size">~3.5 KB</span>
            </div>
            <p className="nig-page__tier-desc">
              Full-featured with scoped CSS, LED pulse, hover lift, traffic display, error highlighting,
              motion levels, and clickable cards.
            </p>
            <div className="nig-page__tier-import">
              import {'{'} NetworkInterfaceGrid {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="nig-page__tier-preview">
              <NetworkInterfaceGrid
                interfaces={sampleInterfaces.slice(0, 4)}
                columns={2}
                size="sm"
                showTraffic
              />
            </div>
          </div>

          {/* Premium */}
          <div
            className={`nig-page__tier-card${tier === 'premium' ? ' nig-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="nig-page__tier-header">
              <span className="nig-page__tier-name">Premium</span>
              <span className="nig-page__tier-size">~4.5 KB</span>
            </div>
            <p className="nig-page__tier-desc">
              Everything in Standard plus aurora glow per status, spring-scale entry animation,
              breathing effect for down interfaces, and enhanced LED glow.
            </p>
            <div className="nig-page__tier-import">
              import {'{'} NetworkInterfaceGrid {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="nig-page__tier-preview">
              <PremiumNetworkInterfaceGrid
                interfaces={sampleInterfaces.slice(0, 4)}
                columns={2}
                size="sm"
                showTraffic
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Props API ───────────────────────────────── */}
      <section className="nig-page__section" id="props">
        <h2 className="nig-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="nig-page__section-desc">
          All props accepted by NetworkInterfaceGrid. It also spreads any native div HTML attributes
          onto the underlying container element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={networkInterfaceGridProps} />
        </Card>
      </section>

      {/* ── 6b. NetworkInterface Sub-type ─────────────── */}
      <section className="nig-page__section" id="network-interface">
        <h2 className="nig-page__section-title">
          <a href="#network-interface">NetworkInterface</a>
        </h2>
        <p className="nig-page__section-desc">
          Shape of each object in the <code>interfaces</code> array.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={networkInterfaceProps} />
        </Card>
      </section>

      {/* ── 7. Accessibility ──────────────────────────── */}
      <section className="nig-page__section" id="accessibility">
        <h2 className="nig-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="nig-page__section-desc">
          Built with semantic markup, ARIA attributes, and keyboard support.
        </p>
        <Card variant="default" padding="md">
          <ul className="nig-page__a11y-list">
            <li className="nig-page__a11y-item">
              <span className="nig-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Role:</strong> Uses <code className="nig-page__a11y-key">role="group"</code> with descriptive aria-label for the grid container.
              </span>
            </li>
            <li className="nig-page__a11y-item">
              <span className="nig-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> When onInterfaceClick is provided, cards render as {'<button>'} elements with <code className="nig-page__a11y-key">focus-visible</code> outline.
              </span>
            </li>
            <li className="nig-page__a11y-item">
              <span className="nig-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>ARIA Labels:</strong> Clickable cards include interface name, status, speed, and type in their aria-label.
              </span>
            </li>
            <li className="nig-page__a11y-item">
              <span className="nig-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Motion:</strong> Respects <code className="nig-page__a11y-key">prefers-reduced-motion</code> and supports 4 motion intensity levels.
              </span>
            </li>
            <li className="nig-page__a11y-item">
              <span className="nig-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High Contrast:</strong> Supports <code className="nig-page__a11y-key">forced-colors: active</code> for Windows High Contrast mode.
              </span>
            </li>
            <li className="nig-page__a11y-item">
              <span className="nig-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Decorative:</strong> Status LEDs and traffic arrows use <code className="nig-page__a11y-key">aria-hidden="true"</code> to avoid screen reader noise.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
