import type { Meta, StoryObj } from '@storybook/react'
import { CoreChart } from './core-chart'

const meta: Meta<typeof CoreChart> = {
  title: 'Domain/CoreChart',
  component: CoreChart,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    colorScale: { control: 'select', options: ['green-red', 'blue-red', 'brand'] },
    showLabels: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof CoreChart>

const makeCores = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ id: i, usage: Math.round(Math.random() * 100) }))

export const Default: Story = {
  args: { cores: makeCores(8) },
}

export const LargeGrid: Story = {
  args: { cores: makeCores(32), columns: 8 },
}

export const AllColorScales: Story = {
  render: () => {
    const cores = makeCores(16)
    return (
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <CoreChart cores={cores} colorScale="green-red" />
        <CoreChart cores={cores} colorScale="blue-red" />
        <CoreChart cores={cores} colorScale="brand" />
      </div>
    )
  },
}

export const WithLabels: Story = {
  args: { cores: makeCores(16), showLabels: true, size: 'lg', columns: 4 },
}
