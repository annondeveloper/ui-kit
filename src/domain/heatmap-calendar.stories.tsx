import type { Meta, StoryObj } from '@storybook/react'
import { HeatmapCalendar } from './heatmap-calendar'

const meta: Meta<typeof HeatmapCalendar> = {
  title: 'Domain/HeatmapCalendar',
  component: HeatmapCalendar,
  argTypes: {
    showTooltip: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof HeatmapCalendar>

function generateData() {
  const data = []
  const now = new Date()
  for (let i = 365; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    data.push({
      date: d.toISOString().slice(0, 10),
      value: Math.floor(Math.random() * 10),
    })
  }
  return data
}

export const Default: Story = {
  args: { data: generateData(), showTooltip: true },
}
