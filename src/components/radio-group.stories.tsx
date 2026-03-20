import type { Meta, StoryObj } from '@storybook/react'
import { RadioGroup } from './radio-group'

const meta: Meta<typeof RadioGroup> = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
}
export default meta
type Story = StoryObj<typeof RadioGroup>

const sampleOptions = [
  { value: 'small', label: 'Small instance' },
  { value: 'medium', label: 'Medium instance' },
  { value: 'large', label: 'Large instance' },
]

export const Default: Story = {
  args: { name: 'size', options: sampleOptions, label: 'Instance size', defaultValue: 'medium' },
}

export const Horizontal: Story = {
  args: { name: 'plan', options: sampleOptions, orientation: 'horizontal', label: 'Plan' },
}

export const WithError: Story = {
  args: { name: 'required', options: sampleOptions, error: 'Please select an option', label: 'Required' },
}
