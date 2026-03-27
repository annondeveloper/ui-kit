import type { Meta, StoryObj } from '@storybook/react'
import { EntityCard } from './entity-card'

const meta: Meta<typeof EntityCard> = {
  title: 'Domain/EntityCard',
  component: EntityCard,
  argTypes: {
    status: { control: 'select', options: ['ok', 'warning', 'critical', 'unknown', 'maintenance'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    compact: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof EntityCard>

export const Default: Story = {
  args: {
    name: 'prod-web-01',
    type: 'Virtual Machine',
    status: 'ok',
    metrics: [
      { label: 'CPU', value: '24%' },
      { label: 'RAM', value: '8.2 GB' },
      { label: 'Disk', value: '67%' },
    ],
    tags: ['production', 'us-east-1', 'nginx'],
  },
}

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
      {(['ok', 'warning', 'critical', 'unknown', 'maintenance'] as const).map(status => (
        <EntityCard key={status} name={`server-${status}`} type="VM" status={status} />
      ))}
    </div>
  ),
}

export const Compact: Story = {
  args: {
    name: 'db-replica-03',
    type: 'Database',
    status: 'warning',
    compact: true,
    tags: ['staging'],
  },
}

export const WithActions: Story = {
  args: {
    name: 'lb-main-01',
    type: 'Load Balancer',
    status: 'ok',
    metrics: [{ label: 'Conns', value: '1.2k' }, { label: 'RPS', value: '4.8k' }],
    tags: ['production'],
    actions: [
      { label: 'SSH', onClick: () => console.log('SSH') },
      { label: 'Restart', onClick: () => console.log('Restart') },
    ],
  },
}
