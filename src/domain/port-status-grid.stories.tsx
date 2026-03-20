import type { Meta, StoryObj } from '@storybook/react'
import { PortStatusGrid } from './port-status-grid'

const meta: Meta<typeof PortStatusGrid> = {
  title: 'Domain/PortStatusGrid',
  component: PortStatusGrid,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md'] },
    columns: { control: 'number' },
  },
}
export default meta
type Story = StoryObj<typeof PortStatusGrid>

const ports = [
  { port: 80, status: 'ok' as const, label: 'HTTP' },
  { port: 443, status: 'ok' as const, label: 'HTTPS' },
  { port: 22, status: 'ok' as const, label: 'SSH' },
  { port: 3306, status: 'warning' as const, label: 'MySQL' },
  { port: 5432, status: 'ok' as const, label: 'PostgreSQL' },
  { port: 6379, status: 'critical' as const, label: 'Redis' },
  { port: 8080, status: 'ok' as const, label: 'Proxy' },
  { port: 9090, status: 'unknown' as const, label: 'Prometheus' },
]

export const Default: Story = {
  args: { ports, columns: 4 },
}
