import type { Meta, StoryObj } from '@storybook/react'
import { Indicator } from './indicator'

const meta: Meta<typeof Indicator> = {
  title: 'Components/Indicator',
  component: Indicator,
}
export default meta
type Story = StoryObj<typeof Indicator>

export const Default: Story = {
  args: {},
}

export const Interactive: Story = {
  args: {},
}
