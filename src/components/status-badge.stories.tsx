import type { Meta, StoryObj } from '@storybook/react'
import { StatusBadge } from './status-badge'

const meta: Meta<typeof StatusBadge> = {
  title: 'Components/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['ok', 'active', 'warning', 'critical', 'unknown', 'maintenance', 'stale', 'inactive', 'decommissioned', 'pending'],
    },
    size: { control: 'select', options: ['sm', 'md'] },
    pulse: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof StatusBadge>

export const Default: Story = {
  args: { status: 'ok' },
}

export const Critical: Story = {
  args: { status: 'critical' },
}

export const Warning: Story = {
  args: { status: 'warning' },
}

export const WithPulse: Story = {
  args: { status: 'critical', pulse: true },
}

export const SmallSize: Story = {
  args: { status: 'active', size: 'sm' },
}

export const CustomLabel: Story = {
  args: { status: 'ok', label: 'Healthy' },
}

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      {['ok', 'active', 'warning', 'critical', 'unknown', 'maintenance', 'stale', 'inactive', 'decommissioned', 'pending'].map(s => (
        <StatusBadge key={s} status={s} />
      ))}
    </div>
  ),
}

export const CustomStatusMap: Story = {
  render: () => {
    const customMap = {
      running: {
        label: 'Running',
        dot: 'bg-[hsl(142,71%,45%)]',
        text: 'text-[hsl(142,71%,45%)]',
        bg: 'bg-[hsl(142,71%,45%)]/10',
      },
      stopped: {
        label: 'Stopped',
        dot: 'bg-[hsl(0,84%,60%)]',
        text: 'text-[hsl(0,84%,60%)]',
        bg: 'bg-[hsl(0,84%,60%)]/10',
      },
      migrating: {
        label: 'Migrating',
        dot: 'bg-[hsl(258,80%,65%)]',
        text: 'text-[hsl(258,80%,65%)]',
        bg: 'bg-[hsl(258,80%,65%)]/10',
      },
    }
    return (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <StatusBadge status="running" statusMap={customMap} />
        <StatusBadge status="stopped" statusMap={customMap} />
        <StatusBadge status="migrating" statusMap={customMap} />
      </div>
    )
  },
}
