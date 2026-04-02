import type { GraphNode, GraphEdge, LayoutOptions, LayoutResult } from './types'
import { Quadtree } from './quadtree'

// ---- Seeded PRNG (mulberry32) ----

function mulberry32(seed: number): () => number {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ---- Helpers ----

function cloneNodes(nodes: GraphNode[]): Array<GraphNode & { x: number; y: number }> {
  return nodes.map((n) => ({
    ...n,
    x: n.x ?? 0,
    y: n.y ?? 0,
    width: n.width ?? 60,
    height: n.height ?? 40,
  }))
}

function buildEdgePoints(
  edges: GraphEdge[],
  nodeMap: Map<string, { x: number; y: number }>,
): Array<GraphEdge & { points: Array<{ x: number; y: number }> }> {
  return edges.map((e) => {
    const s = nodeMap.get(e.source)
    const t = nodeMap.get(e.target)
    const points =
      s && t ? [{ x: s.x, y: s.y }, { x: t.x, y: t.y }] : []
    return { ...e, points }
  })
}

function toNodeMap(nodes: Array<{ id: string; x: number; y: number }>): Map<string, { x: number; y: number }> {
  const map = new Map<string, { x: number; y: number }>()
  for (const n of nodes) map.set(n.id, n)
  return map
}

// ---- Force-directed layout ----

export function forceDirectedLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  options: LayoutOptions,
): LayoutResult {
  const {
    width,
    height,
    iterations = 300,
    gravity = 0.1,
    repulsion = 1000,
    linkDistance = 100,
  } = options

  if (nodes.length === 0) {
    return { nodes: [], edges: buildEdgePoints(edges, new Map()), width, height }
  }

  const rand = mulberry32(42)
  const positioned = cloneNodes(nodes)

  // Initialize random positions for unpinned nodes without explicit coords
  for (const n of positioned) {
    if (n.fx != null) {
      n.x = n.fx
      n.y = n.fy ?? n.y
    } else if (n.fy != null) {
      n.y = n.fy
    }
    if (nodes.find((orig) => orig.id === n.id)?.x == null && n.fx == null) {
      n.x = rand() * width
    }
    if (nodes.find((orig) => orig.id === n.id)?.y == null && n.fy == null) {
      n.y = rand() * height
    }
  }

  const idxMap = new Map<string, number>()
  for (let i = 0; i < positioned.length; i++) idxMap.set(positioned[i].id, i)

  const vx = new Float64Array(positioned.length)
  const vy = new Float64Array(positioned.length)

  const edgeIndices = edges
    .map((e) => [idxMap.get(e.source), idxMap.get(e.target)] as const)
    .filter((pair): pair is [number, number] => pair[0] != null && pair[1] != null)

  const centerX = width / 2
  const centerY = height / 2

  for (let iter = 0; iter < iterations; iter++) {
    const alpha = 1 - iter / iterations // cooling
    const damping = 0.9

    // Build quadtree for Barnes-Hut repulsion
    const qt = new Quadtree(0, 0, width * 2, height * 2)
    for (const n of positioned) {
      qt.insert({ x: n.x, y: n.y, mass: 1 })
    }

    // Repulsion via Barnes-Hut
    for (let i = 0; i < positioned.length; i++) {
      const n = positioned[i]
      if (n.fx != null && n.fy != null) continue

      qt.visit((cx, cy, mass, size) => {
        const dx = cx - n.x
        const dy = cy - n.y
        const dist2 = dx * dx + dy * dy
        if (dist2 < 1) return false // too close, drill down

        // Barnes-Hut: if quadrant is far enough, approximate
        const theta = 0.9
        if (size * size / dist2 < theta * theta) {
          const dist = Math.sqrt(dist2)
          const force = (repulsion * mass * alpha) / dist2
          if (n.fx == null) vx[i] -= (dx / dist) * force
          if (n.fy == null) vy[i] -= (dy / dist) * force
          return true // skip children
        }
        return false
      })
    }

    // Spring attraction along edges (Hooke's law)
    for (const [si, ti] of edgeIndices) {
      const s = positioned[si]
      const t = positioned[ti]
      const dx = t.x - s.x
      const dy = t.y - s.y
      const dist = Math.sqrt(dx * dx + dy * dy) || 1
      // Force proportional to displacement from rest length
      const displacement = dist - linkDistance
      const strength = repulsion * 0.002 // scale spring relative to repulsion
      const fx = (dx / dist) * displacement * strength * alpha
      const fy = (dy / dist) * displacement * strength * alpha

      if (s.fx == null) vx[si] += fx
      if (s.fy == null) vy[si] += fy
      if (t.fx == null) vx[ti] -= fx
      if (t.fy == null) vy[ti] -= fy
    }

    // Gravity toward center
    for (let i = 0; i < positioned.length; i++) {
      const n = positioned[i]
      if (n.fx == null) vx[i] += (centerX - n.x) * gravity * alpha
      if (n.fy == null) vy[i] += (centerY - n.y) * gravity * alpha
    }

    // Apply velocities with damping
    for (let i = 0; i < positioned.length; i++) {
      const n = positioned[i]
      if (n.fx != null) {
        n.x = n.fx
        vx[i] = 0
      } else {
        vx[i] *= damping
        n.x += vx[i]
      }
      if (n.fy != null) {
        n.y = n.fy
        vy[i] = 0
      } else {
        vy[i] *= damping
        n.y += vy[i]
      }
    }
  }

  const nodeMap = toNodeMap(positioned)
  return {
    nodes: positioned,
    edges: buildEdgePoints(edges, nodeMap),
    width,
    height,
  }
}

// ---- Dagre (Sugiyama-style layered DAG) ----

export function dagreLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  options: LayoutOptions,
): LayoutResult {
  const {
    width,
    height,
    rankDir = 'TB',
    rankSep = 50,
    nodeSep = 30,
  } = options

  if (nodes.length === 0) {
    return { nodes: [], edges: buildEdgePoints(edges, new Map()), width, height }
  }

  const positioned = cloneNodes(nodes)
  const idxMap = new Map<string, number>()
  for (let i = 0; i < positioned.length; i++) idxMap.set(positioned[i].id, i)

  // Build adjacency list
  const adj = new Map<string, string[]>()
  for (const n of nodes) adj.set(n.id, [])
  for (const e of edges) {
    if (adj.has(e.source) && idxMap.has(e.target)) {
      adj.get(e.source)!.push(e.target)
    }
  }

  // Step 1: Cycle removal via DFS — find back-edges
  const visited = new Set<string>()
  const inStack = new Set<string>()
  const reversedEdges = new Set<string>()

  function dfs(id: string): void {
    visited.add(id)
    inStack.add(id)
    for (const target of adj.get(id) ?? []) {
      if (inStack.has(target)) {
        reversedEdges.add(`${id}->${target}`)
      } else if (!visited.has(target)) {
        dfs(target)
      }
    }
    inStack.delete(id)
  }
  for (const n of nodes) {
    if (!visited.has(n.id)) dfs(n.id)
  }

  // Build acyclic adjacency using reversed edges
  const acyclicAdj = new Map<string, string[]>()
  for (const n of nodes) acyclicAdj.set(n.id, [])
  for (const e of edges) {
    if (!idxMap.has(e.source) || !idxMap.has(e.target)) continue
    if (reversedEdges.has(`${e.source}->${e.target}`)) {
      acyclicAdj.get(e.target)!.push(e.source)
    } else {
      acyclicAdj.get(e.source)!.push(e.target)
    }
  }

  // Step 2: Layer assignment — longest path from sources
  const layers = new Map<string, number>()
  const inDegree = new Map<string, number>()
  for (const n of nodes) inDegree.set(n.id, 0)
  for (const [, targets] of acyclicAdj) {
    for (const t of targets) inDegree.set(t, (inDegree.get(t) ?? 0) + 1)
  }

  // Topological order using Kahn's algorithm
  const queue: string[] = []
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id)
  }

  // If all nodes have incoming edges (e.g., pure cycle), start from first node
  if (queue.length === 0) {
    queue.push(nodes[0].id)
  }

  const topoOrder: string[] = []
  const topoVisited = new Set<string>()
  while (queue.length > 0) {
    const id = queue.shift()!
    if (topoVisited.has(id)) continue
    topoVisited.add(id)
    topoOrder.push(id)
    for (const t of acyclicAdj.get(id) ?? []) {
      const deg = (inDegree.get(t) ?? 1) - 1
      inDegree.set(t, deg)
      if (deg <= 0 && !topoVisited.has(t)) queue.push(t)
    }
  }

  // Assign layers: longest path
  for (const id of topoOrder) {
    if (!layers.has(id)) layers.set(id, 0)
    const layer = layers.get(id)!
    for (const t of acyclicAdj.get(id) ?? []) {
      layers.set(t, Math.max(layers.get(t) ?? 0, layer + 1))
    }
  }

  // Handle any unvisited nodes (disconnected)
  for (const n of nodes) {
    if (!layers.has(n.id)) layers.set(n.id, 0)
  }

  // Step 3: Group nodes by layer
  const maxLayer = Math.max(0, ...layers.values())
  const layerGroups: string[][] = Array.from({ length: maxLayer + 1 }, () => [])
  for (const n of nodes) {
    layerGroups[layers.get(n.id)!].push(n.id)
  }

  // Step 4: Crossing reduction — barycenter heuristic (3 passes)
  for (let pass = 0; pass < 3; pass++) {
    for (let l = 1; l <= maxLayer; l++) {
      const group = layerGroups[l]
      const prevGroup = layerGroups[l - 1]
      const prevPos = new Map<string, number>()
      prevGroup.forEach((id, i) => prevPos.set(id, i))

      // Calculate barycenter for each node in this layer
      const barycenters = new Map<string, number>()
      for (const id of group) {
        // Find parents in previous layer (from acyclic adjacency)
        const parents: number[] = []
        for (const e of edges) {
          if (e.target === id && prevPos.has(e.source)) {
            parents.push(prevPos.get(e.source)!)
          } else if (e.source === id && prevPos.has(e.target)) {
            parents.push(prevPos.get(e.target)!)
          }
        }
        if (parents.length > 0) {
          barycenters.set(id, parents.reduce((a, b) => a + b, 0) / parents.length)
        } else {
          barycenters.set(id, group.indexOf(id))
        }
      }

      group.sort((a, b) => (barycenters.get(a) ?? 0) - (barycenters.get(b) ?? 0))
      layerGroups[l] = group
    }
  }

  // Step 5: Coordinate assignment
  const horizontal = rankDir === 'LR' || rankDir === 'RL'
  const primarySize = horizontal ? width : height
  const secondarySize = horizontal ? height : width

  const layerSpacing = maxLayer > 0 ? (primarySize - 100) / (maxLayer + 1) : 0
  const layerStart = horizontal
    ? (rankDir === 'RL' ? primarySize - 50 : 50)
    : (rankDir === 'BT' ? primarySize - 50 : 50)
  const layerSign = (rankDir === 'RL' || rankDir === 'BT') ? -1 : 1

  for (let l = 0; l <= maxLayer; l++) {
    const group = layerGroups[l]
    const count = group.length
    const totalWidth = count * nodeSep
    const startOffset = (secondarySize - totalWidth) / 2

    for (let i = 0; i < group.length; i++) {
      const idx = idxMap.get(group[i])!
      const primaryPos = layerStart + l * layerSpacing * layerSign
      const secondaryPos = startOffset + (i + 0.5) * nodeSep

      if (horizontal) {
        positioned[idx].x = primaryPos
        positioned[idx].y = secondaryPos
      } else {
        positioned[idx].x = secondaryPos
        positioned[idx].y = primaryPos
      }
    }
  }

  // Build edge points with layer-based routing
  const nodeMap = toNodeMap(positioned)
  const resultEdges = edges.map((e) => {
    const s = nodeMap.get(e.source)
    const t = nodeMap.get(e.target)
    if (!s || !t) return { ...e, points: [] }

    const sLayer = layers.get(e.source) ?? 0
    const tLayer = layers.get(e.target) ?? 0
    const points: Array<{ x: number; y: number }> = [{ x: s.x, y: s.y }]

    // Add bend points for edges spanning multiple layers
    const minL = Math.min(sLayer, tLayer)
    const maxL = Math.max(sLayer, tLayer)
    if (maxL - minL > 1) {
      for (let l = minL + 1; l < maxL; l++) {
        const frac = (l - minL) / (maxL - minL)
        points.push({
          x: s.x + (t.x - s.x) * frac,
          y: s.y + (t.y - s.y) * frac,
        })
      }
    }

    points.push({ x: t.x, y: t.y })
    return { ...e, points }
  })

  return { nodes: positioned, edges: resultEdges, width, height }
}

// ---- Circular layout ----

export function circularLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  options: LayoutOptions,
): LayoutResult {
  const { width, height } = options

  if (nodes.length === 0) {
    return { nodes: [], edges: buildEdgePoints(edges, new Map()), width, height }
  }

  const positioned = cloneNodes(nodes)

  // Sort by connectivity (degree) for fewer crossings
  const degree = new Map<string, number>()
  for (const n of nodes) degree.set(n.id, 0)
  for (const e of edges) {
    degree.set(e.source, (degree.get(e.source) ?? 0) + 1)
    degree.set(e.target, (degree.get(e.target) ?? 0) + 1)
  }
  positioned.sort((a, b) => (degree.get(b.id) ?? 0) - (degree.get(a.id) ?? 0))

  const cx = width / 2
  const cy = height / 2
  const radius = Math.min(width, height) / 2 - 60
  const count = positioned.length

  for (let i = 0; i < count; i++) {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2
    positioned[i].x = cx + radius * Math.cos(angle)
    positioned[i].y = cy + radius * Math.sin(angle)
  }

  const nodeMap = toNodeMap(positioned)
  return {
    nodes: positioned,
    edges: buildEdgePoints(edges, nodeMap),
    width,
    height,
  }
}

// ---- Grid layout ----

export function gridLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  options: LayoutOptions,
): LayoutResult {
  const { width, height } = options

  if (nodes.length === 0) {
    return { nodes: [], edges: buildEdgePoints(edges, new Map()), width, height }
  }

  const positioned = cloneNodes(nodes)

  // Sort by id for determinism
  positioned.sort((a, b) => a.id.localeCompare(b.id))

  const count = positioned.length
  const cols = Math.ceil(Math.sqrt(count))
  const rows = Math.ceil(count / cols)
  const cellW = width / (cols + 1)
  const cellH = height / (rows + 1)

  for (let i = 0; i < count; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    positioned[i].x = (col + 1) * cellW
    positioned[i].y = (row + 1) * cellH
  }

  const nodeMap = toNodeMap(positioned)
  return {
    nodes: positioned,
    edges: buildEdgePoints(edges, nodeMap),
    width,
    height,
  }
}

// ---- Main entry point ----

export function computeLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  options: LayoutOptions,
): LayoutResult {
  switch (options.type) {
    case 'force':
      return forceDirectedLayout(nodes, edges, options)
    case 'dagre':
      return dagreLayout(nodes, edges, options)
    case 'circular':
      return circularLayout(nodes, edges, options)
    case 'grid':
      return gridLayout(nodes, edges, options)
  }
}
