import type { Meta, StoryObj } from '@storybook/react'
import { Textarea } from './textarea'

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
}
export default meta
type Story = StoryObj<typeof Textarea>

export const Default: Story = {
  args: {},
}

export const Interactive: Story = {
  args: {},
}
