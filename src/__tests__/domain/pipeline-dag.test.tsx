import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { PipelineDAG } from '../../domain/pipeline-dag'
import type { PipelineNode, PipelineEdge } from '../../domain/pipeline-dag'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

// ─── Sample Data ────────────────────────────────────────────────────────────

const sampleNodes: PipelineNode[] = [
  { id: 'src', label: 'Kafka Source', type: 'source', status: 'running', metrics: { throughput: 15000 } },
  { id: 'parse', label: 'JSON Parser', type: 'transform', status: 'running', metrics: { throughput: 14800, latency: 2 } },
  { id: 'filter', label: 'Error Filter', type: 'filter', status: 'running', metrics: { throughput: 12000, dropped: 2800 } },
  { id: 'sink', label: 'Elasticsearch', type: 'sink', status: 'success', metrics: { throughput: 12000 } },
]

const sampleEdges: PipelineEdge[] = [
  { source: 'src', target: 'parse', throughput: 15000 },
  { source: 'parse', target: 'filter', throughput: 14800 },
  { source: 'filter', target: 'sink', throughput: 12000 },
]

const diamondNodes: PipelineNode[] = [
  { id: 'a', label: 'Source', type: 'source', status: 'running' },
  { id: 'b', label: 'Branch 1', type: 'transform', status: 'running' },
  { id: 'c', label: 'Branch 2', type: 'transform', status: 'success' },
  { id: 'd', label: 'Merge', type: 'sink', status: 'pending' },
]

const diamondEdges: PipelineEdge[] = [
  { source: 'a', target: 'b' },
  { source: 'a', target: 'c' },
  { source: 'b', target: 'd' },
  { source: 'c', target: 'd' },
]

describe('PipelineDAG', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<PipelineDAG nodes={sampleNodes} edges={sampleEdges} />)
      expect(container.querySelector('.ui-pipeline-dag')).toBeInTheDocument()
    })

    it('renders SVG element', () => {
      const { container } = render(<PipelineDAG nodes={sampleNodes} edges={sampleEdges} />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('renders correct number of node groups', () => {
      const { container } = render(<PipelineDAG nodes={sampleNodes} edges={sampleEdges} />)
      const nodeGroups = container.querySelectorAll('.ui-pipeline-dag__node')
      expect(nodeGroups.length).toBe(4)
    })

    it('renders correct number of edge paths', () => {
      const { container } = render(<PipelineDAG nodes={sampleNodes} edges={sampleEdges} />)
      const edgePaths = container.querySelectorAll('.ui-pipeline-dag__edge-path')
      expect(edgePaths.length).toBe(3)
    })

    it('renders node labels', () => {
      const { container } = render(<PipelineDAG nodes={sampleNodes} edges={sampleEdges} />)
      const labels = container.querySelectorAll('.ui-pipeline-dag__node-label')
      expect(labels.length).toBe(4)
      expect(labels[0].textContent).toBe('Kafka Source')
    })

    it('renders type badges', () => {
      const { container } = render(<PipelineDAG nodes={sampleNodes} edges={sampleEdges} />)
      const types = container.querySelectorAll('.ui-pipeline-dag__node-type')
      expect(types.length).toBe(4)
    })
  })

  // ─── Node statuses ────────────────────────────────────────────────

  describe('node statuses', () => {
    it('renders correct data-status attributes', () => {
      const nodes: PipelineNode[] = [
        { id: 'a', label: 'Pending', status: 'pending' },
        { id: 'b', label: 'Running', status: 'running' },
        { id: 'c', label: 'Success', status: 'success' },
        { id: 'd', label: 'Failed', status: 'failed' },
        { id: 'e', label: 'Skipped', status: 'skipped' },
      ]
      const edges: PipelineEdge[] = [
        { source: 'a', target: 'b' },
        { source: 'b', target: 'c' },
        { source: 'c', target: 'd' },
        { source: 'd', target: 'e' },
      ]
      const { container } = render(<PipelineDAG nodes={nodes} edges={edges} />)
      expect(container.querySelector('[data-status="pending"]')).toBeInTheDocument()
      expect(container.querySelector('[data-status="running"]')).toBeInTheDocument()
      expect(container.querySelector('[data-status="success"]')).toBeInTheDocument()
      expect(container.querySelector('[data-status="failed"]')).toBeInTheDocument()
      expect(container.querySelector('[data-status="skipped"]')).toBeInTheDocument()
    })

    it('applies running class for running nodes', () => {
      const { container } = render(<PipelineDAG nodes={sampleNodes} edges={sampleEdges} />)
      expect(container.querySelector('.ui-pipeline-dag__node--running')).toBeInTheDocument()
    })
  })

  // ─── Interactions ─────────────────────────────────────────────────

  describe('interactions', () => {
    it('calls onNodeClick when a node is clicked', () => {
      const onNodeClick = vi.fn()
      const { container } = render(
        <PipelineDAG nodes={sampleNodes} edges={sampleEdges} onNodeClick={onNodeClick} />
      )
      const nodeGroups = container.querySelectorAll('.ui-pipeline-dag__node')
      fireEvent.click(nodeGroups[0])
      expect(onNodeClick).toHaveBeenCalledOnce()
      expect(onNodeClick.mock.calls[0][0]).toHaveProperty('id', 'src')
    })

    it('calls onEdgeClick when an edge is clicked', () => {
      const onEdgeClick = vi.fn()
      const { container } = render(
        <PipelineDAG nodes={sampleNodes} edges={sampleEdges} onEdgeClick={onEdgeClick} />
      )
      const edgeGroups = container.querySelectorAll('.ui-pipeline-dag__edge')
      fireEvent.click(edgeGroups[0])
      expect(onEdgeClick).toHaveBeenCalledOnce()
      expect(onEdgeClick.mock.calls[0][0]).toHaveProperty('source', 'src')
    })

    it('renders clickable node class when onNodeClick is provided', () => {
      const { container } = render(
        <PipelineDAG nodes={sampleNodes} edges={sampleEdges} onNodeClick={vi.fn()} />
      )
      expect(container.querySelector('.ui-pipeline-dag__node--clickable')).toBeInTheDocument()
    })
  })

  // ─── Direction ────────────────────────────────────────────────────

  describe('direction', () => {
    it('renders LR layout by default', () => {
      const { container } = render(<PipelineDAG nodes={sampleNodes} edges={sampleEdges} />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('renders TB layout', () => {
      const { container } = render(<PipelineDAG nodes={sampleNodes} edges={sampleEdges} direction="TB" />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })
  })

  // ─── Metrics ──────────────────────────────────────────────────────

  describe('metrics', () => {
    it('shows metrics when showMetrics is true', () => {
      const { container } = render(
        <PipelineDAG nodes={sampleNodes} edges={sampleEdges} showMetrics />
      )
      const metrics = container.querySelectorAll('.ui-pipeline-dag__node-metric')
      expect(metrics.length).toBeGreaterThan(0)
    })

    it('does not show metrics when showMetrics is false', () => {
      const { container } = render(
        <PipelineDAG nodes={sampleNodes} edges={sampleEdges} showMetrics={false} />
      )
      const metrics = container.querySelectorAll('.ui-pipeline-dag__node-metric')
      expect(metrics.length).toBe(0)
    })
  })

  // ─── Edge throughput ──────────────────────────────────────────────

  describe('edge throughput', () => {
    it('renders edge labels when showThroughput is true', () => {
      const { container } = render(
        <PipelineDAG nodes={sampleNodes} edges={sampleEdges} showThroughput />
      )
      const labels = container.querySelectorAll('.ui-pipeline-dag__edge-label')
      expect(labels.length).toBeGreaterThan(0)
    })
  })

  // ─── Selection ────────────────────────────────────────────────────

  describe('selection', () => {
    it('applies selected class to the correct node', () => {
      const { container } = render(
        <PipelineDAG nodes={sampleNodes} edges={sampleEdges} selectedNode="parse" />
      )
      const selected = container.querySelector('.ui-pipeline-dag__node--selected')
      expect(selected).toBeInTheDocument()
      expect(selected?.getAttribute('data-node-id')).toBe('parse')
    })

    it('does not apply selected class when no node is selected', () => {
      const { container } = render(
        <PipelineDAG nodes={sampleNodes} edges={sampleEdges} />
      )
      expect(container.querySelector('.ui-pipeline-dag__node--selected')).not.toBeInTheDocument()
    })
  })

  // ─── Edge cases ───────────────────────────────────────────────────

  describe('edge cases', () => {
    it('renders empty pipeline gracefully', () => {
      const { container } = render(<PipelineDAG nodes={[]} edges={[]} />)
      expect(container.querySelector('.ui-pipeline-dag')).toBeInTheDocument()
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('renders single node with no edges', () => {
      const nodes: PipelineNode[] = [{ id: 'solo', label: 'Solo Node', status: 'success' }]
      const { container } = render(<PipelineDAG nodes={nodes} edges={[]} />)
      const nodeGroups = container.querySelectorAll('.ui-pipeline-dag__node')
      expect(nodeGroups.length).toBe(1)
    })

    it('renders linear pipeline (chain)', () => {
      const nodes: PipelineNode[] = [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
        { id: 'c', label: 'C' },
      ]
      const edges: PipelineEdge[] = [
        { source: 'a', target: 'b' },
        { source: 'b', target: 'c' },
      ]
      const { container } = render(<PipelineDAG nodes={nodes} edges={edges} />)
      expect(container.querySelectorAll('.ui-pipeline-dag__node').length).toBe(3)
      expect(container.querySelectorAll('.ui-pipeline-dag__edge-path').length).toBe(2)
    })

    it('renders diamond-shaped DAG', () => {
      const { container } = render(<PipelineDAG nodes={diamondNodes} edges={diamondEdges} />)
      expect(container.querySelectorAll('.ui-pipeline-dag__node').length).toBe(4)
      expect(container.querySelectorAll('.ui-pipeline-dag__edge-path').length).toBe(4)
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has role="img" when non-interactive', () => {
      const { container } = render(<PipelineDAG nodes={sampleNodes} edges={sampleEdges} />)
      expect(container.querySelector('[role="img"]')).toBeInTheDocument()
    })

    it('has role="figure" when interactive', () => {
      const { container } = render(<PipelineDAG nodes={sampleNodes} edges={sampleEdges} onNodeClick={vi.fn()} />)
      expect(container.querySelector('[role="figure"]')).toBeInTheDocument()
    })

    it('has descriptive aria-label', () => {
      const { container } = render(<PipelineDAG nodes={sampleNodes} edges={sampleEdges} />)
      const el = container.querySelector('[role="img"]')
      expect(el?.getAttribute('aria-label')).toContain('4 nodes')
      expect(el?.getAttribute('aria-label')).toContain('3 edges')
    })

    it('has aria-label on empty state', () => {
      const { container } = render(<PipelineDAG nodes={[]} edges={[]} />)
      const el = container.querySelector('[role="img"]')
      expect(el?.getAttribute('aria-label')).toContain('Empty pipeline')
    })

    it('has no axe violations', async () => {
      const { container } = render(
        <PipelineDAG nodes={sampleNodes} edges={sampleEdges} />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations with clickable nodes', async () => {
      const { container } = render(
        <PipelineDAG nodes={sampleNodes} edges={sampleEdges} onNodeClick={vi.fn()} />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── HTML attributes ──────────────────────────────────────────────

  describe('html attributes', () => {
    it('passes className', () => {
      const { container } = render(
        <PipelineDAG nodes={sampleNodes} edges={sampleEdges} className="custom" />
      )
      expect(container.querySelector('.ui-pipeline-dag.custom')).toBeInTheDocument()
    })

    it('passes data attributes', () => {
      render(
        <PipelineDAG nodes={sampleNodes} edges={sampleEdges} data-testid="dag" />
      )
      expect(screen.getByTestId('dag')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(PipelineDAG.displayName).toBe('PipelineDAG')
    })
  })
})
