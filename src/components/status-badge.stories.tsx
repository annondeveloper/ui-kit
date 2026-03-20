import type { Meta, StoryObj } from '@storybook/react'
import { StatusBadge } from './status-badge'

const meta: Meta<typeof StatusBadge> = {
  title: 'Components/StatusBadge',
  component: StatusBadge,
  argTypes: {
    status: { control: 'select', options: ['ok', 'warning', 'critical', 'info', 'unknown', 'maintenance'] },
    size: { control: 'select', options: ['sm', 'md'] },
    pulse: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof StatusBadge>

export const Default: Story = {
  args: { status: 'ok', label: 'Operational' },
}

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <StatusBadge status="ok" label="Operational" />
      <StatusBadge status="warning" label="Degraded" />
      <StatusBadge status="critical" label="Down" />
      <StatusBadge status="info" label="Info" />
      <StatusBadge status="unknown" label="Unknown" />
      <StatusBadge status="maintenance" label="Maintenance" />
    </div>
  ),
}
