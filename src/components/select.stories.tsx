import type { Meta, StoryObj } from '@storybook/react'
import { Select } from './select'

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    searchable: { control: 'boolean' },
    clearable: { control: 'boolean' },
    disabled: { control: 'boolean' },
    multiple: { control: 'boolean' },
    motion: { control: 'select', options: [0, 1, 2, 3] },
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

export const Multiple: Story = {
  args: { name: 'regions', options, label: 'Regions', multiple: true, placeholder: 'Select regions...' },
}

export const WithError: Story = {
  args: { name: 'region', options, label: 'Region', error: 'Region is required' },
}

export const Disabled: Story = {
  args: { name: 'region', options, label: 'Region', disabled: true, defaultValue: 'us-east' },
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '1rem', maxInlineSize: '320px' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Select key={size} name={`region-${size}`} options={options} size={size} label={`Size: ${size}`} placeholder="Select..." />
      ))}
    </div>
  ),
}

export const NoMotion: Story = {
  args: { name: 'region', options, label: 'Region', motion: 0, placeholder: 'No animation' },
}

export const Interactive: Story = {
  args: {
    name: 'region',
    options,
    label: 'Region',
    searchable: true,
    clearable: true,
    placeholder: 'Interactive demo...',
    size: 'md',
  },
}
