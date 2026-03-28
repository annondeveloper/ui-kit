import type { Meta, StoryObj } from '@storybook/react'
import { NumberInput } from './number-input'

const meta: Meta<typeof NumberInput> = {
  title: 'Components/NumberInput',
  component: NumberInput,
}
export default meta
type Story = StoryObj<typeof NumberInput>

export const Default: Story = {
  args: {},
}

export const Interactive: Story = {
  args: {},
}
