import type { Meta, StoryObj } from '@storybook/react'
import { TextReveal } from './text-reveal'

const meta: Meta<typeof TextReveal> = {
  title: 'Domain/TextReveal',
  component: TextReveal,
  argTypes: {
    trigger: { control: 'select', options: ['mount', 'inView'] },
    speed: { control: { type: 'range', min: 10, max: 200, step: 10 } },
    motion: { control: 'select', options: [0, 1, 2, 3] },
  },
}
export default meta
type Story = StoryObj<typeof TextReveal>

export const Default: Story = {
  args: { text: 'Aurora Fluid design system' },
}

export const SlowReveal: Story = {
  args: { text: 'Each character appears one by one...', speed: 120 },
}

export const FastReveal: Story = {
  args: { text: 'Lightning fast text reveal animation', speed: 20 },
}

export const InViewTrigger: Story = {
  render: () => (
    <div>
      <div style={{ blockSize: '80vh', display: 'grid', placeItems: 'center', color: 'oklch(60% 0 0)' }}>
        Scroll down to reveal text
      </div>
      <TextReveal text="This text reveals when it scrolls into view." trigger="inView" />
      <div style={{ blockSize: '40vh' }} />
    </div>
  ),
}

export const MotionLevels: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {([0, 1, 2, 3] as const).map((m) => (
        <div key={m}>
          <small style={{ color: 'oklch(60% 0 0)' }}>Motion {m}</small>
          <TextReveal text="Physics-based animation engine" motion={m} />
        </div>
      ))}
    </div>
  ),
}
