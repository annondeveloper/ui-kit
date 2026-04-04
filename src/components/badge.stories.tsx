import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './badge'
import { Icon } from '../core/icons/icon'

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  argTypes: {
    variant: { control: 'select', options: ['default', 'primary', 'success', 'warning', 'danger', 'info'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    dot: { control: 'boolean' },
    pulse: { control: 'boolean' },
    removable: { control: 'boolean' },
    outline: { control: 'boolean' },
    motion: { control: 'select', options: [0, 1, 2, 3] },
  },
}
export default meta
type Story = StoryObj<typeof Badge>

export const Default: Story = {
  args: { children: 'Badge', variant: 'default' },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <Badge variant="default">Default</Badge>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="danger">Danger</Badge>
      <Badge variant="info">Info</Badge>
    </div>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <Badge size="xs" variant="primary">XS</Badge>
      <Badge size="sm" variant="primary">SM</Badge>
      <Badge size="md" variant="primary">MD</Badge>
      <Badge size="lg" variant="primary">LG</Badge>
      <Badge size="xl" variant="primary">XL</Badge>
    </div>
  ),
}

export const WithDot: Story = {
  args: { children: 'Active', dot: true, variant: 'success' },
}

export const WithCount: Story = {
  args: { count: 42, maxCount: 99, variant: 'danger' },
}

export const CountOverflow: Story = {
  args: { count: 150, maxCount: 99, variant: 'danger' },
}

export const Pulsing: Story = {
  args: { children: 'Live', dot: true, pulse: true, variant: 'danger' },
}

export const WithIcon: Story = {
  args: { children: 'Status', icon: <Icon name="check" size="sm" />, variant: 'success' },
}

export const Removable: Story = {
  args: { children: 'Removable', removable: true, variant: 'primary', onRemove: () => alert('Removed!') },
}

export const Outline: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <Badge variant="primary" outline>Primary</Badge>
      <Badge variant="success" outline>Success</Badge>
      <Badge variant="danger" outline>Danger</Badge>
    </div>
  ),
}

export const MotionLevels: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <Badge motion={0} variant="primary" dot pulse>Motion 0</Badge>
      <Badge motion={1} variant="primary" dot pulse>Motion 1</Badge>
      <Badge motion={2} variant="primary" dot pulse>Motion 2</Badge>
      <Badge motion={3} variant="primary" dot pulse>Motion 3</Badge>
    </div>
  ),
}
