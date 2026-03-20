import type { Meta, StoryObj } from '@storybook/react'
import { Card } from './card'

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  argTypes: {
    variant: { control: 'select', options: ['default', 'elevated', 'outlined', 'ghost'] },
    padding: { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
    interactive: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof Card>

export const Default: Story = {
  args: { children: 'Card content goes here.', padding: 'md' },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Card variant="default" padding="md" style={{ width: 200 }}>Default</Card>
      <Card variant="elevated" padding="md" style={{ width: 200 }}>Elevated</Card>
      <Card variant="outlined" padding="md" style={{ width: 200 }}>Outlined</Card>
      <Card variant="ghost" padding="md" style={{ width: 200 }}>Ghost</Card>
    </div>
  ),
}

export const Interactive: Story = {
  args: { children: 'Click me', padding: 'md', interactive: true },
}
