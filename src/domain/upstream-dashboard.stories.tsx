import type { Meta, StoryObj } from '@storybook/react'
import { UpstreamDashboard, type UpstreamLink } from './upstream-dashboard'

const sampleLinks: UpstreamLink[] = [
  { id: '1', vendor: 'Lumen', location: 'US-East', inbound: 5e9, outbound: 3.2e9, capacity: 10e9, status: 'ok', trend: [4e9, 4.5e9, 5e9] },
  { id: '2', vendor: 'Telia', location: 'EU-West', inbound: 2.8e9, outbound: 1.9e9, capacity: 5e9, status: 'ok', trend: [2e9, 2.5e9, 2.8e9] },
  { id: '3', vendor: 'NTT', location: 'AP-Tokyo', inbound: 7.5e9, outbound: 6.1e9, capacity: 10e9, status: 'warning', trend: [5e9, 6e9, 7.5e9] },
  { id: '4', vendor: 'Cogent', location: 'US-West', inbound: 1.2e9, outbound: 0.8e9, capacity: 2e9, status: 'critical', trend: [0.5e9, 0.9e9, 1.2e9] },
]

const meta: Meta<typeof UpstreamDashboard> = {
  title: 'Domain/UpstreamDashboard',
  component: UpstreamDashboard,
  argTypes: {
    mode: { control: 'select', options: ['hero', 'compact', 'table'] },
    groupBy: { control: 'select', options: ['vendor', 'location', 'none'] },
    showSummary: { control: 'boolean' },
    showCapacity: { control: 'boolean' },
    showUtilization: { control: 'boolean' },
    utilizationDisplay: { control: 'select', options: ['bar', 'meter', 'ambient'] },
  },
}
export default meta
type Story = StoryObj<typeof UpstreamDashboard>

export const Default: Story = {
  args: { links: sampleLinks, title: 'Upstream Links', showSummary: true },
}

export const CompactMode: Story = {
  args: { links: sampleLinks, title: 'Upstream Links', mode: 'compact', showSummary: true },
}

export const TableMode: Story = {
  args: { links: sampleLinks, title: 'Upstream Links', mode: 'table' },
}

export const GroupedByVendor: Story = {
  args: {
    links: sampleLinks,
    title: 'Grouped by Vendor',
    groupBy: 'vendor',
    showSummary: true,
    showCapacity: true,
    showUtilization: true,
  },
}

export const WithUtilization: Story = {
  args: {
    links: sampleLinks,
    title: 'Utilization View',
    showCapacity: true,
    showUtilization: true,
    utilizationDisplay: 'bar',
    lastUpdated: Date.now() - 30000,
  },
}
