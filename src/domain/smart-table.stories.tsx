import type { Meta, StoryObj } from '@storybook/react'
import { SmartTable } from './smart-table'
import type { ColumnDef } from './data-table'

const meta: Meta<typeof SmartTable> = {
  title: 'Domain/SmartTable',
  component: SmartTable,
  argTypes: {
    searchable: { control: 'boolean' },
    paginated: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof SmartTable>

interface User {
  name: string
  email: string
  role: string
  status: string
}

const columns: ColumnDef<User>[] = [
  { id: 'name', header: 'Name', accessor: 'name', sortable: true },
  { id: 'email', header: 'Email', accessor: 'email' },
  { id: 'role', header: 'Role', accessor: 'role', sortable: true },
  { id: 'status', header: 'Status', accessor: 'status' },
]

const data: User[] = [
  { name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'Active' },
  { name: 'Bob Smith', email: 'bob@example.com', role: 'Developer', status: 'Active' },
  { name: 'Carol Williams', email: 'carol@example.com', role: 'Viewer', status: 'Inactive' },
  { name: 'Dave Brown', email: 'dave@example.com', role: 'Developer', status: 'Active' },
  { name: 'Eve Davis', email: 'eve@example.com', role: 'Admin', status: 'Active' },
]

export const Default: Story = {
  args: { data, columns, searchable: true, paginated: true, pageSize: 3 },
}
