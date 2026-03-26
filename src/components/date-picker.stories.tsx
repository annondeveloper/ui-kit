import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { DatePicker } from './date-picker'

const meta: Meta<typeof DatePicker> = {
  title: 'Components/DatePicker',
  component: DatePicker,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    showWeekNumbers: { control: 'boolean' },
    firstDayOfWeek: { control: 'select', options: [0, 1] },
    motion: { control: 'select', options: [0, 1, 2, 3] },
  },
}
export default meta
type Story = StoryObj<typeof DatePicker>

export const Default: Story = {
  args: { label: 'Select date', placeholder: 'YYYY-MM-DD' },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <DatePicker size="sm" label="Small" />
      <DatePicker size="md" label="Medium" />
      <DatePicker size="lg" label="Large" />
      <DatePicker label="With error" error="Date is required" />
      <DatePicker label="Disabled" disabled />
      <DatePicker label="Week numbers" showWeekNumbers />
    </div>
  ),
}

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState('')
    return (
      <div style={{ maxWidth: 320 }}>
        <DatePicker
          label="Pick a date"
          value={value}
          onChange={setValue}
          min="2026-01-01"
          max="2026-12-31"
          showWeekNumbers
        />
        <p style={{ color: 'oklch(90% 0 0)', marginTop: '1rem' }}>
          Selected: {value || 'none'}
        </p>
      </div>
    )
  },
}
