import type { Meta, StoryObj } from '@storybook/react'
import { RealtimeValue } from './realtime-value'

const meta: Meta<typeof RealtimeValue> = {
  title: 'Domain/RealtimeValue',
  component: RealtimeValue,
  argTypes: {
    showDelta: { control: 'boolean' },
    flashOnChange: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof RealtimeValue>

export const Default: Story = {
  args: { value: 1234.56, previousValue: 1200, showDelta: true, flashOnChange: true },
}

export const Currency: Story = {
  args: {
    value: 48230,
    previousValue: 47500,
    format: (v: number) => `$${v.toLocaleString()}`,
    showDelta: true,
  },
}

export const Percentage: Story = {
  args: {
    value: 92.5,
    previousValue: 88.3,
    format: (v: number) => `${v.toFixed(1)}%`,
    showDelta: true,
  },
}
