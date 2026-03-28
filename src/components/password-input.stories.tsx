import type { Meta, StoryObj } from '@storybook/react'
import { PasswordInput } from './password-input'

const meta: Meta<typeof PasswordInput> = {
  title: 'Components/PasswordInput',
  component: PasswordInput,
}
export default meta
type Story = StoryObj<typeof PasswordInput>

export const Default: Story = {
  args: {},
}

export const Interactive: Story = {
  args: {},
}
