import type { Meta, StoryObj } from '@storybook/react'
import { MultiSelect } from './multi-select'

const meta: Meta<typeof MultiSelect> = {
  title: 'Components/MultiSelect',
  component: MultiSelect,
}
export default meta
type Story = StoryObj<typeof MultiSelect>

export const Default: Story = {
  args: {},
}

export const Interactive: Story = {
  args: {},
}
