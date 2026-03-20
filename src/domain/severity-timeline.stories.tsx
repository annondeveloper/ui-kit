import type { Meta, StoryObj } from '@storybook/react'
import { SeverityTimeline } from './severity-timeline'

const meta: Meta<typeof SeverityTimeline> = {
  title: 'Domain/SeverityTimeline',
  component: SeverityTimeline,
  argTypes: {
    orientation: { control: 'select', options: ['vertical', 'horizontal'] },
    expandable: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof SeverityTimeline>

const events = [
  { id: '1', timestamp: Date.now() - 3600000, severity: 'critical' as const, title: 'Database connection lost', description: 'Primary DB unreachable' },
  { id: '2', timestamp: Date.now() - 2400000, severity: 'warning' as const, title: 'Failover activated', description: 'Switched to replica' },
  { id: '3', timestamp: Date.now() - 1200000, severity: 'info' as const, title: 'Primary DB recovered' },
  { id: '4', timestamp: Date.now() - 600000, severity: 'ok' as const, title: 'All systems operational' },
]

export const Default: Story = {
  args: { events },
}

export const Horizontal: Story = {
  args: { events, orientation: 'horizontal' },
}
