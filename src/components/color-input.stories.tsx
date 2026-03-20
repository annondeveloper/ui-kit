import type { Meta, StoryObj } from '@storybook/react'
import { ColorInput } from './color-input'

const meta: Meta<typeof ColorInput> = {
  title: 'Components/ColorInput',
  component: ColorInput,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof ColorInput>

export const Default: Story = {
  args: { name: 'brand', label: 'Brand color', defaultValue: '#6366f1' },
}

export const WithSwatches: Story = {
  args: {
    name: 'theme',
    label: 'Theme color',
    swatches: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'],
  },
}

export const WithError: Story = {
  args: { name: 'color', label: 'Color', error: 'Invalid color format' },
}
