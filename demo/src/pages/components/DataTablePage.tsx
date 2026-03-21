'use client'

import { useState, useCallback } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { DataTable, type ColumnDef } from '@ui/domain/data-table'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Divider } from '@ui/components/divider'
import { PropsTable, type PropDef } from '../../components/PropsTable'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.datatable-page) {
      :scope {
        max-inline-size: 960px;
        margin-inline: auto;
      }

      /* ── Hero header ────────────────────────────────── */

      .datatable-page__hero {
        margin-block-end: 2.5rem;
      }

      .datatable-page__title {
        font-size: clamp(1.75rem, 4vw, 2.5rem);
        font-weight: 800;
        letter-spacing: -0.02em;
        color: var(--text-primary);
        margin: 0 0 0.5rem;
        line-height: 1.15;
      }

      .datatable-page__desc {
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 65ch;
        text-wrap: pretty;
      }

      .datatable-page__import-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .datatable-page__import-code {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-sm, 0.875rem);
        background: oklch(100% 0 0 / 0.05);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 0.5rem 0.875rem;
        color: var(--text-primary);
        flex: 1;
        min-inline-size: 0;
        overflow-x: auto;
        white-space: nowrap;
      }

      /* ── Sections ───────────────────────────────────── */

      .datatable-page__section {
        margin-block-end: 3rem;
      }

      .datatable-page__section-title {
        font-size: var(--text-lg, 1.125rem);
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.25rem;
        scroll-margin-block-start: 2rem;
      }

      .datatable-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .datatable-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .datatable-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .datatable-page__preview {
        padding: 1.5rem;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        background: var(--bg-surface);
        overflow: hidden;
      }

      /* ── Playground ─────────────────────────────────── */

      .datatable-page__playground {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .datatable-page__flags-panel {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 0.5rem 1rem;
        padding: 1rem;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        background: var(--bg-base);
      }

      .datatable-page__flags-title {
        grid-column: 1 / -1;
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin: 0 0 0.25rem;
      }

      .datatable-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .datatable-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .datatable-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .datatable-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .datatable-page__option-btn {
        font-size: var(--text-xs, 0.75rem);
        padding: 0.25rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-secondary);
        cursor: pointer;
        font-family: inherit;
        font-weight: 500;
        transition: all 0.12s;
        line-height: 1.4;
      }
      .datatable-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .datatable-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
      }

      /* ── Status badges ─────────────────────────────── */

      .datatable-page__status-dot {
        display: inline-block;
        inline-size: 0.5rem;
        block-size: 0.5rem;
        border-radius: 50%;
        margin-inline-end: 0.375rem;
      }
      .datatable-page__status-dot--online {
        background: oklch(72% 0.19 155);
        box-shadow: 0 0 4px oklch(72% 0.19 155 / 0.5);
      }
      .datatable-page__status-dot--warning {
        background: oklch(80% 0.18 85);
      }
      .datatable-page__status-dot--critical {
        background: oklch(62% 0.22 25);
        box-shadow: 0 0 4px oklch(62% 0.22 25 / 0.5);
      }
      .datatable-page__status-dot--offline {
        background: oklch(55% 0 0);
      }

      .datatable-page__usage-bar {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        min-inline-size: 5rem;
      }

      .datatable-page__usage-track {
        flex: 1;
        block-size: 0.375rem;
        border-radius: 1rem;
        background: oklch(100% 0 0 / 0.08);
        overflow: hidden;
      }

      .datatable-page__usage-fill {
        block-size: 100%;
        border-radius: inherit;
        transition: inline-size 0.3s ease;
      }

      .datatable-page__usage-label {
        font-size: var(--text-xs, 0.75rem);
        font-variant-numeric: tabular-nums;
        min-inline-size: 2.5rem;
        text-align: end;
      }

      /* ── Source link ─────────────────────────────────── */

      .datatable-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .datatable-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }
    }
  }
`

// ─── Mock Data ────────────────────────────────────────────────────────────────

interface Server {
  id: number
  hostname: string
  ip: string
  os: string
  cpu: number
  memory: number
  status: 'online' | 'warning' | 'critical' | 'offline'
  uptime: string
  region: string
}

const SERVERS: Server[] = [
  { id: 1, hostname: 'web-prod-01', ip: '10.0.1.12', os: 'Ubuntu 22.04', cpu: 42, memory: 67, status: 'online', uptime: '45d 12h', region: 'us-east-1' },
  { id: 2, hostname: 'web-prod-02', ip: '10.0.1.13', os: 'Ubuntu 22.04', cpu: 38, memory: 54, status: 'online', uptime: '45d 12h', region: 'us-east-1' },
  { id: 3, hostname: 'api-prod-01', ip: '10.0.2.20', os: 'Debian 12', cpu: 71, memory: 82, status: 'warning', uptime: '12d 3h', region: 'us-east-1' },
  { id: 4, hostname: 'api-prod-02', ip: '10.0.2.21', os: 'Debian 12', cpu: 65, memory: 78, status: 'online', uptime: '12d 3h', region: 'us-east-1' },
  { id: 5, hostname: 'db-primary', ip: '10.0.3.10', os: 'RHEL 9', cpu: 89, memory: 91, status: 'critical', uptime: '90d 8h', region: 'us-east-1' },
  { id: 6, hostname: 'db-replica-01', ip: '10.0.3.11', os: 'RHEL 9', cpu: 34, memory: 45, status: 'online', uptime: '90d 8h', region: 'us-east-1' },
  { id: 7, hostname: 'db-replica-02', ip: '10.0.3.12', os: 'RHEL 9', cpu: 29, memory: 41, status: 'online', uptime: '88d 2h', region: 'us-west-2' },
  { id: 8, hostname: 'cache-01', ip: '10.0.4.5', os: 'Alpine 3.18', cpu: 12, memory: 68, status: 'online', uptime: '30d 5h', region: 'us-west-2' },
  { id: 9, hostname: 'cache-02', ip: '10.0.4.6', os: 'Alpine 3.18', cpu: 15, memory: 72, status: 'online', uptime: '30d 5h', region: 'us-west-2' },
  { id: 10, hostname: 'worker-01', ip: '10.0.5.20', os: 'Ubuntu 22.04', cpu: 95, memory: 88, status: 'critical', uptime: '5d 1h', region: 'eu-west-1' },
  { id: 11, hostname: 'worker-02', ip: '10.0.5.21', os: 'Ubuntu 22.04', cpu: 55, memory: 62, status: 'online', uptime: '5d 1h', region: 'eu-west-1' },
  { id: 12, hostname: 'monitor-01', ip: '10.0.6.10', os: 'Debian 12', cpu: 22, memory: 35, status: 'online', uptime: '120d 6h', region: 'eu-west-1' },
  { id: 13, hostname: 'lb-prod-01', ip: '10.0.0.2', os: 'Ubuntu 22.04', cpu: 18, memory: 29, status: 'online', uptime: '60d 14h', region: 'us-east-1' },
  { id: 14, hostname: 'lb-prod-02', ip: '10.0.0.3', os: 'Ubuntu 22.04', cpu: 0, memory: 0, status: 'offline', uptime: '0d 0h', region: 'us-east-1' },
  { id: 15, hostname: 'gpu-ml-01', ip: '10.0.7.50', os: 'Ubuntu 22.04', cpu: 78, memory: 84, status: 'warning', uptime: '3d 9h', region: 'us-west-2' },
]

// ─── Column Definitions ──────────────────────────────────────────────────────

function usageColor(pct: number): string {
  if (pct >= 90) return 'oklch(62% 0.22 25)'
  if (pct >= 70) return 'oklch(80% 0.18 85)'
  return 'oklch(72% 0.19 155)'
}

function UsageBar({ value }: { value: number }) {
  return (
    <span className="datatable-page__usage-bar">
      <span className="datatable-page__usage-track">
        <span
          className="datatable-page__usage-fill"
          style={{ inlineSize: `${value}%`, background: usageColor(value) }}
        />
      </span>
      <span className="datatable-page__usage-label">{value}%</span>
    </span>
  )
}

function StatusBadge({ status }: { status: Server['status'] }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      <span className={`datatable-page__status-dot datatable-page__status-dot--${status}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

const COLUMNS: ColumnDef<Server>[] = [
  {
    id: 'hostname',
    header: 'Hostname',
    accessor: 'hostname',
    sortable: true,
    searchable: true,
    minWidth: 120,
  },
  {
    id: 'ip',
    header: 'IP Address',
    accessor: 'ip',
    sortable: true,
    searchable: true,
    minWidth: 110,
  },
  {
    id: 'os',
    header: 'OS',
    accessor: 'os',
    sortable: true,
    searchable: true,
    minWidth: 110,
  },
  {
    id: 'cpu',
    header: 'CPU %',
    accessor: 'cpu',
    sortable: true,
    align: 'center' as const,
    minWidth: 100,
    cell: (value) => <UsageBar value={value as number} />,
  },
  {
    id: 'memory',
    header: 'Memory %',
    accessor: 'memory',
    sortable: true,
    align: 'center' as const,
    minWidth: 100,
    cell: (value) => <UsageBar value={value as number} />,
  },
  {
    id: 'status',
    header: 'Status',
    accessor: 'status',
    sortable: true,
    searchable: true,
    minWidth: 90,
    cell: (value) => <StatusBadge status={value as Server['status']} />,
  },
  {
    id: 'uptime',
    header: 'Uptime',
    accessor: 'uptime',
    sortable: true,
    minWidth: 80,
  },
  {
    id: 'region',
    header: 'Region',
    accessor: 'region',
    sortable: true,
    searchable: true,
    minWidth: 90,
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="datatable-page__toggle-label">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        style={{ accentColor: 'var(--brand)' }}
      />
      {label}
    </label>
  )
}

function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: readonly T[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="datatable-page__control-group">
      <span className="datatable-page__control-label">{label}</span>
      <div className="datatable-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`datatable-page__option-btn${opt === value ? ' datatable-page__option-btn--active' : ''}`}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

const IMPORT_STR = "import { DataTable, type ColumnDef } from '@annondeveloper/ui-kit'"

// ─── Props Data ──────────────────────────────────────────────────────────────

const dataTableProps: PropDef[] = [
  { name: 'data', type: 'T[]', required: true, description: 'Array of row objects to display.' },
  { name: 'columns', type: 'ColumnDef<T>[]', required: true, description: 'Column definitions: id, header, accessor, cell renderer, sort/search flags.' },
  { name: 'searchable', type: 'boolean', default: 'false', description: 'Enable the search bar in the toolbar.' },
  { name: 'sortable', type: 'boolean', default: 'false', description: 'Enable column sorting (click headers).' },
  { name: 'paginated', type: 'boolean', default: 'false', description: 'Enable pagination with page size controls.' },
  { name: 'pageSize', type: 'number', default: '10', description: 'Default number of rows per page when paginated.' },
  { name: 'pageSizes', type: 'number[]', default: '[5, 10, 25, 50]', description: 'Available page size options.' },
  { name: 'selectable', type: 'boolean', default: 'false', description: 'Enable row selection with checkboxes.' },
  { name: 'resizable', type: 'boolean', default: 'false', description: 'Enable column resize handles.' },
  { name: 'reorderable', type: 'boolean', default: 'false', description: 'Enable column drag-and-drop reordering.' },
  { name: 'exportable', type: 'boolean', default: 'false', description: 'Show CSV/JSON export buttons in toolbar.' },
  { name: 'stickyHeader', type: 'boolean', default: 'false', description: 'Make the header row sticky on scroll.' },
  { name: 'striped', type: 'boolean', default: 'false', description: 'Alternate row background colors.' },
  { name: 'compact', type: 'boolean', default: 'false', description: 'Reduced padding for dense data displays.' },
  { name: 'bordered', type: 'boolean', default: 'false', description: 'Add visible borders around the table.' },
  { name: 'responsiveMode', type: "'scroll' | 'card'", default: "'scroll'", description: 'How the table adapts on narrow screens.' },
  { name: 'loading', type: 'boolean', default: 'false', description: 'Show loading skeleton rows.' },
  { name: 'empty', type: 'ReactNode', description: 'Content to display when data array is empty.' },
  { name: 'error', type: 'ReactNode', description: 'Error message to display instead of the table.' },
  { name: 'onRetry', type: '() => void', description: 'Retry callback shown alongside the error state.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override.' },
]

// ─── Section: Interactive Playground ─────────────────────────────────────────

function PlaygroundSection() {
  const [searchable, setSearchable] = useState(true)
  const [sortable, setSortable] = useState(true)
  const [paginated, setPaginated] = useState(true)
  const [pageSize, setPageSize] = useState(5)
  const [selectable, setSelectable] = useState(false)
  const [resizable, setResizable] = useState(false)
  const [reorderable, setReorderable] = useState(false)
  const [exportable, setExportable] = useState(false)
  const [stickyHeader, setStickyHeader] = useState(false)
  const [striped, setStriped] = useState(false)
  const [compact, setCompact] = useState(false)
  const [bordered, setBordered] = useState(false)
  const [responsiveMode, setResponsiveMode] = useState<'scroll' | 'card'>('scroll')

  // Build generated code
  const codeLines: string[] = [
    `const columns: ColumnDef<Server>[] = [`,
    `  { id: 'hostname', header: 'Hostname', accessor: 'hostname' },`,
    `  { id: 'ip', header: 'IP Address', accessor: 'ip' },`,
    `  { id: 'status', header: 'Status', accessor: 'status',`,
    `    cell: (v) => <StatusBadge status={v} /> },`,
    `  // ... more columns`,
    `]`,
    ``,
    `<DataTable`,
    `  data={servers}`,
    `  columns={columns}`,
  ]
  if (searchable) codeLines.push(`  searchable`)
  if (sortable) codeLines.push(`  sortable`)
  if (paginated) {
    codeLines.push(`  paginated`)
    if (pageSize !== 10) codeLines.push(`  pageSize={${pageSize}}`)
  }
  if (selectable) codeLines.push(`  selectable`)
  if (resizable) codeLines.push(`  resizable`)
  if (reorderable) codeLines.push(`  reorderable`)
  if (exportable) codeLines.push(`  exportable`)
  if (stickyHeader) codeLines.push(`  stickyHeader`)
  if (striped) codeLines.push(`  striped`)
  if (compact) codeLines.push(`  compact`)
  if (bordered) codeLines.push(`  bordered`)
  if (responsiveMode !== 'scroll') codeLines.push(`  responsiveMode="${responsiveMode}"`)
  codeLines.push(`/>`)

  const code = codeLines.join('\n')

  return (
    <section className="datatable-page__section" id="playground">
      <h2 className="datatable-page__section-title">
        <a href="#playground">Interactive Playground</a>
      </h2>
      <p className="datatable-page__section-desc">
        Toggle every feature flag and see the table update in real-time.
        The generated code below updates to reflect only the enabled features.
      </p>

      <div className="datatable-page__playground">
        {/* Feature Flags Panel */}
        <div className="datatable-page__flags-panel">
          <h3 className="datatable-page__flags-title">Feature Flags</h3>
          <Toggle label="Searchable" checked={searchable} onChange={setSearchable} />
          <Toggle label="Sortable" checked={sortable} onChange={setSortable} />
          <Toggle label="Paginated" checked={paginated} onChange={setPaginated} />
          <Toggle label="Selectable" checked={selectable} onChange={setSelectable} />
          <Toggle label="Resizable" checked={resizable} onChange={setResizable} />
          <Toggle label="Reorderable" checked={reorderable} onChange={setReorderable} />
          <Toggle label="Exportable" checked={exportable} onChange={setExportable} />
          <Toggle label="Sticky Header" checked={stickyHeader} onChange={setStickyHeader} />
          <Toggle label="Striped" checked={striped} onChange={setStriped} />
          <Toggle label="Compact" checked={compact} onChange={setCompact} />
          <Toggle label="Bordered" checked={bordered} onChange={setBordered} />
        </div>

        {/* Page Size + Responsive Mode */}
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {paginated && (
            <OptionGroup
              label="Page Size"
              options={['5', '10', '25', '50'] as const}
              value={String(pageSize) as '5' | '10' | '25' | '50'}
              onChange={v => setPageSize(Number(v))}
            />
          )}
          <OptionGroup
            label="Responsive Mode"
            options={['scroll', 'card'] as const}
            value={responsiveMode}
            onChange={setResponsiveMode}
          />
        </div>

        {/* Live Table */}
        <div className="datatable-page__preview">
          <DataTable<Server>
            data={SERVERS}
            columns={COLUMNS}
            searchable={searchable}
            sortable={sortable}
            paginated={paginated}
            pageSize={pageSize}
            pageSizes={[5, 10, 25, 50]}
            selectable={selectable}
            resizable={resizable}
            reorderable={reorderable}
            exportable={exportable}
            stickyHeader={stickyHeader}
            striped={striped}
            compact={compact}
            bordered={bordered}
            responsiveMode={responsiveMode}
          />
        </div>

        {/* Generated Code */}
        <CopyBlock code={code} language="typescript" showLineNumbers />
      </div>
    </section>
  )
}

// ─── Section: Basic Table ────────────────────────────────────────────────────

function BasicSection() {
  const basicColumns: ColumnDef<Server>[] = [
    { id: 'hostname', header: 'Hostname', accessor: 'hostname' },
    { id: 'ip', header: 'IP Address', accessor: 'ip' },
    { id: 'os', header: 'OS', accessor: 'os' },
    { id: 'status', header: 'Status', accessor: 'status',
      cell: (value) => <StatusBadge status={value as Server['status']} /> },
    { id: 'region', header: 'Region', accessor: 'region' },
  ]

  return (
    <section className="datatable-page__section" id="basic">
      <h2 className="datatable-page__section-title">
        <a href="#basic">Basic Table</a>
      </h2>
      <p className="datatable-page__section-desc">
        The simplest form: just pass data and columns. No features enabled -- a clean, static table.
      </p>
      <div className="datatable-page__preview">
        <DataTable<Server>
          data={SERVERS.slice(0, 5)}
          columns={basicColumns}
        />
      </div>
      <div style={{ marginBlockStart: '1rem' }}>
        <CopyBlock
          code={`<DataTable
  data={servers}
  columns={[
    { id: 'hostname', header: 'Hostname', accessor: 'hostname' },
    { id: 'ip', header: 'IP Address', accessor: 'ip' },
    { id: 'status', header: 'Status', accessor: 'status',
      cell: (v) => <StatusBadge status={v} /> },
  ]}
/>`}
          language="typescript"
          showLineNumbers
        />
      </div>
    </section>
  )
}

// ─── Section: Full-Featured ──────────────────────────────────────────────────

function FullFeaturedSection() {
  return (
    <section className="datatable-page__section" id="full-featured">
      <h2 className="datatable-page__section-title">
        <a href="#full-featured">Full-Featured</a>
      </h2>
      <p className="datatable-page__section-desc">
        Every feature flag enabled at once: search, sort, paginate, select, resize,
        reorder, export, sticky header, striped rows, and bordered styling.
      </p>
      <div className="datatable-page__preview">
        <DataTable<Server>
          data={SERVERS}
          columns={COLUMNS}
          searchable
          sortable
          paginated
          pageSize={5}
          pageSizes={[5, 10, 25]}
          selectable
          resizable
          reorderable
          exportable
          stickyHeader
          striped
          bordered
        />
      </div>
    </section>
  )
}

// ─── Section: Compact Mode ───────────────────────────────────────────────────

function CompactSection() {
  return (
    <section className="datatable-page__section" id="compact">
      <h2 className="datatable-page__section-title">
        <a href="#compact">Compact Mode</a>
      </h2>
      <p className="datatable-page__section-desc">
        Dense display with reduced padding -- ideal for NOC dashboards where screen real estate is precious.
      </p>
      <div className="datatable-page__preview">
        <DataTable<Server>
          data={SERVERS.slice(0, 8)}
          columns={COLUMNS}
          compact
          sortable
          striped
        />
      </div>
    </section>
  )
}

// ─── Section: Card Responsive Mode ───────────────────────────────────────────

function CardModeSection() {
  return (
    <section className="datatable-page__section" id="card-mode">
      <h2 className="datatable-page__section-title">
        <a href="#card-mode">Card Responsive Mode</a>
      </h2>
      <p className="datatable-page__section-desc">
        On narrow viewports, the table transforms each row into a card layout.
        Set <code>responsiveMode="card"</code> to enable this behavior.
      </p>
      <div className="datatable-page__preview" style={{ maxInlineSize: '380px' }}>
        <DataTable<Server>
          data={SERVERS.slice(0, 3)}
          columns={COLUMNS}
          responsiveMode="card"
        />
      </div>
      <div style={{ marginBlockStart: '1rem' }}>
        <CopyBlock
          code={`<DataTable
  data={servers}
  columns={columns}
  responsiveMode="card"
/>`}
          language="typescript"
          showLineNumbers
        />
      </div>
    </section>
  )
}

// ─── Section: Empty State ────────────────────────────────────────────────────

function EmptyStateSection() {
  return (
    <section className="datatable-page__section" id="empty-state">
      <h2 className="datatable-page__section-title">
        <a href="#empty-state">Empty State</a>
      </h2>
      <p className="datatable-page__section-desc">
        When data is an empty array, a customizable empty message is shown.
      </p>
      <div className="datatable-page__preview">
        <DataTable<Server>
          data={[]}
          columns={COLUMNS}
          empty={
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>
              No servers found. Try adjusting your filters.
            </div>
          }
        />
      </div>
    </section>
  )
}

// ─── Section: Loading State ──────────────────────────────────────────────────

function LoadingStateSection() {
  return (
    <section className="datatable-page__section" id="loading-state">
      <h2 className="datatable-page__section-title">
        <a href="#loading-state">Loading State</a>
      </h2>
      <p className="datatable-page__section-desc">
        Set <code>loading</code> to render animated skeleton rows while data is being fetched.
      </p>
      <div className="datatable-page__preview">
        <DataTable<Server>
          data={[]}
          columns={COLUMNS}
          loading
        />
      </div>
    </section>
  )
}

// ─── Section: Error State ────────────────────────────────────────────────────

function ErrorStateSection() {
  const [hasError, setHasError] = useState(true)

  const handleRetry = useCallback(() => {
    setHasError(false)
    setTimeout(() => setHasError(true), 1500)
  }, [])

  return (
    <section className="datatable-page__section" id="error-state">
      <h2 className="datatable-page__section-title">
        <a href="#error-state">Error State with Retry</a>
      </h2>
      <p className="datatable-page__section-desc">
        Pass <code>error</code> and <code>onRetry</code> to show an error message with a retry button.
      </p>
      <div className="datatable-page__preview">
        {hasError ? (
          <DataTable<Server>
            data={[]}
            columns={COLUMNS}
            error="Failed to fetch server data. Connection to monitoring API timed out."
            onRetry={handleRetry}
          />
        ) : (
          <DataTable<Server>
            data={[]}
            columns={COLUMNS}
            loading
          />
        )}
      </div>
      <div style={{ marginBlockStart: '1rem' }}>
        <CopyBlock
          code={`<DataTable
  data={[]}
  columns={columns}
  error="Failed to fetch server data."
  onRetry={() => refetch()}
/>`}
          language="typescript"
          showLineNumbers
        />
      </div>
    </section>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function DataTablePage() {
  useStyles('datatable-page', pageStyles)

  return (
    <div className="datatable-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="datatable-page__hero">
        <h1 className="datatable-page__title">DataTable</h1>
        <p className="datatable-page__desc">
          The most feature-rich component in the library. A zero-dependency data table
          with search, sort, pagination, selection, column resize, drag reorder,
          CSV/JSON export, virtual scroll, responsive card mode, and loading/error/empty states.
        </p>
        <div className="datatable-page__import-row">
          <code className="datatable-page__import-code">{IMPORT_STR}</code>
        </div>
      </div>

      <Divider spacing="sm" />

      {/* ── 2. Interactive Playground ───────────────────── */}
      <PlaygroundSection />

      <Divider spacing="sm" />

      {/* ── 3. Basic Table ─────────────────────────────── */}
      <BasicSection />

      <Divider spacing="sm" />

      {/* ── 4. Full-Featured ───────────────────────────── */}
      <FullFeaturedSection />

      <Divider spacing="sm" />

      {/* ── 5. Compact Mode ────────────────────────────── */}
      <CompactSection />

      <Divider spacing="sm" />

      {/* ── 6. Card Responsive Mode ────────────────────── */}
      <CardModeSection />

      <Divider spacing="sm" />

      {/* ── 7. Empty State ─────────────────────────────── */}
      <EmptyStateSection />

      <Divider spacing="sm" />

      {/* ── 8. Loading State ───────────────────────────── */}
      <LoadingStateSection />

      <Divider spacing="sm" />

      {/* ── 9. Error State with Retry ──────────────────── */}
      <ErrorStateSection />

      <Divider spacing="sm" />

      {/* ── 10. Props Reference ────────────────────────── */}
      <section className="datatable-page__section" id="props">
        <h2 className="datatable-page__section-title">
          <a href="#props">Props Reference</a>
        </h2>
        <p className="datatable-page__section-desc">
          Complete list of DataTable props. Columns are configured via the <code>ColumnDef</code> interface.
        </p>
        <PropsTable props={dataTableProps} />
      </section>

      <Divider spacing="sm" />

      {/* ── 11. Source ─────────────────────────────────── */}
      <section className="datatable-page__section" id="source">
        <a
          className="datatable-page__source-link"
          href="https://github.com/annondeveloper/ui-kit/blob/v2/src/domain/data-table.tsx"
          target="_blank"
          rel="noopener noreferrer"
        >
          View source on GitHub
        </a>
      </section>
    </div>
  )
}
