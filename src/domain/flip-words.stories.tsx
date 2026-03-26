import type { Meta, StoryObj } from '@storybook/react'
import { FlipWords } from './flip-words'

const meta: Meta<typeof FlipWords> = {
  title: 'Domain/FlipWords',
  component: FlipWords,
  argTypes: {
    interval: { control: { type: 'range', min: 1000, max: 8000, step: 500 } },
    motion: { control: 'select', options: [0, 1, 2, 3] },
  },
}
export default meta
type Story = StoryObj<typeof FlipWords>

export const Default: Story = {
  args: {
    words: ['innovative', 'powerful', 'beautiful', 'fast'],
    interval: 3000,
  },
  render: (args) => (
    <p style={{ fontSize: '1.5rem', color: 'oklch(90% 0 0)' }}>
      Build something <FlipWords {...args} />
    </p>
  ),
}

export const TwoWords: Story = {
  args: {
    words: ['yes', 'no'],
    interval: 2000,
  },
  render: (args) => (
    <p style={{ fontSize: '2rem', color: 'oklch(90% 0 0)' }}>
      The answer is <FlipWords {...args} />
    </p>
  ),
}

export const FastCycle: Story = {
  args: {
    words: ['React', 'Vue', 'Svelte', 'Angular', 'Solid'],
    interval: 1500,
  },
  render: (args) => (
    <p style={{ fontSize: '1.25rem', color: 'oklch(80% 0 0)' }}>
      Works with <FlipWords {...args} />
    </p>
  ),
}

export const NoMotion: Story = {
  args: {
    words: ['static', 'display'],
    motion: 0,
  },
  render: (args) => (
    <p style={{ fontSize: '1.25rem', color: 'oklch(80% 0 0)' }}>
      Reduced motion: <FlipWords {...args} />
    </p>
  ),
}
