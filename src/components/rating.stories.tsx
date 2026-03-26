import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Rating } from './rating'

const meta: Meta<typeof Rating> = {
  title: 'Components/Rating',
  component: Rating,
  argTypes: {
    value: { control: { type: 'number', min: 0, max: 10, step: 0.5 } },
    max: { control: { type: 'number', min: 1, max: 10 } },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    readOnly: { control: 'boolean' },
    allowHalf: { control: 'boolean' },
    color: { control: 'color' },
    motion: { control: { type: 'range', min: 0, max: 3 } },
  },
}
export default meta
type Story = StoryObj<typeof Rating>

export const Default: Story = {
  args: { defaultValue: 3, max: 5 },
}

export const HalfStars: Story = {
  args: { value: 3.5, max: 5, allowHalf: true, readOnly: true },
}

export const ReadOnly: Story = {
  args: { value: 4, max: 5, readOnly: true },
}

export const CustomColor: Story = {
  args: { defaultValue: 4, max: 5, color: 'oklch(75% 0.2 60)' },
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <Rating key={s} defaultValue={3} max={5} size={s} />
      ))}
    </div>
  ),
}

export const Interactive: Story = {
  render: () => {
    const [val, setVal] = useState(0)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Rating value={val} max={5} onChange={setVal} />
        <span style={{ fontSize: '0.875rem', opacity: 0.6 }}>Rating: {val} / 5</span>
      </div>
    )
  },
}
