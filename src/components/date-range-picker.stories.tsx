import type { Meta, StoryObj } from '@storybook/react'
import { DateRangePicker } from './date-range-picker'

const meta: Meta<typeof DateRangePicker> = {
  title: 'Components/DateRangePicker',
  component: DateRangePicker,
}
export default meta
type Story = StoryObj<typeof DateRangePicker>

export const Default: Story = {
  args: {},
}

export const Interactive: Story = {
  args: {},
}
