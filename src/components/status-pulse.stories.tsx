import type { Meta, StoryObj } from '@storybook/react'
import { StatusPulse } from './status-pulse'

const meta: Meta<typeof StatusPulse> = {
  title: 'Components/StatusPulse',
  component: StatusPulse,
  tags: ['autodocs'],
  argTypes: {
    status: { control: 'select', options: ['online', 'degraded', 'offline', 'unknown'] },
    label: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof StatusPulse>

export const Online: Story = {
  args: { status: 'online' },
}

export const Degraded: Story = {
  args: { status: 'degraded' },
}

export const Offline: Story = {
  args: { status: 'offline' },
}

export const Unknown: Story = {
  args: { status: 'unknown' },
}

export const WithoutLabel: Story = {
  args: { status: 'online', label: false },
}

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
      <StatusPulse status="online" />
      <StatusPulse status="degraded" />
      <StatusPulse status="offline" />
      <StatusPulse status="unknown" />
    </div>
  ),
}

export const DotOnly: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <StatusPulse status="online" label={false} />
      <StatusPulse status="degraded" label={false} />
      <StatusPulse status="offline" label={false} />
      <StatusPulse status="unknown" label={false} />
    </div>
  ),
}
