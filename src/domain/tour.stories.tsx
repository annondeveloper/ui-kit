import type { Meta, StoryObj } from '@storybook/react'
import { Tour } from './tour'

const meta: Meta<typeof Tour> = {
  title: 'Domain/Tour',
  component: Tour,
}
export default meta
type Story = StoryObj<typeof Tour>

export const Default: Story = {
  args: {},
}

export const Interactive: Story = {
  args: {},
}
