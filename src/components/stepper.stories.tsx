import type { Meta, StoryObj } from '@storybook/react'
import { Stepper } from './stepper'

const meta: Meta<typeof Stepper> = {
  title: 'Components/Stepper',
  component: Stepper,
}
export default meta
type Story = StoryObj<typeof Stepper>

export const Default: Story = {
  args: {},
}

export const Interactive: Story = {
  args: {},
}
