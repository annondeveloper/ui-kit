import type { Meta, StoryObj } from '@storybook/react'
import { ToggleSwitch } from './toggle-switch'

const meta: Meta<typeof ToggleSwitch> = {
  title: 'Components/ToggleSwitch',
  component: ToggleSwitch,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof ToggleSwitch>

export const Default: Story = {
  args: { label: 'Enable notifications' },
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <ToggleSwitch size="sm" label="Small" />
      <ToggleSwitch size="md" label="Medium" />
      <ToggleSwitch size="lg" label="Large" />
    </div>
  ),
}

export const Disabled: Story = {
  args: { label: 'Locked setting', disabled: true, defaultChecked: true },
}
