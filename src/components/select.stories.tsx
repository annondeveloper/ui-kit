import type { Meta, StoryObj } from '@storybook/react'
import { Select } from './select'

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    searchable: { control: 'boolean' },
    clearable: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof Select>

const options = [
  { value: 'us-east', label: 'US East' },
  { value: 'us-west', label: 'US West' },
  { value: 'eu-west', label: 'EU West' },
  { value: 'ap-south', label: 'AP South' },
]

export const Default: Story = {
  args: { name: 'region', options, label: 'Region', placeholder: 'Select a region' },
}

export const Searchable: Story = {
  args: { name: 'region', options, label: 'Region', searchable: true, placeholder: 'Search regions...' },
}

export const Clearable: Story = {
  args: { name: 'region', options, label: 'Region', clearable: true, defaultValue: 'us-east' },
}

export const WithError: Story = {
  args: { name: 'region', options, label: 'Region', error: 'Region is required' },
}
