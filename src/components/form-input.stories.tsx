import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { FormInput } from './form-input'

const meta: Meta<typeof FormInput> = {
  title: 'Components/FormInput',
  component: FormInput,
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'select', options: ['text', 'email', 'password', 'number', 'url'] },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof FormInput>

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState('')
    return <FormInput {...args} value={value} onChange={setValue} />
  },
  args: {
    label: 'Hostname',
    placeholder: 'e.g. switch-core-01',
  },
}

export const WithLabel: Story = {
  render: () => {
    const [value, setValue] = useState('admin@netrak.io')
    return <FormInput label="Email" type="email" value={value} onChange={setValue} />
  },
}

export const WithHint: Story = {
  render: () => {
    const [value, setValue] = useState('')
    return (
      <FormInput
        label="API Key"
        value={value}
        onChange={setValue}
        hint="Generate a key from Settings > API Keys."
        placeholder="sk-..."
      />
    )
  },
}

export const Required: Story = {
  render: () => {
    const [value, setValue] = useState('')
    return (
      <FormInput
        label="Device Name"
        value={value}
        onChange={setValue}
        required
        placeholder="Required field"
      />
    )
  },
}

export const Disabled: Story = {
  render: () => (
    <FormInput
      label="Read Only"
      value="Cannot edit this"
      onChange={() => {}}
      disabled
    />
  ),
}

export const Password: Story = {
  render: () => {
    const [value, setValue] = useState('')
    return (
      <FormInput
        label="Password"
        type="password"
        value={value}
        onChange={setValue}
        required
        placeholder="Enter password"
      />
    )
  },
}
