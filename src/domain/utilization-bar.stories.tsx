import type { Meta, StoryObj } from '@storybook/react'
import { UtilizationBar } from './utilization-bar'

const meta: Meta<typeof UtilizationBar> = {
  title: 'Domain/UtilizationBar',
  component: UtilizationBar,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    showLabels: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof UtilizationBar>

export const Default: Story = {
  args: {
    segments: [
      { value: 35, label: 'Used', color: 'oklch(65% 0.2 270)' },
      { value: 25, label: 'Cached', color: 'oklch(70% 0.15 200)' },
    ],
    max: 100,
    showLabels: true,
  },
}

export const WithThresholds: Story = {
  args: {
    segments: [{ value: 82, label: 'Used' }],
    max: 100,
    thresholds: { warning: 70, critical: 90 },
    showLabels: true,
  },
}
