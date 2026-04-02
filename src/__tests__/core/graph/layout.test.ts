import { describe, it, expect } from 'vitest'
import { Quadtree } from '../../../core/graph/quadtree'
import {
  computeLayout,
  forceDirectedLayout,
  dagreLayout,
  circularLayout,
  gridLayout,
} from '../../../core/graph/layout'
import type { GraphNode, GraphEdge, LayoutOptions } from '../../../core/graph/types'

// ---- Quadtree ----

describe('Quadtree', () => {
  it('inserts nodes and tracks mass', () => {
    const qt = new Quadtree(0, 0, 100, 100)
    qt.insert({ x: 25, y: 25, mass: 1 })
    qt.insert({ x: 75, y: 75, mass: 1 })

    let totalMass = 0
    qt.visit((_, __, mass) => {
      totalMass = mass
      return true // stop at root
    })
    expect(totalMass).toBe(2)
  })

  it('visit traverses all regions when not skipping', () => {
    const qt = new Quadtree(0, 0, 100, 100)
    qt.insert({ x: 10, y: 10, mass: 1 })
    qt.insert({ x: 90, y: 90, mass: 1 })
    qt.insert({ x: 10, y: 90, mass: 1 })

    let visitCount = 0
    qt.visit((_cx, _cy, _mass, _size) => {
      visitCount++
      return false // never skip, drill down fully
    })
    // Root + at least one visit per node + branch nodes
    expect(visitCount).toBeGreaterThanOrEqual(3)
  })

  it('visit supports Barnes-Hut approximation (skipping far quadrants)', () => {
    const qt = new Quadtree(0, 0, 1000, 1000)
    // Cluster far away
    for (let i = 0; i < 10; i++) {
      qt.insert({ x: 900 + i, y: 900 + i, mass: 1 })
    }

    let callCount = 0
    qt.visit((cx, cy, mass, size) => {
      callCount++
      // Pretend we're at (0,0) — far cluster should be approximated
      const dx = cx
      const dy = cy
      const dist2 = dx * dx + dy * dy
      const theta = 0.9
      return size * size / dist2 < theta * theta
    })
    // With Barnes-Hut, should visit fewer nodes than individually
    expect(callCount).toBeLessThan(20)
  })

  it('find returns nearest node within radius', () => {
    const qt = new Quadtree(0, 0, 100, 100)
    const nodeA = { x: 20, y: 20, mass: 1, data: 'a' }
    const nodeB = { x: 80, y: 80, mass: 1, data: 'b' }
    qt.insert(nodeA)
    qt.insert(nodeB)

    const found = qt.find(22, 22, 10)
    expect(found).not.toBeNull()
    expect(found!.data).toBe('a')
  })

  it('find returns null when no node within radius', () => {
    const qt = new Quadtree(0, 0, 100, 100)
    qt.insert({ x: 80, y: 80, mass: 1 })

    const found = qt.find(10, 10, 5)
    expect(found).toBeNull()
  })

  it('find returns closest node when multiple in range', () => {
    const qt = new Quadtree(0, 0, 100, 100)
    qt.insert({ x: 50, y: 50, mass: 1, data: 'far' })
    qt.insert({ x: 30, y: 30, mass: 1, data: 'close' })

    const found = qt.find(28, 28, 30)
    expect(found).not.toBeNull()
    expect(found!.data).toBe('close')
  })
})

// ---- Force-directed layout ----

describe('forceDirectedLayout', () => {
  const makeNodes = (count: number): GraphNode[] =>
    Array.from({ length: count }, (_, i) => ({ id: `n${i}` }))

  const opts: LayoutOptions = { type: 'force', width: 800, height: 600, iterations: 100 }

  it('produces positions for all nodes', () => {
    const result = forceDirectedLayout(makeNodes(5), [], opts)
    expect(result.nodes).toHaveLength(5)
    for (const n of result.nodes) {
      expect(typeof n.x).toBe('number')
      expect(typeof n.y).toBe('number')
      expect(Number.isFinite(n.x)).toBe(true)
      expect(Number.isFinite(n.y)).toBe(true)
    }
  })

  it('is deterministic (seeded PRNG)', () => {
    const nodes = makeNodes(10)
    const edges: GraphEdge[] = [{ source: 'n0', target: 'n1' }]
    const r1 = forceDirectedLayout(nodes, edges, opts)
    const r2 = forceDirectedLayout(nodes, edges, opts)
    for (let i = 0; i < r1.nodes.length; i++) {
      expect(r1.nodes[i].x).toBe(r2.nodes[i].x)
      expect(r1.nodes[i].y).toBe(r2.nodes[i].y)
    }
  })

  it('directly connected nodes are closer than average pair distance', () => {
    const nodes: GraphNode[] = Array.from({ length: 8 }, (_, i) => ({ id: `n${i}` }))
    // Only connect n0-n1 and n2-n3
    const edges: GraphEdge[] = [
      { source: 'n0', target: 'n1' },
      { source: 'n2', target: 'n3' },
    ]
    // Use small linkDistance so springs pull connected pairs close together
    const result = forceDirectedLayout(nodes, edges, {
      ...opts,
      iterations: 300,
      linkDistance: 20,
    })

    const posMap = new Map(result.nodes.map((n) => [n.id, n]))

    // Distance between connected pairs
    const n0 = posMap.get('n0')!
    const n1 = posMap.get('n1')!
    const connectedDist = Math.hypot(n0.x - n1.x, n0.y - n1.y)

    // Average distance between all pairs
    let totalDist = 0
    let count = 0
    for (let i = 0; i < result.nodes.length; i++) {
      for (let j = i + 1; j < result.nodes.length; j++) {
        totalDist += Math.hypot(result.nodes[i].x - result.nodes[j].x, result.nodes[i].y - result.nodes[j].y)
        count++
      }
    }
    const avgDist = totalDist / count

    // Connected nodes should be closer than average
    expect(connectedDist).toBeLessThan(avgDist)
  })

  it('respects pinned nodes (fx/fy)', () => {
    const nodes: GraphNode[] = [
      { id: 'pinned', fx: 100, fy: 200 },
      { id: 'free' },
    ]
    const result = forceDirectedLayout(nodes, [], opts)
    const pinned = result.nodes.find((n) => n.id === 'pinned')!
    expect(pinned.x).toBe(100)
    expect(pinned.y).toBe(200)
  })

  it('produces non-overlapping positions for many nodes', () => {
    const result = forceDirectedLayout(makeNodes(20), [], { ...opts, iterations: 200 })
    // Check that not all nodes collapsed to same point
    const xs = new Set(result.nodes.map((n) => Math.round(n.x)))
    const ys = new Set(result.nodes.map((n) => Math.round(n.y)))
    expect(xs.size).toBeGreaterThan(1)
    expect(ys.size).toBeGreaterThan(1)
  })

  it('generates edge points', () => {
    const nodes: GraphNode[] = [{ id: 'a' }, { id: 'b' }]
    const edges: GraphEdge[] = [{ source: 'a', target: 'b' }]
    const result = forceDirectedLayout(nodes, edges, opts)
    expect(result.edges[0].points).toHaveLength(2)
    expect(result.edges[0].points[0]).toHaveProperty('x')
    expect(result.edges[0].points[0]).toHaveProperty('y')
  })
})

// ---- Dagre layout ----

describe('dagreLayout', () => {
  const opts: LayoutOptions = { type: 'dagre', width: 800, height: 600 }

  it('assigns layers correctly in TB mode', () => {
    const nodes: GraphNode[] = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
    const edges: GraphEdge[] = [
      { source: 'a', target: 'b' },
      { source: 'b', target: 'c' },
    ]
    const result = dagreLayout(nodes, edges, opts)
    const posMap = new Map(result.nodes.map((n) => [n.id, n]))

    // In TB mode, a should be above b, b above c
    expect(posMap.get('a')!.y).toBeLessThan(posMap.get('b')!.y)
    expect(posMap.get('b')!.y).toBeLessThan(posMap.get('c')!.y)
  })

  it('assigns layers correctly in LR mode', () => {
    const nodes: GraphNode[] = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
    const edges: GraphEdge[] = [
      { source: 'a', target: 'b' },
      { source: 'b', target: 'c' },
    ]
    const result = dagreLayout(nodes, edges, { ...opts, rankDir: 'LR' })
    const posMap = new Map(result.nodes.map((n) => [n.id, n]))

    // In LR mode, a should be left of b, b left of c
    expect(posMap.get('a')!.x).toBeLessThan(posMap.get('b')!.x)
    expect(posMap.get('b')!.x).toBeLessThan(posMap.get('c')!.x)
  })

  it('handles diamond DAG without overlaps', () => {
    const nodes: GraphNode[] = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }]
    const edges: GraphEdge[] = [
      { source: 'a', target: 'b' },
      { source: 'a', target: 'c' },
      { source: 'b', target: 'd' },
      { source: 'c', target: 'd' },
    ]
    const result = dagreLayout(nodes, edges, opts)

    // No two nodes at exact same position
    for (let i = 0; i < result.nodes.length; i++) {
      for (let j = i + 1; j < result.nodes.length; j++) {
        const a = result.nodes[i]
        const b = result.nodes[j]
        const same = Math.abs(a.x - b.x) < 1 && Math.abs(a.y - b.y) < 1
        expect(same).toBe(false)
      }
    }
  })

  it('includes bend points for multi-layer edges', () => {
    const nodes: GraphNode[] = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
    const edges: GraphEdge[] = [
      { source: 'a', target: 'b' },
      { source: 'b', target: 'c' },
      { source: 'a', target: 'c' }, // skips layer
    ]
    const result = dagreLayout(nodes, edges, opts)
    const skipEdge = result.edges.find((e) => e.source === 'a' && e.target === 'c')!
    // Should have at least 3 points (source, bend, target)
    expect(skipEdge.points.length).toBeGreaterThanOrEqual(3)
  })
})

// ---- Circular layout ----

describe('circularLayout', () => {
  const opts: LayoutOptions = { type: 'circular', width: 800, height: 600 }

  it('places all nodes on a circle', () => {
    const nodes: GraphNode[] = Array.from({ length: 8 }, (_, i) => ({ id: `n${i}` }))
    const result = circularLayout(nodes, [], opts)

    const cx = 400
    const cy = 300
    const distances = result.nodes.map((n) => Math.hypot(n.x - cx, n.y - cy))

    // All distances should be approximately equal (on the circle)
    const avgDist = distances.reduce((a, b) => a + b, 0) / distances.length
    for (const d of distances) {
      expect(Math.abs(d - avgDist)).toBeLessThan(1)
    }
  })

  it('spaces nodes equally', () => {
    const nodes: GraphNode[] = Array.from({ length: 4 }, (_, i) => ({ id: `n${i}` }))
    const result = circularLayout(nodes, [], opts)

    // Adjacent nodes should be approximately the same distance apart
    const dists: number[] = []
    for (let i = 0; i < result.nodes.length; i++) {
      const j = (i + 1) % result.nodes.length
      dists.push(Math.hypot(
        result.nodes[i].x - result.nodes[j].x,
        result.nodes[i].y - result.nodes[j].y,
      ))
    }

    const avgDist = dists.reduce((a, b) => a + b, 0) / dists.length
    for (const d of dists) {
      expect(Math.abs(d - avgDist)).toBeLessThan(1)
    }
  })
})

// ---- Grid layout ----

describe('gridLayout', () => {
  const opts: LayoutOptions = { type: 'grid', width: 800, height: 600 }

  it('arranges nodes in row-major order sorted by id', () => {
    const nodes: GraphNode[] = [{ id: 'c' }, { id: 'a' }, { id: 'b' }]
    const result = gridLayout(nodes, [], opts)

    // Sorted: a, b, c — a should come first (top-left)
    const posMap = new Map(result.nodes.map((n) => [n.id, n]))
    const a = posMap.get('a')!
    const b = posMap.get('b')!
    const c = posMap.get('c')!

    // a and b in first row, c in second (or a before b in same row)
    expect(a.x).toBeLessThan(b.x)
  })

  it('uses correct grid dimensions', () => {
    const nodes: GraphNode[] = Array.from({ length: 9 }, (_, i) => ({ id: `n${i}` }))
    const result = gridLayout(nodes, [], opts)

    // 9 nodes => 3x3 grid
    const ys = [...new Set(result.nodes.map((n) => Math.round(n.y)))]
    const xs = [...new Set(result.nodes.map((n) => Math.round(n.x)))]
    expect(ys.length).toBe(3)
    expect(xs.length).toBe(3)
  })
})

// ---- computeLayout dispatcher ----

describe('computeLayout', () => {
  const nodes: GraphNode[] = [{ id: 'a' }, { id: 'b' }]
  const edges: GraphEdge[] = [{ source: 'a', target: 'b' }]

  it('dispatches to force layout', () => {
    const result = computeLayout(nodes, edges, { type: 'force', width: 400, height: 400, iterations: 10 })
    expect(result.nodes).toHaveLength(2)
  })

  it('dispatches to dagre layout', () => {
    const result = computeLayout(nodes, edges, { type: 'dagre', width: 400, height: 400 })
    expect(result.nodes).toHaveLength(2)
  })

  it('dispatches to circular layout', () => {
    const result = computeLayout(nodes, edges, { type: 'circular', width: 400, height: 400 })
    expect(result.nodes).toHaveLength(2)
  })

  it('dispatches to grid layout', () => {
    const result = computeLayout(nodes, edges, { type: 'grid', width: 400, height: 400 })
    expect(result.nodes).toHaveLength(2)
  })
})

// ---- Edge cases ----

describe('edge cases', () => {
  it('handles empty graph', () => {
    const result = computeLayout([], [], { type: 'force', width: 400, height: 400 })
    expect(result.nodes).toHaveLength(0)
    expect(result.edges).toHaveLength(0)
  })

  it('handles single node', () => {
    const result = computeLayout([{ id: 'solo' }], [], { type: 'force', width: 400, height: 400, iterations: 10 })
    expect(result.nodes).toHaveLength(1)
    expect(Number.isFinite(result.nodes[0].x)).toBe(true)
  })

  it('handles disconnected graph', () => {
    const nodes: GraphNode[] = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
    const result = computeLayout(nodes, [], { type: 'dagre', width: 400, height: 400 })
    expect(result.nodes).toHaveLength(3)
    for (const n of result.nodes) {
      expect(Number.isFinite(n.x)).toBe(true)
      expect(Number.isFinite(n.y)).toBe(true)
    }
  })

  it('handles self-loop edge', () => {
    const nodes: GraphNode[] = [{ id: 'a' }]
    const edges: GraphEdge[] = [{ source: 'a', target: 'a' }]
    const result = computeLayout(nodes, edges, { type: 'force', width: 400, height: 400, iterations: 10 })
    expect(result.nodes).toHaveLength(1)
    expect(result.edges).toHaveLength(1)
  })

  it('handles edges referencing unknown nodes gracefully', () => {
    const nodes: GraphNode[] = [{ id: 'a' }]
    const edges: GraphEdge[] = [{ source: 'a', target: 'missing' }]
    const result = computeLayout(nodes, edges, { type: 'force', width: 400, height: 400, iterations: 10 })
    expect(result.nodes).toHaveLength(1)
    // Edge should have empty points since target is missing
    expect(result.edges[0].points).toHaveLength(0)
  })
})
