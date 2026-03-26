import type { Meta, StoryObj } from '@storybook/react'
import { Divider } from './divider'

const meta: Meta<typeof Divider> = {
  title: 'Components/Divider',
  component: Divider,
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    variant: { control: 'select', options: ['solid', 'dashed', 'dotted'] },
    spacing: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
}
export default meta
type Story = StoryObj<typeof Divider>

export const Default: Story = {
  args: { orientation: 'horizontal', variant: 'solid' },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', color: 'oklch(90% 0 0)' }}>
      <div>
        <p>Solid</p>
        <Divider variant="solid" />
      </div>
      <div>
        <p>Dashed</p>
        <Divider variant="dashed" />
      </div>
      <div>
        <p>Dotted</p>
        <Divider variant="dotted" />
      </div>
      <div>
        <p>With label</p>
        <Divider label="OR" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', height: 48 }}>
        <span>Left</span>
        <Divider orientation="vertical" />
        <span>Right</span>
      </div>
    </div>
  ),
}

export const Interactive: Story = {
  args: { orientation: 'horizontal', variant: 'solid', spacing: 'md', label: 'Section' },
}
