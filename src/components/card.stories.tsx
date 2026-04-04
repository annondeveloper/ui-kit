import type { Meta, StoryObj } from '@storybook/react'
import { Card } from './card'
import { Button } from './button'

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  argTypes: {
    variant: { control: 'select', options: ['default', 'elevated', 'outlined', 'ghost', 'glass', 'gradient'] },
    padding: { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
    interactive: { control: 'boolean' },
    expandable: { control: 'boolean' },
    loading: { control: 'boolean' },
    bordered: { control: 'boolean' },
    motion: { control: 'select', options: [0, 1, 2, 3] },
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
      <Card variant="glass" padding="md" style={{ width: 200 }}>Glass</Card>
      <Card variant="gradient" padding="md" style={{ width: 200 }}>Gradient</Card>
    </div>
  ),
}

export const AllPaddings: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Card padding="none" style={{ width: 200 }}>None</Card>
      <Card padding="sm" style={{ width: 200 }}>Small</Card>
      <Card padding="md" style={{ width: 200 }}>Medium</Card>
      <Card padding="lg" style={{ width: 200 }}>Large</Card>
    </div>
  ),
}

export const Interactive: Story = {
  args: { children: 'Click me', padding: 'md', interactive: true },
}

export const WithHeaderAndFooter: Story = {
  args: {
    header: 'Card Title',
    footer: <><Button size="sm" variant="ghost">Cancel</Button><Button size="sm">Save</Button></>,
    children: 'Card body content with header and footer areas.',
    padding: 'md',
  },
}

export const Expandable: Story = {
  args: {
    header: 'Expandable Card',
    expandable: true,
    defaultExpanded: true,
    children: 'This content can be collapsed by clicking the card or the toggle button.',
    padding: 'md',
  },
}

export const Loading: Story = {
  args: { children: 'This content is loading...', padding: 'md', loading: true },
}

export const Bordered: Story = {
  args: { children: 'Card with explicit border', padding: 'md', variant: 'ghost', bordered: true },
}

export const AsAnchor: Story = {
  args: {
    as: 'a',
    href: '#',
    interactive: true,
    children: 'This card is an anchor element',
    padding: 'md',
  },
}

export const MotionLevels: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Card motion={0} interactive padding="md" style={{ width: 200 }}>Motion 0</Card>
      <Card motion={1} interactive padding="md" style={{ width: 200 }}>Motion 1</Card>
      <Card motion={2} interactive padding="md" style={{ width: 200 }}>Motion 2</Card>
      <Card motion={3} interactive padding="md" style={{ width: 200 }}>Motion 3</Card>
    </div>
  ),
}
