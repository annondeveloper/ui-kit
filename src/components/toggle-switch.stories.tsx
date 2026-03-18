import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { ToggleSwitch } from './toggle-switch'

const meta: Meta<typeof ToggleSwitch> = {
  title: 'Components/ToggleSwitch',
  component: ToggleSwitch,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md'] },
    disabled: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof ToggleSwitch>

export const Default: Story = {
  render: (args) => {
    const [enabled, setEnabled] = useState(false)
    return <ToggleSwitch {...args} enabled={enabled} onChange={setEnabled} />
  },
}

export const On: Story = {
  render: () => {
    const [enabled, setEnabled] = useState(true)
    return <ToggleSwitch enabled={enabled} onChange={setEnabled} />
  },
}

export const Off: Story = {
  render: () => {
    const [enabled, setEnabled] = useState(false)
    return <ToggleSwitch enabled={enabled} onChange={setEnabled} />
  },
}

export const SmallSize: Story = {
  render: () => {
    const [enabled, setEnabled] = useState(true)
    return <ToggleSwitch size="sm" enabled={enabled} onChange={setEnabled} />
  },
}

export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <ToggleSwitch enabled={true} onChange={() => {}} disabled />
      <ToggleSwitch enabled={false} onChange={() => {}} disabled />
    </div>
  ),
}

export const WithLabel: Story = {
  render: () => {
    const [enabled, setEnabled] = useState(false)
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ToggleSwitch enabled={enabled} onChange={setEnabled} label="Enable notifications" />
        <span style={{ fontSize: '0.875rem', color: 'hsl(210 20% 70%)' }}>
          Notifications {enabled ? 'on' : 'off'}
        </span>
      </div>
    )
  },
}
