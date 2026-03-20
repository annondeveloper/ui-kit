import type { Meta, StoryObj } from '@storybook/react'
import { TruncatedText } from './truncated-text'

const meta: Meta<typeof TruncatedText> = {
  title: 'Domain/TruncatedText',
  component: TruncatedText,
  argTypes: {
    lines: { control: 'number' },
    expandable: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof TruncatedText>

const longText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'

export const Default: Story = {
  args: { text: longText, lines: 2 },
  decorators: [(Story) => <div style={{ maxWidth: 300 }}><Story /></div>],
}

export const Expandable: Story = {
  args: { text: longText, lines: 2, expandable: true },
  decorators: [(Story) => <div style={{ maxWidth: 300 }}><Story /></div>],
}
