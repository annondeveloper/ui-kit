import type { Meta, StoryObj } from '@storybook/react'
import { SegmentedControl } from './segmented-control'

const meta: Meta<typeof SegmentedControl> = {
  title: 'Components/SegmentedControl',
  component: SegmentedControl,
}
export default meta
type Story = StoryObj<typeof SegmentedControl>

export const Default: Story = {
  args: {},
}

export const Interactive: Story = {
  args: {},
}
