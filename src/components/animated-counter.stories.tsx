import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { AnimatedCounter } from './animated-counter'
import { Button } from './button'

const meta: Meta<typeof AnimatedCounter> = {
  title: 'Components/AnimatedCounter',
  component: AnimatedCounter,
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'number' },
    duration: { control: { type: 'range', min: 100, max: 2000, step: 100 } },
  },
}
export default meta
type Story = StoryObj<typeof AnimatedCounter>

export const Default: Story = {
  args: { value: 1234 },
}

export const WithFormat: Story = {
  args: {
    value: 98.7,
    format: (n: number) => `${n.toFixed(1)}%`,
  },
}

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState(0)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '2rem', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
          <AnimatedCounter value={value} />
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button size="sm" onClick={() => setValue(v => v + 100)}>+100</Button>
          <Button size="sm" onClick={() => setValue(v => v + 1000)}>+1000</Button>
          <Button size="sm" variant="secondary" onClick={() => setValue(0)}>Reset</Button>
        </div>
      </div>
    )
  },
}

export const FormattedCurrency: Story = {
  render: () => {
    const [value, setValue] = useState(49999)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '2.5rem', fontWeight: 700 }}>
          <AnimatedCounter
            value={value}
            format={(n) => `$${Math.round(n).toLocaleString()}`}
          />
        </span>
        <Button size="sm" onClick={() => setValue(v => v + Math.floor(Math.random() * 10000))}>
          Add Revenue
        </Button>
      </div>
    )
  },
}

export const SlowAnimation: Story = {
  args: { value: 500, duration: 1500 },
}
