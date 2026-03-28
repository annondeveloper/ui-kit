import type { Meta, StoryObj } from '@storybook/react'
import { ActionIcon } from './action-icon'

const meta: Meta<typeof ActionIcon> = {
  title: 'Components/ActionIcon',
  component: ActionIcon,
}
export default meta
type Story = StoryObj<typeof ActionIcon>

export const Default: Story = {
  args: {},
}

export const Interactive: Story = {
  args: {},
}
