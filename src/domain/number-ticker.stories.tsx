import type { Meta, StoryObj } from '@storybook/react'
import { NumberTicker } from './number-ticker'

const meta: Meta<typeof NumberTicker> = {
  title: 'Domain/NumberTicker',
  component: NumberTicker,
  argTypes: {
    value: { control: { type: 'number' } },
    direction: { control: 'select', options: ['up', 'down'] },
    delay: { control: { type: 'number', min: 0, max: 3000 } },
    motion: { control: { type: 'range', min: 0, max: 3 } },
  },
}
export default meta
type Story = StoryObj<typeof NumberTicker>

export const Default: Story = {
  args: { value: 1234 },
}

export const CountUp: Story = {
  args: { value: 99847, direction: 'up' },
}

export const CountDown: Story = {
  args: { value: 500, direction: 'down' },
}

export const WithDelay: Story = {
  args: { value: 42, delay: 1000 },
}

export const LargeNumber: Story = {
  args: { value: 1_000_000 },
}

export const Showcase: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '2rem' }}>
      <NumberTicker value={2025} />
      <NumberTicker value={314159} direction="up" />
      <NumberTicker value={7} delay={500} />
    </div>
  ),
}
