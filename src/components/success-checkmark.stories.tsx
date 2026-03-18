import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { SuccessCheckmark } from './success-checkmark'
import { Button } from './button'

const meta: Meta<typeof SuccessCheckmark> = {
  title: 'Components/SuccessCheckmark',
  component: SuccessCheckmark,
  tags: ['autodocs'],
  argTypes: {
    size: { control: { type: 'range', min: 16, max: 120, step: 4 } },
  },
}
export default meta
type Story = StoryObj<typeof SuccessCheckmark>

export const Default: Story = {
  args: { size: 20 },
}

export const Large: Story = {
  args: { size: 64 },
}

export const ExtraLarge: Story = {
  args: { size: 96 },
}

export const WithMessage: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
      <SuccessCheckmark size={48} />
      <span style={{ fontSize: '1rem', fontWeight: 600, color: 'hsl(210 40% 95%)' }}>
        Device added successfully
      </span>
      <span style={{ fontSize: '0.75rem', color: 'hsl(210 20% 70%)' }}>
        SNMP collection will begin within 60 seconds.
      </span>
    </div>
  ),
}

export const ReplayAnimation: Story = {
  render: () => {
    const [key, setKey] = useState(0)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <SuccessCheckmark key={key} size={48} />
        <Button size="sm" variant="secondary" onClick={() => setKey(k => k + 1)}>
          Replay Animation
        </Button>
      </div>
    )
  },
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
      <SuccessCheckmark size={16} />
      <SuccessCheckmark size={20} />
      <SuccessCheckmark size={32} />
      <SuccessCheckmark size={48} />
      <SuccessCheckmark size={64} />
    </div>
  ),
}
