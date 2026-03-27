import type { Meta, StoryObj } from '@storybook/react'
import { RingChart } from './ring-chart'

const meta: Meta<typeof RingChart> = {
  title: 'Domain/RingChart',
  component: RingChart,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    value: { control: { type: 'range', min: 0, max: 100 } },
  },
}
export default meta
type Story = StoryObj<typeof RingChart>

export const Default: Story = {
  args: { value: 72, showValue: true },
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
      <RingChart value={65} size="sm" showValue />
      <RingChart value={65} size="md" showValue />
      <RingChart value={65} size="lg" showValue />
    </div>
  ),
}

export const Full: Story = {
  args: { value: 100, showValue: true, color: 'oklch(72% 0.19 155)' },
}

export const Empty: Story = {
  args: { value: 0, showValue: true },
}

export const WithLabel: Story = {
  args: { value: 42, label: '42 GB', size: 'lg' },
}
