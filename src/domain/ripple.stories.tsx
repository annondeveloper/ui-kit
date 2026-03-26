import type { Meta, StoryObj } from '@storybook/react'
import { Ripple } from './ripple'

const meta: Meta<typeof Ripple> = {
  title: 'Domain/Ripple',
  component: Ripple,
  argTypes: {
    color: { control: 'color' },
    duration: { control: { type: 'range', min: 200, max: 2000, step: 100 } },
    motion: { control: 'select', options: [0, 1, 2, 3] },
  },
}
export default meta
type Story = StoryObj<typeof Ripple>

const box = {
  padding: '2rem 3rem',
  background: 'oklch(30% 0.05 270)',
  borderRadius: '0.5rem',
  color: 'oklch(90% 0 0)',
  textAlign: 'center' as const,
}

export const Default: Story = {
  args: { children: <div style={box}>Click me</div> },
}

export const CustomColor: Story = {
  args: {
    color: 'oklch(70% 0.2 150 / 0.3)',
    children: <div style={box}>Green ripple</div>,
  },
}

export const SlowDuration: Story = {
  args: {
    duration: 1500,
    children: <div style={box}>Slow ripple (1.5s)</div>,
  },
}

export const MotionLevels: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      {([0, 1, 2, 3] as const).map((m) => (
        <Ripple key={m} motion={m}>
          <div style={box}>Motion {m}</div>
        </Ripple>
      ))}
    </div>
  ),
}
