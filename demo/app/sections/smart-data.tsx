'use client'

import React, { useState, useMemo } from 'react'
import {
  DataTable, SmartTable, DiffViewer, HeatmapCalendar, CopyBlock,
  StatusBadge,
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from '../../../src/index'
import type { ColumnDef } from '@tanstack/react-table'
import type { DayValue } from '../../../src/index'

function rand(min: number, max: number) { return Math.random() * (max - min) + min }
function randInt(min: number, max: number) { return Math.floor(rand(min, max)) }

function DemoCard({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle className="text-base">{label}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

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

function SmartTableDemo() {
  const data = useMemo(() => generateServerData(10), [])
  const columns: ColumnDef<ServerRow>[] = useMemo(() => [
    { accessorKey: 'hostname', header: 'Hostname' },
    { accessorKey: 'ip', header: 'IP Address' },
    { accessorKey: 'role', header: 'Role' },
    { accessorKey: 'cpu', header: 'CPU %' },
    { accessorKey: 'memory', header: 'Memory %' },
    { accessorKey: 'status', header: 'Status' },
    { accessorKey: 'region', header: 'Region' },
  ], [])

  return (
    <DemoCard label="SmartTable" description="DataTable with auto-generated filter suggestions: outlier detection, top-N, threshold, pattern analysis">
      <SmartTable columns={columns} data={data} searchPlaceholder="Search servers..." density="compact" />
    </DemoCard>
  )
}

function DataTableDemo() {
  const data = useMemo(() => generateServerData(10), [])
  const columns: ColumnDef<ServerRow>[] = useMemo(() => [
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
    <DemoCard label="DataTable" description="Full-featured table with sorting, search, pagination, density control, column visibility, and CSV export">
      <DataTable columns={columns} data={data} searchPlaceholder="Search infrastructure..." defaultPageSize={8} exportFilename="infrastructure" density="comfortable" />
    </DemoCard>
  )
}

function DiffViewerDemo() {
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

  return (
    <DemoCard label="DiffViewer" description="Side-by-side config diff with LCS algorithm, collapsible unchanged sections, and line numbers">
      <DiffViewer oldValue={oldConfig} newValue={newConfig} mode="side-by-side" language="cisco-ios" />
    </DemoCard>
  )
}

function HeatmapCalendarDemo() {
  const data = useMemo(() => generateHeatmapData(), [])
  return <HeatmapCalendar data={data} />
}

export default function SmartDataSection() {
  return (
    <div className="section-enter">
      <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-1">Smart Data</h2>
      <p className="text-sm text-[hsl(var(--text-secondary))] mb-8">Intelligent data components that analyze, filter, and display structured information with built-in insights.</p>
      <div className="space-y-8">
        <SmartTableDemo />
        <DataTableDemo />
        <DiffViewerDemo />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DemoCard label="HeatmapCalendar" description="GitHub-style 90-day contribution heatmap">
            <HeatmapCalendarDemo />
          </DemoCard>
          <DemoCard label="CopyBlock" description="Code blocks with one-click copy and line numbers">
            <div className="space-y-4">
              <CopyBlock
                language="bash"
                label="Install"
                content={`npm install @annondeveloper/ui-kit
# or
pnpm add @annondeveloper/ui-kit`}
              />
              <CopyBlock
                language="json"
                label="Config"
                showLineNumbers
                maxHeight={120}
                content={`{
  "collector": "snmp-v3",
  "target": "10.0.1.1",
  "interval": 60,
  "credentials": {
    "username": "netrak",
    "auth_protocol": "sha256",
    "priv_protocol": "aes128"
  }
}`}
              />
            </div>
          </DemoCard>
        </div>
      </div>
    </div>
  )
}
