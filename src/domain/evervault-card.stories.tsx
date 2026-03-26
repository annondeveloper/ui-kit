import type { Meta, StoryObj } from '@storybook/react'
import { EvervaultCard } from './evervault-card'

const meta: Meta<typeof EvervaultCard> = {
  title: 'Domain/EvervaultCard',
  component: EvervaultCard,
  argTypes: {
    motion: { control: 'select', options: [0, 1, 2, 3] },
  },
}
export default meta
type Story = StoryObj<typeof EvervaultCard>

const CardContent = ({ title, desc }: { title: string; desc: string }) => (
  <div style={{ padding: '2rem', color: 'oklch(90% 0 0)', position: 'relative', zIndex: 1 }}>
    <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem' }}>{title}</h3>
    <p style={{ margin: 0, opacity: 0.7, fontSize: '0.875rem' }}>{desc}</p>
  </div>
)

export const Default: Story = {
  args: { children: <CardContent title="Evervault" desc="Hover to reveal the matrix effect" /> },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
      <EvervaultCard motion={3}>
        <CardContent title="Cinematic" desc="Full physics motion" />
      </EvervaultCard>
      <EvervaultCard motion={1}>
        <CardContent title="Subtle" desc="Reduced motion level" />
      </EvervaultCard>
      <EvervaultCard motion={0}>
        <CardContent title="No Motion" desc="Static display" />
      </EvervaultCard>
    </div>
  ),
}

export const Interactive: Story = {
  args: {
    children: <CardContent title="Interactive Card" desc="Move your cursor over this card" />,
    motion: 3,
    style: { maxWidth: 400 },
  },
}
