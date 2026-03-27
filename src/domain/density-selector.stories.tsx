import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { DensitySelector } from './density-selector'

const meta: Meta<typeof DensitySelector> = {
  title: 'Domain/DensitySelector',
  component: DensitySelector,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md'] },
  },
}
export default meta
type Story = StoryObj<typeof DensitySelector>

export const Default: Story = {
  args: { defaultValue: 'comfortable' },
}

export const AllValues: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <DensitySelector defaultValue="compact" />
      <DensitySelector defaultValue="comfortable" />
      <DensitySelector defaultValue="spacious" />
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <DensitySelector size="sm" />
      <DensitySelector size="md" />
    </div>
  ),
}

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<'compact' | 'comfortable' | 'spacious'>('comfortable')
    return (
      <div>
        <DensitySelector value={value} onChange={setValue} />
        <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
          Current: {value}
        </p>
      </div>
    )
  },
}
