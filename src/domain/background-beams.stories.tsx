import type { Meta, StoryObj } from '@storybook/react'
import { BackgroundBeams } from './background-beams'

const meta: Meta<typeof BackgroundBeams> = {
  title: 'Domain/BackgroundBeams',
  component: BackgroundBeams,
  argTypes: {
    count: { control: { type: 'range', min: 1, max: 20 } },
    color: { control: 'color' },
    motion: { control: 'select', options: [0, 1, 2, 3] },
  },
}
export default meta
type Story = StoryObj<typeof BackgroundBeams>

const containerStyle: React.CSSProperties = {
  height: '300px',
  background: 'oklch(15% 0.01 270)',
  borderRadius: '0.75rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'oklch(90% 0 0)',
  fontSize: '1.25rem',
  fontWeight: 600,
}

export const Default: Story = {
  args: { count: 6, children: <div style={containerStyle}>Background Beams</div> },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <BackgroundBeams count={4} style={containerStyle}>
        <span>4 beams (default)</span>
      </BackgroundBeams>
      <BackgroundBeams count={10} color="oklch(70% 0.2 145 / 0.3)" style={containerStyle}>
        <span>10 beams (green)</span>
      </BackgroundBeams>
      <BackgroundBeams count={6} motion={0} style={containerStyle}>
        <span>Motion disabled</span>
      </BackgroundBeams>
    </div>
  ),
}

export const Interactive: Story = {
  args: {
    count: 8,
    motion: 3,
    children: <div style={containerStyle}>Interactive Beams</div>,
  },
}
