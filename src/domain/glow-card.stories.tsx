import type { Meta, StoryObj } from '@storybook/react'
import { GlowCard } from './glow-card'

const meta: Meta<typeof GlowCard> = {
  title: 'Domain/GlowCard',
  component: GlowCard,
  argTypes: {
    glowColor: { control: 'color' },
    motion: { control: 'select', options: [0, 1, 2, 3] },
  },
}
export default meta
type Story = StoryObj<typeof GlowCard>

const cardContent = (
  <div style={{ color: 'oklch(90% 0 0)' }}>
    <h3 style={{ margin: '0 0 0.5rem' }}>Hover me</h3>
    <p style={{ margin: 0, color: 'oklch(70% 0 0)' }}>
      Move your cursor across this card to see the glow follow.
    </p>
  </div>
)

export const Default: Story = {
  args: { children: cardContent },
}

export const CustomColor: Story = {
  args: {
    glowColor: 'oklch(70% 0.2 150 / 0.3)',
    children: (
      <div style={{ color: 'oklch(90% 0 0)' }}>
        <h3 style={{ margin: '0 0 0.5rem' }}>Green glow</h3>
        <p style={{ margin: 0, color: 'oklch(70% 0 0)' }}>Custom glow color via prop.</p>
      </div>
    ),
  },
}

export const Grid: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
      {['270', '150', '25'].map((hue) => (
        <GlowCard key={hue} glowColor={`oklch(70% 0.2 ${hue} / 0.3)`}>
          <div style={{ color: 'oklch(90% 0 0)', padding: '0.5rem' }}>
            <strong>Hue {hue}</strong>
            <p style={{ margin: '0.25rem 0 0', color: 'oklch(70% 0 0)', fontSize: '0.875rem' }}>
              Hover to reveal the glow effect.
            </p>
          </div>
        </GlowCard>
      ))}
    </div>
  ),
}

export const NoMotion: Story = {
  args: { children: cardContent, motion: 0 },
}
