import type { Meta, StoryObj } from '@storybook/react'
import { ShimmerButton } from './shimmer-button'

const meta: Meta<typeof ShimmerButton> = {
  title: 'Domain/ShimmerButton',
  component: ShimmerButton,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    shimmerColor: { control: 'color' },
    disabled: { control: 'boolean' },
    motion: { control: 'select', options: [0, 1, 2, 3] },
  },
}
export default meta
type Story = StoryObj<typeof ShimmerButton>

export const Default: Story = {
  args: { children: 'Shimmer Button' },
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <ShimmerButton size="sm">Small</ShimmerButton>
      <ShimmerButton size="md">Medium</ShimmerButton>
      <ShimmerButton size="lg">Large</ShimmerButton>
    </div>
  ),
}

export const CustomColor: Story = {
  args: {
    children: 'Green Shimmer',
    shimmerColor: 'oklch(70% 0.2 150)',
  },
}

export const Disabled: Story = {
  args: { children: 'Disabled', disabled: true },
}

export const MotionLevels: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      {([0, 1, 2, 3] as const).map((m) => (
        <ShimmerButton key={m} motion={m}>Motion {m}</ShimmerButton>
      ))}
    </div>
  ),
}
