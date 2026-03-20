import type { Meta, StoryObj } from '@storybook/react'
import { SuccessCheckmark } from './success-checkmark'

const meta: Meta<typeof SuccessCheckmark> = {
  title: 'Components/SuccessCheckmark',
  component: SuccessCheckmark,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    animated: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof SuccessCheckmark>

export const Default: Story = {
  args: { animated: true, label: 'Success' },
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
      <SuccessCheckmark size="sm" animated />
      <SuccessCheckmark size="md" animated />
      <SuccessCheckmark size="lg" animated />
    </div>
  ),
}
