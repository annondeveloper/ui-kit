import { forwardRef, useMemo } from 'react'
import type { HTMLAttributes } from 'react'
import { computeLayout } from '../core/graph'

export interface LitePipelineNode {
  id: string
  label: string
  status?: 'pending' | 'running' | 'success' | 'failed' | 'skipped'
}

export interface LitePipelineEdge {
  source: string
  target: string
}

export interface LitePipelineDAGProps extends HTMLAttributes<HTMLDivElement> {
  nodes: LitePipelineNode[]
  edges: LitePipelineEdge[]
  direction?: 'LR' | 'TB'
  height?: number | string
}

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

const NODE_W = 140
const NODE_H = 44

/** Lite PipelineDAG — simple SVG rendering, no animation */
export const PipelineDAG = forwardRef<HTMLDivElement, LitePipelineDAGProps>(
  ({ nodes, edges, direction = 'LR', height = 300, className, style, ...rest }, ref) => {
    const layout = useMemo(() => {
      if (nodes.length === 0) return null

      const graphNodes = nodes.map(n => ({ id: n.id, width: NODE_W, height: NODE_H }))
      const graphEdges = edges.map(e => ({ source: e.source, target: e.target }))

      const layerCount = Math.ceil(nodes.length / 2)
      const w = direction === 'LR'
        ? Math.max(500, layerCount * (NODE_W + 60) + 80)
        : Math.max(350, 3 * (NODE_W + 40) + 80)
      const h = direction === 'TB'
        ? Math.max(350, layerCount * (NODE_H + 50) + 80)
        : Math.max(250, 3 * (NODE_H + 30) + 80)

      return computeLayout(graphNodes, graphEdges, {
        type: 'dagre',
        rankDir: direction,
        width: w,
        height: h,
        rankSep: 60,
        nodeSep: 30,
      })
    }, [nodes, edges, direction])

    const nodeMap = useMemo(() => {
      const m = new Map<string, LitePipelineNode>()
      for (const n of nodes) m.set(n.id, n)
      return m
    }, [nodes])

    const heightStyle = typeof height === 'number' ? `${height}px` : height

    return (
      <div
        ref={ref}
        className={`ui-lite-pipeline-dag${className ? ` ${className}` : ''}`}
        style={{ display: 'block', ...style }}
        role="img"
        aria-label={`Pipeline DAG with ${nodes.length} nodes`}
        {...rest}
      >
        {!layout ? (
          <svg viewBox="0 0 400 100" style={{ width: '100%', height: heightStyle }}>
            <text x="200" y="50" textAnchor="middle" fill="oklch(55% 0 0)" fontSize="13">
              No pipeline data
            </text>
          </svg>
        ) : (
          <svg
            viewBox={`0 0 ${layout.width} ${layout.height}`}
            style={{ width: '100%', height: heightStyle }}
          >
            <defs>
              <marker
                id="ui-lite-dag-arrow"
                viewBox="0 0 10 10"
                refX="10" refY="5"
                markerWidth="5" markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 Z" fill="oklch(100% 0 0 / 0.2)" />
              </marker>
            </defs>

            {/* Edges */}
            {layout.edges.map((le, i) => {
              const pe = edges[i]
              if (!pe || le.points.length < 2) return null
              const [s, e] = [le.points[0], le.points[le.points.length - 1]]
              const dx = direction === 'LR' ? (e.x - s.x) * 0.4 : 0
              const dy = direction === 'TB' ? (e.y - s.y) * 0.4 : 0
              const d = direction === 'LR'
                ? `M ${s.x} ${s.y} C ${s.x + dx} ${s.y}, ${e.x - dx} ${e.y}, ${e.x} ${e.y}`
                : `M ${s.x} ${s.y} C ${s.x} ${s.y + dy}, ${e.x} ${e.y - dy}, ${e.x} ${e.y}`
              return (
                <path
                  key={`${pe.source}-${pe.target}`}
                  d={d}
                  fill="none"
                  stroke="oklch(100% 0 0 / 0.15)"
                  strokeWidth="1.5"
                  markerEnd="url(#ui-lite-dag-arrow)"
                />
              )
            })}

            {/* Nodes */}
            {layout.nodes.map(ln => {
              const pn = nodeMap.get(ln.id)
              if (!pn) return null
              const status = pn.status ?? 'pending'
              const x = ln.x - NODE_W / 2
              const y = ln.y - NODE_H / 2
              return (
                <g key={pn.id} data-status={status}>
                  <rect
                    x={x} y={y} width={NODE_W} height={NODE_H}
                    rx={6} ry={6}
                    fill={STATUS_BG[status] ?? STATUS_BG.pending}
                    stroke="oklch(100% 0 0 / 0.08)"
                    strokeWidth={1}
                  />
                  <rect
                    x={x} y={y} width={3} height={NODE_H}
                    rx={1.5}
                    fill={STATUS_COLORS[status] ?? STATUS_COLORS.pending}
                  />
                  <text
                    x={x + 12} y={y + NODE_H / 2}
                    dominantBaseline="central"
                    fontSize="11"
                    fontWeight="600"
                    fill="oklch(90% 0 0)"
                  >
                    {pn.label}
                  </text>
                </g>
              )
            })}
          </svg>
        )}
      </div>
    )
  }
)
PipelineDAG.displayName = 'PipelineDAG'
