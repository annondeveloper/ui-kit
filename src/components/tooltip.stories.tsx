import type { Meta, StoryObj } from '@storybook/react'
import { Tooltip } from './tooltip'
import { Button } from './button'

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  argTypes: {
    placement: { control: 'select', options: ['top', 'bottom', 'left', 'right'] },
    delay: { control: 'number' },
  },
}
export default meta
type Story = StoryObj<typeof Tooltip>

export const Default: Story = {
  render: (args) => (
    <Tooltip content="Helpful tooltip text" {...args}>
      <Button variant="secondary">Hover me</Button>
    </Tooltip>
  ),
}

export const AllPlacements: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', padding: '4rem' }}>
      <Tooltip content="Top" placement="top"><Button variant="ghost">Top</Button></Tooltip>
      <Tooltip content="Bottom" placement="bottom"><Button variant="ghost">Bottom</Button></Tooltip>
      <Tooltip content="Left" placement="left"><Button variant="ghost">Left</Button></Tooltip>
      <Tooltip content="Right" placement="right"><Button variant="ghost">Right</Button></Tooltip>
    </div>
  ),
}
