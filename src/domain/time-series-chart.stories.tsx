import type { Meta, StoryObj } from '@storybook/react'
import { TimeSeriesChart } from './time-series-chart'

const meta: Meta<typeof TimeSeriesChart> = {
  title: 'Domain/TimeSeriesChart',
  component: TimeSeriesChart,
  argTypes: {
    showGrid: { control: 'boolean' },
    showLegend: { control: 'boolean' },
    showXAxis: { control: 'boolean' },
    showYAxis: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof TimeSeriesChart>

const now = Date.now()
const points = (base: number, variance: number) =>
  Array.from({ length: 20 }, (_, i) => ({
    timestamp: now - (19 - i) * 60_000,
    value: base + Math.sin(i / 3) * variance + Math.random() * variance * 0.3,
  }))

const singleSeries = [{ id: 'cpu', label: 'CPU %', data: points(50, 25) }]

const multiSeries = [
  { id: 'cpu', label: 'CPU %', data: points(50, 25) },
  { id: 'mem', label: 'Memory %', data: points(65, 15) },
  { id: 'net', label: 'Network Mbps', data: points(30, 20) },
]

export const Default: Story = {
  args: { series: singleSeries, height: 220 },
}

export const MultiSeries: Story = {
  args: { series: multiSeries, height: 260 },
}

export const WithGrid: Story = {
  args: { series: singleSeries, height: 220, showGrid: true, showXAxis: true, showYAxis: true },
}

export const Minimal: Story = {
  args: {
    series: singleSeries,
    height: 160,
    showGrid: false,
    showXAxis: false,
    showYAxis: false,
    showLegend: false,
    showTooltip: false,
  },
}
