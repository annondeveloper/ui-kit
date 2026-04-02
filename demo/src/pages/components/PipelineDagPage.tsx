'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { PipelineDAG, type PipelineNode, type PipelineEdge } from '@ui/domain/pipeline-dag'
import { PipelineDAG as LitePipelineDAG } from '@ui/lite/pipeline-dag'
import { PipelineDAG as PremiumPipelineDAG } from '@ui/premium/pipeline-dag'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Sample Data ────────────────────────────────────────────────────────────

const sampleNodes: PipelineNode[] = [
  { id: 'kafka', label: 'Kafka Source', type: 'source', status: 'running', metrics: { throughput: 15000 } },
  { id: 'parse', label: 'JSON Parser', type: 'transform', status: 'running', metrics: { throughput: 14800, latency: 2 } },
  { id: 'filter', label: 'Error Filter', type: 'filter', status: 'running', metrics: { throughput: 12000, dropped: 2800 } },
  { id: 'enrich', label: 'Geo Enrichment', type: 'transform', status: 'running', metrics: { throughput: 11900, latency: 15 } },
  { id: 'agg', label: 'Aggregator', type: 'aggregate', status: 'running', metrics: { throughput: 5000, latency: 30 } },
  { id: 'elastic', label: 'Elasticsearch', type: 'sink', status: 'running', metrics: { throughput: 11900 } },
  { id: 'postgres', label: 'PostgreSQL', type: 'sink', status: 'success', metrics: { throughput: 5000 } },
  { id: 'alert', label: 'Alert Sink', type: 'sink', status: 'failed', metrics: { errorRate: 12.5 } },
]

const sampleEdges: PipelineEdge[] = [
  { source: 'kafka', target: 'parse', throughput: 15000 },
  { source: 'parse', target: 'filter', throughput: 14800 },
  { source: 'filter', target: 'enrich', throughput: 12000 },
  { source: 'filter', target: 'alert', throughput: 200 },
  { source: 'enrich', target: 'elastic', throughput: 11900 },
  { source: 'enrich', target: 'agg', throughput: 11900 },
  { source: 'agg', target: 'postgres', throughput: 5000 },
]

const liteNodes = sampleNodes.map(n => ({ id: n.id, label: n.label, status: n.status }))
const liteEdges = sampleEdges.map(e => ({ source: e.source, target: e.target }))

// ─── Page Styles ────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.pipeline-dag-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: pipeline-dag-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .pipeline-dag-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .pipeline-dag-page__hero::before {
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
        animation: dag-page-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes dag-page-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .pipeline-dag-page__hero::before { animation: none; }
      }

      .pipeline-dag-page__title {
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

      .pipeline-dag-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .pipeline-dag-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .pipeline-dag-page__import-code {
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

      .pipeline-dag-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────── */

      .pipeline-dag-page__section {
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
        animation: dag-page-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes dag-page-section-reveal {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .pipeline-dag-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .pipeline-dag-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .pipeline-dag-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .pipeline-dag-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .pipeline-dag-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview ────────────────────────────── */

      .pipeline-dag-page__preview {
        padding: 1.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
      }

      .pipeline-dag-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ─────────────────────────── */

      .pipeline-dag-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @container pipeline-dag-page (max-width: 680px) {
        .pipeline-dag-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .pipeline-dag-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .pipeline-dag-page__playground-result {
        overflow-x: auto;
        min-block-size: 200px;
        padding: 1.5rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .pipeline-dag-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .pipeline-dag-page__playground-controls {
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

      .pipeline-dag-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .pipeline-dag-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .pipeline-dag-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .pipeline-dag-page__option-btn {
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
      .pipeline-dag-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .pipeline-dag-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .pipeline-dag-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .pipeline-dag-page__selected-node {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        margin-block-start: 0.5rem;
        padding: 0.5rem;
        background: var(--bg-surface);
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
      }

      /* ── Tier Cards ─────────────────────────── */

      .pipeline-dag-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .pipeline-dag-page__tier-card {
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

      .pipeline-dag-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .pipeline-dag-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .pipeline-dag-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .pipeline-dag-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .pipeline-dag-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .pipeline-dag-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .pipeline-dag-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .pipeline-dag-page__tier-import {
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

      .pipeline-dag-page__tier-preview {
        padding-block-start: 0.5rem;
      }

      /* ── Code tabs ──────────────────────────── */

      .pipeline-dag-page__code-tabs {
        margin-block-start: 1rem;
      }

      .pipeline-dag-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .pipeline-dag-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────── */

      .pipeline-dag-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .pipeline-dag-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .pipeline-dag-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .pipeline-dag-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Responsive ─────────────────────────── */

      @media (max-width: 768px) {
        .pipeline-dag-page__hero { padding: 2rem 1.25rem; }
        .pipeline-dag-page__title { font-size: 1.75rem; }
        .pipeline-dag-page__playground { grid-template-columns: 1fr; }
        .pipeline-dag-page__tiers { grid-template-columns: 1fr; }
        .pipeline-dag-page__section { padding: 1.25rem; }
      }
    }
  }
`

// ─── Props Data ─────────────────────────────────────────────────────────────

const dagProps: PropDef[] = [
  { name: 'nodes', type: 'PipelineNode[]', required: true, description: 'Array of pipeline node definitions.' },
  { name: 'edges', type: 'PipelineEdge[]', required: true, description: 'Array of edges connecting nodes by id.' },
  { name: 'direction', type: "'LR' | 'TB'", default: "'LR'", description: 'Layout direction: left-to-right or top-to-bottom.' },
  { name: 'onNodeClick', type: '(node: PipelineNode) => void', description: 'Click handler for nodes. Makes nodes interactive.' },
  { name: 'onEdgeClick', type: '(edge: PipelineEdge) => void', description: 'Click handler for edges.' },
  { name: 'selectedNode', type: 'string', description: 'ID of the currently selected node (highlighted).' },
  { name: 'showMetrics', type: 'boolean', default: 'false', description: 'Show throughput/latency metrics on nodes.' },
  { name: 'showThroughput', type: 'boolean', default: 'false', description: 'Show throughput labels on edges and scale edge width.' },
  { name: 'height', type: 'number | string', default: '300', description: 'SVG height. Accepts px number or CSS string.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override.' },
]

const nodeProps: PropDef[] = [
  { name: 'id', type: 'string', required: true, description: 'Unique node identifier.' },
  { name: 'label', type: 'string', required: true, description: 'Display label for the node.' },
  { name: 'type', type: "'source' | 'transform' | 'sink' | 'filter' | 'aggregate' | 'custom'", description: 'Node type shown as a badge.' },
  { name: 'status', type: "'pending' | 'running' | 'success' | 'failed' | 'skipped'", description: 'Pipeline stage status controlling color coding.' },
  { name: 'metrics', type: '{ throughput?, latency?, errorRate?, dropped? }', description: 'Optional metrics displayed on the node when showMetrics is enabled.' },
  { name: 'icon', type: 'ReactNode', description: 'Optional custom icon for the node.' },
]

const edgeProps: PropDef[] = [
  { name: 'source', type: 'string', required: true, description: 'ID of the source node.' },
  { name: 'target', type: 'string', required: true, description: 'ID of the target node.' },
  { name: 'label', type: 'string', description: 'Optional label displayed at the edge midpoint.' },
  { name: 'throughput', type: 'number', description: 'Throughput value for edge thickness scaling.' },
  { name: 'animated', type: 'boolean', description: 'Override flow animation. Defaults to true when source or target is running.' },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { PipelineDAG } from '@annondeveloper/ui-kit/lite'",
  standard: "import { PipelineDAG } from '@annondeveloper/ui-kit'",
  premium: "import { PipelineDAG } from '@annondeveloper/ui-kit/premium'",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="pipeline-dag-page__copy-btn"
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
    <div className="pipeline-dag-page__control-group">
      <span className="pipeline-dag-page__control-label">{label}</span>
      <div className="pipeline-dag-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`pipeline-dag-page__option-btn${opt === value ? ' pipeline-dag-page__option-btn--active' : ''}`}
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
    <label className="pipeline-dag-page__toggle-label">
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

// ─── Code Generation ────────────────────────────────────────────────────────

function generateReactCode(tier: Tier, direction: string, showMetrics: boolean, showThroughput: boolean): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = [
    '  nodes={nodes}',
    '  edges={edges}',
  ]
  if (direction !== 'LR') props.push(`  direction="${direction}"`)
  if (showMetrics) props.push('  showMetrics')
  if (showThroughput) props.push('  showThroughput')

  return `${importStr}

const nodes = [
  { id: 'kafka', label: 'Kafka Source', type: 'source', status: 'running', metrics: { throughput: 15000 } },
  { id: 'parse', label: 'JSON Parser', type: 'transform', status: 'running', metrics: { throughput: 14800, latency: 2 } },
  { id: 'filter', label: 'Error Filter', type: 'filter', status: 'running', metrics: { throughput: 12000 } },
  { id: 'elastic', label: 'Elasticsearch', type: 'sink', status: 'success' },
]

const edges = [
  { source: 'kafka', target: 'parse', throughput: 15000 },
  { source: 'parse', target: 'filter', throughput: 14800 },
  { source: 'filter', target: 'elastic', throughput: 12000 },
]

<PipelineDAG
${props.join('\n')}
  onNodeClick={(node) => console.log('Clicked:', node.id)}
/>`
}

// ─── Playground Section ─────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [direction, setDirection] = useState<'LR' | 'TB'>('LR')
  const [showMetrics, setShowMetrics] = useState(true)
  const [showThroughput, setShowThroughput] = useState(false)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [selectedNode, setSelectedNode] = useState<string | undefined>()
  const [copyStatus, setCopyStatus] = useState('')

  const DAGComponent = tier === 'lite'
    ? (props: any) => <LitePipelineDAG {...props} />
    : tier === 'premium'
    ? PremiumPipelineDAG
    : PipelineDAG

  const reactCode = useMemo(
    () => generateReactCode(tier, direction, showMetrics, showThroughput),
    [tier, direction, showMetrics, showThroughput],
  )

  const previewProps: Record<string, unknown> = tier === 'lite'
    ? { nodes: liteNodes, edges: liteEdges, direction, height: 320 }
    : {
        nodes: sampleNodes,
        edges: sampleEdges,
        direction,
        showMetrics,
        showThroughput,
        height: 320,
        selectedNode,
        onNodeClick: (node: PipelineNode) => setSelectedNode(node.id === selectedNode ? undefined : node.id),
        motion,
      }

  return (
    <section className="pipeline-dag-page__section" id="playground">
      <h2 className="pipeline-dag-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="pipeline-dag-page__section-desc">
        Configure the pipeline DAG in real-time. Toggle metrics, edge throughput, layout direction, and click nodes to select them.
      </p>

      <div className="pipeline-dag-page__playground">
        <div className="pipeline-dag-page__playground-preview">
          <div className="pipeline-dag-page__playground-result">
            <DAGComponent {...previewProps} />
          </div>

          {selectedNode && (
            <div className="pipeline-dag-page__selected-node">
              Selected: <strong>{sampleNodes.find(n => n.id === selectedNode)?.label ?? selectedNode}</strong>
            </div>
          )}

          <div className="pipeline-dag-page__code-tabs">
            <div className="pipeline-dag-page__export-row">
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
              {copyStatus && <span className="pipeline-dag-page__export-status">{copyStatus}</span>}
            </div>
            <CopyBlock code={reactCode} language="typescript" showLineNumbers />
          </div>
        </div>

        <div className="pipeline-dag-page__playground-controls">
          <OptionGroup
            label="Direction"
            options={['LR', 'TB'] as const}
            value={direction}
            onChange={v => setDirection(v as 'LR' | 'TB')}
          />

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="pipeline-dag-page__control-group">
            <span className="pipeline-dag-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {tier !== 'lite' && (
                <>
                  <Toggle label="Show metrics" checked={showMetrics} onChange={setShowMetrics} />
                  <Toggle label="Show throughput" checked={showThroughput} onChange={setShowThroughput} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function PipelineDagPage() {
  useStyles('pipeline-dag-page', pageStyles)

  const { tier, setTier } = useTier()

  // Scroll reveal fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.pipeline-dag-page__section')
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
    <div className="pipeline-dag-page">
      {/* ── 1. Hero Header ──────────────────────────── */}
      <div className="pipeline-dag-page__hero">
        <h1 className="pipeline-dag-page__title">PipelineDAG</h1>
        <p className="pipeline-dag-page__desc">
          SVG-based directed acyclic graph visualization for data pipelines. Displays node statuses,
          throughput metrics, animated edge flow, and supports interactive selection.
        </p>
        <div className="pipeline-dag-page__import-row">
          <code className="pipeline-dag-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Weight Tiers ─────────────────────────── */}
      <section className="pipeline-dag-page__section" id="tiers">
        <h2 className="pipeline-dag-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="pipeline-dag-page__section-desc">
          Choose between three weight tiers. Lite provides static SVG rendering with no animation.
          Standard adds animated edge flow, metrics display, and interactive selection.
          Premium adds aurora glow, spring-scale entrance, and particle effects.
        </p>

        <div className="pipeline-dag-page__tiers">
          {/* Lite */}
          <div
            className={`pipeline-dag-page__tier-card${tier === 'lite' ? ' pipeline-dag-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="pipeline-dag-page__tier-header">
              <span className="pipeline-dag-page__tier-name">Lite</span>
              <span className="pipeline-dag-page__tier-size">~1.2 KB</span>
            </div>
            <p className="pipeline-dag-page__tier-desc">
              Static SVG rendering. No animations, no metrics, no interactivity. Basic DAG layout with status colors.
            </p>
            <div className="pipeline-dag-page__tier-import">
              import {'{'} PipelineDAG {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="pipeline-dag-page__tier-preview">
              <LitePipelineDAG
                nodes={liteNodes.slice(0, 4)}
                edges={liteEdges.slice(0, 3)}
                height={120}
              />
            </div>
          </div>

          {/* Standard */}
          <div
            className={`pipeline-dag-page__tier-card${tier === 'standard' ? ' pipeline-dag-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="pipeline-dag-page__tier-header">
              <span className="pipeline-dag-page__tier-name">Standard</span>
              <span className="pipeline-dag-page__tier-size">~4 KB</span>
            </div>
            <p className="pipeline-dag-page__tier-desc">
              Full-featured with animated edge flow, metrics display, throughput scaling, interactive node selection, and motion levels.
            </p>
            <div className="pipeline-dag-page__tier-import">
              import {'{'} PipelineDAG {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="pipeline-dag-page__tier-preview">
              <PipelineDAG
                nodes={sampleNodes.slice(0, 4)}
                edges={sampleEdges.slice(0, 3)}
                height={120}
                showMetrics
              />
            </div>
          </div>

          {/* Premium */}
          <div
            className={`pipeline-dag-page__tier-card${tier === 'premium' ? ' pipeline-dag-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="pipeline-dag-page__tier-header">
              <span className="pipeline-dag-page__tier-name">Premium</span>
              <span className="pipeline-dag-page__tier-size">~5.5 KB</span>
            </div>
            <p className="pipeline-dag-page__tier-desc">
              Everything in Standard plus aurora glow on running nodes, spring-scale entrance animation,
              breathing effects for failed nodes, and particle flow on edges.
            </p>
            <div className="pipeline-dag-page__tier-import">
              import {'{'} PipelineDAG {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="pipeline-dag-page__tier-preview">
              <PremiumPipelineDAG
                nodes={sampleNodes.slice(0, 4)}
                edges={sampleEdges.slice(0, 3)}
                height={120}
                showMetrics
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Props API ────────────────────────────── */}
      <section className="pipeline-dag-page__section" id="props">
        <h2 className="pipeline-dag-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="pipeline-dag-page__section-desc">
          All props accepted by PipelineDAG. It also spreads any native div HTML attributes
          onto the underlying container element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={dagProps} />
        </Card>
      </section>

      {/* ── 4b. PipelineNode ────────────────────────── */}
      <section className="pipeline-dag-page__section" id="pipeline-node">
        <h2 className="pipeline-dag-page__section-title">
          <a href="#pipeline-node">PipelineNode</a>
        </h2>
        <p className="pipeline-dag-page__section-desc">
          Shape of each object in the <code>nodes</code> array.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={nodeProps} />
        </Card>
      </section>

      {/* ── 4c. PipelineEdge ────────────────────────── */}
      <section className="pipeline-dag-page__section" id="pipeline-edge">
        <h2 className="pipeline-dag-page__section-title">
          <a href="#pipeline-edge">PipelineEdge</a>
        </h2>
        <p className="pipeline-dag-page__section-desc">
          Shape of each object in the <code>edges</code> array.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={edgeProps} />
        </Card>
      </section>

      {/* ── 5. Accessibility ────────────────────────── */}
      <section className="pipeline-dag-page__section" id="accessibility">
        <h2 className="pipeline-dag-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="pipeline-dag-page__section-desc">
          Built with semantic SVG markup, ARIA attributes, and keyboard support.
        </p>
        <Card variant="default" padding="md">
          <ul className="pipeline-dag-page__a11y-list">
            <li className="pipeline-dag-page__a11y-item">
              <span className="pipeline-dag-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Role:</strong> Uses <code className="pipeline-dag-page__a11y-key">role="img"</code> with descriptive aria-label including node and edge count.
              </span>
            </li>
            <li className="pipeline-dag-page__a11y-item">
              <span className="pipeline-dag-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> When onNodeClick is provided, nodes are focusable with <code className="pipeline-dag-page__a11y-key">Enter</code> and <code className="pipeline-dag-page__a11y-key">Space</code> to activate.
              </span>
            </li>
            <li className="pipeline-dag-page__a11y-item">
              <span className="pipeline-dag-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Motion:</strong> Respects <code className="pipeline-dag-page__a11y-key">prefers-reduced-motion</code> and supports 4 motion levels.
              </span>
            </li>
            <li className="pipeline-dag-page__a11y-item">
              <span className="pipeline-dag-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High Contrast:</strong> Full <code className="pipeline-dag-page__a11y-key">forced-colors</code> support for Windows High Contrast mode.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
