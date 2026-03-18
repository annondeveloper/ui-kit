import type { Meta, StoryObj } from '@storybook/react'
import type { ColumnDef } from '@tanstack/react-table'
import { Server, Wifi } from 'lucide-react'
import { DataTable } from './data-table'
import { StatusBadge } from './status-badge'
import { Badge } from './badge'

interface Device {
  id: string
  hostname: string
  ip: string
  vendor: string
  type: string
  status: string
  uptime: string
}

const sampleData: Device[] = [
  { id: '1', hostname: 'core-sw-01', ip: '10.0.0.1', vendor: 'Cisco', type: 'Switch', status: 'ok', uptime: '142d 3h' },
  { id: '2', hostname: 'core-sw-02', ip: '10.0.0.2', vendor: 'Cisco', type: 'Switch', status: 'ok', uptime: '89d 12h' },
  { id: '3', hostname: 'fw-edge-01', ip: '10.0.0.10', vendor: 'FortiGate', type: 'Firewall', status: 'warning', uptime: '30d 1h' },
  { id: '4', hostname: 'esxi-host-01', ip: '192.168.1.10', vendor: 'VMware', type: 'Hypervisor', status: 'ok', uptime: '210d 7h' },
  { id: '5', hostname: 'esxi-host-02', ip: '192.168.1.11', vendor: 'VMware', type: 'Hypervisor', status: 'critical', uptime: '0d 0h' },
  { id: '6', hostname: 'dist-sw-01', ip: '10.0.1.1', vendor: 'Arista', type: 'Switch', status: 'ok', uptime: '67d 5h' },
  { id: '7', hostname: 'dist-sw-02', ip: '10.0.1.2', vendor: 'Arista', type: 'Switch', status: 'maintenance', uptime: '0d 0h' },
  { id: '8', hostname: 'lb-prod-01', ip: '10.0.2.1', vendor: 'F5', type: 'Load Balancer', status: 'ok', uptime: '45d 9h' },
  { id: '9', hostname: 'san-sw-01', ip: '10.0.3.1', vendor: 'Brocade', type: 'SAN Switch', status: 'ok', uptime: '300d 2h' },
  { id: '10', hostname: 'router-gw-01', ip: '10.0.0.254', vendor: 'Juniper', type: 'Router', status: 'ok', uptime: '180d 11h' },
  { id: '11', hostname: 'access-sw-01', ip: '10.1.0.1', vendor: 'HP', type: 'Switch', status: 'stale', uptime: '—' },
  { id: '12', hostname: 'access-sw-02', ip: '10.1.0.2', vendor: 'HP', type: 'Switch', status: 'ok', uptime: '55d 8h' },
]

const columns: ColumnDef<Device, unknown>[] = [
  { accessorKey: 'hostname', header: 'Hostname' },
  { accessorKey: 'ip', header: 'IP Address' },
  { accessorKey: 'vendor', header: 'Vendor' },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ getValue }) => <Badge color="blue" size="xs">{getValue() as string}</Badge>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => <StatusBadge status={getValue() as string} size="sm" />,
  },
  { accessorKey: 'uptime', header: 'Uptime' },
]

const meta: Meta<typeof DataTable<Device>> = {
  title: 'Components/DataTable',
  component: DataTable,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof DataTable<Device>>

export const Default: Story = {
  args: {
    columns,
    data: sampleData,
  },
}

export const WithExport: Story = {
  args: {
    columns,
    data: sampleData,
    exportFilename: 'devices',
  },
}

export const WithRowClick: Story = {
  args: {
    columns,
    data: sampleData,
    onRowClick: (row: Device) => alert(`Clicked: ${row.hostname}`),
  },
}

export const WithDefaultSort: Story = {
  args: {
    columns,
    data: sampleData,
    defaultSort: { id: 'hostname', desc: false },
  },
}

export const Loading: Story = {
  args: {
    columns,
    data: [],
    isLoading: true,
  },
}

export const Empty: Story = {
  args: {
    columns,
    data: [],
    emptyState: {
      icon: Server,
      title: 'No devices found',
      description: 'Run a discovery scan to find devices on your network.',
    },
  },
}

export const SmallPageSize: Story = {
  args: {
    columns,
    data: sampleData,
    defaultPageSize: 5,
  },
}

export const StickyFirstColumn: Story = {
  args: {
    columns,
    data: sampleData,
    stickyFirstColumn: true,
  },
  parameters: { layout: 'padded' },
}
