import type { Meta, StoryObj } from '@storybook/react'
import { ServiceStrip } from './service-strip'

const meta: Meta<typeof ServiceStrip> = {
  title: 'Domain/ServiceStrip',
  component: ServiceStrip,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md'] },
    maxVisible: { control: 'number' },
  },
}
export default meta
type Story = StoryObj<typeof ServiceStrip>

const services = [
  { name: 'nginx', status: 'running' as const },
  { name: 'postgres', status: 'running' as const },
  { name: 'redis', status: 'running' as const },
  { name: 'cron', status: 'stopped' as const },
]

export const Default: Story = {
  args: { services },
}

export const ManyServices: Story = {
  args: {
    services: [
      ...services,
      { name: 'docker', status: 'running' as const },
      { name: 'prometheus', status: 'running' as const },
      { name: 'grafana', status: 'error' as const },
      { name: 'alertmanager', status: 'unknown' as const },
    ],
    maxVisible: 5,
  },
}

export const AllStatuses: Story = {
  args: {
    services: [
      { name: 'running-svc', status: 'running' as const },
      { name: 'stopped-svc', status: 'stopped' as const },
      { name: 'error-svc', status: 'error' as const },
      { name: 'unknown-svc', status: 'unknown' as const },
    ],
  },
}
