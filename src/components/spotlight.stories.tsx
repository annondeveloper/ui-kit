import type { Meta, StoryObj } from '@storybook/react'
import { Spotlight } from './spotlight'

const meta: Meta<typeof Spotlight> = {
  title: 'Components/Spotlight',
  component: Spotlight,
}
export default meta
type Story = StoryObj<typeof Spotlight>

export const Default: Story = {
  args: {},
}

export const Interactive: Story = {
  args: {},
}
