import type { Meta, StoryObj } from '@storybook/react'
import { SwitchFaceplate } from './switch-faceplate'
import type { SwitchPort } from './switch-faceplate'

const meta: Meta<typeof SwitchFaceplate> = {
  title: 'Domain/SwitchFaceplate',
  component: SwitchFaceplate,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    showLabels: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof SwitchFaceplate>

const makePorts = (count: number): SwitchPort[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    status: (['up', 'up', 'up', 'down', 'unused', 'admin-down'] as const)[i % 6],
    speed: '1G',
    type: 'ethernet' as const,
  }))

export const Default: Story = {
  args: { ports: makePorts(24), label: 'SW-CORE-01' },
}

export const LargeSwitch: Story = {
  args: { ports: makePorts(48), label: 'SW-DIST-01', size: 'sm' },
}

export const AllStatuses: Story = {
  args: {
    ports: [
      { id: 1, status: 'up', speed: '10G', type: 'sfp' },
      { id: 2, status: 'down', speed: '1G', type: 'ethernet' },
      { id: 3, status: 'admin-down', speed: '1G', type: 'ethernet' },
      { id: 4, status: 'unused', type: 'ethernet' },
    ],
    label: 'Status Demo',
    size: 'lg',
  },
}

export const WithLabels: Story = {
  args: {
    ports: makePorts(12).map((p) => ({ ...p, label: `eth${p.id}` })),
    label: 'SW-ACCESS-01',
    showLabels: true,
  },
}
