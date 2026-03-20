import type { Meta, StoryObj } from '@storybook/react'
import { ResponsiveCard } from './responsive-card'
import { Button } from '../components/button'
import { Badge } from '../components/badge'

const meta: Meta<typeof ResponsiveCard> = {
  title: 'Domain/ResponsiveCard',
  component: ResponsiveCard,
  argTypes: {
    variant: { control: 'select', options: ['default', 'horizontal', 'compact'] },
  },
}
export default meta
type Story = StoryObj<typeof ResponsiveCard>

export const Default: Story = {
  args: {
    title: 'Project Alpha',
    description: 'A next-generation deployment platform with zero-downtime releases.',
    badge: <Badge variant="success">Active</Badge>,
    actions: <Button size="sm" variant="secondary">View</Button>,
  },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 400 }}>
      <ResponsiveCard variant="default" title="Default" description="Default card layout" />
      <ResponsiveCard variant="horizontal" title="Horizontal" description="Horizontal card layout" />
      <ResponsiveCard variant="compact" title="Compact" description="Compact card layout" />
    </div>
  ),
}
