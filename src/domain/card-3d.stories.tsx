import type { Meta, StoryObj } from '@storybook/react'
import { Card3D } from './card-3d'

const meta: Meta<typeof Card3D> = {
  title: 'Domain/Card3D',
  component: Card3D,
  argTypes: {
    perspective: { control: { type: 'range', min: 400, max: 2000, step: 100 } },
    maxTilt: { control: { type: 'range', min: 5, max: 30, step: 1 } },
    glare: { control: 'boolean' },
    motion: { control: 'select', options: [0, 1, 2, 3] },
  },
}
export default meta
type Story = StoryObj<typeof Card3D>

const SampleContent = () => (
  <div style={{ padding: '2rem', color: 'oklch(90% 0 0)' }}>
    <h3 style={{ margin: '0 0 0.5rem' }}>3D Card</h3>
    <p style={{ margin: 0, opacity: 0.7 }}>Hover to see the tilt effect</p>
  </div>
)

export const Default: Story = {
  args: { children: <SampleContent />, glare: true },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
      <Card3D glare>{<SampleContent />}</Card3D>
      <Card3D glare={false}>{<SampleContent />}</Card3D>
      <Card3D maxTilt={25} glare>{<SampleContent />}</Card3D>
      <Card3D perspective={600} glare>{<SampleContent />}</Card3D>
    </div>
  ),
}

export const Interactive: Story = {
  args: {
    children: <SampleContent />,
    glare: true,
    perspective: 1000,
    maxTilt: 15,
    motion: 3,
  },
}
