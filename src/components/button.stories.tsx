import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './button'
import { Icon } from '../core/icons/icon'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'danger', 'link'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    iconOnly: { control: 'boolean' },
    motion: { control: 'select', options: [0, 1, 2, 3] },
  },
}
export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {
  args: { children: 'Button', variant: 'primary' },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Button size="xs">Extra Small</Button>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra Large</Button>
    </div>
  ),
}

export const WithIcon: Story = {
  args: { children: 'Deploy', icon: <Icon name="zap" size="sm" /> },
}

export const WithIconEnd: Story = {
  args: { children: 'Continue', iconEnd: <Icon name="arrow-right" size="sm" /> },
}

export const IconOnly: Story = {
  args: { icon: <Icon name="zap" size="sm" />, iconOnly: true, 'aria-label': 'Quick action' },
}

export const Loading: Story = {
  args: { children: 'Saving...', loading: true },
}

export const LoadingWithText: Story = {
  args: { loadingText: 'Saving...', loading: true },
}

export const Disabled: Story = {
  args: { children: 'Disabled', disabled: true },
}

export const FullWidth: Story = {
  args: { children: 'Full Width', fullWidth: true },
}

export const MotionLevels: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Button motion={0}>No motion</Button>
      <Button motion={1}>Subtle</Button>
      <Button motion={2}>Expressive</Button>
      <Button motion={3}>Cinematic</Button>
    </div>
  ),
}

export const DisabledVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Button variant="primary" disabled>Primary</Button>
      <Button variant="secondary" disabled>Secondary</Button>
      <Button variant="ghost" disabled>Ghost</Button>
      <Button variant="danger" disabled>Danger</Button>
    </div>
  ),
}
