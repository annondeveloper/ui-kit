import type { Meta, StoryObj } from '@storybook/react'
import { NotificationStack } from './notification-stack'

const meta: Meta<typeof NotificationStack> = {
  title: 'Domain/NotificationStack',
  component: NotificationStack,
}
export default meta
type Story = StoryObj<typeof NotificationStack>

const sampleNotifications = [
  { id: '1', title: 'Deploy succeeded', description: 'Production v2.3.1 is live', timestamp: Date.now() - 60000, variant: 'success' as const },
  { id: '2', title: 'High CPU usage', description: 'Server us-east-1 at 92%', timestamp: Date.now() - 300000, variant: 'warning' as const },
  { id: '3', title: 'Certificate expiring', description: 'SSL cert expires in 7 days', timestamp: Date.now() - 3600000, variant: 'error' as const },
  { id: '4', title: 'New team member', description: 'Alice joined the project', timestamp: Date.now() - 7200000, variant: 'info' as const },
]

export const Default: Story = {
  args: { notifications: sampleNotifications, onDismiss: () => {}, onMarkRead: () => {} },
}

export const Empty: Story = {
  args: { notifications: [], emptyMessage: 'No notifications' },
}
