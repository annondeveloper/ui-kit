import type { Meta, StoryObj } from '@storybook/react'
import { StreamingText } from './streaming-text'

const meta: Meta<typeof StreamingText> = {
  title: 'Domain/StreamingText',
  component: StreamingText,
  argTypes: {
    streaming: { control: 'boolean' },
    showCursor: { control: 'boolean' },
    speed: { control: 'number' },
  },
}
export default meta
type Story = StoryObj<typeof StreamingText>

export const Default: Story = {
  args: {
    text: 'Hello! I am an AI assistant. I can help you with coding, writing, analysis, and much more. How can I help you today?',
    streaming: true,
    showCursor: true,
  },
}

export const Complete: Story = {
  args: {
    text: 'This text has finished streaming and the cursor is hidden.',
    streaming: false,
    showCursor: false,
  },
}
