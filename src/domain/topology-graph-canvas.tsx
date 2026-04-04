'use client'

import {
  useRef,
  useEffect,
  useCallback,
  useState,
  type ReactElement,
} from 'react'
import { Quadtree } from '../core/graph/quadtree'
import type { LayoutResult } from '../core/graph'
import type { TopologyNode, TopologyEdge } from './topology-graph-svg'

// ─── Status Colors (canvas-compatible hex approximations of OKLCH) ──────────

const STATUS_FILL: Record<string, string> = {
  ok: '#4ead6a',
  warning: '#c9a83e',
  critical: '#c44d3b',
  unknown: '#777777',
  maintenance: '#7b6fc0',
}

function getColor(status?: string): string {
  return STATUS_FILL[status || 'unknown'] || STATUS_FILL.unknown
}

// ─── Props ──────────────────────────────────────────────────────────────────

export interface TopologyGraphCanvasProps {
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

// ─── Canvas Renderer ────────────────────────────────────────────────────────

export function TopologyGraphCanvas({
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
}: TopologyGraphCanvasProps): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const dragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 })
  const animFrame = useRef(0)
  const dashOffset = useRef(0)

  const nodeMap = new Map(nodes.map(n => [n.id, n]))
  const selectedSet = new Set(selectedNodes)

  // Build quadtree for hit testing
  const quadtree = useRef<Quadtree | null>(null)

  useEffect(() => {
    const qt = new Quadtree(0, 0, layout.width || width, layout.height || height)
    for (const ln of layout.nodes) {
      qt.insert({ x: ln.x, y: ln.y, mass: 1, data: ln.id })
    }
    quadtree.current = qt
  }, [layout, width, height])

  // Transform screen coords to graph coords
  const screenToGraph = useCallback((sx: number, sy: number) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: (sx - rect.left - pan.x) / zoom,
      y: (sy - rect.top - pan.y) / zoom,
    }
  }, [pan, zoom])

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    let running = true

    function draw() {
      if (!running || !ctx) return
      ctx.clearRect(0, 0, width, height)
      ctx.save()
      ctx.translate(pan.x, pan.y)
      ctx.scale(zoom, zoom)

      // Draw edges
      for (let i = 0; i < layout.edges.length; i++) {
        const le = layout.edges[i]
        const edge = edges[i]
        if (!edge || le.points.length < 2) continue

        const start = le.points[0]
        const end = le.points[le.points.length - 1]
        const color = getColor(edge.status)

        ctx.beginPath()
        ctx.strokeStyle = color
        ctx.lineWidth = edge.bandwidth ? Math.min(edge.bandwidth / 100, 4) + 1 : 1.5
        ctx.globalAlpha = 0.7

        if (edge.animated && motionLevel >= 2) {
          ctx.setLineDash([6, 4])
          ctx.lineDashOffset = dashOffset.current
        } else {
          ctx.setLineDash([])
        }

        // Quadratic curve
        const mx = (start.x + end.x) / 2
        const my = (start.y + end.y) / 2
        ctx.moveTo(start.x, start.y)
        ctx.quadraticCurveTo(mx, my, end.x, end.y)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.globalAlpha = 1.0

        // Arrow at end
        const angle = Math.atan2(end.y - my, end.x - mx)
        ctx.save()
        ctx.translate(end.x, end.y)
        ctx.rotate(angle)
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(-8, -3)
        ctx.lineTo(-8, 3)
        ctx.closePath()
        ctx.fillStyle = color
        ctx.fill()
        ctx.restore()

        // Edge label
        if (edge.label) {
          ctx.fillStyle = '#aaa'
          ctx.font = '9px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(edge.label, mx, my - 6)
        }
      }

      // Draw nodes
      const nodeW = 40
      const nodeH = 30

      for (const ln of layout.nodes) {
        const node = nodeMap.get(ln.id)
        if (!node) continue

        const color = getColor(node.status)
        const w = node.width || nodeW
        const h = node.height || nodeH
        const selected = selectedSet.has(node.id)

        // Selected glow
        if (selected) {
          ctx.strokeStyle = color
          ctx.lineWidth = 2
          ctx.globalAlpha = 0.4
          ctx.strokeRect(ln.x - w / 2 - 3, ln.y - h / 2 - 3, w + 6, h + 6)
          ctx.globalAlpha = 1.0
        }

        // Background
        ctx.fillStyle = '#2a2a35'
        ctx.strokeStyle = color
        ctx.lineWidth = selected ? 2.5 : 1.5
        ctx.beginPath()
        ctx.roundRect(ln.x - w / 2, ln.y - h / 2, w, h, 6)
        ctx.fill()
        ctx.stroke()

        // Type indicator (simple shapes)
        ctx.strokeStyle = color
        ctx.lineWidth = 1.5
        ctx.beginPath()
        switch (node.type) {
          case 'server':
            ctx.rect(ln.x - 5, ln.y - 7, 10, 10)
            break
          case 'router':
            ctx.arc(ln.x, ln.y - 2, 6, 0, Math.PI * 2)
            break
          case 'switch':
            ctx.moveTo(ln.x, ln.y - 8)
            ctx.lineTo(ln.x + 6, ln.y - 2)
            ctx.lineTo(ln.x, ln.y + 4)
            ctx.lineTo(ln.x - 6, ln.y - 2)
            ctx.closePath()
            break
          default:
            ctx.arc(ln.x, ln.y - 2, 5, 0, Math.PI * 2)
            break
        }
        ctx.stroke()

        // Label
        ctx.fillStyle = '#bbb'
        ctx.font = '10px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(node.label, ln.x, ln.y + h / 2 + 12)
      }

      ctx.restore()

      if (motionLevel >= 2) {
        dashOffset.current -= 0.5
        animFrame.current = requestAnimationFrame(draw)
      }
    }

    draw()
    if (motionLevel < 2) {
      // Still re-render on pan/zoom changes but no animation loop
      animFrame.current = 0
    }

    return () => {
      running = false
      if (animFrame.current) cancelAnimationFrame(animFrame.current)
    }
  }, [layout, nodes, edges, selectedNodes, pan, zoom, motionLevel, width, height, nodeMap, selectedSet])

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y }
  }, [pan])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragging.current) {
      const dx = e.clientX - dragStart.current.x
      const dy = e.clientY - dragStart.current.y
      setPan({ x: dragStart.current.panX + dx, y: dragStart.current.panY + dy })
      return
    }

    // Hit test for hover
    if (onNodeHover && quadtree.current) {
      const pt = screenToGraph(e.clientX, e.clientY)
      const found = quadtree.current.find(pt.x, pt.y, 25)
      if (found?.data) {
        const node = nodeMap.get(found.data as string)
        if (node) {
          onNodeHover(node)
          return
        }
      }
      onNodeHover(null)
    }
  }, [onNodeHover, screenToGraph, nodeMap])

  const handleMouseUp = useCallback(() => {
    dragging.current = false
  }, [])

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!onNodeClick || !quadtree.current) return
    const pt = screenToGraph(e.clientX, e.clientY)
    const found = quadtree.current.find(pt.x, pt.y, 25)
    if (found?.data) {
      const node = nodeMap.get(found.data as string)
      if (node) onNodeClick(node)
    }
  }, [onNodeClick, screenToGraph, nodeMap])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(z => Math.min(Math.max(z * delta, 0.1), 5))
  }, [])

  useEffect(() => {
    const up = () => { dragging.current = false }
    window.addEventListener('mouseup', up)
    return () => window.removeEventListener('mouseup', up)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ width, height, cursor: dragging.current ? 'grabbing' : 'grab' }}
      className="ui-topology-graph__canvas"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      onWheel={handleWheel}
      data-testid="topology-canvas"
    />
  )
}
