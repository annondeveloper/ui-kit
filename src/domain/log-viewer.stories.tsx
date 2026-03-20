import type { Meta, StoryObj } from '@storybook/react'
import { LogViewer } from './log-viewer'

const meta: Meta<typeof LogViewer> = {
  title: 'Domain/LogViewer',
  component: LogViewer,
  argTypes: {
    showTimestamp: { control: 'boolean' },
    showLevel: { control: 'boolean' },
    wrap: { control: 'boolean' },
    autoTail: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof LogViewer>

const sampleLines = [
  { id: 1, timestamp: Date.now() - 5000, level: 'info' as const, message: 'Server started on port 3000' },
  { id: 2, timestamp: Date.now() - 4000, level: 'info' as const, message: 'Database connection established' },
  { id: 3, timestamp: Date.now() - 3000, level: 'debug' as const, message: 'Loading configuration from /etc/app/config.yaml' },
  { id: 4, timestamp: Date.now() - 2000, level: 'warn' as const, message: 'Deprecated API endpoint called: /api/v1/users' },
  { id: 5, timestamp: Date.now() - 1000, level: 'error' as const, message: 'Failed to connect to cache: ECONNREFUSED 127.0.0.1:6379' },
  { id: 6, timestamp: Date.now(), level: 'info' as const, message: 'Request processed: GET /api/health -> 200 (12ms)' },
]

export const Default: Story = {
  args: { lines: sampleLines, showTimestamp: true, showLevel: true },
}

export const AutoTail: Story = {
  args: { lines: sampleLines, showTimestamp: true, showLevel: true, autoTail: true },
}
