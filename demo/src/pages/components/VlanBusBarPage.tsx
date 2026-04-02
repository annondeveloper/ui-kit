'use client'

import { useState, useMemo, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { VlanBusBar, type VlanEntry } from '@ui/domain/vlan-bus-bar'
import { VlanBusBar as LiteVlanBusBar } from '@ui/lite/vlan-bus-bar'
import { VlanBusBar as PremiumVlanBusBar } from '@ui/premium/vlan-bus-bar'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Sample Data ──────────────────────────────────────────────────────────────

const sampleVlans: VlanEntry[] = [
  { id: 1, name: 'Management', ports: [1, 2, 3, 4], tagged: false },
  { id: 100, name: 'Production', ports: [1, 2, 5, 6, 7, 8, 9, 10], tagged: true },
  { id: 200, name: 'Development', ports: [3, 4, 11, 12, 13, 14], tagged: true },
  { id: 300, name: 'DMZ', ports: [15, 16], tagged: true },
  { id: 999, name: 'Native', ports: [17, 18, 19, 20, 21, 22, 23, 24], tagged: false },
]

const smallVlans: VlanEntry[] = [
  { id: 1, name: 'Mgmt', ports: [1, 2], tagged: false },
  { id: 100, name: 'Prod', ports: [1, 3, 4, 5, 6], tagged: true },
  { id: 200, name: 'Dev', ports: [3, 4, 7, 8], tagged: true },
]

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.vlan-bus-bar-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: vlan-bus-bar-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .vlan-bus-bar-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .vlan-bus-bar-page__hero::before {
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
        animation: vbb-page-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes vbb-page-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .vlan-bus-bar-page__hero::before { animation: none; }
      }

      .vlan-bus-bar-page__title {
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

      .vlan-bus-bar-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .vlan-bus-bar-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .vlan-bus-bar-page__import-code {
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

      .vlan-bus-bar-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .vlan-bus-bar-page__section {
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
        animation: vbb-page-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes vbb-page-section-reveal {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .vlan-bus-bar-page__section {
          opacity: 1; transform: none; filter: none; animation: none;
        }
      }

      .vlan-bus-bar-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .vlan-bus-bar-page__section-title a {
        color: inherit; text-decoration: none;
      }
      .vlan-bus-bar-page__section-title a:hover {
        text-decoration: underline; text-underline-offset: 0.2em;
      }

      .vlan-bus-bar-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .vlan-bus-bar-page__preview {
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

      .vlan-bus-bar-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ─────────────────────────────────── */

      .vlan-bus-bar-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @container vlan-bus-bar-page (max-width: 680px) {
        .vlan-bus-bar-page__playground { grid-template-columns: 1fr; }
      }

      @media (max-width: 768px) {
        .vlan-bus-bar-page__playground { grid-template-columns: 1fr; }
      }

      .vlan-bus-bar-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .vlan-bus-bar-page__playground-result {
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

      .vlan-bus-bar-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .vlan-bus-bar-page__playground-controls {
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

      .vlan-bus-bar-page__control-group {
        display: flex; flex-direction: column; gap: 0.375rem;
      }

      .vlan-bus-bar-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .vlan-bus-bar-page__control-options {
        display: flex; flex-wrap: wrap; gap: 0.375rem;
      }

      .vlan-bus-bar-page__option-btn {
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
      .vlan-bus-bar-page__option-btn:hover {
        border-color: var(--border-strong); color: var(--text-primary);
      }
      .vlan-bus-bar-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .vlan-bus-bar-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .vlan-bus-bar-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .vlan-bus-bar-page__tier-card {
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

      .vlan-bus-bar-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .vlan-bus-bar-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .vlan-bus-bar-page__tier-header {
        display: flex; align-items: center; justify-content: space-between;
      }

      .vlan-bus-bar-page__tier-name {
        font-size: var(--text-sm, 0.875rem); font-weight: 700; color: var(--text-primary);
      }

      .vlan-bus-bar-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .vlan-bus-bar-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .vlan-bus-bar-page__tier-import {
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

      .vlan-bus-bar-page__tier-preview {
        display: flex; justify-content: center; padding-block-start: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .vlan-bus-bar-page__code-tabs { margin-block-start: 1rem; }

      .vlan-bus-bar-page__export-row {
        display: flex; align-items: center; gap: 0.5rem; margin-block-start: 0.75rem;
      }

      .vlan-bus-bar-page__export-status {
        font-size: var(--text-xs, 0.75rem); color: var(--text-tertiary); font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .vlan-bus-bar-page__a11y-list {
        list-style: none; margin: 0; padding: 0;
        display: flex; flex-direction: column; gap: 0.625rem;
      }

      .vlan-bus-bar-page__a11y-item {
        display: flex; align-items: flex-start; gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem); color: var(--text-secondary); line-height: 1.5;
      }

      .vlan-bus-bar-page__a11y-icon {
        color: var(--brand); flex-shrink: 0; margin-block-start: 0.125rem;
      }

      .vlan-bus-bar-page__a11y-key {
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
        .vlan-bus-bar-page__hero { padding: 2rem 1.25rem; }
        .vlan-bus-bar-page__title { font-size: 1.75rem; }
        .vlan-bus-bar-page__preview { padding: 1.75rem; }
        .vlan-bus-bar-page__playground { grid-template-columns: 1fr; }
        .vlan-bus-bar-page__tiers { grid-template-columns: 1fr; }
        .vlan-bus-bar-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .vlan-bus-bar-page__hero { padding: 1.5rem 1rem; }
        .vlan-bus-bar-page__title { font-size: 1.5rem; }
        .vlan-bus-bar-page__preview { padding: 1rem; }
      }

      .vlan-bus-bar-page__import-code,
      .vlan-bus-bar-page code,
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

const vlanBusBarProps: PropDef[] = [
  { name: 'vlans', type: 'VlanEntry[]', required: true, description: 'Array of VLAN definitions with ID, name, ports, and color.' },
  { name: 'totalPorts', type: 'number', required: true, description: 'Total port count for the scale axis.' },
  { name: 'showLabels', type: 'boolean', default: 'true', description: 'Show VLAN name labels on the left side.' },
  { name: 'showPortNumbers', type: 'boolean', default: 'false', description: 'Show port number tick labels along the bottom.' },
  { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Diagram orientation.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls row height, tick width, and font sizes.' },
  { name: 'onVlanClick', type: '(vlan: VlanEntry) => void', description: 'Click handler for VLAN segments.' },
  { name: 'onPortClick', type: '(port: number, vlans: VlanEntry[]) => void', description: 'Click handler for port ticks. Receives port number and containing VLANs.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override.' },
  { name: 'highlightPorts', type: 'number[]', description: 'Externally highlight specific ports. Dims all other segments.' },
  { name: 'highlightVlans', type: 'number[]', description: 'Externally highlight specific VLANs by ID. Dims all non-matching segments.' },
  { name: 'showTrunkIndicator', type: 'boolean', default: 'false', description: 'Show T (trunk) / A (access) mode indicator below each port.' },
  { name: 'compactMode', type: 'boolean', default: 'false', description: 'Thin bars without labels for embedding in small spaces.' },
  { name: 'maxHeight', type: "number | string", description: 'Constrain the diagram height. Enables scroll when content overflows.' },
  { name: 'colorScheme', type: "'auto' | 'categorical' | 'sequential'", default: "'auto'", description: 'Color generation mode. Sequential uses a single-hue lightness ramp.' },
  { name: 'onPortHover', type: '(port: number | null) => void', description: 'Callback when a port is hovered. Receives null on leave.' },
  { name: 'onVlanHover', type: '(vlan: VlanEntry | null) => void', description: 'Callback when a VLAN row is hovered. Receives null on leave.' },
]

const vlanEntryProps: PropDef[] = [
  { name: 'id', type: 'number', required: true, description: 'VLAN ID (1-4094).' },
  { name: 'name', type: 'string', description: 'Human-readable VLAN name (e.g. "Management").' },
  { name: 'color', type: 'string', description: 'OKLCH color override. Auto-generated if not provided.' },
  { name: 'ports', type: 'number[]', required: true, description: 'Port numbers belonging to this VLAN.' },
  { name: 'tagged', type: 'boolean', description: 'Whether ports are tagged (trunk) vs untagged (access). Renders dashed outline when true.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Size = 'sm' | 'md' | 'lg'

const SIZES: Size[] = ['sm', 'md', 'lg']
const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { VlanBusBar } from '@annondeveloper/ui-kit/lite'",
  standard: "import { VlanBusBar } from '@annondeveloper/ui-kit'",
  premium: "import { VlanBusBar } from '@annondeveloper/ui-kit/premium'",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="vlan-bus-bar-page__copy-btn"
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
    <div className="vlan-bus-bar-page__control-group">
      <span className="vlan-bus-bar-page__control-label">{label}</span>
      <div className="vlan-bus-bar-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`vlan-bus-bar-page__option-btn${opt === value ? ' vlan-bus-bar-page__option-btn--active' : ''}`}
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
    <label className="vlan-bus-bar-page__toggle-label">
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

function generateReactCode(tier: Tier, size: Size, showLabels: boolean, showPortNumbers: boolean): string {
  const importStr = IMPORT_STRINGS[tier]
  const vlansDef = `const vlans = [
  { id: 1, name: 'Management', ports: [1, 2, 3, 4], tagged: false },
  { id: 100, name: 'Production', ports: [1, 2, 5, 6, 7, 8, 9, 10], tagged: true },
  { id: 200, name: 'Development', ports: [3, 4, 11, 12, 13, 14], tagged: true },
  { id: 300, name: 'DMZ', ports: [15, 16], tagged: true },
  { id: 999, name: 'Native', ports: [17, 18, 19, 20, 21, 22, 23, 24], tagged: false },
]`

  const props: string[] = ['  vlans={vlans}', '  totalPorts={24}']
  if (size !== 'md') props.push(`  size="${size}"`)
  if (!showLabels) props.push('  showLabels={false}')
  if (showPortNumbers) props.push('  showPortNumbers')

  return `${importStr}\n\n${vlansDef}\n\n<VlanBusBar\n${props.join('\n')}\n/>`
}

// ─── Playground Section ──────────────────────────────────────────────────────

type ColorScheme = 'auto' | 'categorical' | 'sequential'
const COLOR_SCHEMES: ColorScheme[] = ['auto', 'categorical', 'sequential']

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [size, setSize] = useState<Size>('md')
  const [showLabels, setShowLabels] = useState(true)
  const [showPortNumbers, setShowPortNumbers] = useState(true)
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal')
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [showTrunkIndicator, setShowTrunkIndicator] = useState(false)
  const [compactMode, setCompactMode] = useState(false)
  const [colorScheme, setColorScheme] = useState<ColorScheme>('auto')
  const [highlightPort, setHighlightPort] = useState<string>('')
  const [highlightVlan, setHighlightVlan] = useState<string>('')
  const [copyStatus, setCopyStatus] = useState('')

  const VlanComponent = tier === 'lite'
    ? (props: any) => <LiteVlanBusBar {...props} />
    : tier === 'premium'
    ? PremiumVlanBusBar
    : VlanBusBar

  const reactCode = useMemo(
    () => generateReactCode(tier, size, showLabels, showPortNumbers),
    [tier, size, showLabels, showPortNumbers],
  )

  const [activeCodeTab, setActiveCodeTab] = useState('react')
  const codeTabs = [
    { id: 'react', label: 'React' },
    { id: 'html', label: 'HTML+CSS' },
  ]

  const activeCode = activeCodeTab === 'react' ? reactCode : `<!-- VlanBusBar — use the React component for full interactivity -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/vlan-bus-bar.css">

<div class="ui-vlan-bus-bar" data-size="${size}" role="img"
     aria-label="VLAN bus bar diagram">
  <!-- SVG content rendered by the component -->
</div>`

  const parsedHighlightPorts = useMemo(() => {
    if (!highlightPort.trim()) return undefined
    return highlightPort.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
  }, [highlightPort])

  const parsedHighlightVlans = useMemo(() => {
    if (!highlightVlan.trim()) return undefined
    return highlightVlan.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
  }, [highlightVlan])

  const previewProps: Record<string, unknown> = {
    vlans: sampleVlans,
    totalPorts: 24,
    size,
    showLabels,
    showPortNumbers,
    orientation,
    showTrunkIndicator,
    compactMode,
    colorScheme,
    ...(parsedHighlightPorts ? { highlightPorts: parsedHighlightPorts } : {}),
    ...(parsedHighlightVlans ? { highlightVlans: parsedHighlightVlans } : {}),
  }
  if (tier !== 'lite') {
    previewProps.motion = motion
  }

  return (
    <section className="vlan-bus-bar-page__section" id="playground">
      <h2 className="vlan-bus-bar-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="vlan-bus-bar-page__section-desc">
        Configure the VLAN bus bar in real-time. Adjust size, labels, orientation, and motion to match your use case.
      </p>

      <div className="vlan-bus-bar-page__playground">
        <div className="vlan-bus-bar-page__playground-preview">
          <div className="vlan-bus-bar-page__playground-result">
            <VlanComponent {...previewProps} />
          </div>

          <div className="vlan-bus-bar-page__code-tabs">
            <div className="vlan-bus-bar-page__export-row">
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
              {copyStatus && <span className="vlan-bus-bar-page__export-status">{copyStatus}</span>}
            </div>
            <Tabs tabs={codeTabs} activeTab={activeCodeTab} onChange={setActiveCodeTab} size="sm" variant="pills">
              <TabPanel tabId="react">
                <CopyBlock code={reactCode} language="typescript" showLineNumbers />
              </TabPanel>
              <TabPanel tabId="html">
                <CopyBlock code={activeCode} language="html" showLineNumbers />
              </TabPanel>
            </Tabs>
          </div>
        </div>

        <div className="vlan-bus-bar-page__playground-controls">
          <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />
          <OptionGroup
            label="Orientation"
            options={['horizontal', 'vertical'] as const}
            value={orientation}
            onChange={setOrientation}
          />

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <OptionGroup label="Color Scheme" options={COLOR_SCHEMES} value={colorScheme} onChange={setColorScheme} />

          <div className="vlan-bus-bar-page__control-group">
            <span className="vlan-bus-bar-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Show labels" checked={showLabels} onChange={setShowLabels} />
              <Toggle label="Show port numbers" checked={showPortNumbers} onChange={setShowPortNumbers} />
              <Toggle label="Trunk indicator" checked={showTrunkIndicator} onChange={setShowTrunkIndicator} />
              <Toggle label="Compact mode" checked={compactMode} onChange={setCompactMode} />
            </div>
          </div>

          <div className="vlan-bus-bar-page__control-group">
            <span className="vlan-bus-bar-page__control-label">Highlight Ports</span>
            <input
              type="text"
              placeholder="e.g. 1,2,5"
              value={highlightPort}
              onChange={e => setHighlightPort(e.target.value)}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.25rem 0.5rem',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: 'var(--text-xs, 0.75rem)',
              }}
            />
          </div>

          <div className="vlan-bus-bar-page__control-group">
            <span className="vlan-bus-bar-page__control-label">Highlight VLANs</span>
            <input
              type="text"
              placeholder="e.g. 100,200"
              value={highlightVlan}
              onChange={e => setHighlightVlan(e.target.value)}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.25rem 0.5rem',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: 'var(--text-xs, 0.75rem)',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Cross-Highlight Section ─────────────────────────────────────────────────

function CrossHighlightSection() {
  const [hoveredPort, setHoveredPort] = useState<number | null>(null)
  const [hoveredVlan, setHoveredVlan] = useState<VlanEntry | null>(null)
  const [selectedPorts, setSelectedPorts] = useState<number[]>([])

  const togglePort = (port: number) => {
    setSelectedPorts(prev =>
      prev.includes(port) ? prev.filter(p => p !== port) : [...prev, port]
    )
  }

  return (
    <section className="vlan-bus-bar-page__section" id="cross-highlight">
      <h2 className="vlan-bus-bar-page__section-title">
        <a href="#cross-highlight">Cross-Highlighting</a>
      </h2>
      <p className="vlan-bus-bar-page__section-desc">
        Hover over any port to highlight all VLANs it belongs to. Hover a VLAN row to
        highlight all its member ports. Click port buttons below to set external highlights
        via the <code>highlightPorts</code> prop.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="vlan-bus-bar-page__preview">
          <VlanBusBar
            vlans={sampleVlans}
            totalPorts={24}
            showPortNumbers
            showTrunkIndicator
            highlightPorts={selectedPorts.length > 0 ? selectedPorts : undefined}
            onPortHover={setHoveredPort}
            onVlanHover={setHoveredVlan}
          />
        </div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.375rem',
          alignItems: 'center',
        }}>
          <span style={{
            fontSize: 'var(--text-xs, 0.75rem)',
            color: 'var(--text-tertiary)',
            fontWeight: 600,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
            marginInlineEnd: '0.5rem',
          }}>
            Toggle ports:
          </span>
          {Array.from({ length: 24 }, (_, i) => i + 1).map(port => (
            <button
              key={port}
              type="button"
              className={`vlan-bus-bar-page__option-btn${selectedPorts.includes(port) ? ' vlan-bus-bar-page__option-btn--active' : ''}`}
              onClick={() => togglePort(port)}
              style={{ minWidth: '2rem' }}
            >
              {port}
            </button>
          ))}
          {selectedPorts.length > 0 && (
            <button
              type="button"
              className="vlan-bus-bar-page__option-btn"
              onClick={() => setSelectedPorts([])}
              style={{ marginInlineStart: '0.5rem' }}
            >
              Clear
            </button>
          )}
        </div>

        <div style={{
          fontSize: 'var(--text-sm, 0.875rem)',
          color: 'var(--text-secondary)',
          minHeight: '1.5rem',
        }}>
          {hoveredPort !== null && (
            <span>Port <strong>{hoveredPort}</strong> — member of {
              sampleVlans.filter(v => v.ports.includes(hoveredPort)).map(v => v.name || `VLAN ${v.id}`).join(', ') || 'no VLANs'
            }</span>
          )}
          {hoveredVlan !== null && hoveredPort === null && (
            <span><strong>{hoveredVlan.name || `VLAN ${hoveredVlan.id}`}</strong> — ports {hoveredVlan.ports.join(', ')}</span>
          )}
          {hoveredPort === null && hoveredVlan === null && selectedPorts.length === 0 && (
            <span style={{ fontStyle: 'italic', color: 'var(--text-tertiary)' }}>
              Hover over the diagram or click port buttons to see cross-highlighting
            </span>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function VlanBusBarPage() {
  useStyles('vlan-bus-bar-page', pageStyles)

  const { tier, setTier } = useTier()

  // Scroll reveal for sections — JS fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.vlan-bus-bar-page__section')
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
    <div className="vlan-bus-bar-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="vlan-bus-bar-page__hero">
        <h1 className="vlan-bus-bar-page__title">VlanBusBar</h1>
        <p className="vlan-bus-bar-page__desc">
          SVG-based horizontal bus diagram showing VLAN membership across ports with color-coded segments.
          Each VLAN is a row with colored blocks at member port positions. Hover to see tooltips and cross-highlight.
        </p>
        <div className="vlan-bus-bar-page__import-row">
          <code className="vlan-bus-bar-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 2b. Cross-Highlighting Demo ─────────────────── */}
      <CrossHighlightSection />

      {/* ── 3. Weight Tiers ────────────────────────────── */}
      <section className="vlan-bus-bar-page__section" id="tiers">
        <h2 className="vlan-bus-bar-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="vlan-bus-bar-page__section-desc">
          Choose between three weight tiers. Lite is inline-style static SVG, Standard adds hover tooltips
          and port highlighting, Premium adds segment reveal animation, glow effects, and aurora label accents.
        </p>

        <div className="vlan-bus-bar-page__tiers">
          {/* Lite */}
          <div
            className={`vlan-bus-bar-page__tier-card${tier === 'lite' ? ' vlan-bus-bar-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="vlan-bus-bar-page__tier-header">
              <span className="vlan-bus-bar-page__tier-name">Lite</span>
              <span className="vlan-bus-bar-page__tier-size">~0.5 KB</span>
            </div>
            <p className="vlan-bus-bar-page__tier-desc">
              Inline-style SVG rendering. No animation, no tooltips, no hover effects. Static VLAN diagram.
            </p>
            <div className="vlan-bus-bar-page__tier-import">
              import {'{'} VlanBusBar {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="vlan-bus-bar-page__tier-preview">
              <LiteVlanBusBar vlans={smallVlans} totalPorts={8} />
            </div>
          </div>

          {/* Standard */}
          <div
            className={`vlan-bus-bar-page__tier-card${tier === 'standard' ? ' vlan-bus-bar-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="vlan-bus-bar-page__tier-header">
              <span className="vlan-bus-bar-page__tier-name">Standard</span>
              <span className="vlan-bus-bar-page__tier-size">~3 KB</span>
            </div>
            <p className="vlan-bus-bar-page__tier-desc">
              Full-featured with hover tooltips, port cross-highlighting, tagged/untagged visual distinction,
              clickable segments and ports, and motion levels.
            </p>
            <div className="vlan-bus-bar-page__tier-import">
              import {'{'} VlanBusBar {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="vlan-bus-bar-page__tier-preview">
              <VlanBusBar vlans={smallVlans} totalPorts={8} size="sm" />
            </div>
          </div>

          {/* Premium */}
          <div
            className={`vlan-bus-bar-page__tier-card${tier === 'premium' ? ' vlan-bus-bar-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="vlan-bus-bar-page__tier-header">
              <span className="vlan-bus-bar-page__tier-name">Premium</span>
              <span className="vlan-bus-bar-page__tier-size">~4 KB</span>
            </div>
            <p className="vlan-bus-bar-page__tier-desc">
              Everything in Standard plus animated segment reveal, glow on hover,
              aurora gradient behind labels, and spring physics entrance.
            </p>
            <div className="vlan-bus-bar-page__tier-import">
              import {'{'} VlanBusBar {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="vlan-bus-bar-page__tier-preview">
              <PremiumVlanBusBar vlans={smallVlans} totalPorts={8} size="sm" />
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Props API ───────────────────────────────── */}
      <section className="vlan-bus-bar-page__section" id="props">
        <h2 className="vlan-bus-bar-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="vlan-bus-bar-page__section-desc">
          All props accepted by VlanBusBar. It also spreads any native div HTML attributes
          onto the underlying container element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={vlanBusBarProps} />
        </Card>
      </section>

      {/* ── 4b. VlanEntry Sub-type ────────────────────── */}
      <section className="vlan-bus-bar-page__section" id="vlan-entry">
        <h2 className="vlan-bus-bar-page__section-title">
          <a href="#vlan-entry">VlanEntry</a>
        </h2>
        <p className="vlan-bus-bar-page__section-desc">
          Shape of each object in the <code>vlans</code> array.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={vlanEntryProps} />
        </Card>
      </section>

      {/* ── 5. Accessibility ──────────────────────────── */}
      <section className="vlan-bus-bar-page__section" id="accessibility">
        <h2 className="vlan-bus-bar-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="vlan-bus-bar-page__section-desc">
          Built with semantic markup, ARIA attributes, and reduced-motion support.
        </p>
        <Card variant="default" padding="md">
          <ul className="vlan-bus-bar-page__a11y-list">
            <li className="vlan-bus-bar-page__a11y-item">
              <span className="vlan-bus-bar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Role:</strong> Uses <code className="vlan-bus-bar-page__a11y-key">role="img"</code> with descriptive aria-label including VLAN count and port count.
              </span>
            </li>
            <li className="vlan-bus-bar-page__a11y-item">
              <span className="vlan-bus-bar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>SVG:</strong> Inner SVG is marked <code className="vlan-bus-bar-page__a11y-key">aria-hidden="true"</code> since the container provides the accessible label.
              </span>
            </li>
            <li className="vlan-bus-bar-page__a11y-item">
              <span className="vlan-bus-bar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Motion:</strong> Respects <code className="vlan-bus-bar-page__a11y-key">prefers-reduced-motion</code> — disables hover brightness and segment transitions.
              </span>
            </li>
            <li className="vlan-bus-bar-page__a11y-item">
              <span className="vlan-bus-bar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="vlan-bus-bar-page__a11y-key">forced-colors: active</code> with ButtonText strokes and text fills.
              </span>
            </li>
            <li className="vlan-bus-bar-page__a11y-item">
              <span className="vlan-bus-bar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Colors:</strong> Auto-generated OKLCH colors use golden-angle hue rotation for maximum visual separation.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
