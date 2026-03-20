import type { Meta, StoryObj } from '@storybook/react'
import { TypingIndicator } from './typing-indicator'

const meta: Meta<typeof TypingIndicator> = {
  title: 'Domain/TypingIndicator',
  component: TypingIndicator,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md'] },
  },
}
export default meta
type Story = StoryObj<typeof TypingIndicator>

export const Default: Story = {
  args: { label: 'AI is typing' },
}

export const WithAvatar: Story = {
  args: {
    label: 'Alice is typing',
    avatar: <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'oklch(65% 0.2 270)' }} />,
  },
}
