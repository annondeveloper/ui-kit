import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { FilterPill } from './filter-pill'

const meta: Meta<typeof FilterPill> = {
  title: 'Components/FilterPill',
  component: FilterPill,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof FilterPill>

export const Active: Story = {
  args: {
    label: 'Network Devices',
    active: true,
    onClick: () => {},
  },
}

export const Inactive: Story = {
  args: {
    label: 'Firewalls',
    active: false,
    onClick: () => {},
  },
}

export const WithCount: Story = {
  args: {
    label: 'Hosts',
    count: 42,
    active: true,
    onClick: () => {},
  },
}

export const WithCountInactive: Story = {
  args: {
    label: 'VMs',
    count: 128,
    active: false,
    onClick: () => {},
  },
}

export const FilterGroup: Story = {
  render: () => {
    const [active, setActive] = useState('all')
    const filters = [
      { key: 'all', label: 'All', count: 312 },
      { key: 'network', label: 'Network', count: 47 },
      { key: 'compute', label: 'Compute', count: 89 },
      { key: 'storage', label: 'Storage', count: 12 },
      { key: 'firewall', label: 'Firewall', count: 8 },
    ]
    return (
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {filters.map(f => (
          <FilterPill
            key={f.key}
            label={f.label}
            count={f.count}
            active={active === f.key}
            onClick={() => setActive(f.key)}
          />
        ))}
      </div>
    )
  },
}
