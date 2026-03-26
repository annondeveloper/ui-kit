import type { Meta, StoryObj } from '@storybook/react'
import { SpotlightCard } from './spotlight-card'

const meta: Meta<typeof SpotlightCard> = {
  title: 'Domain/SpotlightCard',
  component: SpotlightCard,
  argTypes: {
    spotlightColor: { control: 'color' },
    motion: { control: 'select', options: [0, 1, 2, 3] },
  },
}
export default meta
type Story = StoryObj<typeof SpotlightCard>

const inner = { padding: '2rem', color: 'oklch(90% 0 0)' }

export const Default: Story = {
  args: {
    children: (
      <div style={inner}>
        <h3 style={{ margin: 0 }}>Spotlight Card</h3>
        <p style={{ opacity: 0.7 }}>Move your cursor over this card to see the spotlight effect.</p>
      </div>
    ),
  },
}

export const CustomColor: Story = {
  args: {
    spotlightColor: 'oklch(70% 0.2 150 / 0.2)',
    children: (
      <div style={inner}>
        <h3 style={{ margin: 0 }}>Green spotlight</h3>
        <p style={{ opacity: 0.7 }}>Custom spotlight color.</p>
      </div>
    ),
  },
}

export const Grid: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', maxInlineSize: '48rem' }}>
      {['Features', 'Pricing', 'Support'].map((title) => (
        <SpotlightCard key={title}>
          <div style={inner}>
            <h3 style={{ margin: 0 }}>{title}</h3>
            <p style={{ opacity: 0.7 }}>Hover to reveal spotlight.</p>
          </div>
        </SpotlightCard>
      ))}
    </div>
  ),
}

export const MotionOff: Story = {
  args: {
    motion: 0,
    children: (
      <div style={inner}>
        <h3 style={{ margin: 0 }}>No motion</h3>
        <p style={{ opacity: 0.7 }}>Spotlight disabled at motion level 0.</p>
      </div>
    ),
  },
}
