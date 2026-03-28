import type { Meta, StoryObj } from '@storybook/react'
import { Affix } from './affix'

const meta: Meta<typeof Affix> = {
  title: 'Components/Affix',
  component: Affix,
}
export default meta
type Story = StoryObj<typeof Affix>

export const Default: Story = {
  args: {},
}

export const Interactive: Story = {
  args: {},
}
