'use client'

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import type { LayoutResult } from '../core/graph'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TopologyNode {
  id: string
  label: string
  type?: 'server' | 'switch' | 'router' | 'firewall' | 'cloud' | 'database' | 'loadbalancer' | 'custom'
  status?: 'ok' | 'warning' | 'critical' | 'unknown' | 'maintenance'
  icon?: React.ReactNode
  group?: string
  metrics?: Record<string, number>
  x?: number
  y?: number
  width?: number
  height?: number
}

export interface TopologyEdge {
  source: string
  target: string
  label?: string
  status?: 'ok' | 'warning' | 'critical' | 'unknown'
  bandwidth?: number
  animated?: boolean
  bidirectional?: boolean
}

export interface TopologyGraphSVGProps {
  layout: LayoutResult
  nodes: TopologyNode[]
  edges: TopologyEdge[]
  selectedNodes?: string[]
  onNodeClick?: (node: TopologyNode) => void
  onNodeHover?: (node: TopologyNode | null) => void
  onEdgeClick?: (edge: TopologyEdge) => void
  motionLevel: number
  width: number
  height: number
}

// ─── Status Colors ──────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  ok: 'oklch(72% 0.19 155)',
  warning: 'oklch(80% 0.18 85)',
  critical: 'oklch(62% 0.22 25)',
  unknown: 'oklch(55% 0 0)',
  maintenance: 'oklch(65% 0.15 270)',
}

function getStatusColor(status?: string): string {
  return STATUS_COLORS[status || 'unknown'] || STATUS_COLORS.unknown
}

// ─── Node Icon SVGs ─────────────────────────────────────────────────────────

function NodeIcon({ type, size = 14 }: { type?: string; size?: number }) {
  const half = size / 2
  const color = 'currentColor'

  switch (type) {
    case 'server':
      return (
        <rect x={-half} y={-half} width={size} height={size} rx={2} fill="none" stroke={color} strokeWidth={1.5} />
      )
    case 'switch':
      return (
        <polygon
          points={`0,${-half} ${half},0 0,${half} ${-half},0`}
          fill="none" stroke={color} strokeWidth={1.5}
        />
      )
    case 'router':
      return <circle cx={0} cy={0} r={half} fill="none" stroke={color} strokeWidth={1.5} />
    case 'firewall':
      return (
        <path
          d={`M0,${-half} L${half},${-half * 0.3} L${half},${half * 0.5} L0,${half} L${-half},${half * 0.5} L${-half},${-half * 0.3} Z`}
          fill="none" stroke={color} strokeWidth={1.5}
        />
      )
    case 'cloud':
      return (
        <path
          d={`M${-half},${half * 0.2} a${half * 0.5},${half * 0.5} 0 0,1 ${half * 0.5},${-half * 0.7} a${half * 0.6},${half * 0.6} 0 0,1 ${half * 0.9},0 a${half * 0.4},${half * 0.4} 0 0,1 ${half * 0.1},${half * 0.7} Z`}
          fill="none" stroke={color} strokeWidth={1.5}
        />
      )
    case 'database':
      return (
        <g>
          <ellipse cx={0} cy={-half * 0.4} rx={half} ry={half * 0.35} fill="none" stroke={color} strokeWidth={1.5} />
          <line x1={-half} y1={-half * 0.4} x2={-half} y2={half * 0.4} stroke={color} strokeWidth={1.5} />
          <line x1={half} y1={-half * 0.4} x2={half} y2={half * 0.4} stroke={color} strokeWidth={1.5} />
          <ellipse cx={0} cy={half * 0.4} rx={half} ry={half * 0.35} fill="none" stroke={color} strokeWidth={1.5} />
        </g>
      )
    case 'loadbalancer':
      return (
        <g>
          <rect x={-half} y={-half} width={size} height={size} rx={2} fill="none" stroke={color} strokeWidth={1.5} />
          <line x1={-half * 0.5} y1={0} x2={half * 0.5} y2={0} stroke={color} strokeWidth={1.5} />
        </g>
      )
    default:
      return <circle cx={0} cy={0} r={half * 0.7} fill="none" stroke={color} strokeWidth={1.5} />
  }
}

// ─── Edge Path ──────────────────────────────────────────────────────────────

function computeEdgePath(points: Array<{ x: number; y: number }>): string {
  if (points.length < 2) return ''
  const [start, end] = [points[0], points[points.length - 1]]
  const midX = (start.x + end.x) / 2
  const midY = (start.y + end.y) / 2
  // Slight curve offset
  const dx = end.x - start.x
  const dy = end.y - start.y
  const offset = Math.min(Math.abs(dx) + Math.abs(dy), 40) * 0.15
  const cx = midX - dy * offset / (Math.abs(dy) + 1)
  const cy = midY + dx * offset / (Math.abs(dx) + 1)
  return `M${start.x},${start.y} Q${cx},${cy} ${end.x},${end.y}`
}

function edgeMidpoint(points: Array<{ x: number; y: number }>): { x: number; y: number } {
  if (points.length < 2) return { x: 0, y: 0 }
  return {
    x: (points[0].x + points[points.length - 1].x) / 2,
    y: (points[0].y + points[points.length - 1].y) / 2,
  }
}

// ─── SVG Renderer ───────────────────────────────────────────────────────────

export function TopologyGraphSVG({
  layout,
  nodes,
  edges,
  selectedNodes = [],
  onNodeClick,
  onNodeHover,
  onEdgeClick,
  motionLevel,
  width,
  height,
}: TopologyGraphSVGProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 })

  const nodeMap = new Map(nodes.map(n => [n.id, n]))

  // Build layout node map for positions
  const layoutNodeMap = new Map(layout.nodes.map(n => [n.id, n]))

  const handleMouseDown = useCallback((e: ReactMouseEvent<SVGSVGElement>) => {
    if ((e.target as SVGElement).closest('.ui-topology-graph__node')) return
    if ((e.target as SVGElement).closest('.ui-topology-graph__edge')) return
    setDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y }
  }, [pan])

  const handleMouseMove = useCallback((e: ReactMouseEvent<SVGSVGElement>) => {
    if (!dragging) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    setPan({ x: dragStart.current.panX + dx, y: dragStart.current.panY + dy })
  }, [dragging])

  const handleMouseUp = useCallback(() => {
    setDragging(false)
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(z => Math.min(Math.max(z * delta, 0.1), 5))
  }, [])

  // Mouse up outside SVG
  useEffect(() => {
    const up = () => setDragging(false)
    window.addEventListener('mouseup', up)
    return () => window.removeEventListener('mouseup', up)
  }, [])

  const selectedSet = new Set(selectedNodes)

  const nodeW = 40
  const nodeH = 30

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="ui-topology-graph__svg"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: dragging ? 'grabbing' : 'grab' }}
      data-testid="topology-svg"
    >
      <defs>
        <marker
          id="ui-topo-arrow"
          viewBox="0 0 10 6"
          refX="10"
          refY="3"
          markerWidth="8"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,3 L0,6 Z" fill="oklch(55% 0 0)" />
        </marker>
        {motionLevel >= 2 && (
          <style>{`
            @keyframes ui-topo-dash {
              to { stroke-dashoffset: -20; }
            }
          `}</style>
        )}
      </defs>

      <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
        {/* Edges */}
        {layout.edges.map((le, i) => {
          const edge = edges[i]
          if (!edge) return null
          const path = computeEdgePath(le.points)
          const color = getStatusColor(edge.status)
          const mid = edgeMidpoint(le.points)
          return (
            <g key={`${edge.source}-${edge.target}`} className="ui-topology-graph__edge">
              <path
                d={path}
                fill="none"
                stroke={color}
                strokeWidth={edge.bandwidth ? Math.min(edge.bandwidth / 100, 4) + 1 : 1.5}
                strokeOpacity={0.7}
                markerEnd="url(#ui-topo-arrow)"
                style={
                  edge.animated && motionLevel >= 2
                    ? { strokeDasharray: '6 4', animation: 'ui-topo-dash 0.8s linear infinite' }
                    : undefined
                }
                cursor={onEdgeClick ? 'pointer' : undefined}
                onClick={onEdgeClick ? () => onEdgeClick(edge) : undefined}
              />
              {edge.bidirectional && (
                <path
                  d={path}
                  fill="none"
                  stroke="none"
                  markerStart="url(#ui-topo-arrow)"
                />
              )}
              {edge.label && (
                <text
                  x={mid.x}
                  y={mid.y - 6}
                  textAnchor="middle"
                  fontSize={9}
                  fill="oklch(70% 0 0)"
                  className="ui-topology-graph__edge-label"
                >
                  {edge.label}
                </text>
              )}
            </g>
          )
        })}

        {/* Nodes */}
        {layout.nodes.map((ln) => {
          const node = nodeMap.get(ln.id)
          if (!node) return null
          const selected = selectedSet.has(node.id)
          const color = getStatusColor(node.status)
          const w = node.width || nodeW
          const h = node.height || nodeH

          return (
            <g
              key={node.id}
              className="ui-topology-graph__node"
              transform={`translate(${ln.x},${ln.y})`}
              cursor={onNodeClick ? 'pointer' : undefined}
              onClick={onNodeClick ? () => onNodeClick(node) : undefined}
              onMouseEnter={onNodeHover ? () => onNodeHover(node) : undefined}
              onMouseLeave={onNodeHover ? () => onNodeHover(null) : undefined}
              data-status={node.status || 'unknown'}
              data-selected={selected || undefined}
              data-testid={`topology-node-${node.id}`}
            >
              {/* Selection glow */}
              {selected && (
                <rect
                  x={-w / 2 - 3}
                  y={-h / 2 - 3}
                  width={w + 6}
                  height={h + 6}
                  rx={8}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  strokeOpacity={0.4}
                  className="ui-topology-graph__node-glow"
                />
              )}

              {/* Background rect */}
              <rect
                x={-w / 2}
                y={-h / 2}
                width={w}
                height={h}
                rx={6}
                fill="oklch(20% 0.01 270)"
                stroke={color}
                strokeWidth={selected ? 2.5 : 1.5}
              />

              {/* Type icon */}
              <g style={{ color }} transform="translate(0, -2)">
                {node.icon || <NodeIcon type={node.type} size={14} />}
              </g>

              {/* Label below node */}
              <text
                y={h / 2 + 12}
                textAnchor="middle"
                fontSize={10}
                fill="oklch(75% 0 0)"
                className="ui-topology-graph__node-label"
              >
                {node.label}
              </text>
            </g>
          )
        })}
      </g>
    </svg>
  )
}
