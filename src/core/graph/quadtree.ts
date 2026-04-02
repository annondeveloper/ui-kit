export interface QuadtreeNode {
  x: number
  y: number
  mass: number
  data?: unknown
}

interface QuadtreeLeaf {
  node: QuadtreeNode | null
  children: null
}

interface QuadtreeBranch {
  node: null
  children: [Quad, Quad, Quad, Quad] // NW, NE, SW, SE
}

type Quad = (QuadtreeLeaf | QuadtreeBranch) & {
  cx: number
  cy: number
  mass: number
}

function createLeaf(): Quad {
  return { node: null, children: null, cx: 0, cy: 0, mass: 0 }
}

export class Quadtree {
  private root: Quad = createLeaf()
  private x0: number
  private y0: number
  private size: number

  constructor(x: number, y: number, width: number, height: number) {
    this.x0 = x
    this.y0 = y
    this.size = Math.max(width, height)
  }

  insert(node: QuadtreeNode): void {
    this.root = this.insertInto(this.root, node, this.x0, this.y0, this.size, 0)
  }

  private insertInto(
    quad: Quad,
    node: QuadtreeNode,
    x: number,
    y: number,
    size: number,
    depth: number,
  ): Quad {
    // Update center of mass
    const totalMass = quad.mass + node.mass
    if (totalMass > 0) {
      quad.cx = (quad.cx * quad.mass + node.x * node.mass) / totalMass
      quad.cy = (quad.cy * quad.mass + node.y * node.mass) / totalMass
    }
    quad.mass = totalMass

    // Empty leaf — store node here
    if (quad.children === null && quad.node === null) {
      quad.node = node
      return quad
    }

    const half = size / 2

    // Leaf with existing node — subdivide (with max depth to avoid infinite recursion
    // when two nodes share the same position)
    if (quad.children === null && quad.node !== null) {
      if (depth >= 50) {
        // At max depth, just merge into this leaf (approximate coincident points)
        return quad
      }
      const existing = quad.node
      const branch = quad as unknown as QuadtreeBranch & { cx: number; cy: number; mass: number }
      branch.node = null
      branch.children = [createLeaf(), createLeaf(), createLeaf(), createLeaf()]
      this.placeInChild(branch, existing, x, y, size, half, depth)
      this.placeInChild(branch, node, x, y, size, half, depth)
      return branch as unknown as Quad
    }

    // Branch — recurse into correct child
    this.placeInChild(quad as unknown as QuadtreeBranch & { cx: number; cy: number; mass: number }, node, x, y, size, half, depth)
    return quad
  }

  private placeInChild(
    branch: QuadtreeBranch & { cx: number; cy: number; mass: number },
    node: QuadtreeNode,
    x: number,
    y: number,
    size: number,
    half: number,
    depth: number,
  ): void {
    const midX = x + half
    const midY = y + half
    const west = node.x < midX
    const north = node.y < midY
    const idx = (north ? 0 : 2) + (west ? 0 : 1)
    const childX = west ? x : midX
    const childY = north ? y : midY
    branch.children[idx] = this.insertInto(branch.children[idx], node, childX, childY, half, depth + 1)
  }

  /**
   * Barnes-Hut traversal. Callback receives (cx, cy, mass, size) for each
   * relevant region. Return true to skip children (node is far enough).
   */
  visit(callback: (cx: number, cy: number, mass: number, size: number) => boolean): void {
    this.visitQuad(this.root, this.x0, this.y0, this.size, callback)
  }

  private visitQuad(
    quad: Quad,
    _x: number,
    _y: number,
    size: number,
    callback: (cx: number, cy: number, mass: number, size: number) => boolean,
  ): void {
    if (quad.mass === 0) return
    const skip = callback(quad.cx, quad.cy, quad.mass, size)
    if (!skip && quad.children !== null) {
      const half = size / 2
      const branch = quad as QuadtreeBranch & { cx: number; cy: number; mass: number }
      this.visitQuad(branch.children[0], _x, _y, half, callback)
      this.visitQuad(branch.children[1], _x + half, _y, half, callback)
      this.visitQuad(branch.children[2], _x, _y + half, half, callback)
      this.visitQuad(branch.children[3], _x + half, _y + half, half, callback)
    }
  }

  /**
   * Find the nearest node within `radius` of the given point.
   */
  find(x: number, y: number, radius: number): QuadtreeNode | null {
    let best: QuadtreeNode | null = null
    let bestDist = radius * radius

    this.findInQuad(this.root, this.x0, this.y0, this.size, x, y, bestDist, (node, dist2) => {
      if (dist2 < bestDist) {
        bestDist = dist2
        best = node
      }
    })

    return best
  }

  private findInQuad(
    quad: Quad,
    qx: number,
    qy: number,
    size: number,
    x: number,
    y: number,
    radius2: number,
    onFound: (node: QuadtreeNode, dist2: number) => void,
  ): void {
    // Prune if the closest point of this quadrant is outside radius
    const closestX = Math.max(qx, Math.min(x, qx + size))
    const closestY = Math.max(qy, Math.min(y, qy + size))
    const dx = closestX - x
    const dy = closestY - y
    if (dx * dx + dy * dy > radius2) return

    if (quad.children === null) {
      if (quad.node !== null) {
        const ndx = quad.node.x - x
        const ndy = quad.node.y - y
        onFound(quad.node, ndx * ndx + ndy * ndy)
      }
      return
    }

    const half = size / 2
    const branch = quad as QuadtreeBranch & { cx: number; cy: number; mass: number }
    this.findInQuad(branch.children[0], qx, qy, half, x, y, radius2, onFound)
    this.findInQuad(branch.children[1], qx + half, qy, half, x, y, radius2, onFound)
    this.findInQuad(branch.children[2], qx, qy + half, half, x, y, radius2, onFound)
    this.findInQuad(branch.children[3], qx + half, qy + half, half, x, y, radius2, onFound)
  }
}
