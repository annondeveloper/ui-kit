import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { TopologyGraph } from '../../domain/topology-graph'
import type { TopologyNode, TopologyEdge } from '../../domain/topology-graph'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

// Mock canvas for canvas renderer tests
beforeEach(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    setTransform: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    rect: vi.fn(),
    roundRect: vi.fn(),
    quadraticCurveTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
    rotate: vi.fn(),
    setLineDash: vi.fn(),
    measureText: vi.fn().mockReturnValue({ width: 10 }),
    canvas: { width: 800, height: 500 },
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    globalAlpha: 1,
    lineDashOffset: 0,
    font: '',
    textAlign: '',
  })
})

// Mock ResizeObserver
class MockResizeObserver {
  callback: ResizeObserverCallback
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }
  observe() {
    // Immediately call with mock entry
    this.callback(
      [{ contentRect: { width: 800, height: 500 } } as ResizeObserverEntry],
      this as unknown as ResizeObserver,
    )
  }
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver

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
]

const sampleEdges: TopologyEdge[] = [
  { source: 'inet', target: 'fw1', animated: true },
  { source: 'fw1', target: 'r1' },
  { source: 'r1', target: 'sw1' },
  { source: 'r1', target: 'sw2' },
  { source: 'sw1', target: 'srv1' },
  { source: 'sw1', target: 'srv2' },
  { source: 'sw2', target: 'srv3' },
  { source: 'srv1', target: 'db1', status: 'ok' },
  { source: 'srv3', target: 'db1', status: 'warning' },
]

describe('TopologyGraph', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(
        <TopologyGraph nodes={sampleNodes} edges={sampleEdges} />
      )
      expect(container.querySelector('.ui-topology-graph')).toBeInTheDocument()
    })

    it('renders SVG renderer for small node counts', () => {
      const { container } = render(
        <TopologyGraph nodes={sampleNodes} edges={sampleEdges} renderer="svg" />
      )
      expect(container.querySelector('[data-testid="topology-svg"]')).toBeInTheDocument()
    })

    it('renders canvas renderer when explicitly set', () => {
      const { container } = render(
        <TopologyGraph nodes={sampleNodes} edges={sampleEdges} renderer="canvas" />
      )
      expect(container.querySelector('[data-testid="topology-canvas"]')).toBeInTheDocument()
    })

    it('renders nodes in SVG', () => {
      const { container } = render(
        <TopologyGraph nodes={sampleNodes} edges={sampleEdges} renderer="svg" />
      )
      const nodeGroups = container.querySelectorAll('.ui-topology-graph__node')
      expect(nodeGroups.length).toBe(sampleNodes.length)
    })

    it('renders node labels', () => {
      render(
        <TopologyGraph nodes={sampleNodes} edges={sampleEdges} renderer="svg" />
      )
      expect(screen.getByText('Internet')).toBeInTheDocument()
      expect(screen.getByText('Firewall')).toBeInTheDocument()
      expect(screen.getByText('Core Router')).toBeInTheDocument()
    })

    it('renders edges in SVG', () => {
      const { container } = render(
        <TopologyGraph nodes={sampleNodes} edges={sampleEdges} renderer="svg" />
      )
      const edgeGroups = container.querySelectorAll('.ui-topology-graph__edge')
      expect(edgeGroups.length).toBe(sampleEdges.length)
    })
  })

  // ─── Interactions ─────────────────────────────────────────────────────

  describe('interactions', () => {
    it('calls onNodeClick when a node is clicked', () => {
      const onClick = vi.fn()
      const { container } = render(
        <TopologyGraph nodes={sampleNodes} edges={sampleEdges} renderer="svg" onNodeClick={onClick} />
      )
      const node = container.querySelector('[data-testid="topology-node-inet"]')
      expect(node).toBeInTheDocument()
      fireEvent.click(node!)
      expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'inet' }))
    })

    it('calls onEdgeClick when an edge is clicked', () => {
      const onClick = vi.fn()
      const { container } = render(
        <TopologyGraph nodes={sampleNodes} edges={sampleEdges} renderer="svg" onEdgeClick={onClick} />
      )
      const edgePath = container.querySelector('.ui-topology-graph__edge path')
      expect(edgePath).toBeInTheDocument()
      fireEvent.click(edgePath!)
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('calls onNodeHover on mouseenter/mouseleave', () => {
      const onHover = vi.fn()
      const { container } = render(
        <TopologyGraph nodes={sampleNodes} edges={sampleEdges} renderer="svg" onNodeHover={onHover} />
      )
      const node = container.querySelector('[data-testid="topology-node-fw1"]')
      fireEvent.mouseEnter(node!)
      expect(onHover).toHaveBeenCalledWith(expect.objectContaining({ id: 'fw1' }))
      fireEvent.mouseLeave(node!)
      expect(onHover).toHaveBeenCalledWith(null)
    })
  })

  // ─── Controls ─────────────────────────────────────────────────────────

  describe('controls', () => {
    it('renders zoom buttons when showControls is true', () => {
      render(
        <TopologyGraph nodes={sampleNodes} edges={sampleEdges} showControls />
      )
      expect(screen.getByLabelText('Zoom in')).toBeInTheDocument()
      expect(screen.getByLabelText('Zoom out')).toBeInTheDocument()
      expect(screen.getByLabelText('Fit to view')).toBeInTheDocument()
    })

    it('does not render controls when showControls is false', () => {
      render(
        <TopologyGraph nodes={sampleNodes} edges={sampleEdges} showControls={false} />
      )
      expect(screen.queryByLabelText('Zoom in')).not.toBeInTheDocument()
    })
  })

  // ─── Legend ───────────────────────────────────────────────────────────

  describe('legend', () => {
    it('renders legend when showLegend is true', () => {
      const { container } = render(
        <TopologyGraph nodes={sampleNodes} edges={sampleEdges} showLegend />
      )
      expect(container.querySelector('[data-testid="topology-legend"]')).toBeInTheDocument()
      expect(screen.getByText('OK')).toBeInTheDocument()
      expect(screen.getByText('Warning')).toBeInTheDocument()
      expect(screen.getByText('Critical')).toBeInTheDocument()
    })

    it('does not render legend when showLegend is false', () => {
      const { container } = render(
        <TopologyGraph nodes={sampleNodes} edges={sampleEdges} showLegend={false} />
      )
      expect(container.querySelector('[data-testid="topology-legend"]')).not.toBeInTheDocument()
    })
  })

  // ─── Layout ───────────────────────────────────────────────────────────

  describe('layout', () => {
    it('applies force layout by default', () => {
      const { container } = render(
        <TopologyGraph nodes={sampleNodes} edges={sampleEdges} renderer="svg" />
      )
      // Should render without error — layout computes positions
      expect(container.querySelector('.ui-topology-graph__node')).toBeInTheDocument()
    })

    it('applies circular layout', () => {
      const { container } = render(
        <TopologyGraph nodes={sampleNodes} edges={sampleEdges} layout="circular" renderer="svg" />
      )
      expect(container.querySelectorAll('.ui-topology-graph__node').length).toBe(sampleNodes.length)
    })

    it('applies dagre layout', () => {
      const { container } = render(
        <TopologyGraph nodes={sampleNodes} edges={sampleEdges} layout="dagre" renderer="svg" />
      )
      expect(container.querySelectorAll('.ui-topology-graph__node').length).toBe(sampleNodes.length)
    })

    it('applies grid layout', () => {
      const { container } = render(
        <TopologyGraph nodes={sampleNodes} edges={sampleEdges} layout="grid" renderer="svg" />
      )
      expect(container.querySelectorAll('.ui-topology-graph__node').length).toBe(sampleNodes.length)
    })
  })

  // ─── Renderer selection ───────────────────────────────────────────────

  describe('renderer selection', () => {
    it('auto selects SVG for <=500 nodes', () => {
      const { container } = render(
        <TopologyGraph nodes={sampleNodes} edges={sampleEdges} renderer="auto" />
      )
      expect(container.querySelector('[data-testid="topology-svg"]')).toBeInTheDocument()
    })

    it('forces canvas when renderer is canvas', () => {
      const { container } = render(
        <TopologyGraph nodes={sampleNodes} edges={sampleEdges} renderer="canvas" />
      )
      expect(container.querySelector('[data-testid="topology-canvas"]')).toBeInTheDocument()
      expect(container.querySelector('[data-testid="topology-svg"]')).not.toBeInTheDocument()
    })

    it('forces SVG when renderer is svg', () => {
      const { container } = render(
        <TopologyGraph nodes={sampleNodes} edges={sampleEdges} renderer="svg" />
      )
      expect(container.querySelector('[data-testid="topology-svg"]')).toBeInTheDocument()
      expect(container.querySelector('[data-testid="topology-canvas"]')).not.toBeInTheDocument()
    })
  })

  // ─── Minimap ──────────────────────────────────────────────────────────

  describe('minimap', () => {
    it('renders minimap when showMinimap is true', () => {
      const { container } = render(
        <TopologyGraph nodes={sampleNodes} edges={sampleEdges} showMinimap />
      )
      expect(container.querySelector('[data-testid="topology-minimap"]')).toBeInTheDocument()
    })

    it('does not render minimap when showMinimap is false', () => {
      const { container } = render(
        <TopologyGraph nodes={sampleNodes} edges={sampleEdges} showMinimap={false} />
      )
      expect(container.querySelector('[data-testid="topology-minimap"]')).not.toBeInTheDocument()
    })
  })

  // ─── Edge cases ───────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('renders empty graph without error', () => {
      const { container } = render(
        <TopologyGraph nodes={[]} edges={[]} />
      )
      expect(container.querySelector('.ui-topology-graph')).toBeInTheDocument()
    })

    it('renders single node without edges', () => {
      const { container } = render(
        <TopologyGraph
          nodes={[{ id: 'solo', label: 'Lone Server', type: 'server', status: 'ok' }]}
          edges={[]}
          renderer="svg"
        />
      )
      expect(container.querySelectorAll('.ui-topology-graph__node').length).toBe(1)
      expect(screen.getByText('Lone Server')).toBeInTheDocument()
    })

    it('handles disconnected nodes', () => {
      const nodes: TopologyNode[] = [
        { id: 'a', label: 'Node A', status: 'ok' },
        { id: 'b', label: 'Node B', status: 'ok' },
        { id: 'c', label: 'Node C', status: 'ok' },
      ]
      const edges: TopologyEdge[] = [
        { source: 'a', target: 'b' },
        // c is disconnected
      ]
      const { container } = render(
        <TopologyGraph nodes={nodes} edges={edges} renderer="svg" />
      )
      expect(container.querySelectorAll('.ui-topology-graph__node').length).toBe(3)
    })

    it('applies nodeFilter to exclude nodes', () => {
      const { container } = render(
        <TopologyGraph
          nodes={sampleNodes}
          edges={sampleEdges}
          renderer="svg"
          nodeFilter={n => n.status !== 'critical'}
        />
      )
      // srv3 (critical) should be excluded
      const nodeGroups = container.querySelectorAll('.ui-topology-graph__node')
      expect(nodeGroups.length).toBe(sampleNodes.length - 1)
    })

    it('applies edgeFilter to exclude edges', () => {
      const { container } = render(
        <TopologyGraph
          nodes={sampleNodes}
          edges={sampleEdges}
          renderer="svg"
          edgeFilter={e => !e.animated}
        />
      )
      const edgeGroups = container.querySelectorAll('.ui-topology-graph__edge')
      // One animated edge should be removed
      expect(edgeGroups.length).toBe(sampleEdges.length - 1)
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has aria-label on the container', () => {
      const { container } = render(
        <TopologyGraph nodes={sampleNodes} edges={sampleEdges} />
      )
      const root = container.querySelector('.ui-topology-graph')
      expect(root).toHaveAttribute('aria-label', 'Network topology graph')
    })

    it('has role figure on the container', () => {
      const { container } = render(
        <TopologyGraph nodes={sampleNodes} edges={sampleEdges} />
      )
      expect(container.querySelector('[role="figure"]')).toBeInTheDocument()
    })

    it('controls toolbar has aria-label', () => {
      render(
        <TopologyGraph nodes={sampleNodes} edges={sampleEdges} showControls />
      )
      expect(screen.getByRole('toolbar')).toHaveAttribute('aria-label', 'Graph controls')
    })

    it('passes axe accessibility check', async () => {
      const { container } = render(
        <TopologyGraph nodes={sampleNodes} edges={sampleEdges} showControls showLegend />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
