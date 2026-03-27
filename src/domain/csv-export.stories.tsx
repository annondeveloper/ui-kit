import type { Meta, StoryObj } from '@storybook/react'
import { CSVExportButton } from './csv-export'

const meta: Meta<typeof CSVExportButton> = {
  title: 'Domain/CSVExportButton',
  component: CSVExportButton,
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    disabled: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof CSVExportButton>

const sampleData = [
  { host: 'srv-01', cpu: 72, memory: 8192 },
  { host: 'srv-02', cpu: 45, memory: 16384 },
  { host: 'srv-03', cpu: 91, memory: 4096 },
]

export const Default: Story = {
  args: { data: sampleData },
}

export const WithColumns: Story = {
  args: {
    data: sampleData,
    columns: [
      { key: 'host', label: 'Hostname' },
      { key: 'cpu', label: 'CPU %' },
    ],
  },
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <CSVExportButton key={s} data={sampleData} size={s}>
          {s.toUpperCase()}
        </CSVExportButton>
      ))}
    </div>
  ),
}

export const Disabled: Story = {
  args: { data: sampleData, disabled: true },
}
