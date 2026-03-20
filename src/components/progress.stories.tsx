import type { Meta, StoryObj } from '@storybook/react'
import { Progress } from './progress'

const meta: Meta<typeof Progress> = {
  title: 'Components/Progress',
  component: Progress,
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100 } },
    variant: { control: 'select', options: ['default', 'success', 'warning', 'danger'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    showValue: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof Progress>

export const Default: Story = {
  args: { value: 60, max: 100, size: 'md' },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: 300 }}>
      <Progress value={25} variant="default" />
      <Progress value={50} variant="success" />
      <Progress value={75} variant="warning" />
      <Progress value={90} variant="danger" />
    </div>
  ),
}

export const WithLabel: Story = {
  args: { value: 72, label: 'Upload progress', showValue: true },
}
