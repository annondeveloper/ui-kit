import type { Meta, StoryObj } from '@storybook/react'
import { UptimeTracker } from './uptime-tracker'

const meta: Meta<typeof UptimeTracker> = {
  title: 'Domain/UptimeTracker',
  component: UptimeTracker,
  argTypes: {
    showSla: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof UptimeTracker>

function generateDays(count: number) {
  const days = []
  const now = new Date()
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const date = d.toISOString().slice(0, 10)
    const rand = Math.random()
    const status = rand > 0.95 ? 'down' as const : rand > 0.9 ? 'degraded' as const : 'up' as const
    days.push({ date, status, uptime: status === 'up' ? 1 : status === 'degraded' ? 0.95 : 0.2 })
  }
  return days
}

export const Default: Story = {
  args: { days: generateDays(90), showSla: true, slaTarget: 0.999 },
}
