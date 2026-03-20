import type { Meta, StoryObj } from '@storybook/react'
import { AnimatedCounter } from './animated-counter'

const meta: Meta<typeof AnimatedCounter> = {
  title: 'Components/AnimatedCounter',
  component: AnimatedCounter,
}
export default meta
type Story = StoryObj<typeof AnimatedCounter>

export const Default: Story = {
  args: { value: 1234 },
}

export const Currency: Story = {
  args: {
    value: 99999,
    format: (v: number) => `$${v.toLocaleString()}`,
  },
}

export const Percentage: Story = {
  args: {
    value: 87.5,
    format: (v: number) => `${v.toFixed(1)}%`,
  },
}
