import { useState } from 'react'
import { Preview } from '../components/Preview'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Button } from '@ui/components/button'
import { Icon } from '@ui/core/icons/icon'
import { DataTable } from '@ui/domain/data-table'
import { SmartTable } from '@ui/domain/smart-table'
import { TreeView } from '@ui/domain/tree-view'
import { SortableList } from '@ui/domain/sortable-list'
import { CopyBlock } from '@ui/domain/copy-block'
import { InfiniteScroll } from '@ui/domain/infinite-scroll'
import { DiffViewer } from '@ui/domain/diff-viewer'
import { EmptyState } from '@ui/domain/empty-state'
import { KanbanColumn } from '@ui/domain/kanban-column'
import type { ColumnDef } from '@ui/domain/data-table'
import type { TreeNode } from '@ui/domain/tree-view'
import type { SortableItem } from '@ui/domain/sortable-list'
import type { KanbanCard } from '@ui/domain/kanban-column'

interface Server {
  hostname: string
  ip: string
  os: string
  cpu: number
  memory: number
  status: string
  uptime: string
  region: string
}

const serverData: Server[] = [
  { hostname: 'prod-api-01', ip: '10.0.1.10', os: 'Ubuntu 24.04', cpu: 45, memory: 62, status: 'Online', uptime: '47d', region: 'us-east-1' },
  { hostname: 'prod-api-02', ip: '10.0.1.11', os: 'Ubuntu 24.04', cpu: 72, memory: 81, status: 'Online', uptime: '47d', region: 'us-east-1' },
  { hostname: 'prod-db-01', ip: '10.0.2.10', os: 'Debian 12', cpu: 38, memory: 55, status: 'Online', uptime: '120d', region: 'us-east-1' },
  { hostname: 'staging-api', ip: '10.0.3.10', os: 'Ubuntu 24.04', cpu: 12, memory: 34, status: 'Online', uptime: '15d', region: 'eu-west-1' },
  { hostname: 'edge-fw-01', ip: '10.0.0.1', os: 'pfSense', cpu: 94, memory: 67, status: 'Warning', uptime: '230d', region: 'us-east-1' },
  { hostname: 'cache-01', ip: '10.0.4.10', os: 'Alpine 3.19', cpu: 8, memory: 92, status: 'Online', uptime: '60d', region: 'us-west-2' },
  { hostname: 'monitor-01', ip: '10.0.5.10', os: 'Rocky 9', cpu: 25, memory: 48, status: 'Online', uptime: '90d', region: 'eu-west-1' },
  { hostname: 'backup-01', ip: '10.0.6.10', os: 'Debian 12', cpu: 5, memory: 30, status: 'Offline', uptime: '0d', region: 'us-west-2' },
]

const columns: ColumnDef<Server>[] = [
  { id: 'hostname', header: 'Hostname', accessor: 'hostname', sortable: true },
  { id: 'ip', header: 'IP Address', accessor: 'ip' },
  { id: 'os', header: 'OS', accessor: 'os' },
  { id: 'cpu', header: 'CPU %', accessor: 'cpu', sortable: true, align: 'right', cell: (v) => `${v}%` },
  { id: 'memory', header: 'Memory %', accessor: 'memory', sortable: true, align: 'right', cell: (v) => `${v}%` },
  { id: 'status', header: 'Status', accessor: 'status', sortable: true },
  { id: 'uptime', header: 'Uptime', accessor: 'uptime', align: 'right' },
  { id: 'region', header: 'Region', accessor: 'region' },
]

const treeNodes: TreeNode[] = [
  {
    id: 'src',
    label: 'src',
    icon: <Icon name="folder" size="sm" />,
    children: [
      {
        id: 'components',
        label: 'components',
        icon: <Icon name="folder" size="sm" />,
        children: [
          { id: 'button.tsx', label: 'button.tsx', icon: <Icon name="file" size="sm" /> },
          { id: 'card.tsx', label: 'card.tsx', icon: <Icon name="file" size="sm" /> },
          { id: 'dialog.tsx', label: 'dialog.tsx', icon: <Icon name="file" size="sm" /> },
        ],
      },
      {
        id: 'core',
        label: 'core',
        icon: <Icon name="folder" size="sm" />,
        children: [
          { id: 'motion', label: 'motion', icon: <Icon name="folder" size="sm" />, children: [
            { id: 'spring.ts', label: 'spring.ts', icon: <Icon name="file" size="sm" /> },
            { id: 'use-spring.ts', label: 'use-spring.ts', icon: <Icon name="file" size="sm" /> },
          ]},
          { id: 'tokens', label: 'tokens', icon: <Icon name="folder" size="sm" />, children: [
            { id: 'theme.css', label: 'theme.css', icon: <Icon name="file" size="sm" /> },
          ]},
        ],
      },
      { id: 'index.ts', label: 'index.ts', icon: <Icon name="file" size="sm" /> },
    ],
  },
  {
    id: 'package.json',
    label: 'package.json',
    icon: <Icon name="file" size="sm" />,
  },
]

const codeExample = `import { Button } from '@annondeveloper/ui-kit'
import { useForm, createForm, v } from '@annondeveloper/ui-kit/form'
import { generateTheme } from '@annondeveloper/ui-kit/theme'

const myForm = createForm({
  fields: {
    email: { initial: '', validate: v.pipe(v.required(), v.email()) },
    password: { initial: '', validate: v.minLength(8) },
  },
  onSubmit: (values) => console.log(values),
})

export function LoginPage() {
  const form = useForm(myForm)
  return <Form form={form}>...</Form>
}`

const oldCode = `function fetchData() {
  return fetch('/api/data')
    .then(res => res.json())
    .then(data => {
      setState(data)
    })
}`

const newCode = `async function fetchData() {
  try {
    const res = await fetch('/api/data')
    const data = await res.json()
    setState(data)
  } catch (err) {
    setError(err.message)
  }
}`

const kanbanCards: KanbanCard[] = [
  { id: 'k1', title: 'Design system tokens', description: 'Define OKLCH color palette and spacing scale', tags: ['design', 'tokens'], priority: 'high' },
  { id: 'k2', title: 'Button component', description: 'Build primary, secondary, ghost variants', tags: ['component'], priority: 'medium' },
  { id: 'k3', title: 'Dialog accessibility', description: 'Focus trap, ESC to close, ARIA labels', tags: ['a11y'], priority: 'critical' },
  { id: 'k4', title: 'Spring animation', description: 'Physics-based motion solver', tags: ['motion'], priority: 'low' },
]

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
  gap: '1rem',
}

export default function DataPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [feedItems, setFeedItems] = useState(Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`))
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const loadMore = async () => {
    setLoadingMore(true)
    await new Promise(r => setTimeout(r, 500))
    setFeedItems(prev => {
      const next = [
        ...prev,
        ...Array.from({ length: 10 }, (_, i) => `Item ${prev.length + i + 1}`),
      ]
      if (next.length >= 50) setHasMore(false)
      return next
    })
    setLoadingMore(false)
  }

  const [sortItems, setSortItems] = useState<SortableItem[]>([
    { id: '1', content: 'Deploy to production' },
    { id: '2', content: 'Run integration tests' },
    { id: '3', content: 'Review pull request' },
    { id: '4', content: 'Update documentation' },
    { id: '5', content: 'Fix CI pipeline' },
  ])

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Data</h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Tables, trees, code blocks, and data display components</p>
      </div>

      <div style={grid}>
        {/* Tabs */}
        <Preview label="Tabs" description="3 variants: underline, pills, enclosed">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Tabs
              tabs={[
                { id: 'overview', label: 'Overview' },
                { id: 'analytics', label: 'Analytics' },
                { id: 'settings', label: 'Settings' },
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
              variant="underline"
            >
              <TabPanel tabId="overview">
                <div style={{ padding: '0.75rem 0', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  Welcome to the overview panel. This shows general information about your project.
                </div>
              </TabPanel>
              <TabPanel tabId="analytics">
                <div style={{ padding: '0.75rem 0', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  Analytics dashboard with charts and metrics would appear here.
                </div>
              </TabPanel>
              <TabPanel tabId="settings">
                <div style={{ padding: '0.75rem 0', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  Configure project settings: notifications, integrations, and team access.
                </div>
              </TabPanel>
            </Tabs>
          </div>
        </Preview>

        {/* TreeView */}
        <Preview label="TreeView" description="Nested file structure with expand/collapse">
          <TreeView
            nodes={treeNodes}
            showGuides
          />
        </Preview>

        {/* DataTable */}
        <Preview label="DataTable" description="Full-featured: search, sort, resize, reorder, export, select, paginate" wide>
          <DataTable
            data={serverData}
            columns={columns}
            searchable
            sortable
            paginated
            pageSize={5}
            pageSizes={[5, 10, 25, 50]}
            selectable
            resizable
            reorderable
            exportable
            stickyHeader
            striped
          />
        </Preview>

        {/* SmartTable */}
        <Preview label="SmartTable" description="Search, column toggle, pagination, sorting, striped rows" wide>
          <SmartTable
            data={serverData}
            columns={columns}
            searchable
            searchPlaceholder="Search servers..."
            columnToggle
            selectable
            sortable
            paginated
            pageSize={4}
            pageSizes={[4, 8, 25]}
            striped
            exportable
            stickyHeader
          />
        </Preview>

        {/* SortableList */}
        <Preview label="SortableList" description="Drag to reorder items">
          <SortableList
            items={sortItems}
            onChange={setSortItems}
            handle
          />
        </Preview>

        {/* CopyBlock */}
        <Preview label="CopyBlock" description="Syntax-highlighted TypeScript with copy">
          <CopyBlock
            code={codeExample}
            language="typescript"
            showLineNumbers
            title="Getting Started"
          />
        </Preview>

        {/* DiffViewer */}
        <Preview label="DiffViewer" description="Before/after code comparison" wide>
          <DiffViewer
            oldValue={oldCode}
            newValue={newCode}
            oldTitle="Before"
            newTitle="After"
            mode="unified"
            showLineNumbers
          />
        </Preview>

        {/* InfiniteScroll */}
        <Preview label="InfiniteScroll" description="Load more items on scroll" wide>
          <InfiniteScroll
            onLoadMore={loadMore}
            hasMore={hasMore}
            loading={loadingMore}
            style={{ height: '300px', overflow: 'auto' }}
          >
            {feedItems.map((item, i) => (
              <div key={i} style={{
                padding: '0.75rem 1rem',
                borderBottom: '1px solid var(--border-subtle)',
                fontSize: 'var(--text-sm)',
                color: 'var(--text-primary)',
              }}>
                {item}
              </div>
            ))}
          </InfiniteScroll>
        </Preview>

        {/* KanbanColumn */}
        <Preview label="KanbanColumn" description="Kanban board column with cards, tags, priorities">
          <div style={{ display: 'flex', gap: '1rem' }}>
            <KanbanColumn
              columnId="in-progress"
              title="In Progress"
              cards={kanbanCards.slice(0, 2)}
              wipLimit={3}
            />
            <KanbanColumn
              columnId="review"
              title="Review"
              cards={kanbanCards.slice(2)}
              wipLimit={5}
            />
          </div>
        </Preview>

        {/* EmptyState */}
        <Preview label="EmptyState" description="Placeholder for empty views">
          <EmptyState
            icon={<Icon name="search" size="lg" />}
            title="No results found"
            description="Try adjusting your search or filters to find what you're looking for."
            action={<Button variant="primary" size="sm">Clear Filters</Button>}
            secondaryAction={<Button variant="ghost" size="sm">Browse All</Button>}
          />
        </Preview>
      </div>
    </div>
  )
}
