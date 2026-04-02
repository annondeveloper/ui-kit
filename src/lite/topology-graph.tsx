import { forwardRef, useMemo, type HTMLAttributes } from 'react'
import { computeLayout } from '../core/graph'

export interface LiteTopologyNode {
  id: string
  label: string
  type?: string
  status?: 'ok' | 'warning' | 'critical' | 'unknown'
}

export interface LiteTopologyEdge {
  source: string
  target: string
  label?: string
  status?: 'ok' | 'warning' | 'critical' | 'unknown'
}

export interface LiteTopologyGraphProps extends HTMLAttributes<HTMLDivElement> {
  nodes: LiteTopologyNode[]
  edges: LiteTopologyEdge[]
  layout?: 'force' | 'dagre' | 'circular' | 'grid'
  height?: number
}

const STATUS_COLORS: Record<string, string> = {
  ok: 'oklch(72% 0.19 155)',
  warning: 'oklch(80% 0.18 85)',
  critical: 'oklch(62% 0.22 25)',
  unknown: 'oklch(55% 0 0)',
}

/** Lite TopologyGraph — SVG-only, no pan/zoom, no minimap */
export const TopologyGraph = forwardRef<HTMLDivElement, LiteTopologyGraphProps>(
  ({ nodes, edges, layout: layoutType = 'force', height = 400, className, style, ...rest }, ref) => {
    const width = 600

    const layoutResult = useMemo(() => {
      const graphNodes = nodes.map(n => ({
        id: n.id,
        width: 40,
        height: 30,
      }))
      const graphEdges = edges.map(e => ({
        source: e.source,
        target: e.target,
      }))
      return computeLayout(graphNodes, graphEdges, {
        type: layoutType,
        width,
        height,
      })
    }, [nodes, edges, layoutType, height])

    const nodeMap = new Map(nodes.map(n => [n.id, n]))

    return (
      <div
        ref={ref}
        className={`ui-lite-topology-graph${className ? ` ${className}` : ''}`}
        style={{
          display: 'block',
          border: '1px solid oklch(100% 0 0 / 0.08)',
          borderRadius: '0.5rem',
          background: 'oklch(18% 0.01 270)',
          overflow: 'hidden',
          ...style,
        }}
        role="figure"
        aria-label="Network topology graph"
        {...rest}
      >
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
          {/* Edges */}
          {layoutResult.edges.map((le, i) => {
            const edge = edges[i]
            if (!edge || le.points.length < 2) return null
            const start = le.points[0]
            const end = le.points[le.points.length - 1]
            const color = STATUS_COLORS[edge.status || 'unknown'] || STATUS_COLORS.unknown
            return (
              <line
                key={`${edge.source}-${edge.target}`}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke={color}
                strokeWidth={1.5}
                strokeOpacity={0.6}
              />
            )
          })}

          {/* Nodes */}
          {layoutResult.nodes.map(ln => {
            const node = nodeMap.get(ln.id)
            if (!node) return null
            const color = STATUS_COLORS[node.status || 'unknown'] || STATUS_COLORS.unknown
            return (
              <g key={node.id}>
                <circle
                  cx={ln.x}
                  cy={ln.y}
                  r={12}
                  fill="oklch(20% 0.01 270)"
                  stroke={color}
                  strokeWidth={1.5}
                />
                <text
                  x={ln.x}
                  y={ln.y + 22}
                  textAnchor="middle"
                  fontSize={9}
                  fill="oklch(70% 0 0)"
                >
                  {node.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    )
  }
)

TopologyGraph.displayName = 'TopologyGraph'
