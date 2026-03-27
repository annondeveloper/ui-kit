import type { Meta, StoryObj } from '@storybook/react'
import { PropertyList } from './property-list'

const meta: Meta<typeof PropertyList> = {
  title: 'Domain/PropertyList',
  component: PropertyList,
  argTypes: {
    columns: { control: 'select', options: [1, 2] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    striped: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof PropertyList>

const items = [
  { label: 'Hostname', value: 'prod-web-01.dc1.example.com', copyable: true, mono: true },
  { label: 'IP Address', value: '10.0.42.17', copyable: true, mono: true },
  { label: 'OS', value: 'Ubuntu 24.04 LTS' },
  { label: 'Kernel', value: '6.8.0-44-generic', mono: true },
  { label: 'Uptime', value: '142 days, 7 hours' },
  { label: 'CPU', value: '16 cores @ 3.4 GHz' },
]

export const Default: Story = {
  args: { items },
}

export const TwoColumns: Story = {
  args: { items, columns: 2 },
}

export const Striped: Story = {
  args: { items, striped: true },
}

export const WithCopy: Story = {
  args: {
    items: [
      { label: 'API Key', value: 'sk-abc123...xyz', copyable: true, mono: true },
      { label: 'Secret', value: '••••••••••', copyable: true, mono: true },
      { label: 'Endpoint', value: 'https://api.example.com/v2', copyable: true, mono: true },
    ],
    size: 'sm',
  },
}

export const Large: Story = {
  args: { items, size: 'lg', striped: true, columns: 2 },
}
