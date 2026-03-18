import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Checkbox } from './checkbox'

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md'] },
    indeterminate: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof Checkbox>

export const Default: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(false)
    return <Checkbox {...args} checked={checked} onChange={() => setChecked(!checked)} />
  },
}

export const Checked: Story = {
  render: () => {
    const [checked, setChecked] = useState(true)
    return <Checkbox checked={checked} onChange={() => setChecked(!checked)} />
  },
}

export const Unchecked: Story = {
  render: () => {
    const [checked, setChecked] = useState(false)
    return <Checkbox checked={checked} onChange={() => setChecked(!checked)} />
  },
}

export const Indeterminate: Story = {
  args: { indeterminate: true, checked: false },
}

export const Disabled: Story = {
  args: { disabled: true, checked: true },
}

export const SmallSize: Story = {
  render: () => {
    const [checked, setChecked] = useState(true)
    return <Checkbox size="sm" checked={checked} onChange={() => setChecked(!checked)} />
  },
}

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
      <Checkbox checked={false} onChange={() => {}} />
      <Checkbox checked={true} onChange={() => {}} />
      <Checkbox indeterminate checked={false} onChange={() => {}} />
      <Checkbox disabled checked={false} onChange={() => {}} />
      <Checkbox disabled checked={true} onChange={() => {}} />
    </div>
  ),
}
