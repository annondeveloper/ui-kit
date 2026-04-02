export interface GraphNode {
  id: string
  x?: number
  y?: number
  width?: number
  height?: number
  data?: unknown
  fx?: number
  fy?: number
}

export interface GraphEdge {
  source: string
  target: string
  data?: unknown
}

export interface LayoutOptions {
  type: 'force' | 'dagre' | 'circular' | 'grid'
  width: number
  height: number
  iterations?: number
  gravity?: number
  repulsion?: number
  linkDistance?: number
  rankDir?: 'TB' | 'LR' | 'BT' | 'RL'
  rankSep?: number
  nodeSep?: number
}

export interface LayoutResult {
  nodes: Array<GraphNode & { x: number; y: number }>
  edges: Array<GraphEdge & { points: Array<{ x: number; y: number }> }>
  width: number
  height: number
}
