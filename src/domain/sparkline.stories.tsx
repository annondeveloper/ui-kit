import type { Meta, StoryObj } from '@storybook/react'
import { Sparkline } from './sparkline'

const meta: Meta<typeof Sparkline> = {
  title: 'Domain/Sparkline',
  component: Sparkline,
  argTypes: {
    gradient: { control: 'boolean' },
    showTooltip: { control: 'boolean' },
    animate: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof Sparkline>

const data = [10, 25, 15, 30, 22, 35, 28, 42, 38, 50, 45, 55]

export const Default: Story = {
  args: { data, width: 200, height: 40 },
}

export const WithGradient: Story = {
  args: { data, width: 200, height: 40, gradient: true },
}

export const WithTooltip: Story = {
  args: { data, width: 200, height: 40, showTooltip: true },
}
