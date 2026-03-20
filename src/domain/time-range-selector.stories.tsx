import type { Meta, StoryObj } from '@storybook/react'
import { TimeRangeSelector } from './time-range-selector'

const meta: Meta<typeof TimeRangeSelector> = {
  title: 'Domain/TimeRangeSelector',
  component: TimeRangeSelector,
  argTypes: {
    showCustom: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof TimeRangeSelector>

export const Default: Story = {
  args: { onChange: () => {} },
}

export const WithCustom: Story = {
  args: { showCustom: true, onChange: () => {} },
}
