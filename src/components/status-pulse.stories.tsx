import type { Meta, StoryObj } from '@storybook/react'
import { StatusPulse } from './status-pulse'

const meta: Meta<typeof StatusPulse> = {
  title: 'Components/StatusPulse',
  component: StatusPulse,
  argTypes: {
    status: { control: 'select', options: ['ok', 'warning', 'critical', 'info'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
}
export default meta
type Story = StoryObj<typeof StatusPulse>

export const Default: Story = {
  args: { status: 'ok', label: 'Connected' },
}

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
      <StatusPulse status="ok" label="OK" />
      <StatusPulse status="warning" label="Warning" />
      <StatusPulse status="critical" label="Critical" />
      <StatusPulse status="info" label="Info" />
    </div>
  ),
}
