'use client'

import { useState, useMemo, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { TopologyGraph } from '@ui/domain/topology-graph'
import type { TopologyNode, TopologyEdge } from '@ui/domain/topology-graph'
import { TopologyGraph as LiteTopologyGraph } from '@ui/lite/topology-graph'
import { TopologyGraph as PremiumTopologyGraph } from '@ui/premium/topology-graph'
import { Button } from '@ui/components/button'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Sample Data ──────────────────────────────────────────────────────────────

const sampleNodes: TopologyNode[] = [
  { id: 'inet', label: 'Internet', type: 'cloud', status: 'ok' },
  { id: 'fw1', label: 'Firewall', type: 'firewall', status: 'ok' },
  { id: 'r1', label: 'Core Router', type: 'router', status: 'ok' },
  { id: 'sw1', label: 'Switch A', type: 'switch', status: 'ok' },
  { id: 'sw2', label: 'Switch B', type: 'switch', status: 'warning' },
  { id: 'srv1', label: 'Web Server 1', type: 'server', status: 'ok' },
  { id: 'srv2', label: 'Web Server 2', type: 'server', status: 'ok' },
  { id: 'srv3', label: 'App Server', type: 'server', status: 'critical' },
  { id: 'db1', label: 'Primary DB', type: 'database', status: 'ok' },
  { id: 'lb1', label: 'Load Balancer', type: 'loadbalancer', status: 'ok' },
]

const sampleEdges: TopologyEdge[] = [
  { source: 'inet', target: 'fw1', animated: true },
  { source: 'fw1', target: 'r1' },
  { source: 'r1', target: 'sw1' },
  { source: 'r1', target: 'sw2' },
  { source: 'sw1', target: 'lb1' },
  { source: 'lb1', target: 'srv1' },
  { source: 'lb1', target: 'srv2' },
  { source: 'sw2', target: 'srv3' },
  { source: 'srv1', target: 'db1', status: 'ok' },
  { source: 'srv2', target: 'db1', status: 'ok' },
  { source: 'srv3', target: 'db1', status: 'warning' },
]

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.topology-graph-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: topology-graph-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .topology-graph-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .topology-graph-page__hero::before {
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
        animation: topo-page-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes topo-page-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .topology-graph-page__hero::before { animation: none; }
      }

      .topology-graph-page__title {
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

      .topology-graph-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .topology-graph-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .topology-graph-page__import-code {
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

      .topology-graph-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* Sections */
      .topology-graph-page__section {
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
        animation: topo-page-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes topo-page-section-reveal {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .topology-graph-page__section {
          opacity: 1; transform: none; filter: none; animation: none;
        }
      }

      .topology-graph-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .topology-graph-page__section-title a { color: inherit; text-decoration: none; }
      .topology-graph-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .topology-graph-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* Preview */
      .topology-graph-page__preview {
        padding: 1rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
        min-block-size: 400px;
      }

      .topology-graph-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* Playground */
      .topology-graph-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @container topology-graph-page (max-width: 680px) {
        .topology-graph-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .topology-graph-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .topology-graph-page__playground-result {
        overflow: hidden;
        min-block-size: 400px;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
      }

      .topology-graph-page__playground-controls {
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

      .topology-graph-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .topology-graph-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .topology-graph-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .topology-graph-page__option-btn {
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
      .topology-graph-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .topology-graph-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .topology-graph-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      /* Tier cards */
      .topology-graph-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .topology-graph-page__tier-card {
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

      .topology-graph-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .topology-graph-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .topology-graph-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .topology-graph-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .topology-graph-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .topology-graph-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .topology-graph-page__tier-import {
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

      .topology-graph-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* Code tabs */
      .topology-graph-page__code-tabs {
        margin-block-start: 1rem;
      }

      .topology-graph-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .topology-graph-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* A11y list */
      .topology-graph-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .topology-graph-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .topology-graph-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .topology-graph-page__hero { padding: 2rem 1.25rem; }
        .topology-graph-page__title { font-size: 1.75rem; }
        .topology-graph-page__playground { grid-template-columns: 1fr; }
        .topology-graph-page__tiers { grid-template-columns: 1fr; }
        .topology-graph-page__section { padding: 1.25rem; }
      }
    }
  }
`

// ─── Props Data ──────────────────────────────────────────────────────────────

const topologyGraphProps: PropDef[] = [
  { name: 'nodes', type: 'TopologyNode[]', required: true, description: 'Array of node definitions with id, label, type, status, and optional position.' },
  { name: 'edges', type: 'TopologyEdge[]', required: true, description: 'Array of edges connecting nodes by source and target ids.' },
  { name: 'layout', type: "'force' | 'dagre' | 'circular' | 'grid'", default: "'force'", description: 'Layout algorithm to position nodes.' },
  { name: 'layoutOptions', type: 'Partial<LayoutOptions>', description: 'Options passed to the layout engine (gravity, repulsion, iterations, etc.).' },
  { name: 'onNodeClick', type: '(node: TopologyNode) => void', description: 'Callback when a node is clicked.' },
  { name: 'onNodeHover', type: '(node: TopologyNode | null) => void', description: 'Callback when a node is hovered or unhovered.' },
  { name: 'onEdgeClick', type: '(edge: TopologyEdge) => void', description: 'Callback when an edge is clicked.' },
  { name: 'selectedNodes', type: 'string[]', description: 'Array of node IDs that should appear selected.' },
  { name: 'showMinimap', type: 'boolean', default: 'false', description: 'Show a minimap overview of the full graph.' },
  { name: 'showControls', type: 'boolean', default: 'true', description: 'Show zoom in/out/fit controls.' },
  { name: 'showLegend', type: 'boolean', default: 'false', description: 'Show a status color legend.' },
  { name: 'height', type: 'number | string', default: '500', description: 'Height of the graph container.' },
  { name: 'renderer', type: "'auto' | 'svg' | 'canvas'", default: "'auto'", description: 'Force a specific renderer. Auto uses SVG for <=500 nodes, Canvas for more.' },
  { name: 'nodeFilter', type: '(node: TopologyNode) => boolean', description: 'Filter function to hide specific nodes.' },
  { name: 'edgeFilter', type: '(edge: TopologyEdge) => boolean', description: 'Filter function to hide specific edges.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override.' },
]

const topologyNodeProps: PropDef[] = [
  { name: 'id', type: 'string', required: true, description: 'Unique node identifier.' },
  { name: 'label', type: 'string', required: true, description: 'Display label for the node.' },
  { name: 'type', type: "'server' | 'switch' | 'router' | 'firewall' | 'cloud' | 'database' | 'loadbalancer' | 'custom'", description: 'Node type controlling the icon shape.' },
  { name: 'status', type: "'ok' | 'warning' | 'critical' | 'unknown' | 'maintenance'", description: 'Status color of the node border.' },
  { name: 'icon', type: 'ReactNode', description: 'Custom icon to render inside the node.' },
  { name: 'group', type: 'string', description: 'Group identifier for grouping nodes.' },
  { name: 'metrics', type: 'Record<string, number>', description: 'Optional metrics data attached to the node.' },
]

const topologyEdgeProps: PropDef[] = [
  { name: 'source', type: 'string', required: true, description: 'ID of the source node.' },
  { name: 'target', type: 'string', required: true, description: 'ID of the target node.' },
  { name: 'label', type: 'string', description: 'Label displayed at the edge midpoint.' },
  { name: 'status', type: "'ok' | 'warning' | 'critical' | 'unknown'", description: 'Status color of the edge.' },
  { name: 'bandwidth', type: 'number', description: 'Bandwidth value controlling edge thickness.' },
  { name: 'animated', type: 'boolean', description: 'Show animated dashes on the edge.' },
  { name: 'bidirectional', type: 'boolean', description: 'Show arrows on both ends.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Layout = 'force' | 'dagre' | 'circular' | 'grid'
type Renderer = 'auto' | 'svg' | 'canvas'

const LAYOUTS: Layout[] = ['force', 'dagre', 'circular', 'grid']
const RENDERERS: Renderer[] = ['auto', 'svg', 'canvas']

const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { TopologyGraph } from '@annondeveloper/ui-kit/lite'",
  standard: "import { TopologyGraph } from '@annondeveloper/ui-kit'",
  premium: "import { TopologyGraph } from '@annondeveloper/ui-kit/premium'",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="topology-graph-page__copy-btn"
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
    <div className="topology-graph-page__control-group">
      <span className="topology-graph-page__control-label">{label}</span>
      <div className="topology-graph-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`topology-graph-page__option-btn${opt === value ? ' topology-graph-page__option-btn--active' : ''}`}
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
    <label className="topology-graph-page__toggle-label">
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
  layout: Layout,
  renderer: Renderer,
  showMinimap: boolean,
  showControls: boolean,
  showLegend: boolean,
  motion: 0 | 1 | 2 | 3,
): string {
  const importStr = IMPORT_STRINGS[tier]

  const nodesDef = `const nodes = [
  { id: 'inet', label: 'Internet', type: 'cloud', status: 'ok' },
  { id: 'fw1', label: 'Firewall', type: 'firewall', status: 'ok' },
  { id: 'r1', label: 'Core Router', type: 'router', status: 'ok' },
  { id: 'sw1', label: 'Switch A', type: 'switch', status: 'ok' },
  { id: 'sw2', label: 'Switch B', type: 'switch', status: 'warning' },
  { id: 'srv1', label: 'Web Server 1', type: 'server', status: 'ok' },
  { id: 'srv3', label: 'App Server', type: 'server', status: 'critical' },
  { id: 'db1', label: 'Primary DB', type: 'database', status: 'ok' },
]`

  const edgesDef = `const edges = [
  { source: 'inet', target: 'fw1', animated: true },
  { source: 'fw1', target: 'r1' },
  { source: 'r1', target: 'sw1' },
  { source: 'r1', target: 'sw2' },
  { source: 'sw1', target: 'srv1' },
  { source: 'sw2', target: 'srv3' },
  { source: 'srv1', target: 'db1', status: 'ok' },
  { source: 'srv3', target: 'db1', status: 'warning' },
]`

  const props: string[] = ['  nodes={nodes}', '  edges={edges}']
  if (layout !== 'force') props.push(`  layout="${layout}"`)
  if (renderer !== 'auto') props.push(`  renderer="${renderer}"`)
  if (showMinimap) props.push('  showMinimap')
  if (!showControls) props.push('  showControls={false}')
  if (showLegend) props.push('  showLegend')
  if (tier !== 'lite' && motion !== 3) props.push(`  motion={${motion}}`)
  props.push('  height={450}')

  return `${importStr}\n\n${nodesDef}\n\n${edgesDef}\n\n<TopologyGraph\n${props.join('\n')}\n/>`
}

// ─── Tier Preview Data ───────────────────────────────────────────────────────

const tierPreviewNodes: TopologyNode[] = [
  { id: 'r1', label: 'Router', type: 'router', status: 'ok' },
  { id: 'sw1', label: 'Switch', type: 'switch', status: 'ok' },
  { id: 'srv1', label: 'Server', type: 'server', status: 'ok' },
  { id: 'db1', label: 'Database', type: 'database', status: 'warning' },
]

const tierPreviewEdges: TopologyEdge[] = [
  { source: 'r1', target: 'sw1' },
  { source: 'sw1', target: 'srv1' },
  { source: 'srv1', target: 'db1' },
]

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [layout, setLayout] = useState<Layout>('force')
  const [renderer, setRenderer] = useState<Renderer>('auto')
  const [showMinimap, setShowMinimap] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [showLegend, setShowLegend] = useState(true)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [selectedNodes, setSelectedNodes] = useState<string[]>([])
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const reactCode = useMemo(
    () => generateReactCode(tier, layout, renderer, showMinimap, showControls, showLegend, motion),
    [tier, layout, renderer, showMinimap, showControls, showLegend, motion],
  )

  const codeTabs = [{ id: 'react', label: 'React' }]

  const handleNodeClick = (node: TopologyNode) => {
    setSelectedNodes(prev =>
      prev.includes(node.id) ? prev.filter(id => id !== node.id) : [...prev, node.id]
    )
  }

  const GraphComponent = tier === 'lite'
    ? (props: any) => <LiteTopologyGraph {...props} />
    : tier === 'premium'
    ? PremiumTopologyGraph
    : TopologyGraph

  const previewProps: Record<string, unknown> = {
    nodes: sampleNodes,
    edges: sampleEdges,
    layout,
    renderer,
    showMinimap,
    showControls,
    showLegend,
    selectedNodes,
    onNodeClick: handleNodeClick,
    height: 450,
  }
  if (tier !== 'lite') {
    previewProps.motion = motion
  }

  return (
    <section className="topology-graph-page__section" id="playground">
      <h2 className="topology-graph-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="topology-graph-page__section-desc">
        Explore the topology graph with different layouts, renderers, and options. Click nodes to select them.
      </p>

      <div className="topology-graph-page__playground">
        <div className="topology-graph-page__playground-preview">
          <div className="topology-graph-page__playground-result">
            <GraphComponent {...previewProps} />
          </div>

          <div className="topology-graph-page__code-tabs">
            <div className="topology-graph-page__export-row">
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
              {copyStatus && <span className="topology-graph-page__export-status">{copyStatus}</span>}
            </div>
            <Tabs tabs={codeTabs} activeTab={activeCodeTab} onChange={setActiveCodeTab} size="sm" variant="pills">
              <TabPanel tabId="react">
                <CopyBlock code={reactCode} language="typescript" showLineNumbers />
              </TabPanel>
            </Tabs>
          </div>
        </div>

        <div className="topology-graph-page__playground-controls">
          <OptionGroup label="Layout" options={LAYOUTS} value={layout} onChange={setLayout} />
          {tier !== 'lite' && (
            <OptionGroup label="Renderer" options={RENDERERS} value={renderer} onChange={setRenderer} />
          )}
          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}
          <div className="topology-graph-page__control-group">
            <span className="topology-graph-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {tier !== 'lite' && (
                <>
                  <Toggle label="Show minimap" checked={showMinimap} onChange={setShowMinimap} />
                  <Toggle label="Show controls" checked={showControls} onChange={setShowControls} />
                </>
              )}
              <Toggle label="Show legend" checked={showLegend} onChange={setShowLegend} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TopologyGraphPage() {
  useStyles('topology-graph-page', pageStyles)

  const { tier, setTier } = useTier()

  // Scroll reveal JS fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.topology-graph-page__section')
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
    <div className="topology-graph-page">
      {/* Hero Header */}
      <div className="topology-graph-page__hero">
        <h1 className="topology-graph-page__title">TopologyGraph</h1>
        <p className="topology-graph-page__desc">
          Interactive network topology visualization with SVG and Canvas renderers, multiple layout algorithms,
          pan/zoom navigation, and status-aware styling. Zero external dependencies.
        </p>
        <div className="topology-graph-page__import-row">
          <code className="topology-graph-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* Playground */}
      <PlaygroundSection tier={tier} />

      {/* Weight Tier Comparison */}
      <section className="topology-graph-page__section" id="tiers">
        <h2 className="topology-graph-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="topology-graph-page__section-desc">
          Choose the tier that matches your performance budget and feature requirements.
        </p>

        <div className="topology-graph-page__tiers">
          {/* Lite */}
          <div
            className={`topology-graph-page__tier-card${tier === 'lite' ? ' topology-graph-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="topology-graph-page__tier-header">
              <span className="topology-graph-page__tier-name">Lite</span>
              <span className="topology-graph-page__tier-size">~1.2KB</span>
            </div>
            <p className="topology-graph-page__tier-desc">
              SVG-only, no pan/zoom, no minimap. Simple static graph rendering.
            </p>
            <div className="topology-graph-page__tier-import">{IMPORT_STRINGS.lite}</div>
            <div className="topology-graph-page__tier-preview">
              <LiteTopologyGraph nodes={tierPreviewNodes} edges={tierPreviewEdges} height={160} />
            </div>
          </div>

          {/* Standard */}
          <div
            className={`topology-graph-page__tier-card${tier === 'standard' ? ' topology-graph-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="topology-graph-page__tier-header">
              <span className="topology-graph-page__tier-name">Standard</span>
              <span className="topology-graph-page__tier-size">~5.5KB</span>
            </div>
            <p className="topology-graph-page__tier-desc">
              SVG + Canvas renderers, pan/zoom, minimap, controls, legend. Full interactive graph.
            </p>
            <div className="topology-graph-page__tier-import">{IMPORT_STRINGS.standard}</div>
            <div className="topology-graph-page__tier-preview">
              <TopologyGraph nodes={tierPreviewNodes} edges={tierPreviewEdges} height={160} />
            </div>
          </div>

          {/* Premium */}
          <div
            className={`topology-graph-page__tier-card${tier === 'premium' ? ' topology-graph-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="topology-graph-page__tier-header">
              <span className="topology-graph-page__tier-name">Premium</span>
              <span className="topology-graph-page__tier-size">~6.2KB</span>
            </div>
            <p className="topology-graph-page__tier-desc">
              Aurora glow on nodes, enhanced edge effects, spring animations on selection.
            </p>
            <div className="topology-graph-page__tier-import">{IMPORT_STRINGS.premium}</div>
            <div className="topology-graph-page__tier-preview">
              <PremiumTopologyGraph nodes={tierPreviewNodes} edges={tierPreviewEdges} height={160} />
            </div>
          </div>
        </div>
      </section>

      {/* Props Table */}
      <section className="topology-graph-page__section" id="props">
        <h2 className="topology-graph-page__section-title">
          <a href="#props">Props Reference</a>
        </h2>
        <p className="topology-graph-page__section-desc">
          TopologyGraph component props.
        </p>
        <PropsTable props={topologyGraphProps} />

        <h3 style={{ marginBlockStart: '2rem', marginBlockEnd: '0.5rem', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600 }}>
          TopologyNode
        </h3>
        <PropsTable props={topologyNodeProps} />

        <h3 style={{ marginBlockStart: '2rem', marginBlockEnd: '0.5rem', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600 }}>
          TopologyEdge
        </h3>
        <PropsTable props={topologyEdgeProps} />
      </section>

      {/* Accessibility */}
      <section className="topology-graph-page__section" id="accessibility">
        <h2 className="topology-graph-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="topology-graph-page__section-desc">
          Built with accessibility in mind following WAI-ARIA best practices.
        </p>
        <ul className="topology-graph-page__a11y-list">
          <li className="topology-graph-page__a11y-item">
            <span className="topology-graph-page__a11y-icon"><Icon name="check" size="sm" /></span>
            <span>Container has <code>role="img"</code> and <code>aria-label</code> describing the graph.</span>
          </li>
          <li className="topology-graph-page__a11y-item">
            <span className="topology-graph-page__a11y-icon"><Icon name="check" size="sm" /></span>
            <span>Controls toolbar with <code>role="toolbar"</code> and labeled zoom buttons.</span>
          </li>
          <li className="topology-graph-page__a11y-item">
            <span className="topology-graph-page__a11y-icon"><Icon name="check" size="sm" /></span>
            <span>Respects <code>prefers-reduced-motion</code> for all animations and edge effects.</span>
          </li>
          <li className="topology-graph-page__a11y-item">
            <span className="topology-graph-page__a11y-icon"><Icon name="check" size="sm" /></span>
            <span>High-contrast mode support with <code>forced-colors: active</code> media query.</span>
          </li>
          <li className="topology-graph-page__a11y-item">
            <span className="topology-graph-page__a11y-icon"><Icon name="check" size="sm" /></span>
            <span>Keyboard-accessible control buttons with visible focus indicators.</span>
          </li>
        </ul>
      </section>
    </div>
  )
}
