import type { Meta, StoryObj } from '@storybook/react'
import { MetricCard } from './metric-card'

const meta: Meta<typeof MetricCard> = {
  title: 'Domain/MetricCard',
  component: MetricCard,
}
export default meta
type Story = StoryObj<typeof MetricCard>

export const Default: Story = {
  args: {
    title: 'Revenue',
    value: '$48,230',
    change: { value: 12.5, period: 'vs last month' },
    trend: 'up',
    status: 'ok',
  },
}

export const WithSparkline: Story = {
  args: {
    title: 'Active Users',
    value: '2,847',
    change: { value: -3.2, period: 'vs last week' },
    trend: 'down',
    sparkline: [45, 52, 38, 62, 55, 48, 72, 65, 58, 70],
  },
}

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
      <MetricCard title="CPU" value="45%" status="ok" trend="flat" />
      <MetricCard title="Memory" value="78%" status="warning" trend="up" change={{ value: 5 }} />
      <MetricCard title="Disk" value="92%" status="critical" trend="up" change={{ value: 8 }} />
    </div>
  ),
}

export const Loading: Story = {
  args: { title: 'Revenue', value: '', loading: true },
}
