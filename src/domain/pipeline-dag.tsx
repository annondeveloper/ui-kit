'use client'

import {
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'
import { ComponentErrorBoundary } from '../core/utils/error-boundary'
import { computeLayout } from '../core/graph'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PipelineNode {
  id: string
  label: string
  type?: 'source' | 'transform' | 'sink' | 'filter' | 'aggregate' | 'custom'
  status?: 'pending' | 'running' | 'success' | 'failed' | 'skipped'
  metrics?: {
    throughput?: number
    latency?: number
    errorRate?: number
    dropped?: number
  }
  icon?: ReactNode
}

export interface PipelineEdge {
  source: string
  target: string
  label?: string
  throughput?: number
  animated?: boolean
}

export interface PipelineDAGProps extends HTMLAttributes<HTMLDivElement> {
  nodes: PipelineNode[]
  edges: PipelineEdge[]
  direction?: 'LR' | 'TB'
  onNodeClick?: (node: PipelineNode) => void
  onEdgeClick?: (edge: PipelineEdge) => void
  selectedNode?: string
  showMetrics?: boolean
  showThroughput?: boolean
  height?: number | string
  motion?: 0 | 1 | 2 | 3
}

// ─── Constants ──────────────────────────────────────────────────────────────

const NODE_WIDTH = 160
const NODE_HEIGHT = 56
const NODE_HEIGHT_METRICS = 76
const PADDING = 40

const STATUS_COLORS: Record<string, string> = {
  pending: 'oklch(70% 0 0)',
  running: 'oklch(65% 0.2 270)',
  success: 'oklch(72% 0.19 155)',
  failed: 'oklch(62% 0.22 25)',
  skipped: 'oklch(55% 0 0)',
}

const STATUS_BG: Record<string, string> = {
  pending: 'oklch(70% 0 0 / 0.08)',
  running: 'oklch(65% 0.2 270 / 0.08)',
  success: 'oklch(72% 0.19 155 / 0.08)',
  failed: 'oklch(62% 0.22 25 / 0.08)',
  skipped: 'oklch(55% 0 0 / 0.06)',
}

const TYPE_LABELS: Record<string, string> = {
  source: 'Source',
  transform: 'Transform',
  sink: 'Sink',
  filter: 'Filter',
  aggregate: 'Aggregate',
  custom: 'Custom',
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatThroughput(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M/s`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K/s`
  return `${n}/s`
}

function buildBezierPath(points: Array<{ x: number; y: number }>, direction: 'LR' | 'TB'): string {
  if (points.length < 2) return ''
  const [start, end] = [points[0], points[points.length - 1]]

  if (direction === 'LR') {
    const dx = (end.x - start.x) * 0.4
    return `M ${start.x} ${start.y} C ${start.x + dx} ${start.y}, ${end.x - dx} ${end.y}, ${end.x} ${end.y}`
  }
  const dy = (end.y - start.y) * 0.4
  return `M ${start.x} ${start.y} C ${start.x} ${start.y + dy}, ${end.x} ${end.y - dy}, ${end.x} ${end.y}`
}

function edgeMidpoint(points: Array<{ x: number; y: number }>): { x: number; y: number } {
  if (points.length < 2) return { x: 0, y: 0 }
  return {
    x: (points[0].x + points[points.length - 1].x) / 2,
    y: (points[0].y + points[points.length - 1].y) / 2,
  }
}

function isEdgeAnimated(edge: PipelineEdge, nodeMap: Map<string, PipelineNode>): boolean {
  if (edge.animated !== undefined) return edge.animated
  const src = nodeMap.get(edge.source)
  const tgt = nodeMap.get(edge.target)
  return src?.status === 'running' || tgt?.status === 'running'
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const dagStyles = css`
  @layer components {
    @scope (.ui-pipeline-dag) {
      :scope {
        position: relative;
        display: block;
        container-type: inline-size;
        container-name: pipeline-dag;
      }

      .ui-pipeline-dag__svg {
        display: block;
        width: 100%;
        height: auto;
      }

      /* ── Node ──────────────────────────── */

      .ui-pipeline-dag__node {
        cursor: default;
      }

      .ui-pipeline-dag__node--clickable {
        cursor: pointer;
      }

      .ui-pipeline-dag__node--clickable:hover .ui-pipeline-dag__node-bg {
        filter: brightness(1.15);
      }

      .ui-pipeline-dag__node--clickable:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      .ui-pipeline-dag__node-bg {
        rx: 8;
        ry: 8;
        fill: var(--bg-surface, oklch(20% 0.01 270));
        stroke: var(--border-default, oklch(100% 0 0 / 0.08));
        stroke-width: 1;
        transition: filter 0.15s ease;
      }

      .ui-pipeline-dag__node-accent {
        rx: 8;
        ry: 0;
      }

      .ui-pipeline-dag__node--selected .ui-pipeline-dag__node-bg {
        stroke-width: 2;
        stroke: var(--brand, oklch(65% 0.2 270));
        filter: drop-shadow(0 0 6px oklch(65% 0.2 270 / 0.3));
      }

      .ui-pipeline-dag__node-label {
        font-size: 0.75rem;
        font-weight: 600;
        fill: var(--text-primary, oklch(90% 0 0));
        dominant-baseline: central;
      }

      .ui-pipeline-dag__node-type {
        font-size: 0.5625rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        dominant-baseline: central;
      }

      .ui-pipeline-dag__node-metric {
        font-size: 0.5625rem;
        font-family: var(--font-mono, ui-monospace, monospace);
        dominant-baseline: central;
        fill: var(--text-tertiary, oklch(55% 0 0));
      }

      /* ── Edge ──────────────────────────── */

      .ui-pipeline-dag__edge {
        cursor: default;
      }

      .ui-pipeline-dag__edge--clickable {
        cursor: pointer;
      }

      .ui-pipeline-dag__edge-path {
        fill: none;
        stroke: var(--border-default, oklch(100% 0 0 / 0.15));
        stroke-width: 1.5;
        stroke-linecap: round;
      }

      .ui-pipeline-dag__edge-hit {
        fill: none;
        stroke: transparent;
        stroke-width: 12;
        cursor: pointer;
      }

      .ui-pipeline-dag__edge-label {
        font-size: 9px;
        fill: var(--text-tertiary, oklch(55% 0 0));
        text-anchor: middle;
        dominant-baseline: central;
      }

      /* ── Animated flow ─────────────────── */

      :scope:not([data-motion="0"]) .ui-pipeline-dag__edge-path--animated {
        stroke-dasharray: 6 4;
        animation: ui-dag-flow 0.8s linear infinite;
      }

      @keyframes ui-dag-flow {
        to { stroke-dashoffset: -10; }
      }

      /* ── Running pulse ─────────────────── */

      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-pipeline-dag__node--running .ui-pipeline-dag__node-accent {
        animation: ui-dag-pulse 2s ease-in-out infinite;
      }

      @keyframes ui-dag-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }

      /* ── Reduced motion ────────────────── */

      @media (prefers-reduced-motion: reduce) {
        .ui-pipeline-dag__edge-path--animated { animation: none; }
        .ui-pipeline-dag__node--running .ui-pipeline-dag__node-accent { animation: none; }
      }

      /* ── Forced colors ─────────────────── */

      @media (forced-colors: active) {
        .ui-pipeline-dag__node-bg {
          forced-color-adjust: none;
          stroke: ButtonText;
          fill: Canvas;
        }
        .ui-pipeline-dag__edge-path {
          stroke: ButtonText;
        }
        .ui-pipeline-dag__node-label {
          fill: ButtonText;
        }
      }

      /* ── Container responsive ──────────── */

      @container pipeline-dag (max-width: 400px) {
        .ui-pipeline-dag__node-metric { display: none; }
        .ui-pipeline-dag__edge-label { display: none; }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

function PipelineDAGInner({
  nodes,
  edges,
  direction = 'LR',
  onNodeClick,
  onEdgeClick,
  selectedNode,
  showMetrics = false,
  showThroughput = false,
  height = 300,
  motion: motionProp,
  className,
  ...rest
}: PipelineDAGProps) {
  useStyles('pipeline-dag', dagStyles)
  const motionLevel = useMotionLevel(motionProp)

  const nodeMap = useMemo(() => {
    const m = new Map<string, PipelineNode>()
    for (const n of nodes) m.set(n.id, n)
    return m
  }, [nodes])

  const nodeH = showMetrics ? NODE_HEIGHT_METRICS : NODE_HEIGHT

  const layout = useMemo(() => {
    if (nodes.length === 0) return null

    const graphNodes = nodes.map(n => ({
      id: n.id,
      width: NODE_WIDTH,
      height: nodeH,
    }))

    const graphEdges = edges.map(e => ({
      source: e.source,
      target: e.target,
    }))

    // Calculate layout area based on node count
    const layerCount = Math.ceil(nodes.length / 2)
    const w = direction === 'LR'
      ? Math.max(600, layerCount * (NODE_WIDTH + 80) + PADDING * 2)
      : Math.max(400, 3 * (NODE_WIDTH + 60) + PADDING * 2)
    const h = direction === 'TB'
      ? Math.max(400, layerCount * (nodeH + 60) + PADDING * 2)
      : Math.max(300, 3 * (nodeH + 40) + PADDING * 2)

    return computeLayout(graphNodes, graphEdges, {
      type: 'dagre',
      rankDir: direction,
      width: w,
      height: h,
      rankSep: 80,
      nodeSep: 40,
    })
  }, [nodes, edges, direction, nodeH])

  if (!layout || nodes.length === 0) {
    return (
      <div
        className={cn('ui-pipeline-dag', className)}
        data-motion={motionLevel}
        role="img"
        aria-label="Empty pipeline DAG"
        {...rest}
      >
        <svg
          className="ui-pipeline-dag__svg"
          viewBox="0 0 400 100"
          style={{ height: typeof height === 'number' ? `${height}px` : height }}
        >
          <text x="200" y="50" textAnchor="middle" fill="var(--text-tertiary, oklch(55% 0 0))" fontSize="13">
            No pipeline data
          </text>
        </svg>
      </div>
    )
  }

  const viewBox = `0 0 ${layout.width} ${layout.height}`

  // Compute max throughput for edge scaling
  const maxThroughput = edges.reduce((max, e) => Math.max(max, e.throughput ?? 0), 1)

  return (
    <div
      className={cn('ui-pipeline-dag', className)}
      data-motion={motionLevel}
      role={onNodeClick || onEdgeClick ? 'figure' : 'img'}
      aria-label={`Pipeline DAG with ${nodes.length} nodes and ${edges.length} edges`}
      {...rest}
    >
      <svg
        className="ui-pipeline-dag__svg"
        viewBox={viewBox}
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <marker
            id="ui-dag-arrow"
            viewBox="0 0 10 10"
            refX="10"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 Z" fill="var(--border-default, oklch(100% 0 0 / 0.2))" />
          </marker>
        </defs>

        {/* ── Edges ──────────────────────────── */}
        <g className="ui-pipeline-dag__edges">
          {layout.edges.map((layoutEdge, i) => {
            const pipeEdge = edges[i]
            if (!pipeEdge) return null
            const animated = isEdgeAnimated(pipeEdge, nodeMap)
            const strokeWidth = showThroughput && pipeEdge.throughput
              ? 1.5 + (pipeEdge.throughput / maxThroughput) * 3
              : 1.5
            const pathD = buildBezierPath(layoutEdge.points, direction)
            const mid = edgeMidpoint(layoutEdge.points)

            return (
              <g
                key={`${pipeEdge.source}-${pipeEdge.target}`}
                className={cn('ui-pipeline-dag__edge', onEdgeClick && 'ui-pipeline-dag__edge--clickable')}
                onClick={onEdgeClick ? () => onEdgeClick(pipeEdge) : undefined}
              >
                {onEdgeClick && (
                  <path className="ui-pipeline-dag__edge-hit" d={pathD} />
                )}
                <path
                  className={cn(
                    'ui-pipeline-dag__edge-path',
                    animated && 'ui-pipeline-dag__edge-path--animated',
                  )}
                  d={pathD}
                  strokeWidth={strokeWidth}
                  markerEnd="url(#ui-dag-arrow)"
                />
                {pipeEdge.label && (
                  <text className="ui-pipeline-dag__edge-label" x={mid.x} y={mid.y - 8}>
                    {pipeEdge.label}
                  </text>
                )}
                {showThroughput && pipeEdge.throughput != null && (
                  <text className="ui-pipeline-dag__edge-label" x={mid.x} y={mid.y + 10}>
                    {formatThroughput(pipeEdge.throughput)}
                  </text>
                )}
              </g>
            )
          })}
        </g>

        {/* ── Nodes ──────────────────────────── */}
        <g className="ui-pipeline-dag__nodes">
          {layout.nodes.map(layoutNode => {
            const pipeNode = nodeMap.get(layoutNode.id)
            if (!pipeNode) return null
            const status = pipeNode.status ?? 'pending'
            const statusColor = STATUS_COLORS[status] ?? STATUS_COLORS.pending
            const statusBg = STATUS_BG[status] ?? STATUS_BG.pending
            const x = layoutNode.x - NODE_WIDTH / 2
            const y = layoutNode.y - nodeH / 2
            const isSelected = selectedNode === pipeNode.id

            return (
              <g
                key={pipeNode.id}
                className={cn(
                  'ui-pipeline-dag__node',
                  onNodeClick && 'ui-pipeline-dag__node--clickable',
                  isSelected && 'ui-pipeline-dag__node--selected',
                  status === 'running' && 'ui-pipeline-dag__node--running',
                )}
                data-status={status}
                data-node-id={pipeNode.id}
                onClick={onNodeClick ? () => onNodeClick(pipeNode) : undefined}
                tabIndex={onNodeClick ? 0 : undefined}
                role={onNodeClick ? 'button' : undefined}
                aria-label={onNodeClick ? `${pipeNode.label}: ${status}` : undefined}
                onKeyDown={onNodeClick ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onNodeClick(pipeNode)
                  }
                } : undefined}
              >
                {/* Background rect */}
                <rect
                  className="ui-pipeline-dag__node-bg"
                  x={x}
                  y={y}
                  width={NODE_WIDTH}
                  height={nodeH}
                  fill={statusBg}
                />

                {/* Status accent bar (left side) */}
                <rect
                  className="ui-pipeline-dag__node-accent"
                  x={x}
                  y={y}
                  width={4}
                  height={nodeH}
                  fill={statusColor}
                  rx={2}
                />

                {/* Label */}
                <text
                  className="ui-pipeline-dag__node-label"
                  x={x + 14}
                  y={y + 18}
                >
                  {pipeNode.label}
                </text>

                {/* Type badge */}
                {pipeNode.type && (
                  <text
                    className="ui-pipeline-dag__node-type"
                    x={x + 14}
                    y={y + 34}
                    fill={statusColor}
                  >
                    {TYPE_LABELS[pipeNode.type] ?? pipeNode.type}
                  </text>
                )}

                {/* Metrics */}
                {showMetrics && pipeNode.metrics && (
                  <text
                    className="ui-pipeline-dag__node-metric"
                    x={x + 14}
                    y={y + 52}
                  >
                    {pipeNode.metrics.throughput != null && formatThroughput(pipeNode.metrics.throughput)}
                    {pipeNode.metrics.latency != null && ` ${pipeNode.metrics.latency}ms`}
                    {pipeNode.metrics.errorRate != null && ` ${pipeNode.metrics.errorRate}% err`}
                    {pipeNode.metrics.dropped != null && ` -${pipeNode.metrics.dropped}`}
                  </text>
                )}
              </g>
            )
          })}
        </g>
      </svg>
    </div>
  )
}

export function PipelineDAG(props: PipelineDAGProps) {
  return (
    <ComponentErrorBoundary>
      <PipelineDAGInner {...props} />
    </ComponentErrorBoundary>
  )
}

PipelineDAG.displayName = 'PipelineDAG'
