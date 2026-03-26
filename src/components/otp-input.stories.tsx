import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { OtpInput } from './otp-input'

const meta: Meta<typeof OtpInput> = {
  title: 'Components/OtpInput',
  component: OtpInput,
  argTypes: {
    length: { control: { type: 'number', min: 3, max: 8 } },
    type: { control: 'select', options: ['number', 'text'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    disabled: { control: 'boolean' },
    error: { control: 'text' },
    motion: { control: { type: 'range', min: 0, max: 3 } },
  },
}
export default meta
type Story = StoryObj<typeof OtpInput>

export const Default: Story = {
  args: { length: 6 },
}

export const FourDigit: Story = {
  args: { length: 4, type: 'number' },
}

export const WithError: Story = {
  args: { length: 6, error: 'Invalid code. Please try again.' },
}

export const Disabled: Story = {
  args: { length: 6, disabled: true, value: '123456' },
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <OtpInput length={4} size="xs" />
      <OtpInput length={4} size="sm" />
      <OtpInput length={4} size="md" />
      <OtpInput length={4} size="lg" />
      <OtpInput length={4} size="xl" />
    </div>
  ),
}

export const Controlled: Story = {
  render: () => {
    const [val, setVal] = useState('')
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <OtpInput length={6} value={val} onChange={setVal} onComplete={(v) => alert(`Code: ${v}`)} />
        <span style={{ fontSize: '0.875rem', opacity: 0.6 }}>Value: {val || '(empty)'}</span>
      </div>
    )
  },
}
