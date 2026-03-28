import type { Meta, StoryObj } from '@storybook/react'
import { Cropper } from './cropper'

const meta: Meta<typeof Cropper> = {
  title: 'Domain/Cropper',
  component: Cropper,
}
export default meta
type Story = StoryObj<typeof Cropper>

export const Default: Story = {
  args: {},
}

export const Interactive: Story = {
  args: {},
}
