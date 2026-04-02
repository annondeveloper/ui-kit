# Netrak-Grade Infrastructure Components — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build 8 new domain components + enhance 1 existing component to cover every UI pattern used in the Netrak infrastructure monitoring platform, with zero external dependencies, massive scale support (10K+ node topology), and MCP-first discoverability.

**Architecture:** Three subsystems built incrementally: (A) Infrastructure primitives (NetworkInterfaceGrid, VlanBusBar), (B) Graph visualization engine with canvas renderer for massive topologies + SVG for small ones, (C) Composable dashboard template system. Each component follows the existing pattern: `src/domain/`, lite/premium wrappers, tests, demo page, MCP registry.

**Tech Stack:** React 19, zero external deps, SVG + Canvas 2D, CSS @scope/@layer, OKLCH color system, physics-based spring animations

**Constraints:**
- Zero external dependencies (no @xyflow, no d3, no dagre)
- Per-component budget: < 8KB JS gzip for complex domain components
- Full bundle must stay < 350KB gzip (currently ~332KB, 18KB headroom)
- Canvas fallback for >500 nodes, SVG for ≤500 nodes
- MCP registry entry for every new component
- Lite/Standard/Premium tiers for each component

---

## Subsystem A: Infrastructure Network Primitives

### Task 1: NetworkInterfaceGrid

**Purpose:** Grid visualization of network interfaces (NICs) showing status, speed, duplex, errors, and traffic for each interface. Used in server/switch detail pages.

**Files:**
- Create: `src/domain/network-interface-grid.tsx`
- Create: `src/lite/network-interface-grid.tsx`
- Create: `src/premium/network-interface-grid.tsx`
- Create: `src/__tests__/domain/network-interface-grid.test.tsx`
- Create: `demo/src/pages/components/NetworkInterfaceGridPage.tsx`

**Interface:**
```typescript
export interface NetworkInterface {
  name: string                    // e.g. "eth0", "bond0", "ens192"
  status: 'up' | 'down' | 'dormant' | 'unknown'
  speed?: string                  // e.g. "1Gbps", "10Gbps", "25Gbps"
  duplex?: 'full' | 'half' | 'unknown'
  mac?: string
  ipv4?: string
  ipv6?: string
  mtu?: number
  txRate?: number                 // bytes/sec
  rxRate?: number                 // bytes/sec
  txErrors?: number
  rxErrors?: number
  type?: 'ethernet' | 'bond' | 'bridge' | 'vlan' | 'loopback' | 'wireless'
}

export interface NetworkInterfaceGridProps extends HTMLAttributes<HTMLDivElement> {
  interfaces: NetworkInterface[]
  columns?: number               // default: auto (responsive)
  size?: 'sm' | 'md' | 'lg'
  showTraffic?: boolean          // show tx/rx sparklines
  showErrors?: boolean           // highlight error counts
  onInterfaceClick?: (iface: NetworkInterface) => void
  compact?: boolean              // minimal view for sidebars
  motion?: 0 | 1 | 2 | 3
}
```

**Visual design:** Grid of cards, each showing interface name, status LED, speed badge, and optional mini sparkline for traffic. Status colors match the existing palette (ok=green, down=red, dormant=amber). Cards have Aurora Fluid glass effect in premium tier.

- [ ] **Step 1:** Write test file with rendering, props, and a11y tests
- [ ] **Step 2:** Implement the Standard component
- [ ] **Step 3:** Create Lite wrapper (native HTML table, no motion)
- [ ] **Step 4:** Create Premium wrapper (aurora glow, spring hover)
- [ ] **Step 5:** Create demo page with PropsTable, tier comparison, interactive examples
- [ ] **Step 6:** Register in MCP build script
- [ ] **Step 7:** Export from barrel files (index.ts, lite/index.ts, premium/index.ts)
- [ ] **Step 8:** Run tests, typecheck, build — commit

---

### Task 2: VlanBusBar

**Purpose:** Horizontal bus diagram showing VLAN membership across ports/interfaces. Shows which VLANs are configured on which ports, with color-coded segments.

**Files:**
- Create: `src/domain/vlan-bus-bar.tsx`
- Create: `src/lite/vlan-bus-bar.tsx`
- Create: `src/premium/vlan-bus-bar.tsx`
- Create: `src/__tests__/domain/vlan-bus-bar.test.tsx`
- Create: `demo/src/pages/components/VlanBusBarPage.tsx`

**Interface:**
```typescript
export interface VlanEntry {
  id: number                     // VLAN ID (1-4094)
  name?: string                  // e.g. "Management", "Production"
  color?: string                 // OKLCH color override
  ports: number[]                // port numbers in this VLAN
  tagged?: boolean               // tagged (trunk) vs untagged (access)
}

export interface VlanBusBarProps extends HTMLAttributes<HTMLDivElement> {
  vlans: VlanEntry[]
  totalPorts: number             // total port count for scale
  showLabels?: boolean           // show VLAN ID labels
  showPortNumbers?: boolean      // show port numbers on the bus
  orientation?: 'horizontal' | 'vertical'
  size?: 'sm' | 'md' | 'lg'
  onVlanClick?: (vlan: VlanEntry) => void
  onPortClick?: (port: number, vlans: VlanEntry[]) => void
  motion?: 0 | 1 | 2 | 3
}
```

**Visual design:** SVG-based horizontal bus with colored segments for each VLAN. Ports are tick marks along the bus. VLANs are stacked rows with segments spanning their port ranges. Hover shows VLAN details tooltip.

- [ ] Steps: Same pattern as Task 1 (test → implement → lite → premium → demo → MCP → exports → commit)

---

### Task 3: TimeSeriesChart Enhancements

**Purpose:** Add brush/zoom, metric toggle, and time range selection to the existing TimeSeriesChart.

**Files:**
- Modify: `src/domain/time-series-chart.tsx`
- Modify: `src/__tests__/domain/time-series-chart.test.tsx`

**New props to add:**
```typescript
// Add to existing TimeSeriesChartProps:
  brushable?: boolean            // enable time range brush selection
  zoomable?: boolean             // enable scroll-to-zoom
  onBrush?: (range: [number, number]) => void  // callback with selected time range
  onZoom?: (domain: { x: [number, number]; y: [number, number] }) => void
  toggleableSeries?: boolean     // show checkboxes to toggle series visibility
  crosshair?: boolean            // show vertical crosshair on hover (default: true)
  annotations?: ChartAnnotation[]  // horizontal/vertical reference lines
```

```typescript
export interface ChartAnnotation {
  type: 'horizontal' | 'vertical'
  value: number                  // y-value for horizontal, timestamp for vertical
  label?: string
  color?: string
  dashed?: boolean
}
```

**Implementation:** Brush is an SVG rect overlay with drag handles. Zoom uses wheel events to scale the x/y domains. Series toggle uses the existing legend with checkbox integration. Annotations are SVG line elements.

- [ ] Steps: Add tests for new props → implement brush → implement zoom → implement toggle → implement annotations → update demo page → commit

---

## Subsystem B: Graph Visualization Engine

### Task 4: Graph Layout Engine (core/graph/)

**Purpose:** Zero-dependency graph layout algorithm that positions nodes for topology and pipeline visualization. Supports force-directed (for topology) and layered/DAG (for pipelines) layouts.

**Files:**
- Create: `src/core/graph/layout.ts` — layout algorithms
- Create: `src/core/graph/types.ts` — shared graph types
- Create: `src/core/graph/quadtree.ts` — spatial index for force simulation
- Create: `src/__tests__/core/graph/layout.test.ts`

**Architecture:** 
- **Force-directed layout:** Barnes-Hut simulation with quadtree for O(n log n) force calculation. Supports 10K+ nodes.
- **Layered layout (DAG):** Sugiyama-style with: (1) cycle removal, (2) layer assignment (longest path), (3) crossing reduction (barycenter), (4) coordinate assignment.
- Both layouts return `{ nodes: Array<{ id, x, y }>, edges: Array<{ source, target, points }> }`

**Types:**
```typescript
export interface GraphNode {
  id: string
  x?: number
  y?: number
  width?: number
  height?: number
  data?: unknown
  // Force layout
  fx?: number  // fixed x (pinned)
  fy?: number  // fixed y (pinned)
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
  // Force options
  iterations?: number     // default: 300
  gravity?: number        // default: 0.1
  repulsion?: number      // default: 1000
  linkDistance?: number    // default: 100
  // Dagre options
  rankDir?: 'TB' | 'LR' | 'BT' | 'RL'
  rankSep?: number        // default: 50
  nodeSep?: number        // default: 30
}

export interface LayoutResult {
  nodes: Array<GraphNode & { x: number; y: number }>
  edges: Array<GraphEdge & { points: Array<{ x: number; y: number }> }>
  width: number
  height: number
}
```

**Budget:** ~3KB gzip for the full layout engine (force + dagre + quadtree)

- [ ] **Step 1:** Write types file
- [ ] **Step 2:** Write quadtree with tests
- [ ] **Step 3:** Write force-directed layout with tests
- [ ] **Step 4:** Write layered/DAG layout with tests
- [ ] **Step 5:** Write circular and grid layouts
- [ ] **Step 6:** Export from core/graph/index.ts
- [ ] **Step 7:** Commit

---

### Task 5: TopologyGraph Component

**Purpose:** Interactive network topology visualization with device nodes, edges, pan/zoom, minimap, and detail panel. Supports 10K+ nodes via canvas rendering with SVG fallback for smaller graphs.

**Files:**
- Create: `src/domain/topology-graph.tsx` — main component
- Create: `src/domain/topology-graph-canvas.tsx` — canvas renderer for large graphs
- Create: `src/domain/topology-graph-svg.tsx` — SVG renderer for small graphs
- Create: `src/lite/topology-graph.tsx`
- Create: `src/premium/topology-graph.tsx`
- Create: `src/__tests__/domain/topology-graph.test.tsx`
- Create: `demo/src/pages/components/TopologyGraphPage.tsx`

**Interface:**
```typescript
export interface TopologyNode extends GraphNode {
  label: string
  type?: 'server' | 'switch' | 'router' | 'firewall' | 'cloud' | 'database' | 'loadbalancer' | 'custom'
  status?: 'ok' | 'warning' | 'critical' | 'unknown' | 'maintenance'
  icon?: ReactNode
  group?: string                 // for grouping/clustering
  metrics?: Record<string, number>  // key metrics shown on hover
}

export interface TopologyEdge extends GraphEdge {
  label?: string
  status?: 'ok' | 'warning' | 'critical' | 'unknown'
  bandwidth?: number             // for edge thickness
  animated?: boolean             // show traffic flow animation
  bidirectional?: boolean
}

export interface TopologyGraphProps extends HTMLAttributes<HTMLDivElement> {
  nodes: TopologyNode[]
  edges: TopologyEdge[]
  layout?: 'force' | 'dagre' | 'circular' | 'grid'  // default: 'force'
  layoutOptions?: Partial<LayoutOptions>
  
  // Interaction
  onNodeClick?: (node: TopologyNode) => void
  onNodeHover?: (node: TopologyNode | null) => void
  onEdgeClick?: (edge: TopologyEdge) => void
  selectedNodes?: string[]       // controlled selection
  
  // Display
  showMinimap?: boolean          // default: true for >50 nodes
  showControls?: boolean         // zoom in/out/fit buttons
  showLegend?: boolean
  height?: number | string
  
  // Grouping
  groupBy?: string               // node field to group by
  collapsibleGroups?: boolean
  
  // Performance
  renderer?: 'auto' | 'svg' | 'canvas'  // default: 'auto' (canvas >500 nodes)
  
  // Filtering
  nodeFilter?: (node: TopologyNode) => boolean
  edgeFilter?: (edge: TopologyEdge) => boolean
  
  motion?: 0 | 1 | 2 | 3
}
```

**Canvas renderer (>500 nodes):**
- Uses Canvas 2D API for node/edge rendering
- Quadtree-based hit testing for mouse interactions
- requestAnimationFrame-based pan/zoom
- Icon rendering via pre-cached ImageBitmap
- ~4KB gzip

**SVG renderer (≤500 nodes):**
- React elements for each node/edge
- CSS transitions for motion
- Direct DOM event handling
- ~2KB gzip

- [ ] **Step 1-3:** Write SVG renderer with tests
- [ ] **Step 4-6:** Write Canvas renderer with tests
- [ ] **Step 7:** Write main component with auto-switching
- [ ] **Step 8:** Write minimap, controls, legend
- [ ] **Step 9:** Create lite/premium wrappers
- [ ] **Step 10:** Create demo page
- [ ] **Step 11:** Register in MCP, export, commit

---

### Task 6: PipelineDAG Component

**Purpose:** DAG (directed acyclic graph) visualization for data pipelines with stage nodes, animated flow, and trace timeline. Uses the layered layout from Task 4.

**Files:**
- Create: `src/domain/pipeline-dag.tsx`
- Create: `src/lite/pipeline-dag.tsx`
- Create: `src/premium/pipeline-dag.tsx`
- Create: `src/__tests__/domain/pipeline-dag.test.tsx`
- Create: `demo/src/pages/components/PipelineDagPage.tsx`

**Interface:**
```typescript
export interface PipelineNode {
  id: string
  label: string
  type?: 'source' | 'transform' | 'sink' | 'filter' | 'aggregate' | 'custom'
  status?: 'pending' | 'running' | 'success' | 'failed' | 'skipped'
  metrics?: {
    throughput?: number          // events/sec
    latency?: number             // ms
    errorRate?: number           // percentage
    dropped?: number             // count
  }
  icon?: ReactNode
}

export interface PipelineEdge {
  source: string
  target: string
  label?: string
  throughput?: number            // for edge thickness
  animated?: boolean             // show flow animation (default: true for running)
}

export interface PipelineDAGProps extends HTMLAttributes<HTMLDivElement> {
  nodes: PipelineNode[]
  edges: PipelineEdge[]
  direction?: 'LR' | 'TB'       // default: 'LR'
  
  onNodeClick?: (node: PipelineNode) => void
  onEdgeClick?: (edge: PipelineEdge) => void
  selectedNode?: string
  
  showMetrics?: boolean          // show throughput/latency on nodes
  showThroughput?: boolean       // show throughput on edges
  height?: number | string
  
  motion?: 0 | 1 | 2 | 3
}
```

- [ ] Steps: test → implement → lite → premium → demo → MCP → exports → commit

---

## Subsystem C: Dashboard Template System

### Task 7: DashboardTemplate Component

**Purpose:** Composable dashboard layout with metric row, chart area, and property sidebar. Standard layout for monitoring dashboards.

**Files:**
- Create: `src/domain/dashboard-template.tsx`
- Create: `src/lite/dashboard-template.tsx`
- Create: `src/premium/dashboard-template.tsx`
- Create: `src/__tests__/domain/dashboard-template.test.tsx`
- Create: `demo/src/pages/components/DashboardTemplatePage.tsx`

**Interface:**
```typescript
export interface DashboardMetric {
  id: string
  title: string
  value: ReactNode
  change?: { value: number; period?: string }
  trend?: 'up' | 'down' | 'flat'
  status?: 'ok' | 'warning' | 'critical'
  sparkline?: number[]
  icon?: ReactNode
}

export interface DashboardSection {
  id: string
  title: string
  description?: string
  collapsible?: boolean
  defaultCollapsed?: boolean
  content: ReactNode
  span?: 1 | 2 | 3              // grid column span (default: 1)
}

export interface DashboardTemplateProps extends HTMLAttributes<HTMLDivElement> {
  title?: ReactNode
  subtitle?: string
  status?: 'ok' | 'warning' | 'critical' | 'unknown' | 'maintenance'
  lastUpdated?: number | Date
  
  // Metric strip at top
  metrics?: DashboardMetric[]
  
  // Main content grid
  sections?: DashboardSection[]
  columns?: 1 | 2 | 3           // grid columns (default: 2)
  
  // Sidebar
  sidebar?: ReactNode            // PropertyList, entity details, etc.
  sidebarPosition?: 'left' | 'right'  // default: 'right'
  sidebarCollapsible?: boolean
  
  // Actions
  actions?: ReactNode            // buttons/dropdowns in the header
  
  // Refresh
  autoRefresh?: number           // interval in ms
  onRefresh?: () => void
  
  children?: ReactNode           // fallback for freeform content
  motion?: 0 | 1 | 2 | 3
}
```

- [ ] Steps: test → implement → lite → premium → demo → MCP → exports → commit

---

### Task 8: PluginDashboard Component

**Purpose:** Declarative dashboard builder for service-specific monitoring (Postgres, Redis, Kafka, etc.). Takes a configuration object and composes MetricCards, TimeSeriesCharts, PropertyLists, and status indicators into a standard layout.

**Files:**
- Create: `src/domain/plugin-dashboard.tsx`
- Create: `src/lite/plugin-dashboard.tsx`
- Create: `src/premium/plugin-dashboard.tsx`
- Create: `src/__tests__/domain/plugin-dashboard.test.tsx`
- Create: `demo/src/pages/components/PluginDashboardPage.tsx`

**Interface:**
```typescript
export interface PluginMetricDef {
  key: string
  label: string
  format?: 'number' | 'bytes' | 'percent' | 'duration' | 'rate'
  unit?: string
  thresholds?: { warning: number; critical: number }
  sparkline?: boolean
}

export interface PluginChartDef {
  id: string
  title: string
  series: Array<{ key: string; label: string; color?: string }>
  height?: number
  yFormat?: 'number' | 'bytes' | 'percent' | 'duration'
}

export interface PluginPropertyDef {
  key: string
  label: string
  format?: 'text' | 'code' | 'link' | 'badge' | 'timestamp'
  copyable?: boolean
}

export interface PluginDashboardConfig {
  name: string                   // e.g. "PostgreSQL", "Redis"
  icon?: ReactNode
  metrics: PluginMetricDef[]     // top metric strip
  charts: PluginChartDef[]       // main chart area
  properties: PluginPropertyDef[] // sidebar property list
  statusKey?: string             // which data key determines overall status
}

export interface PluginDashboardProps extends HTMLAttributes<HTMLDivElement> {
  config: PluginDashboardConfig
  data: Record<string, unknown>  // flat key-value data from API
  timeSeries?: Record<string, Array<{ timestamp: number; value: number }>>
  loading?: boolean
  error?: ReactNode
  onRefresh?: () => void
  autoRefresh?: number
  motion?: 0 | 1 | 2 | 3
}
```

**Built-in configs (exported separately):**
```typescript
export const POSTGRES_DASHBOARD: PluginDashboardConfig
export const MYSQL_DASHBOARD: PluginDashboardConfig
export const REDIS_DASHBOARD: PluginDashboardConfig
export const KAFKA_DASHBOARD: PluginDashboardConfig
export const KUBERNETES_DASHBOARD: PluginDashboardConfig
export const DOCKER_DASHBOARD: PluginDashboardConfig
export const NGINX_DASHBOARD: PluginDashboardConfig
export const ELASTICSEARCH_DASHBOARD: PluginDashboardConfig
```

- [ ] Steps: test → implement configs → implement renderer → lite → premium → demo → MCP → exports → commit

---

## Task 9: MCP Registry & Exports

**Purpose:** Register all 8 new components in the MCP server and export from barrel files.

**Files:**
- Modify: `src/mcp/scripts/build-registry.ts` — add component entries
- Modify: `src/index.ts` — export new components
- Modify: `src/lite/index.ts` — export lite wrappers
- Modify: `src/premium/index.ts` — export premium wrappers
- Modify: `src/core/graph/index.ts` — export layout engine (for advanced users)

- [ ] **Step 1:** Add all 8 components to MCP registry categories
- [ ] **Step 2:** Add exports to all barrel files
- [ ] **Step 3:** Run full test suite + typecheck + build
- [ ] **Step 4:** Verify MCP `list_components` returns new components
- [ ] **Step 5:** Commit

---

## Budget Tracking

| Component | Estimated JS gzip | Estimated CSS gzip |
|---|---|---|
| NetworkInterfaceGrid | ~2.5KB | ~1KB |
| VlanBusBar | ~2KB | ~0.8KB |
| TimeSeriesChart enhancements | +1.5KB | +0.3KB |
| Graph layout engine | ~3KB | 0 |
| TopologyGraph (SVG+Canvas) | ~6KB | ~1.5KB |
| PipelineDAG | ~3KB | ~1KB |
| DashboardTemplate | ~2KB | ~1KB |
| PluginDashboard + configs | ~4KB | ~0.5KB |
| **Total new** | **~24KB** | **~6KB** |

Note: 24KB exceeds the 18KB headroom. However, tree-shaking means users only pay for what they import. The full un-tree-shaken bundle is the constraint — we may need to optimize aggressively or slightly increase the budget.

---

## Execution Order

1. **Task 4** (Graph layout engine) — dependency for Tasks 5 & 6
2. **Tasks 1 & 2** (NetworkInterfaceGrid, VlanBusBar) — independent primitives
3. **Task 3** (TimeSeriesChart enhancements) — enhances existing component
4. **Task 5** (TopologyGraph) — depends on Task 4
5. **Task 6** (PipelineDAG) — depends on Task 4
6. **Task 7** (DashboardTemplate) — independent
7. **Task 8** (PluginDashboard) — depends on Task 7
8. **Task 9** (MCP & exports) — final integration
