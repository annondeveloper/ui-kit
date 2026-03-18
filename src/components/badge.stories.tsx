import type { Meta, StoryObj } from '@storybook/react'
import { Shield, Zap, AlertTriangle } from 'lucide-react'
import { Badge, createBadgeVariant } from './badge'

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['brand', 'blue', 'green', 'yellow', 'red', 'orange', 'purple', 'pink', 'teal', 'gray'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md'],
    },
  },
}
export default meta
type Story = StoryObj<typeof Badge>

export const Default: Story = {
  args: { children: 'Badge', color: 'gray' },
}

export const AllColors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      {(['brand', 'blue', 'green', 'yellow', 'red', 'orange', 'purple', 'pink', 'teal', 'gray'] as const).map(c => (
        <Badge key={c} color={c}>{c}</Badge>
      ))}
    </div>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <Badge size="xs" color="blue">XS</Badge>
      <Badge size="sm" color="blue">SM</Badge>
      <Badge size="md" color="blue">MD</Badge>
    </div>
  ),
}

export const WithIcon: Story = {
  args: { children: 'Secured', color: 'green', icon: Shield },
}

export const WithIconWarning: Story = {
  args: { children: 'Warning', color: 'yellow', icon: AlertTriangle },
}

export const CreateBadgeVariantExample: Story = {
  render: () => {
    const SeverityBadge = createBadgeVariant({
      colorMap: { critical: 'red', warning: 'yellow', info: 'blue', ok: 'green' },
      labelMap: { critical: 'Critical', warning: 'Warning', info: 'Info', ok: 'OK' },
    })
    return (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <SeverityBadge value="critical" />
        <SeverityBadge value="warning" />
        <SeverityBadge value="info" />
        <SeverityBadge value="ok" />
      </div>
    )
  },
}
