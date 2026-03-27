import type { Meta, StoryObj } from '@storybook/react'
import { ConnectionTestPanel } from './connection-test-panel'

const meta: Meta<typeof ConnectionTestPanel> = {
  title: 'Domain/ConnectionTestPanel',
  component: ConnectionTestPanel,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    running: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof ConnectionTestPanel>

const defaultSteps = [
  { id: 'dns', label: 'DNS Resolution', status: 'passed' as const, duration: 12 },
  { id: 'tcp', label: 'TCP Handshake', status: 'passed' as const, duration: 45 },
  { id: 'tls', label: 'TLS Negotiation', status: 'passed' as const, duration: 120 },
  { id: 'auth', label: 'Authentication', status: 'pending' as const },
  { id: 'ping', label: 'Latency Check', status: 'pending' as const },
]

export const Default: Story = {
  args: { steps: defaultSteps, title: 'Connection Test' },
}

export const AllPassed: Story = {
  args: {
    steps: defaultSteps.map(s => ({ ...s, status: 'passed' as const, duration: Math.floor(Math.random() * 200) + 5 })),
    title: 'All Checks Passed',
  },
}

export const WithFailure: Story = {
  args: {
    steps: [
      { id: 'dns', label: 'DNS Resolution', status: 'passed' as const, duration: 14 },
      { id: 'tcp', label: 'TCP Handshake', status: 'failed' as const, message: 'Connection refused on port 5432' },
      { id: 'tls', label: 'TLS Negotiation', status: 'skipped' as const },
      { id: 'auth', label: 'Authentication', status: 'skipped' as const },
    ],
    title: 'Database Connection',
    onRetry: () => console.log('retry'),
  },
}

export const Running: Story = {
  args: {
    steps: [
      { id: 'dns', label: 'DNS Resolution', status: 'passed' as const, duration: 11 },
      { id: 'tcp', label: 'TCP Handshake', status: 'running' as const },
      { id: 'tls', label: 'TLS Negotiation', status: 'pending' as const },
    ],
    title: 'Connecting...',
    running: true,
  },
}
