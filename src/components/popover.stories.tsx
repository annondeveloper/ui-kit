import type { Meta, StoryObj } from '@storybook/react'
import { Popover } from './popover'
import { Button } from './button'

const meta: Meta<typeof Popover> = {
  title: 'Components/Popover',
  component: Popover,
  argTypes: {
    placement: { control: 'select', options: ['top', 'bottom', 'left', 'right'] },
    arrow: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof Popover>

export const Default: Story = {
  render: (args) => (
    <Popover
      {...args}
      content={<div style={{ padding: '0.5rem' }}>Popover content here</div>}
    >
      <Button variant="secondary">Open Popover</Button>
    </Popover>
  ),
}

export const WithArrow: Story = {
  render: () => (
    <Popover
      content={<div style={{ padding: '0.5rem' }}>Content with arrow</div>}
      arrow
    >
      <Button variant="secondary">With Arrow</Button>
    </Popover>
  ),
}
