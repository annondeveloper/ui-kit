import type { Meta, StoryObj } from '@storybook/react'
import { ColumnVisibilityToggle } from './column-visibility-toggle'

const meta: Meta<typeof ColumnVisibilityToggle> = {
  title: 'Domain/ColumnVisibilityToggle',
  component: ColumnVisibilityToggle,
}
export default meta
type Story = StoryObj<typeof ColumnVisibilityToggle>

const defaultColumns = [
  { id: 'name', label: 'Name', visible: true },
  { id: 'status', label: 'Status', visible: true },
  { id: 'cpu', label: 'CPU', visible: true },
  { id: 'memory', label: 'Memory', visible: false },
  { id: 'uptime', label: 'Uptime', visible: true },
]

export const Default: Story = {
  args: { columns: defaultColumns },
}

export const AllHidden: Story = {
  args: {
    columns: defaultColumns.map((c) => ({ ...c, visible: false })),
  },
}

export const WithReset: Story = {
  args: {
    columns: defaultColumns,
    onReset: () => {},
  },
}

export const ManyColumns: Story = {
  args: {
    columns: Array.from({ length: 12 }, (_, i) => ({
      id: `col-${i}`,
      label: `Column ${i + 1}`,
      visible: i < 6,
    })),
    onReset: () => {},
  },
}
