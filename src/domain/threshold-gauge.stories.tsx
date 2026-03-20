import type { Meta, StoryObj } from '@storybook/react'
import { ThresholdGauge } from './threshold-gauge'

const meta: Meta<typeof ThresholdGauge> = {
  title: 'Domain/ThresholdGauge',
  component: ThresholdGauge,
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100 } },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    showValue: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof ThresholdGauge>

export const Default: Story = {
  args: { value: 65, label: 'CPU Usage', showValue: true },
}

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem' }}>
      <ThresholdGauge value={30} label="Healthy" showValue />
      <ThresholdGauge value={72} label="Warning" showValue thresholds={{ warning: 60, critical: 85 }} />
      <ThresholdGauge value={92} label="Critical" showValue thresholds={{ warning: 60, critical: 85 }} />
    </div>
  ),
}
