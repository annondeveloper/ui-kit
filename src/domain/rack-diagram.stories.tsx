import type { Meta, StoryObj } from '@storybook/react'
import { RackDiagram } from './rack-diagram'

const meta: Meta<typeof RackDiagram> = {
  title: 'Domain/RackDiagram',
  component: RackDiagram,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    orientation: { control: 'select', options: ['front', 'rear'] },
  },
}
export default meta
type Story = StoryObj<typeof RackDiagram>

const devices = [
  { startU: 1, heightU: 1, label: 'PDU', status: 'ok' as const },
  { startU: 3, heightU: 2, label: 'Core Switch', status: 'ok' as const },
  { startU: 10, heightU: 4, label: 'Server A', status: 'warning' as const },
  { startU: 20, heightU: 2, label: 'UPS', status: 'ok' as const },
  { startU: 38, heightU: 4, label: 'Storage Array', status: 'critical' as const },
]

export const Default: Story = {
  args: { units: 42, devices },
}

export const SmallRack: Story = {
  args: {
    units: 12,
    devices: [
      { startU: 1, heightU: 1, label: 'Switch', status: 'ok' as const },
      { startU: 3, heightU: 2, label: 'Server', status: 'ok' as const },
      { startU: 8, heightU: 2, label: 'NAS', status: 'warning' as const },
    ],
    size: 'sm',
  },
}

export const FullRack: Story = {
  args: {
    units: 12,
    devices: Array.from({ length: 6 }, (_, i) => ({
      startU: i * 2 + 1,
      heightU: 2,
      label: `Device ${i + 1}`,
      status: 'ok' as const,
    })),
  },
}

export const RearView: Story = {
  args: { units: 42, devices, orientation: 'rear' },
}
