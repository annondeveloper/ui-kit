import type { Meta, StoryObj } from '@storybook/react'
import { Highlight } from './highlight'

const meta: Meta<typeof Highlight> = {
  title: 'Components/Highlight',
  component: Highlight,
}
export default meta
type Story = StoryObj<typeof Highlight>

export const Default: Story = {
  args: {},
}

export const Interactive: Story = {
  args: {},
}
