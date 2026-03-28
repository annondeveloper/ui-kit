import type { Meta, StoryObj } from '@storybook/react'
import { ButtonGroup } from './button-group'

const meta: Meta<typeof ButtonGroup> = {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
}
export default meta
type Story = StoryObj<typeof ButtonGroup>

export const Default: Story = {
  args: {},
}

export const Interactive: Story = {
  args: {},
}
