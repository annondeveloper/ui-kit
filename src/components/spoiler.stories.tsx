import type { Meta, StoryObj } from '@storybook/react'
import { Spoiler } from './spoiler'

const meta: Meta<typeof Spoiler> = {
  title: 'Components/Spoiler',
  component: Spoiler,
}
export default meta
type Story = StoryObj<typeof Spoiler>

export const Default: Story = {
  args: {},
}

export const Interactive: Story = {
  args: {},
}
