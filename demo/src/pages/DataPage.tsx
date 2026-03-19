import { useState, useCallback } from 'react'
import { Preview } from '../components/Preview.tsx'
import {
  SmartTable, DataTable, DiffViewer, HeatmapCalendar,
  CopyBlock, AnimatedCounter, TruncatedText, Button,
  TreeView,
  type DayValue, type TreeNode,
} from '@ui/index'
import type { ColumnDef } from '@tanstack/react-table'
import { Folder, FileText, FileCode, FileJson, Image, Settings } from 'lucide-react'

interface DeviceRow {
  name: string
  ip: string
  vendor: string
  status: string
  cpu: number
  uptime: string
}

const deviceData: DeviceRow[] = [
  { name: 'core-sw-01', ip: '10.0.0.1', vendor: 'Cisco', status: 'active', cpu: 67, uptime: '142d 3h' },
  { name: 'dist-sw-02', ip: '10.0.1.2', vendor: 'Juniper', status: 'active', cpu: 45, uptime: '89d 12h' },
  { name: 'edge-fw-01', ip: '10.0.2.1', vendor: 'FortiGate', status: 'warning', cpu: 82, uptime: '34d 7h' },
  { name: 'access-sw-05', ip: '10.0.3.5', vendor: 'Arista', status: 'active', cpu: 23, uptime: '203d 1h' },
  { name: 'dc-spine-01', ip: '10.0.4.1', vendor: 'Nokia', status: 'active', cpu: 55, uptime: '67d 18h' },
  { name: 'wan-rtr-03', ip: '10.0.5.3', vendor: 'Cisco', status: 'critical', cpu: 94, uptime: '12d 5h' },
  { name: 'lb-prod-01', ip: '10.0.6.1', vendor: 'F5', status: 'active', cpu: 38, uptime: '256d 0h' },
  { name: 'mgmt-sw-01', ip: '10.0.7.1', vendor: 'HP', status: 'active', cpu: 12, uptime: '365d 2h' },
  { name: 'wifi-ctrl-01', ip: '10.0.8.1', vendor: 'Aruba', status: 'active', cpu: 31, uptime: '78d 14h' },
  { name: 'san-sw-01', ip: '10.0.9.1', vendor: 'Brocade', status: 'maintenance', cpu: 8, uptime: '445d 6h' },
]

const columns: ColumnDef<DeviceRow>[] = [
  { accessorKey: 'name', header: 'Device' },
  { accessorKey: 'ip', header: 'IP Address' },
  { accessorKey: 'vendor', header: 'Vendor' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'cpu', header: 'CPU %' },
  { accessorKey: 'uptime', header: 'Uptime' },
]

const oldConfig = `hostname core-sw-01
!
interface GigabitEthernet0/0/0
  ip address 10.0.0.1 255.255.255.0
  no shutdown
!
router ospf 1
  network 10.0.0.0 0.0.0.255 area 0
  passive-interface default
!`

const newConfig = `hostname core-sw-01
!
interface GigabitEthernet0/0/0
  ip address 10.0.0.1 255.255.255.0
  description UPLINK-TO-SPINE
  no shutdown
!
interface GigabitEthernet0/0/1
  ip address 10.0.1.1 255.255.255.0
  no shutdown
!
router ospf 1
  network 10.0.0.0 0.0.0.255 area 0
  network 10.0.1.0 0.0.0.255 area 0
!`

const heatmapData: DayValue[] = Array.from({ length: 90 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - 89 + i)
  return { date: d.toISOString().slice(0, 10), value: Math.floor(Math.random() * 100) }
})

const bashCode = `#!/bin/bash
# Install and start netrak agent
curl -sL https://get.netrak.io/agent | bash
sudo systemctl enable --now netrak-agent
netrak-agent --status`

const jsonCode = `{
  "entity": {
    "type": "network_device",
    "vendor": "Cisco",
    "model": "C9300-48P",
    "serial": "FCW2345G0AB"
  },
  "metrics": {
    "cpu_usage": 67.2,
    "mem_usage": 4.1,
    "uptime_seconds": 12268800
  }
}`

const treeData: TreeNode[] = [
  {
    id: 'project',
    label: 'netrak/',
    icon: Folder,
    children: [
      {
        id: 'backend',
        label: 'backend/',
        icon: Folder,
        children: [
          { id: 'cargo', label: 'Cargo.toml', icon: Settings },
          {
            id: 'crates',
            label: 'crates/',
            icon: Folder,
            children: [
              { id: 'server', label: 'server/', icon: Folder, children: [
                { id: 'main-rs', label: 'main.rs', icon: FileCode },
                { id: 'routes', label: 'routes/', icon: Folder, children: [
                  { id: 'mod-rs', label: 'mod.rs', icon: FileCode },
                  { id: 'entities-rs', label: 'entities.rs', icon: FileCode },
                  { id: 'metrics-rs', label: 'metrics.rs', icon: FileCode },
                ]},
              ]},
              { id: 'common', label: 'common/', icon: Folder, children: [
                { id: 'lib-rs', label: 'lib.rs', icon: FileCode },
              ]},
              { id: 'snmp-engine', label: 'snmp-engine/', icon: Folder },
            ],
          },
        ],
      },
      {
        id: 'frontend',
        label: 'frontend/',
        icon: Folder,
        children: [
          { id: 'package-json', label: 'package.json', icon: FileJson },
          { id: 'tsconfig', label: 'tsconfig.json', icon: FileJson },
          { id: 'app', label: 'app/', icon: Folder, children: [
            { id: 'layout', label: 'layout.tsx', icon: FileCode },
            { id: 'page', label: 'page.tsx', icon: FileCode },
          ]},
          { id: 'components', label: 'components/', icon: Folder },
        ],
      },
      { id: 'readme', label: 'README.md', icon: FileText },
      { id: 'screenshot', label: 'screenshot.png', icon: Image, disabled: true },
    ],
  },
]

export function DataPage() {
  const [counter, setCounter] = useState(1000)
  const [selectedNode, setSelectedNode] = useState<string>('main-rs')

  const increment = useCallback(() => setCounter(p => p + Math.floor(Math.random() * 500)), [])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-1">Smart Data</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))]">8 components for data display, analysis, and interaction</p>
      </div>
      <div className="grid grid-cols-1 gap-6 stagger">
        <Preview label="SmartTable" description="Auto-suggested filters + full DataTable features" glow="realtime" wide code={`<SmartTable columns={columns} data={devices} />`}>
          <SmartTable columns={columns} data={deviceData} exportFilename="devices" />
        </Preview>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Preview label="DiffViewer" description="Side-by-side config diff" code={`<DiffViewer oldValue={old} newValue={new} mode="inline" />`}>
            <div className="max-h-[240px] overflow-y-auto">
              <DiffViewer oldValue={oldConfig} newValue={newConfig} mode="inline" showLineNumbers />
            </div>
          </Preview>

          <Preview label="TreeView" description="File browser tree with expand/collapse" code={`<TreeView\n  data={treeData}\n  selected={selectedNode}\n  onSelect={setSelected}\n  showLines\n  defaultExpanded={['project', 'backend']}\n/>`}>
            <div className="max-h-[260px] overflow-y-auto">
              <TreeView
                data={treeData}
                selected={selectedNode}
                onSelect={setSelectedNode}
                showLines
                defaultExpanded={['project', 'backend', 'crates', 'server', 'frontend']}
              />
            </div>
          </Preview>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Preview label="HeatmapCalendar" description="90-day activity heatmap" code={`<HeatmapCalendar data={days} showMonthLabels />`}>
            <HeatmapCalendar data={heatmapData} showMonthLabels showDayLabels />
          </Preview>

          <Preview label="CopyBlock" description="Code blocks with copy button" code={`<CopyBlock content={code} language="bash" showLineNumbers />`}>
            <div className="space-y-3">
              <CopyBlock content={bashCode} language="bash" showLineNumbers label="Install Agent" />
              <CopyBlock content={jsonCode} language="json" maxHeight={120} label="Entity Payload" />
            </div>
          </Preview>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Preview label="AnimatedCounter" description="Spring-animated number transitions" code={`<AnimatedCounter value={count} />\n<Button onClick={increment}>Add</Button>`}>
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-[hsl(var(--text-primary))] tabular-nums mb-4">
                <AnimatedCounter value={counter} />
              </div>
              <Button variant="primary" onClick={increment}>Add random amount</Button>
            </div>
          </Preview>

          <Preview label="TruncatedText" description="Truncated text with tooltip" code={`<TruncatedText text={longText} maxWidth={200} />`}>
            <div className="space-y-3">
              <TruncatedText text="This is a very long hostname that will be truncated: dc01-rack14-sw-access-port-bundle-aggr-01.datacenter.example.com" maxWidth={280} />
              <TruncatedText text="Short text" maxWidth={280} />
              <TruncatedText text="Another long string: enterprise-monitoring-platform-core-service-mesh-gateway-primary.internal.corp.netrak.io" maxWidth={280} />
            </div>
          </Preview>
        </div>

        <Preview label="DataTable" description="Full-featured data table" wide code={`<DataTable columns={columns} data={data} />`}>
          <DataTable columns={columns} data={deviceData} exportFilename="devices-export" searchPlaceholder="Search devices..." />
        </Preview>
      </div>
    </div>
  )
}
export default DataPage
