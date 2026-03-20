import type { Meta, StoryObj } from '@storybook/react'
import { LiveFeed } from './live-feed'

const meta: Meta<typeof LiveFeed> = {
  title: 'Domain/LiveFeed',
  component: LiveFeed,
  argTypes: {
    autoScroll: { control: 'boolean' },
    paused: { control: 'boolean' },
    connectionStatus: { control: 'select', options: ['connected', 'reconnecting', 'offline'] },
  },
}
export default meta
type Story = StoryObj<typeof LiveFeed>

const items = [
  { id: '1', content: 'Deploy started: v2.3.1', timestamp: Date.now() - 60000 },
  { id: '2', content: 'Building image...', timestamp: Date.now() - 45000 },
  { id: '3', content: 'Running tests...', timestamp: Date.now() - 30000 },
  { id: '4', content: 'Tests passed (42/42)', timestamp: Date.now() - 15000 },
  { id: '5', content: 'Deploying to production', timestamp: Date.now() },
]

export const Default: Story = {
  args: { items, autoScroll: true, connectionStatus: 'connected', height: '300px' },
}

export const Offline: Story = {
  args: { items, connectionStatus: 'offline', height: '300px' },
}
