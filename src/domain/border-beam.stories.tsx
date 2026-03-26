import type { Meta, StoryObj } from '@storybook/react'
import { BorderBeam } from './border-beam'

const meta: Meta<typeof BorderBeam> = {
  title: 'Domain/BorderBeam',
  component: BorderBeam,
  argTypes: {
    duration: { control: { type: 'range', min: 1, max: 15 } },
    size: { control: { type: 'range', min: 20, max: 200 } },
    color: { control: 'color' },
    motion: { control: 'select', options: [0, 1, 2, 3] },
  },
}
export default meta
type Story = StoryObj<typeof BorderBeam>

const cardContent = (
  <div style={{ padding: '2rem', color: 'oklch(90% 0 0)', textAlign: 'center' as const }}>
    <h3 style={{ margin: 0 }}>Border Beam</h3>
    <p style={{ margin: '0.5rem 0 0', color: 'oklch(70% 0 0)', fontSize: '0.875rem' }}>
      Animated conic-gradient border effect
    </p>
  </div>
)

export const Default: Story = {
  args: { duration: 5, size: 80, children: cardContent },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
      <BorderBeam duration={3} size={60}>
        <div style={{ padding: '1.5rem', color: 'oklch(90% 0 0)' }}>Fast (3s)</div>
      </BorderBeam>
      <BorderBeam duration={8} size={120} color="oklch(70% 0.2 145)">
        <div style={{ padding: '1.5rem', color: 'oklch(90% 0 0)' }}>Slow green</div>
      </BorderBeam>
      <BorderBeam duration={5} color="oklch(70% 0.2 25)">
        <div style={{ padding: '1.5rem', color: 'oklch(90% 0 0)' }}>Red beam</div>
      </BorderBeam>
      <BorderBeam duration={5} motion={0}>
        <div style={{ padding: '1.5rem', color: 'oklch(90% 0 0)' }}>Motion off</div>
      </BorderBeam>
    </div>
  ),
}

export const Interactive: Story = {
  args: { duration: 5, size: 80, color: 'oklch(75% 0.15 270)', children: cardContent },
}
