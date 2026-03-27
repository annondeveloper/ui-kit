import type { Meta, StoryObj } from '@storybook/react'
import { StorageBar } from './storage-bar'

const meta: Meta<typeof StorageBar> = {
  title: 'Domain/StorageBar',
  component: StorageBar,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    showLegend: { control: 'boolean' },
    showLabels: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof StorageBar>

const segments = [
  { label: 'System', value: 120 },
  { label: 'Apps', value: 340 },
  { label: 'Media', value: 210 },
]

export const Default: Story = {
  args: { segments, total: 1024 },
}

export const WithLegend: Story = {
  args: { segments, total: 1024, showLegend: true },
}

export const ManySegments: Story = {
  args: {
    segments: [
      { label: 'OS', value: 80 },
      { label: 'Apps', value: 200 },
      { label: 'Media', value: 150 },
      { label: 'Logs', value: 90 },
      { label: 'Cache', value: 60 },
      { label: 'Backups', value: 120 },
    ],
    total: 1024,
    showLegend: true,
    showLabels: true,
  },
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 400 }}>
      <StorageBar segments={segments} total={1024} size="sm" />
      <StorageBar segments={segments} total={1024} size="md" />
      <StorageBar segments={segments} total={1024} size="lg" showLabels />
    </div>
  ),
}
