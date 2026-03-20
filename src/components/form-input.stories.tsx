import type { Meta, StoryObj } from '@storybook/react'
import { FormInput } from './form-input'
import { Icon } from '../core/icons/icon'

const meta: Meta<typeof FormInput> = {
  title: 'Components/FormInput',
  component: FormInput,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    variant: { control: 'select', options: ['default', 'filled'] },
    disabled: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof FormInput>

export const Default: Story = {
  args: { name: 'email', label: 'Email', placeholder: 'you@example.com' },
}

export const WithDescription: Story = {
  args: { name: 'api-key', label: 'API Key', description: 'Found in your dashboard settings' },
}

export const WithError: Story = {
  args: { name: 'username', label: 'Username', error: 'Username is already taken', defaultValue: 'admin' },
}

export const WithIcon: Story = {
  args: { name: 'search', label: 'Search', icon: <Icon name="search" size="sm" />, placeholder: 'Search...' },
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: 300 }}>
      <FormInput name="sm" size="sm" label="Small" placeholder="Small input" />
      <FormInput name="md" size="md" label="Medium" placeholder="Medium input" />
      <FormInput name="lg" size="lg" label="Large" placeholder="Large input" />
    </div>
  ),
}
