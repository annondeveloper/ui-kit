import type { Meta, StoryObj } from '@storybook/react'
import { Timeline } from './timeline'

const meta: Meta<typeof Timeline> = {
  title: 'Components/Timeline',
  component: Timeline,
}
export default meta
type Story = StoryObj<typeof Timeline>

export const Default: Story = {
  args: {},
}

export const Interactive: Story = {
  args: {},
}
