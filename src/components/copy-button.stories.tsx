import type { Meta, StoryObj } from '@storybook/react'
import { CopyButton } from './copy-button'

const meta: Meta<typeof CopyButton> = {
  title: 'Components/CopyButton',
  component: CopyButton,
}
export default meta
type Story = StoryObj<typeof CopyButton>

export const Default: Story = {
  args: {},
}

export const Interactive: Story = {
  args: {},
}
