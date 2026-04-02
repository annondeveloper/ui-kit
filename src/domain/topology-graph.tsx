'use client'

import {
  useRef,
  useState,
  useMemo,
  useCallback,
  useEffect,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'
import { ComponentErrorBoundary } from '../core/utils/error-boundary'
import { computeLayout, type LayoutOptions } from '../core/graph'
import { TopologyGraphSVG } from './topology-graph-svg'
import { TopologyGraphCanvas } from './topology-graph-canvas'

// ─── Re-export types from SVG renderer ──────────────────────────────────────

export type { TopologyNode, TopologyEdge } from './topology-graph-svg'
import type { TopologyNode, TopologyEdge } from './topology-graph-svg'

// ─── Props ──────────────────────────────────────────────────────────────────

export interface TopologyGraphProps extends HTMLAttributes<HTMLDivElement> {
  nodes: TopologyNode[]
  edges: TopologyEdge[]
  layout?: 'force' | 'dagre' | 'circular' | 'grid'
  layoutOptions?: Partial<LayoutOptions>
  onNodeClick?: (node: TopologyNode) => void
  onNodeHover?: (node: TopologyNode | null) => void
  onEdgeClick?: (edge: TopologyEdge) => void
  selectedNodes?: string[]
  showMinimap?: boolean
  showControls?: boolean
  showLegend?: boolean
  height?: number | string
  groupBy?: string
  renderer?: 'auto' | 'svg' | 'canvas'
  nodeFilter?: (node: TopologyNode) => boolean
  edgeFilter?: (edge: TopologyEdge) => boolean
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const topologyGraphStyles = css`
  @layer components {
    @scope (.ui-topology-graph) {
      :scope {
        position: relative;
        display: block;
        min-inline-size: 200px;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md, 0.5rem);
        background: var(--bg-surface, oklch(18% 0.01 270));
        overflow: hidden;
        font-family: var(--font-sans, system-ui, sans-serif);
      }

      .ui-topology-graph__controls {
        position: absolute;
        inset-block-start: 0.5rem;
        inset-inline-end: 0.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        z-index: 2;
      }

      .ui-topology-graph__control-btn {
        all: unset;
        display: flex;
        align-items: center;
        justify-content: center;
        inline-size: 1.75rem;
        block-size: 1.75rem;
        border-radius: var(--radius-sm, 0.375rem);
        background: var(--bg-elevated, oklch(25% 0.02 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.1));
        color: var(--text-secondary, oklch(70% 0 0));
        font-size: 0.875rem;
        cursor: pointer;
        user-select: none;
        transition: background 0.12s, color 0.12s;
      }

      .ui-topology-graph__control-btn:hover {
        background: var(--bg-hover, oklch(30% 0.02 270));
        color: var(--text-primary, oklch(90% 0 0));
      }

      .ui-topology-graph__control-btn:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      .ui-topology-graph__legend {
        position: absolute;
        inset-block-end: 0.5rem;
        inset-inline-start: 0.5rem;
        display: flex;
        flex-wrap: wrap;
        gap: 0.625rem;
        padding: 0.5rem 0.75rem;
        background: var(--bg-elevated, oklch(22% 0.02 270 / 0.9));
        backdrop-filter: blur(8px);
        border-radius: var(--radius-sm, 0.375rem);
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.1));
        z-index: 2;
        font-size: 0.6875rem;
      }

      .ui-topology-graph__legend-item {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        color: var(--text-secondary, oklch(70% 0 0));
      }

      .ui-topology-graph__legend-dot {
        inline-size: 0.5rem;
        block-size: 0.5rem;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .ui-topology-graph__minimap {
        position: absolute;
        inset-block-end: 0.5rem;
        inset-inline-end: 0.5rem;
        inline-size: 140px;
        block-size: 100px;
        background: var(--bg-elevated, oklch(20% 0.01 270 / 0.85));
        backdrop-filter: blur(8px);
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.1));
        border-radius: var(--radius-sm, 0.375rem);
        overflow: hidden;
        z-index: 2;
        pointer-events: none;
      }

      .ui-topology-graph__minimap svg {
        inline-size: 100%;
        block-size: 100%;
      }

      /* Status colors */
      .ui-topology-graph__node[data-status="ok"] rect:nth-of-type(1) {
        stroke: oklch(72% 0.19 155);
      }
      .ui-topology-graph__node[data-status="warning"] rect:nth-of-type(1) {
        stroke: oklch(80% 0.18 85);
      }
      .ui-topology-graph__node[data-status="critical"] rect:nth-of-type(1) {
        stroke: oklch(62% 0.22 25);
      }

      /* Forced colors */
      @media (forced-colors: active) {
        :scope {
          forced-color-adjust: none;
          border-color: ButtonText;
        }
        .ui-topology-graph__control-btn {
          border: 1px solid ButtonText;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .ui-topology-graph__edge path {
          animation: none !important;
        }
      }
    }
  }
`

// ─── Status Legend Data ─────────────────────────────────────────────────────

const LEGEND_STATUSES = [
  { status: 'ok', label: 'OK', color: 'oklch(72% 0.19 155)' },
  { status: 'warning', label: 'Warning', color: 'oklch(80% 0.18 85)' },
  { status: 'critical', label: 'Critical', color: 'oklch(62% 0.22 25)' },
  { status: 'unknown', label: 'Unknown', color: 'oklch(55% 0 0)' },
  { status: 'maintenance', label: 'Maintenance', color: 'oklch(65% 0.15 270)' },
]

// ─── Component ──────────────────────────────────────────────────────────────

function TopologyGraphInner({
  nodes,
  edges,
  layout: layoutType = 'force',
  layoutOptions,
  onNodeClick,
  onNodeHover,
  onEdgeClick,
  selectedNodes,
  showMinimap = false,
  showControls = true,
  showLegend = false,
  height: heightProp = 500,
  groupBy,
  renderer = 'auto',
  nodeFilter,
  edgeFilter,
  motion: motionProp,
  className,
  ...rest
}: TopologyGraphProps) {
  useStyles('topology-graph', topologyGraphStyles)
  const motionLevel = useMotionLevel(motionProp)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(800)
  const [zoom, setZoom] = useState(1)

  // Measure container width
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width)
      }
    })
    ro.observe(el)
    setContainerWidth(el.clientWidth || 800)
    return () => ro.disconnect()
  }, [])

  const graphWidth = containerWidth
  const graphHeight = typeof heightProp === 'number' ? heightProp : 500

  // Filter nodes and edges
  const filteredNodes = useMemo(
    () => nodeFilter ? nodes.filter(nodeFilter) : nodes,
    [nodes, nodeFilter],
  )

  const filteredNodeIds = useMemo(
    () => new Set(filteredNodes.map(n => n.id)),
    [filteredNodes],
  )

  const filteredEdges = useMemo(() => {
    let result = edges.filter(e => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target))
    if (edgeFilter) result = result.filter(edgeFilter)
    return result
  }, [edges, filteredNodeIds, edgeFilter])

  // Compute layout
  const layoutResult = useMemo(() => {
    const graphNodes = filteredNodes.map(n => ({
      id: n.id,
      x: n.x,
      y: n.y,
      width: n.width || 40,
      height: n.height || 30,
      data: n,
      ...(n.x != null ? { fx: n.x } : {}),
      ...(n.y != null ? { fy: n.y } : {}),
    }))

    const graphEdges = filteredEdges.map(e => ({
      source: e.source,
      target: e.target,
      data: e,
    }))

    return computeLayout(graphNodes, graphEdges, {
      type: layoutType,
      width: graphWidth,
      height: graphHeight,
      ...layoutOptions,
    })
  }, [filteredNodes, filteredEdges, layoutType, graphWidth, graphHeight, layoutOptions])

  // Select renderer
  const useCanvas = renderer === 'canvas' || (renderer === 'auto' && filteredNodes.length > 500)

  // Controls
  const handleZoomIn = useCallback(() => setZoom(z => Math.min(z * 1.2, 5)), [])
  const handleZoomOut = useCallback(() => setZoom(z => Math.max(z * 0.8, 0.1)), [])
  const handleFit = useCallback(() => setZoom(1), [])

  return (
    <div
      ref={containerRef}
      className={cn('ui-topology-graph', className)}
      data-motion={motionLevel}
      role="figure"
      aria-label="Network topology graph"
      style={{ height: heightProp }}
      {...rest}
    >
      {/* Controls */}
      {showControls && (
        <div className="ui-topology-graph__controls" role="toolbar" aria-label="Graph controls">
          <button
            type="button"
            className="ui-topology-graph__control-btn"
            onClick={handleZoomIn}
            aria-label="Zoom in"
            data-testid="topology-zoom-in"
          >
            +
          </button>
          <button
            type="button"
            className="ui-topology-graph__control-btn"
            onClick={handleZoomOut}
            aria-label="Zoom out"
            data-testid="topology-zoom-out"
          >
            &minus;
          </button>
          <button
            type="button"
            className="ui-topology-graph__control-btn"
            onClick={handleFit}
            aria-label="Fit to view"
            data-testid="topology-fit"
          >
            &#x2922;
          </button>
        </div>
      )}

      {/* Graph renderer */}
      {useCanvas ? (
        <TopologyGraphCanvas
          layout={layoutResult}
          nodes={filteredNodes}
          edges={filteredEdges}
          selectedNodes={selectedNodes}
          onNodeClick={onNodeClick}
          onNodeHover={onNodeHover}
          onEdgeClick={onEdgeClick}
          motionLevel={motionLevel}
          width={graphWidth}
          height={graphHeight}
        />
      ) : (
        <TopologyGraphSVG
          layout={layoutResult}
          nodes={filteredNodes}
          edges={filteredEdges}
          selectedNodes={selectedNodes}
          onNodeClick={onNodeClick}
          onNodeHover={onNodeHover}
          onEdgeClick={onEdgeClick}
          motionLevel={motionLevel}
          width={graphWidth}
          height={graphHeight}
        />
      )}

      {/* Legend */}
      {showLegend && (
        <div className="ui-topology-graph__legend" data-testid="topology-legend">
          {LEGEND_STATUSES.map(s => (
            <div key={s.status} className="ui-topology-graph__legend-item">
              <span className="ui-topology-graph__legend-dot" style={{ background: s.color }} />
              {s.label}
            </div>
          ))}
        </div>
      )}

      {/* Minimap */}
      {showMinimap && layoutResult.nodes.length > 0 && (
        <div className="ui-topology-graph__minimap" data-testid="topology-minimap">
          <svg viewBox={`0 0 ${layoutResult.width || graphWidth} ${layoutResult.height || graphHeight}`}>
            {layoutResult.edges.map((le, i) => {
              const edge = filteredEdges[i]
              if (!edge || le.points.length < 2) return null
              return (
                <line
                  key={`${edge.source}-${edge.target}`}
                  x1={le.points[0].x}
                  y1={le.points[0].y}
                  x2={le.points[le.points.length - 1].x}
                  y2={le.points[le.points.length - 1].y}
                  stroke="oklch(55% 0 0)"
                  strokeWidth={1}
                  strokeOpacity={0.4}
                />
              )
            })}
            {layoutResult.nodes.map(ln => (
              <circle
                key={ln.id}
                cx={ln.x}
                cy={ln.y}
                r={3}
                fill="oklch(65% 0.15 270)"
              />
            ))}
          </svg>
        </div>
      )}
    </div>
  )
}

export function TopologyGraph(props: TopologyGraphProps) {
  return (
    <ComponentErrorBoundary>
      <TopologyGraphInner {...props} />
    </ComponentErrorBoundary>
  )
}

TopologyGraph.displayName = 'TopologyGraph'
