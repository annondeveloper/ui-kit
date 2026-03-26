import type { Meta, StoryObj } from '@storybook/react'
import { MeteorShower } from './meteor-shower'

const meta: Meta<typeof MeteorShower> = {
  title: 'Domain/MeteorShower',
  component: MeteorShower,
  argTypes: {
    count: { control: { type: 'range', min: 5, max: 50, step: 5 } },
    motion: { control: 'select', options: [0, 1, 2, 3] },
  },
}
export default meta
type Story = StoryObj<typeof MeteorShower>

const containerStyle: React.CSSProperties = {
  minHeight: '400px',
  background: 'oklch(15% 0.02 270)',
  borderRadius: '0.75rem',
}

export const Default: Story = {
  args: { count: 20, style: containerStyle },
}

export const WithContent: Story = {
  args: {
    count: 15,
    style: containerStyle,
    children: (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2 style={{ color: 'oklch(95% 0 0)', margin: '0 0 0.5rem', fontSize: '2rem' }}>
          Welcome to the cosmos
        </h2>
        <p style={{ color: 'oklch(70% 0 0)', margin: 0 }}>
          Content renders above the meteor layer.
        </p>
      </div>
    ),
  },
}

export const Dense: Story = {
  args: { count: 50, style: containerStyle },
}

export const Sparse: Story = {
  args: { count: 5, style: containerStyle },
}

export const NoMotion: Story = {
  args: { count: 20, motion: 0, style: containerStyle },
}
