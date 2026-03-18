import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Select } from './select'

const sampleOptions = [
  { value: 'us-east', label: 'US East' },
  { value: 'us-west', label: 'US West' },
  { value: 'eu-central', label: 'EU Central' },
  { value: 'ap-south', label: 'AP South' },
]

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
}
export default meta
type Story = StoryObj<typeof Select>

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState('us-east')
    return <Select {...args} value={value} onValueChange={setValue} options={sampleOptions} />
  },
  args: {},
}

export const WithPlaceholder: Story = {
  render: (args) => {
    const [value, setValue] = useState('')
    return (
      <Select
        {...args}
        value={value}
        onValueChange={setValue}
        options={sampleOptions}
        placeholder="Select a region..."
      />
    )
  },
}

export const Disabled: Story = {
  render: () => {
    const [value, setValue] = useState('eu-central')
    return <Select value={value} onValueChange={setValue} options={sampleOptions} disabled />
  },
}
