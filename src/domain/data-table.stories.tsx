import type { Meta, StoryObj } from '@storybook/react'
import { DataTable, type ColumnDef } from './data-table'

const meta: Meta<typeof DataTable> = {
  title: 'Domain/DataTable',
  component: DataTable,
  argTypes: {
    striped: { control: 'boolean' },
    compact: { control: 'boolean' },
    stickyHeader: { control: 'boolean' },
    selectable: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof DataTable>

interface Server {
  name: string
  region: string
  status: string
  cpu: number
  memory: number
}

const columns: ColumnDef<Server>[] = [
  { id: 'name', header: 'Name', accessor: 'name', sortable: true },
  { id: 'region', header: 'Region', accessor: 'region', sortable: true },
  { id: 'status', header: 'Status', accessor: 'status' },
  { id: 'cpu', header: 'CPU %', accessor: 'cpu', align: 'right' },
  { id: 'memory', header: 'Memory %', accessor: 'memory', align: 'right' },
]

const data: Server[] = [
  { name: 'web-prod-01', region: 'us-east-1', status: 'healthy', cpu: 45, memory: 62 },
  { name: 'web-prod-02', region: 'us-east-1', status: 'healthy', cpu: 38, memory: 55 },
  { name: 'api-prod-01', region: 'eu-west-1', status: 'warning', cpu: 82, memory: 71 },
  { name: 'db-prod-01', region: 'us-east-1', status: 'healthy', cpu: 25, memory: 88 },
  { name: 'cache-01', region: 'ap-south-1', status: 'critical', cpu: 95, memory: 92 },
]

export const Default: Story = {
  args: { data, columns: columns as any },
}

export const Striped: Story = {
  args: { data, columns: columns as any, striped: true },
}

export const Selectable: Story = {
  args: { data, columns: columns as any, selectable: true },
}

export const Loading: Story = {
  args: { data: [], columns: columns as any, loading: true },
}

export const Empty: Story = {
  args: { data: [], columns: columns as any, empty: 'No servers found' },
}
