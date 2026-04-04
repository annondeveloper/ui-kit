import type { Meta, StoryObj } from '@storybook/react'
import { Checkbox } from './checkbox'

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    disabled: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof Checkbox>

export const Default: Story = {
  args: { label: 'Accept terms and conditions' },
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Checkbox size="xs" label="Extra Small" />
      <Checkbox size="sm" label="Small" />
      <Checkbox size="md" label="Medium" />
      <Checkbox size="lg" label="Large" />
      <Checkbox size="xl" label="Extra Large" />
    </div>
  ),
}

export const Indeterminate: Story = {
  args: { label: 'Select all', indeterminate: true },
}

export const WithError: Story = {
  args: { label: 'Required field', error: 'This field is required' },
}
