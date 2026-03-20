import type { Meta, StoryObj } from '@storybook/react'
import { Slider } from './slider'

const meta: Meta<typeof Slider> = {
  title: 'Components/Slider',
  component: Slider,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    showValue: { control: 'boolean' },
    showTicks: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof Slider>

export const Default: Story = {
  args: { min: 0, max: 100, defaultValue: 50, label: 'Volume', showValue: true },
}

export const WithTicks: Story = {
  args: { min: 0, max: 100, step: 25, defaultValue: 50, showTicks: true, label: 'Quality' },
}

export const Disabled: Story = {
  args: { min: 0, max: 100, defaultValue: 30, disabled: true, label: 'Locked' },
}
