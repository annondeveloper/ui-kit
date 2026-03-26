import type { Meta, StoryObj } from '@storybook/react'
import { NetworkTrafficCard } from './network-traffic-card'

const meta: Meta<typeof NetworkTrafficCard> = {
  title: 'Domain/NetworkTrafficCard',
  component: NetworkTrafficCard,
  argTypes: {
    status: { control: 'select', options: ['ok', 'warning', 'critical', 'unknown'] },
    compact: { control: 'boolean' },
    motion: { control: { type: 'range', min: 0, max: 3 } },
  },
}
export default meta
type Story = StoryObj<typeof NetworkTrafficCard>

const sampleTrend = [120, 145, 130, 180, 220, 195, 260, 310, 280, 350]

export const Default: Story = {
  args: {
    title: 'us-east-1 Gateway',
    vendor: 'AWS',
    location: 'Virginia, US',
    traffic: { inbound: 125_000_000, outbound: 89_000_000 },
    trend: sampleTrend,
    status: 'ok',
  },
}

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', maxWidth: 640 }}>
      <NetworkTrafficCard title="Node A" traffic={{ inbound: 5e8, outbound: 3e8 }} status="ok" trend={sampleTrend} />
      <NetworkTrafficCard title="Node B" traffic={{ inbound: 2e8, outbound: 1e8 }} status="warning" trend={sampleTrend} />
      <NetworkTrafficCard title="Node C" traffic={{ inbound: 9e7, outbound: 4e7 }} status="critical" trend={sampleTrend} />
      <NetworkTrafficCard title="Node D" traffic={{ inbound: 0, outbound: 0 }} status="unknown" />
    </div>
  ),
}

export const Compact: Story = {
  args: {
    ...Default.args,
    compact: true,
  },
}

export const HighThroughput: Story = {
  args: {
    title: 'Core Backbone',
    vendor: 'Equinix',
    traffic: { inbound: 1.2e12, outbound: 9.8e11 },
    status: 'ok',
    trend: [800, 850, 920, 870, 900, 950, 1000, 980, 1050, 1100],
  },
}
