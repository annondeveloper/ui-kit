import type { Meta, StoryObj } from '@storybook/react'
import { ConfidenceBar } from './confidence-bar'

const meta: Meta<typeof ConfidenceBar> = {
  title: 'Domain/ConfidenceBar',
  component: ConfidenceBar,
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 1, step: 0.01 } },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    showValue: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof ConfidenceBar>

export const Default: Story = {
  args: { value: 0.85, label: 'Confidence', showValue: true },
}

export const AllLevels: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: 300 }}>
      <ConfidenceBar value={0.95} label="High" showValue />
      <ConfidenceBar value={0.65} label="Medium" showValue />
      <ConfidenceBar value={0.25} label="Low" showValue />
    </div>
  ),
}
