'use client'

import React, { useMemo } from 'react'
import {
  DataTable, SmartTable, DiffViewer, HeatmapCalendar, CopyBlock, StatusBadge,
} from '../../../src/index'
import type { ColumnDef } from '@tanstack/react-table'
import type { DayValue } from '../../../src/index'

function Preview({ label, hint, children, wide }: {
  label: string; hint: string; children: React.ReactNode; wide?: boolean
}): React.JSX.Element {
  return (
    <figure className={`preview-card ${wide ? 'col-span-full' : ''}`}>
      <div className="preview-label">
        <span>{label}</span>
        <span className="text-[10px] font-normal normal-case tracking-normal text-[hsl(var(--text-disabled))]">Live</span>
      </div>
      <div className="preview-body">{children}</div>
      <div className="code-snippet font-mono"><code>{hint}</code></div>
    </figure>
  )
}

function rand(min: number, max: number) { return Math.random() * (max - min) + min }
function randInt(min: number, max: number) { return Math.floor(rand(min, max)) }

type ServerRow = {
  id: string; hostname: string; ip: string; cpu: number; memory: number;
  status: string; region: string; uptime: string; role: string
}

function generateServerData(count: number): ServerRow[] {
  const statuses = ['healthy', 'warning', 'critical', 'healthy', 'healthy', 'healthy'] as const
  const regions = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1', 'eu-central-1']
  const roles = ['web', 'api', 'db', 'cache', 'worker', 'gateway', 'monitor']
  return Array.from({ length: count }, (_, i) => ({
    id: `srv-${String(i + 1).padStart(3, '0')}`,
    hostname: `${roles[i % roles.length]}-${String(i + 1).padStart(2, '0')}.prod.internal`,
    ip: `10.${randInt(0, 255)}.${randInt(1, 254)}.${randInt(1, 254)}`,
    cpu: Math.round(rand(5, 98)),
    memory: Math.round(rand(20, 95)),
    status: statuses[i % statuses.length],
    region: regions[i % regions.length]!,
    uptime: `${randInt(1, 365)}d`,
    role: roles[i % roles.length]!,
  }))
}

function generateHeatmapData(): DayValue[] {
  const now = new Date()
  const data: DayValue[] = []
  for (let i = 89; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    data.push({ date: d.toISOString().slice(0, 10), value: Math.random() < 0.15 ? 0 : randInt(1, 40) })
  }
  return data
}

const oldConfig = `# router-core01.conf
hostname router-core01
interface GigabitEthernet0/0
  ip address 10.0.1.1 255.255.255.0
  no shutdown
interface GigabitEthernet0/1
  ip address 10.0.2.1 255.255.255.0
  no shutdown
router ospf 1
  network 10.0.1.0 0.0.0.255 area 0
  network 10.0.2.0 0.0.0.255 area 0`

const newConfig = `# router-core01.conf
hostname router-core01
interface GigabitEthernet0/0
  ip address 10.0.1.1 255.255.255.0
  description "Uplink to spine-01"
  no shutdown
interface GigabitEthernet0/1
  ip address 10.0.2.1 255.255.255.0
  no shutdown
interface GigabitEthernet0/2
  ip address 10.0.3.1 255.255.255.0
  description "New segment for monitoring VLAN"
  no shutdown
router ospf 1
  network 10.0.1.0 0.0.0.255 area 0
  network 10.0.2.0 0.0.0.255 area 0
  network 10.0.3.0 0.0.0.255 area 0`

export default function SmartDataSection() {
  const serverData = useMemo(() => generateServerData(10), [])
  const heatmapData = useMemo(() => generateHeatmapData(), [])

  const smartCols: ColumnDef<ServerRow>[] = useMemo(() => [
    { accessorKey: 'hostname', header: 'Hostname' },
    { accessorKey: 'ip', header: 'IP Address' },
    { accessorKey: 'role', header: 'Role' },
    { accessorKey: 'cpu', header: 'CPU %' },
    { accessorKey: 'memory', header: 'Memory %' },
    { accessorKey: 'status', header: 'Status' },
    { accessorKey: 'region', header: 'Region' },
  ], [])

  const dataCols: ColumnDef<ServerRow>[] = useMemo(() => [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'hostname', header: 'Hostname' },
    { accessorKey: 'ip', header: 'IP Address' },
    { accessorKey: 'cpu', header: 'CPU %', cell: ({ getValue }) => <span className="tabular-nums">{getValue() as number}%</span> },
    { accessorKey: 'memory', header: 'Memory %', cell: ({ getValue }) => <span className="tabular-nums">{getValue() as number}%</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <StatusBadge status={getValue() as string} /> },
    { accessorKey: 'region', header: 'Region' },
    { accessorKey: 'uptime', header: 'Uptime' },
  ], [])

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[hsl(var(--text-primary))] tracking-tight">Smart Data</h2>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Intelligent data components with built-in analysis and insights.</p>
      </div>

      <div className="demo-grid">
        <Preview label="SmartTable" hint='<SmartTable columns={cols} data={data} density="compact" />' wide>
          <SmartTable columns={smartCols} data={serverData} searchPlaceholder="Search servers..." density="compact" />
        </Preview>

        <Preview label="DataTable" hint='<DataTable columns={cols} data={data} exportFilename="infra" />' wide>
          <DataTable columns={dataCols} data={serverData} searchPlaceholder="Search infrastructure..." defaultPageSize={8} exportFilename="infrastructure" density="comfortable" />
        </Preview>

        <Preview label="DiffViewer" hint='<DiffViewer oldValue={old} newValue={new} mode="side-by-side" />' wide>
          <DiffViewer oldValue={oldConfig} newValue={newConfig} mode="side-by-side" language="cisco-ios" />
        </Preview>

        <Preview label="HeatmapCalendar" hint='<HeatmapCalendar data={days} />' wide>
          <HeatmapCalendar data={heatmapData} />
        </Preview>

        <Preview label="CopyBlock" hint='<CopyBlock language="bash" content={code} />'>
          <div className="space-y-4">
            <CopyBlock language="bash" label="Install" content={`npm install @annondeveloper/ui-kit`} />
            <CopyBlock
              language="json" label="Config" showLineNumbers maxHeight={120}
              content={`{\n  "collector": "snmp-v3",\n  "target": "10.0.1.1",\n  "interval": 60\n}`}
            />
          </div>
        </Preview>
      </div>
    </>
  )
}
