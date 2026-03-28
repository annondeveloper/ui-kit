import type { Meta, StoryObj } from '@storybook/react'
import { PinInput } from './pin-input'

const meta: Meta<typeof PinInput> = {
  title: 'Components/PinInput',
  component: PinInput,
}
export default meta
type Story = StoryObj<typeof PinInput>

export const Default: Story = {
  args: {},
}

export const Interactive: Story = {
  args: {},
}
